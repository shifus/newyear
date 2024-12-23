
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Screen4.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/components/Screen4.svelte";

    function create_fragment$3(ctx) {
    	let div16;
    	let h2;
    	let t1;
    	let div15;
    	let div0;
    	let t2;
    	let div1;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let p2;
    	let t8;
    	let button;
    	let span;
    	let t10;
    	let div14;
    	let div4;
    	let div3;
    	let div2;
    	let t11;
    	let p3;
    	let t13;
    	let div8;
    	let div7;
    	let div5;
    	let t14;
    	let div6;
    	let t15;
    	let p4;
    	let t17;
    	let div13;
    	let div12;
    	let div9;
    	let t18;
    	let div10;
    	let t19;
    	let div11;
    	let t20;
    	let p5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			h2 = element("h2");
    			h2.textContent = "О проекте";
    			t1 = space();
    			div15 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Выбирайте высокие коэффициенты, заключайте пари, получайте яркие эмоции от побед!";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Правила акции";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "CQ.ru совместно с букмекерской компанией «Лига Ставок» запустили новогодний проект. Делайте ставки на спортивные события с большими коэффициентами и выигрывайте топовые призы!";
    			t8 = space();
    			button = element("button");
    			span = element("span");
    			span.textContent = "ПОЛУЧИТЬ ПРОМОКОД";
    			t10 = space();
    			div14 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t11 = space();
    			p3 = element("p");
    			p3.textContent = "Получите промокод";
    			t13 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			t14 = space();
    			div6 = element("div");
    			t15 = space();
    			p4 = element("p");
    			p4.textContent = "Заключайте пари в «Лиге Ставок»";
    			t17 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div9 = element("div");
    			t18 = space();
    			div10 = element("div");
    			t19 = space();
    			div11 = element("div");
    			t20 = space();
    			p5 = element("p");
    			p5.textContent = "Следите за розыгрышами призов";
    			attr_dev(h2, "class", "project-title svelte-1fi8a5n");
    			add_location(h2, file$3, 10, 2, 291);
    			attr_dev(div0, "class", "santa-image svelte-1fi8a5n");
    			add_location(div0, file$3, 13, 4, 390);
    			attr_dev(p0, "class", "highlight-text svelte-1fi8a5n");
    			add_location(p0, file$3, 16, 6, 471);
    			attr_dev(p1, "class", "rules-text svelte-1fi8a5n");
    			add_location(p1, file$3, 19, 6, 605);
    			attr_dev(p2, "class", "details-text svelte-1fi8a5n");
    			add_location(p2, file$3, 20, 6, 651);
    			attr_dev(span, "class", "promo-button-text svelte-1fi8a5n");
    			add_location(span, file$3, 26, 8, 1014);
    			attr_dev(button, "class", "promo-button svelte-1fi8a5n");
    			add_location(button, file$3, 25, 6, 948);
    			attr_dev(div1, "class", "project-description svelte-1fi8a5n");
    			add_location(div1, file$3, 15, 4, 431);
    			attr_dev(div2, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div2, file$3, 34, 10, 1272);
    			attr_dev(div3, "class", "image-frame svelte-1fi8a5n");
    			add_location(div3, file$3, 33, 8, 1236);
    			attr_dev(p3, "class", "row-text svelte-1fi8a5n");
    			add_location(p3, file$3, 36, 8, 1332);
    			attr_dev(div4, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div4, file$3, 32, 6, 1198);
    			attr_dev(div5, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div5, file$3, 42, 10, 1529);
    			attr_dev(div6, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div6, file$3, 43, 10, 1576);
    			attr_dev(div7, "class", "image-frame svelte-1fi8a5n");
    			add_location(div7, file$3, 41, 8, 1493);
    			attr_dev(p4, "class", "row-text svelte-1fi8a5n");
    			add_location(p4, file$3, 45, 8, 1636);
    			attr_dev(div8, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div8, file$3, 40, 6, 1455);
    			attr_dev(div9, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div9, file$3, 51, 10, 1861);
    			attr_dev(div10, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div10, file$3, 52, 10, 1908);
    			attr_dev(div11, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div11, file$3, 53, 10, 1955);
    			attr_dev(div12, "class", "image-frame svelte-1fi8a5n");
    			add_location(div12, file$3, 50, 8, 1825);
    			attr_dev(p5, "class", "row-text svelte-1fi8a5n");
    			add_location(p5, file$3, 55, 8, 2015);
    			attr_dev(div13, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div13, file$3, 49, 6, 1787);
    			attr_dev(div14, "class", "right-column svelte-1fi8a5n");
    			add_location(div14, file$3, 30, 4, 1103);
    			attr_dev(div15, "class", "project-frame svelte-1fi8a5n");
    			add_location(div15, file$3, 11, 2, 334);
    			attr_dev(div16, "class", "about-project svelte-1fi8a5n");
    			add_location(div16, file$3, 9, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, h2);
    			append_dev(div16, t1);
    			append_dev(div16, div15);
    			append_dev(div15, div0);
    			append_dev(div15, t2);
    			append_dev(div15, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(div1, t6);
    			append_dev(div1, p2);
    			append_dev(div1, t8);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div15, t10);
    			append_dev(div15, div14);
    			append_dev(div14, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div4, t11);
    			append_dev(div4, p3);
    			append_dev(div14, t13);
    			append_dev(div14, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div8, t15);
    			append_dev(div8, p4);
    			append_dev(div14, t17);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div9);
    			append_dev(div12, t18);
    			append_dev(div12, div10);
    			append_dev(div12, t19);
    			append_dev(div12, div11);
    			append_dev(div13, t20);
    			append_dev(div13, p5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", handlePromoClick$1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlePromoClick$1() {
    	console.log('Кнопка "ПОЛУЧИТЬ ПРОМОКОД" нажата');
    	alert('Промокод получен! Нажмите ОК, чтобы продолжить.');
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen4', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Screen4> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ handlePromoClick: handlePromoClick$1 });
    	return [];
    }

    class Screen4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Screen4",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Screen5.svelte generated by Svelte v3.59.2 */

    const file$2 = "src/components/Screen5.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let h2;
    	let t1;
    	let div2;
    	let div0;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let a0;
    	let t7;
    	let div1;
    	let t8;
    	let div3;
    	let a1;
    	let t10;
    	let p2;
    	let t12;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Расписание стримов";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "14 января 14:00 Мск";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Расскажем про спецпроект и призы";
    			t5 = space();
    			a0 = element("a");
    			a0.textContent = "Смотреть";
    			t7 = space();
    			div1 = element("div");
    			t8 = space();
    			div3 = element("div");
    			a1 = element("a");
    			a1.textContent = "Пользовательское соглашение";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Разработчик проекта:";
    			t12 = space();
    			img = element("img");
    			attr_dev(h2, "class", "schedule-title svelte-1tykm3b");
    			add_location(h2, file$2, 6, 2, 108);
    			attr_dev(p0, "class", "stream-date svelte-1tykm3b");
    			add_location(p0, file$2, 9, 6, 231);
    			attr_dev(p1, "class", "stream-description svelte-1tykm3b");
    			add_location(p1, file$2, 10, 6, 284);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "stream-link svelte-1tykm3b");
    			add_location(a0, file$2, 11, 6, 357);
    			attr_dev(div0, "class", "schedule-details svelte-1tykm3b");
    			add_location(div0, file$2, 8, 4, 194);
    			attr_dev(div1, "class", "bell svelte-1tykm3b");
    			add_location(div1, file$2, 13, 4, 417);
    			attr_dev(div2, "class", "schedule-frame svelte-1tykm3b");
    			add_location(div2, file$2, 7, 2, 161);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "user-agreement svelte-1tykm3b");
    			add_location(a1, file$2, 16, 4, 484);
    			attr_dev(p2, "class", "developer-text svelte-1tykm3b");
    			add_location(p2, file$2, 17, 4, 555);
    			if (!src_url_equal(img.src, img_src_value = "/images/Лого.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Лого");
    			attr_dev(img, "class", "logo svelte-1tykm3b");
    			add_location(img, file$2, 18, 4, 610);
    			attr_dev(div3, "class", "footer-frame svelte-1tykm3b");
    			add_location(div3, file$2, 15, 2, 453);
    			attr_dev(div4, "class", "Screen5 svelte-1tykm3b");
    			add_location(div4, file$2, 5, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, a0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, a1);
    			append_dev(div3, t10);
    			append_dev(div3, p2);
    			append_dev(div3, t12);
    			append_dev(div3, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen5', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Screen5> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Screen5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Screen5",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Screen1.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Screen1.svelte";

    function create_fragment$1(ctx) {
    	let div54;
    	let div3;
    	let section0;
    	let picture;
    	let source;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div2;
    	let div0;
    	let h1;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let p0;
    	let t6;
    	let p1;
    	let t8;
    	let button0;
    	let t10;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div52;
    	let section1;
    	let div12;
    	let div4;
    	let span0;
    	let t13;
    	let h20;
    	let t15;
    	let div11;
    	let div7;
    	let div5;
    	let span1;
    	let t17;
    	let span2;
    	let t19;
    	let div6;
    	let span3;
    	let t21;
    	let span4;
    	let t23;
    	let div10;
    	let div8;
    	let span5;
    	let t25;
    	let span6;
    	let t27;
    	let div9;
    	let span7;
    	let t29;
    	let span8;
    	let t31;
    	let img2;
    	let img2_src_value;
    	let t32;
    	let div16;
    	let div13;
    	let h30;
    	let t34;
    	let h40;
    	let t36;
    	let img3;
    	let img3_src_value;
    	let t37;
    	let div14;
    	let h31;
    	let t39;
    	let h41;
    	let t41;
    	let img4;
    	let img4_src_value;
    	let t42;
    	let div15;
    	let h32;
    	let t44;
    	let h42;
    	let t46;
    	let img5;
    	let img5_src_value;
    	let t47;
    	let div51;
    	let div46;
    	let div20;
    	let div17;
    	let t49;
    	let div18;
    	let t51;
    	let div19;
    	let t53;
    	let div45;
    	let div24;
    	let div21;
    	let t55;
    	let div22;
    	let t57;
    	let div23;
    	let t59;
    	let div28;
    	let div25;
    	let t61;
    	let div26;
    	let t63;
    	let div27;
    	let t65;
    	let div32;
    	let div29;
    	let t67;
    	let div30;
    	let t69;
    	let div31;
    	let t71;
    	let div36;
    	let div33;
    	let t73;
    	let div34;
    	let t75;
    	let div35;
    	let t77;
    	let div40;
    	let div37;
    	let t79;
    	let div38;
    	let t81;
    	let div39;
    	let t83;
    	let div44;
    	let div41;
    	let t85;
    	let div42;
    	let t87;
    	let div43;
    	let t89;
    	let div50;
    	let div49;
    	let div47;
    	let t90;
    	let div48;
    	let span9;
    	let t92;
    	let div53;
    	let screen4;
    	let t93;
    	let screen5;
    	let t94;
    	let section2;
    	let div61;
    	let div57;
    	let h21;
    	let t96;
    	let p2;
    	let t98;
    	let a;
    	let t100;
    	let div56;
    	let div55;
    	let t101;
    	let div60;
    	let div59;
    	let button1;
    	let t103;
    	let button2;
    	let t105;
    	let p3;
    	let t107;
    	let div58;
    	let p4;
    	let t109;
    	let p5;
    	let t111;
    	let p6;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div54 = element("div");
    			div3 = element("div");
    			section0 = element("section");
    			picture = element("picture");
    			source = element("source");
    			t0 = space();
    			img0 = element("img");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t2 = text("В НОВЫЙ ГОД");
    			br = element("br");
    			t3 = text("\n            С ЛИГОЙ СТАВОК");
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Лига ставок поздравляет всех с Новым Годом! Желаем всего да побольше, особенно больше высоких выигрышных кэфов!\n            И анонсируем новый спецпроект, где больше однозначно лучше! \n            Получите уникальный промокод для участия в розыгрыше.";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Заключайте пари на высокие коэффициенты. Призы достанутся 100 одателям самых больших выигрышных кэфов!";
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "Получить промокод";
    			t10 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div52 = element("div");
    			section1 = element("section");
    			div12 = element("div");
    			div4 = element("div");
    			span0 = element("span");
    			span0.textContent = "Главный приз";
    			t13 = space();
    			h20 = element("h2");
    			h20.textContent = "iPhone 14 Pro";
    			t15 = space();
    			div11 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			span1 = element("span");
    			span1.textContent = "Объем памяти";
    			t17 = space();
    			span2 = element("span");
    			span2.textContent = "128 GB";
    			t19 = space();
    			div6 = element("div");
    			span3 = element("span");
    			span3.textContent = "Процессор";
    			t21 = space();
    			span4 = element("span");
    			span4.textContent = "A16 Bionic";
    			t23 = space();
    			div10 = element("div");
    			div8 = element("div");
    			span5 = element("span");
    			span5.textContent = "Цвет";
    			t25 = space();
    			span6 = element("span");
    			span6.textContent = "Космический черный";
    			t27 = space();
    			div9 = element("div");
    			span7 = element("span");
    			span7.textContent = "Камера";
    			t29 = space();
    			span8 = element("span");
    			span8.textContent = "48 МП";
    			t31 = space();
    			img2 = element("img");
    			t32 = space();
    			div16 = element("div");
    			div13 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t34 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t36 = space();
    			img3 = element("img");
    			t37 = space();
    			div14 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t39 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t41 = space();
    			img4 = element("img");
    			t42 = space();
    			div15 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t44 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t46 = space();
    			img5 = element("img");
    			t47 = space();
    			div51 = element("div");
    			div46 = element("div");
    			div20 = element("div");
    			div17 = element("div");
    			div17.textContent = "Место";
    			t49 = space();
    			div18 = element("div");
    			div18.textContent = "Приз";
    			t51 = space();
    			div19 = element("div");
    			div19.textContent = "Фрибет";
    			t53 = space();
    			div45 = element("div");
    			div24 = element("div");
    			div21 = element("div");
    			div21.textContent = "1";
    			t55 = space();
    			div22 = element("div");
    			div22.textContent = "iPhone 14 Pro";
    			t57 = space();
    			div23 = element("div");
    			div23.textContent = "50 000 ₽";
    			t59 = space();
    			div28 = element("div");
    			div25 = element("div");
    			div25.textContent = "2";
    			t61 = space();
    			div26 = element("div");
    			div26.textContent = "Наушники Sony";
    			t63 = space();
    			div27 = element("div");
    			div27.textContent = "40 000 ₽";
    			t65 = space();
    			div32 = element("div");
    			div29 = element("div");
    			div29.textContent = "3";
    			t67 = space();
    			div30 = element("div");
    			div30.textContent = "Наушники Sony";
    			t69 = space();
    			div31 = element("div");
    			div31.textContent = "30 000 ₽";
    			t71 = space();
    			div36 = element("div");
    			div33 = element("div");
    			div33.textContent = "4";
    			t73 = space();
    			div34 = element("div");
    			div34.textContent = "Винный шкаф Kitfort";
    			t75 = space();
    			div35 = element("div");
    			div35.textContent = "20 000 ₽";
    			t77 = space();
    			div40 = element("div");
    			div37 = element("div");
    			div37.textContent = "5";
    			t79 = space();
    			div38 = element("div");
    			div38.textContent = "Винный шкаф Kitfort";
    			t81 = space();
    			div39 = element("div");
    			div39.textContent = "10 000 ₽";
    			t83 = space();
    			div44 = element("div");
    			div41 = element("div");
    			div41.textContent = "6-10";
    			t85 = space();
    			div42 = element("div");
    			div42.textContent = "Фитнес трекер Xiaomi";
    			t87 = space();
    			div43 = element("div");
    			div43.textContent = "7 000 ₽";
    			t89 = space();
    			div50 = element("div");
    			div49 = element("div");
    			div47 = element("div");
    			t90 = space();
    			div48 = element("div");
    			span9 = element("span");
    			span9.textContent = "Мерч разыгран";
    			t92 = space();
    			div53 = element("div");
    			create_component(screen4.$$.fragment);
    			t93 = space();
    			create_component(screen5.$$.fragment);
    			t94 = space();
    			section2 = element("section");
    			div61 = element("div");
    			div57 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t96 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t98 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t100 = space();
    			div56 = element("div");
    			div55 = element("div");
    			t101 = space();
    			div60 = element("div");
    			div59 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t103 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t105 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».";
    			t107 = space();
    			div58 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t109 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t111 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			attr_dev(source, "class", "svelte-12i3e48");
    			add_location(source, file$1, 17, 8, 545);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-12i3e48");
    			add_location(img0, file$1, 19, 8, 656);
    			attr_dev(picture, "class", "svelte-12i3e48");
    			add_location(picture, file$1, 15, 6, 493);
    			attr_dev(br, "class", "svelte-12i3e48");
    			add_location(br, file$1, 25, 23, 853);
    			attr_dev(h1, "class", "title svelte-12i3e48");
    			add_location(h1, file$1, 24, 10, 811);
    			attr_dev(p0, "class", "description svelte-12i3e48");
    			add_location(p0, file$1, 28, 10, 911);
    			attr_dev(p1, "class", "description svelte-12i3e48");
    			add_location(p1, file$1, 33, 10, 1223);
    			attr_dev(button0, "class", "promo-button svelte-12i3e48");
    			add_location(button0, file$1, 37, 10, 1434);
    			attr_dev(div0, "class", "left-side svelte-12i3e48");
    			add_location(div0, file$1, 23, 8, 777);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-12i3e48");
    			add_location(img1, file$1, 42, 10, 1600);
    			attr_dev(div1, "class", "right-side svelte-12i3e48");
    			add_location(div1, file$1, 41, 8, 1565);
    			attr_dev(div2, "class", "content svelte-12i3e48");
    			add_location(div2, file$1, 22, 6, 747);
    			attr_dev(section0, "class", "first-screen svelte-12i3e48");
    			add_location(section0, file$1, 14, 4, 456);
    			attr_dev(div3, "class", "screen-container svelte-12i3e48");
    			add_location(div3, file$1, 13, 2, 421);
    			attr_dev(span0, "class", "prize-label svelte-12i3e48");
    			add_location(span0, file$1, 53, 10, 1904);
    			attr_dev(div4, "class", "prize-header svelte-12i3e48");
    			add_location(div4, file$1, 52, 8, 1867);
    			attr_dev(h20, "class", "prize-title svelte-12i3e48");
    			add_location(h20, file$1, 56, 8, 1982);
    			attr_dev(span1, "class", "spec-label svelte-12i3e48");
    			add_location(span1, file$1, 61, 14, 2159);
    			attr_dev(span2, "class", "spec-value svelte-12i3e48");
    			add_location(span2, file$1, 62, 14, 2218);
    			attr_dev(div5, "class", "spec-item svelte-12i3e48");
    			add_location(div5, file$1, 60, 12, 2121);
    			attr_dev(span3, "class", "spec-label svelte-12i3e48");
    			add_location(span3, file$1, 65, 14, 2326);
    			attr_dev(span4, "class", "spec-value svelte-12i3e48");
    			add_location(span4, file$1, 66, 14, 2382);
    			attr_dev(div6, "class", "spec-item svelte-12i3e48");
    			add_location(div6, file$1, 64, 12, 2288);
    			attr_dev(div7, "class", "specs-column svelte-12i3e48");
    			add_location(div7, file$1, 59, 10, 2082);
    			attr_dev(span5, "class", "spec-label svelte-12i3e48");
    			add_location(span5, file$1, 71, 14, 2548);
    			attr_dev(span6, "class", "spec-value svelte-12i3e48");
    			add_location(span6, file$1, 72, 14, 2599);
    			attr_dev(div8, "class", "spec-item svelte-12i3e48");
    			add_location(div8, file$1, 70, 12, 2510);
    			attr_dev(span7, "class", "spec-label svelte-12i3e48");
    			add_location(span7, file$1, 75, 14, 2719);
    			attr_dev(span8, "class", "spec-value svelte-12i3e48");
    			add_location(span8, file$1, 76, 14, 2772);
    			attr_dev(div9, "class", "spec-item svelte-12i3e48");
    			add_location(div9, file$1, 74, 12, 2681);
    			attr_dev(div10, "class", "specs-column svelte-12i3e48");
    			add_location(div10, file$1, 69, 10, 2471);
    			attr_dev(div11, "class", "specs-container svelte-12i3e48");
    			add_location(div11, file$1, 58, 8, 2042);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/iphone14pro.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "iPhone 14 Pro");
    			attr_dev(img2, "class", "prize-image svelte-12i3e48");
    			add_location(img2, file$1, 81, 8, 2878);
    			attr_dev(div12, "class", "main-prize svelte-12i3e48");
    			add_location(div12, file$1, 51, 6, 1834);
    			attr_dev(h30, "class", "prize-card-category svelte-12i3e48");
    			add_location(h30, file$1, 86, 10, 3049);
    			attr_dev(h40, "class", "prize-card-model svelte-12i3e48");
    			add_location(h40, file$1, 87, 10, 3105);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/Naychniki.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Sony WH-1000XM4");
    			attr_dev(img3, "class", "prize-card-image svelte-12i3e48");
    			add_location(img3, file$1, 88, 10, 3165);
    			attr_dev(div13, "class", "prize-card svelte-12i3e48");
    			add_location(div13, file$1, 85, 8, 3014);
    			attr_dev(h31, "class", "prize-card-category svelte-12i3e48");
    			add_location(h31, file$1, 92, 10, 3305);
    			attr_dev(h41, "class", "prize-card-model svelte-12i3e48");
    			add_location(h41, file$1, 93, 10, 3364);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/wine-fridge.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Kitfort KT-2403");
    			attr_dev(img4, "class", "prize-card-image svelte-12i3e48");
    			add_location(img4, file$1, 94, 10, 3424);
    			attr_dev(div14, "class", "prize-card svelte-12i3e48");
    			add_location(div14, file$1, 91, 8, 3270);
    			attr_dev(h32, "class", "prize-card-category svelte-12i3e48");
    			add_location(h32, file$1, 98, 10, 3566);
    			attr_dev(h42, "class", "prize-card-model svelte-12i3e48");
    			add_location(h42, file$1, 99, 10, 3627);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/mi-band.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img5, "class", "prize-card-image svelte-12i3e48");
    			add_location(img5, file$1, 100, 10, 3688);
    			attr_dev(div15, "class", "prize-card svelte-12i3e48");
    			add_location(div15, file$1, 97, 8, 3531);
    			attr_dev(div16, "class", "additional-prizes svelte-12i3e48");
    			add_location(div16, file$1, 84, 6, 2974);
    			attr_dev(div17, "class", "header-place svelte-12i3e48");
    			add_location(div17, file$1, 107, 12, 3927);
    			attr_dev(div18, "class", "header-prize svelte-12i3e48");
    			add_location(div18, file$1, 108, 12, 3977);
    			attr_dev(div19, "class", "header-freebet svelte-12i3e48");
    			add_location(div19, file$1, 109, 12, 4026);
    			attr_dev(div20, "class", "leaderboard-headers svelte-12i3e48");
    			add_location(div20, file$1, 106, 10, 3881);
    			attr_dev(div21, "class", "place svelte-12i3e48");
    			add_location(div21, file$1, 114, 14, 4182);
    			attr_dev(div22, "class", "prize svelte-12i3e48");
    			add_location(div22, file$1, 115, 14, 4223);
    			attr_dev(div23, "class", "freebet svelte-12i3e48");
    			add_location(div23, file$1, 116, 14, 4276);
    			attr_dev(div24, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div24, file$1, 113, 12, 4138);
    			attr_dev(div25, "class", "place svelte-12i3e48");
    			add_location(div25, file$1, 120, 14, 4388);
    			attr_dev(div26, "class", "prize svelte-12i3e48");
    			add_location(div26, file$1, 121, 14, 4429);
    			attr_dev(div27, "class", "freebet svelte-12i3e48");
    			add_location(div27, file$1, 122, 14, 4482);
    			attr_dev(div28, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div28, file$1, 119, 12, 4344);
    			attr_dev(div29, "class", "place svelte-12i3e48");
    			add_location(div29, file$1, 126, 14, 4594);
    			attr_dev(div30, "class", "prize svelte-12i3e48");
    			add_location(div30, file$1, 127, 14, 4635);
    			attr_dev(div31, "class", "freebet svelte-12i3e48");
    			add_location(div31, file$1, 128, 14, 4688);
    			attr_dev(div32, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div32, file$1, 125, 12, 4550);
    			attr_dev(div33, "class", "place svelte-12i3e48");
    			add_location(div33, file$1, 132, 14, 4800);
    			attr_dev(div34, "class", "prize svelte-12i3e48");
    			add_location(div34, file$1, 133, 14, 4841);
    			attr_dev(div35, "class", "freebet svelte-12i3e48");
    			add_location(div35, file$1, 134, 14, 4900);
    			attr_dev(div36, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div36, file$1, 131, 12, 4756);
    			attr_dev(div37, "class", "place svelte-12i3e48");
    			add_location(div37, file$1, 138, 14, 5012);
    			attr_dev(div38, "class", "prize svelte-12i3e48");
    			add_location(div38, file$1, 139, 14, 5053);
    			attr_dev(div39, "class", "freebet svelte-12i3e48");
    			add_location(div39, file$1, 140, 14, 5112);
    			attr_dev(div40, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div40, file$1, 137, 12, 4968);
    			attr_dev(div41, "class", "place svelte-12i3e48");
    			add_location(div41, file$1, 144, 14, 5224);
    			attr_dev(div42, "class", "prize svelte-12i3e48");
    			add_location(div42, file$1, 145, 14, 5268);
    			attr_dev(div43, "class", "freebet svelte-12i3e48");
    			add_location(div43, file$1, 146, 14, 5328);
    			attr_dev(div44, "class", "leaderboard-row svelte-12i3e48");
    			add_location(div44, file$1, 143, 12, 5180);
    			attr_dev(div45, "class", "leaderboard-rows svelte-12i3e48");
    			add_location(div45, file$1, 112, 10, 4095);
    			attr_dev(div46, "class", "leaderboard-content svelte-12i3e48");
    			add_location(div46, file$1, 105, 8, 3837);
    			attr_dev(div47, "class", "merch-images svelte-12i3e48");
    			add_location(div47, file$1, 153, 12, 5500);
    			attr_dev(span9, "class", "svelte-12i3e48");
    			add_location(span9, file$1, 157, 14, 5652);
    			attr_dev(div48, "class", "merch-status svelte-12i3e48");
    			add_location(div48, file$1, 156, 12, 5611);
    			attr_dev(div49, "class", "merch-content svelte-12i3e48");
    			add_location(div49, file$1, 152, 10, 5460);
    			attr_dev(div50, "class", "merch-column svelte-12i3e48");
    			add_location(div50, file$1, 151, 8, 5423);
    			attr_dev(div51, "class", "leaderboard svelte-12i3e48");
    			add_location(div51, file$1, 104, 6, 3803);
    			attr_dev(section1, "class", "second-screen svelte-12i3e48");
    			add_location(section1, file$1, 50, 4, 1796);
    			attr_dev(div52, "class", "screen-container svelte-12i3e48");
    			add_location(div52, file$1, 49, 2, 1761);
    			attr_dev(div53, "class", "screen1 svelte-12i3e48");
    			add_location(div53, file$1, 166, 2, 5811);
    			attr_dev(div54, "class", "page-wrapper svelte-12i3e48");
    			add_location(div54, file$1, 11, 0, 368);
    			attr_dev(h21, "class", "leaderboard-title svelte-12i3e48");
    			add_location(h21, file$1, 181, 6, 6244);
    			attr_dev(p2, "class", "leaderboard-description svelte-12i3e48");
    			add_location(p2, file$1, 182, 6, 6302);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-12i3e48");
    			add_location(a, file$1, 185, 6, 6442);
    			attr_dev(div55, "class", "table-frame svelte-12i3e48");
    			add_location(div55, file$1, 189, 8, 6610);
    			attr_dev(div56, "class", "leaderboard-table svelte-12i3e48");
    			add_location(div56, file$1, 187, 6, 6533);
    			attr_dev(div57, "class", "leaderboard-left svelte-12i3e48");
    			add_location(div57, file$1, 180, 4, 6207);
    			attr_dev(button1, "class", "action-button svelte-12i3e48");
    			add_location(button1, file$1, 197, 8, 6807);
    			attr_dev(button2, "class", "action-button svelte-12i3e48");
    			add_location(button2, file$1, 198, 8, 6871);
    			attr_dev(p3, "class", "promo-description svelte-12i3e48");
    			add_location(p3, file$1, 200, 8, 6940);
    			attr_dev(p4, "class", "svelte-12i3e48");
    			add_location(p4, file$1, 206, 10, 7194);
    			attr_dev(p5, "class", "svelte-12i3e48");
    			add_location(p5, file$1, 207, 10, 7304);
    			attr_dev(p6, "class", "svelte-12i3e48");
    			add_location(p6, file$1, 208, 10, 7356);
    			attr_dev(div58, "class", "additional-info svelte-12i3e48");
    			add_location(div58, file$1, 205, 8, 7154);
    			attr_dev(div59, "class", "actions-container svelte-12i3e48");
    			add_location(div59, file$1, 196, 6, 6767);
    			attr_dev(div60, "class", "leaderboard-right svelte-12i3e48");
    			add_location(div60, file$1, 195, 4, 6729);
    			attr_dev(div61, "class", "leaderboard-container svelte-12i3e48");
    			add_location(div61, file$1, 179, 2, 6167);
    			attr_dev(section2, "class", "third-screen svelte-12i3e48");
    			add_location(section2, file$1, 178, 0, 6134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div54, anchor);
    			append_dev(div54, div3);
    			append_dev(div3, section0);
    			append_dev(section0, picture);
    			append_dev(picture, source);
    			append_dev(picture, t0);
    			append_dev(picture, img0);
    			append_dev(section0, t1);
    			append_dev(section0, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t2);
    			append_dev(h1, br);
    			append_dev(h1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(div0, t6);
    			append_dev(div0, p1);
    			append_dev(div0, t8);
    			append_dev(div0, button0);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div54, t11);
    			append_dev(div54, div52);
    			append_dev(div52, section1);
    			append_dev(section1, div12);
    			append_dev(div12, div4);
    			append_dev(div4, span0);
    			append_dev(div12, t13);
    			append_dev(div12, h20);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			append_dev(div11, div7);
    			append_dev(div7, div5);
    			append_dev(div5, span1);
    			append_dev(div5, t17);
    			append_dev(div5, span2);
    			append_dev(div7, t19);
    			append_dev(div7, div6);
    			append_dev(div6, span3);
    			append_dev(div6, t21);
    			append_dev(div6, span4);
    			append_dev(div11, t23);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, span5);
    			append_dev(div8, t25);
    			append_dev(div8, span6);
    			append_dev(div10, t27);
    			append_dev(div10, div9);
    			append_dev(div9, span7);
    			append_dev(div9, t29);
    			append_dev(div9, span8);
    			append_dev(div12, t31);
    			append_dev(div12, img2);
    			append_dev(section1, t32);
    			append_dev(section1, div16);
    			append_dev(div16, div13);
    			append_dev(div13, h30);
    			append_dev(div13, t34);
    			append_dev(div13, h40);
    			append_dev(div13, t36);
    			append_dev(div13, img3);
    			append_dev(div16, t37);
    			append_dev(div16, div14);
    			append_dev(div14, h31);
    			append_dev(div14, t39);
    			append_dev(div14, h41);
    			append_dev(div14, t41);
    			append_dev(div14, img4);
    			append_dev(div16, t42);
    			append_dev(div16, div15);
    			append_dev(div15, h32);
    			append_dev(div15, t44);
    			append_dev(div15, h42);
    			append_dev(div15, t46);
    			append_dev(div15, img5);
    			append_dev(section1, t47);
    			append_dev(section1, div51);
    			append_dev(div51, div46);
    			append_dev(div46, div20);
    			append_dev(div20, div17);
    			append_dev(div20, t49);
    			append_dev(div20, div18);
    			append_dev(div20, t51);
    			append_dev(div20, div19);
    			append_dev(div46, t53);
    			append_dev(div46, div45);
    			append_dev(div45, div24);
    			append_dev(div24, div21);
    			append_dev(div24, t55);
    			append_dev(div24, div22);
    			append_dev(div24, t57);
    			append_dev(div24, div23);
    			append_dev(div45, t59);
    			append_dev(div45, div28);
    			append_dev(div28, div25);
    			append_dev(div28, t61);
    			append_dev(div28, div26);
    			append_dev(div28, t63);
    			append_dev(div28, div27);
    			append_dev(div45, t65);
    			append_dev(div45, div32);
    			append_dev(div32, div29);
    			append_dev(div32, t67);
    			append_dev(div32, div30);
    			append_dev(div32, t69);
    			append_dev(div32, div31);
    			append_dev(div45, t71);
    			append_dev(div45, div36);
    			append_dev(div36, div33);
    			append_dev(div36, t73);
    			append_dev(div36, div34);
    			append_dev(div36, t75);
    			append_dev(div36, div35);
    			append_dev(div45, t77);
    			append_dev(div45, div40);
    			append_dev(div40, div37);
    			append_dev(div40, t79);
    			append_dev(div40, div38);
    			append_dev(div40, t81);
    			append_dev(div40, div39);
    			append_dev(div45, t83);
    			append_dev(div45, div44);
    			append_dev(div44, div41);
    			append_dev(div44, t85);
    			append_dev(div44, div42);
    			append_dev(div44, t87);
    			append_dev(div44, div43);
    			append_dev(div51, t89);
    			append_dev(div51, div50);
    			append_dev(div50, div49);
    			append_dev(div49, div47);
    			append_dev(div49, t90);
    			append_dev(div49, div48);
    			append_dev(div48, span9);
    			append_dev(div54, t92);
    			append_dev(div54, div53);
    			mount_component(screen4, div53, null);
    			append_dev(div53, t93);
    			mount_component(screen5, div53, null);
    			insert_dev(target, t94, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div61);
    			append_dev(div61, div57);
    			append_dev(div57, h21);
    			append_dev(div57, t96);
    			append_dev(div57, p2);
    			append_dev(div57, t98);
    			append_dev(div57, a);
    			append_dev(div57, t100);
    			append_dev(div57, div56);
    			append_dev(div56, div55);
    			append_dev(div61, t101);
    			append_dev(div61, div60);
    			append_dev(div60, div59);
    			append_dev(div59, button1);
    			append_dev(div59, t103);
    			append_dev(div59, button2);
    			append_dev(div59, t105);
    			append_dev(div59, p3);
    			append_dev(div59, t107);
    			append_dev(div59, div58);
    			append_dev(div58, p4);
    			append_dev(div58, t109);
    			append_dev(div58, p5);
    			append_dev(div58, t111);
    			append_dev(div58, p6);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button0, "click", handlePromoClick, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(screen4.$$.fragment, local);
    			transition_in(screen5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(screen4.$$.fragment, local);
    			transition_out(screen5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div54);
    			destroy_component(screen4);
    			destroy_component(screen5);
    			if (detaching) detach_dev(t94);
    			if (detaching) detach_dev(section2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlePromoClick() {
    	console.log('Кнопка "Получить промокод" нажата');
    	alert('Промокод получен! Нажмите ОК, чтобы продолжить.');
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Screen1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Screen4, Screen5, handlePromoClick });
    	return [];
    }

    class Screen1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Screen1",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let screen1;
    	let current;
    	screen1 = new Screen1({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(screen1.$$.fragment);
    			attr_dev(main, "class", "svelte-rrnf50");
    			add_location(main, file, 5, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(screen1, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(screen1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(screen1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(screen1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Screen1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // main.js

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
