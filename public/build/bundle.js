
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
    	let div61;
    	let div4;
    	let section0;
    	let picture;
    	let source;
    	let t0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div0;
    	let t2;
    	let div3;
    	let div1;
    	let h1;
    	let t3;
    	let br;
    	let t4;
    	let t5;
    	let p0;
    	let t7;
    	let p1;
    	let t9;
    	let button0;
    	let t11;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let div53;
    	let section1;
    	let div13;
    	let div5;
    	let span0;
    	let t14;
    	let h20;
    	let t16;
    	let div12;
    	let div8;
    	let div6;
    	let span1;
    	let t18;
    	let span2;
    	let t20;
    	let div7;
    	let span3;
    	let t22;
    	let span4;
    	let t24;
    	let div11;
    	let div9;
    	let span5;
    	let t26;
    	let span6;
    	let t28;
    	let div10;
    	let span7;
    	let t30;
    	let span8;
    	let t32;
    	let img2;
    	let img2_src_value;
    	let t33;
    	let div17;
    	let div14;
    	let h30;
    	let t35;
    	let h40;
    	let t37;
    	let img3;
    	let img3_src_value;
    	let t38;
    	let div15;
    	let h31;
    	let t40;
    	let h41;
    	let t42;
    	let img4;
    	let img4_src_value;
    	let t43;
    	let div16;
    	let h32;
    	let t45;
    	let h42;
    	let t47;
    	let img5;
    	let img5_src_value;
    	let t48;
    	let div52;
    	let div47;
    	let div21;
    	let div18;
    	let t50;
    	let div19;
    	let t52;
    	let div20;
    	let t54;
    	let div46;
    	let div25;
    	let div22;
    	let t56;
    	let div23;
    	let t58;
    	let div24;
    	let t60;
    	let div29;
    	let div26;
    	let t62;
    	let div27;
    	let t64;
    	let div28;
    	let t66;
    	let div33;
    	let div30;
    	let t68;
    	let div31;
    	let t70;
    	let div32;
    	let t72;
    	let div37;
    	let div34;
    	let t74;
    	let div35;
    	let t76;
    	let div36;
    	let t78;
    	let div41;
    	let div38;
    	let t80;
    	let div39;
    	let t82;
    	let div40;
    	let t84;
    	let div45;
    	let div42;
    	let t86;
    	let div43;
    	let t88;
    	let div44;
    	let t90;
    	let div51;
    	let div50;
    	let div48;
    	let t91;
    	let div49;
    	let span9;
    	let t93;
    	let section2;
    	let div60;
    	let div56;
    	let h21;
    	let t95;
    	let p2;
    	let t97;
    	let a;
    	let t99;
    	let div55;
    	let div54;
    	let t100;
    	let div59;
    	let div58;
    	let button1;
    	let t102;
    	let button2;
    	let t104;
    	let p3;
    	let t106;
    	let div57;
    	let p4;
    	let t108;
    	let p5;
    	let t110;
    	let p6;
    	let t112;
    	let screen4;
    	let t113;
    	let screen5;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div61 = element("div");
    			div4 = element("div");
    			section0 = element("section");
    			picture = element("picture");
    			source = element("source");
    			t0 = space();
    			img0 = element("img");
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t3 = text("В НОВЫЙ ГОД");
    			br = element("br");
    			t4 = text("\n            С ЛИГОЙ СТАВОК");
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "Лига ставок поздравляет всех с Новым Годом! Жел��ем всего да побольше, особенно больше высоких выигрышных кэфов!\n            И анонсируем новый спецпроект, где больше однозначно лучше! \n            Получите уникальный промокод для участия в розыгрыше.";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Заключайте пари на высокие коэффициенты. Призы достанутся 100 одателям самых больших выигрышных кэфов!";
    			t9 = space();
    			button0 = element("button");
    			button0.textContent = "Получить промокод";
    			t11 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t12 = space();
    			div53 = element("div");
    			section1 = element("section");
    			div13 = element("div");
    			div5 = element("div");
    			span0 = element("span");
    			span0.textContent = "Главный приз";
    			t14 = space();
    			h20 = element("h2");
    			h20.textContent = "iPhone 14 Pro";
    			t16 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			span1 = element("span");
    			span1.textContent = "Объем памяти";
    			t18 = space();
    			span2 = element("span");
    			span2.textContent = "128 GB";
    			t20 = space();
    			div7 = element("div");
    			span3 = element("span");
    			span3.textContent = "Процессор";
    			t22 = space();
    			span4 = element("span");
    			span4.textContent = "A16 Bionic";
    			t24 = space();
    			div11 = element("div");
    			div9 = element("div");
    			span5 = element("span");
    			span5.textContent = "Цвет";
    			t26 = space();
    			span6 = element("span");
    			span6.textContent = "Космический черный";
    			t28 = space();
    			div10 = element("div");
    			span7 = element("span");
    			span7.textContent = "Камера";
    			t30 = space();
    			span8 = element("span");
    			span8.textContent = "48 МП";
    			t32 = space();
    			img2 = element("img");
    			t33 = space();
    			div17 = element("div");
    			div14 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t35 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t37 = space();
    			img3 = element("img");
    			t38 = space();
    			div15 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t40 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t42 = space();
    			img4 = element("img");
    			t43 = space();
    			div16 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t45 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t47 = space();
    			img5 = element("img");
    			t48 = space();
    			div52 = element("div");
    			div47 = element("div");
    			div21 = element("div");
    			div18 = element("div");
    			div18.textContent = "Место";
    			t50 = space();
    			div19 = element("div");
    			div19.textContent = "Приз";
    			t52 = space();
    			div20 = element("div");
    			div20.textContent = "Фрибет";
    			t54 = space();
    			div46 = element("div");
    			div25 = element("div");
    			div22 = element("div");
    			div22.textContent = "1";
    			t56 = space();
    			div23 = element("div");
    			div23.textContent = "iPhone 14 Pro";
    			t58 = space();
    			div24 = element("div");
    			div24.textContent = "50 000 ₽";
    			t60 = space();
    			div29 = element("div");
    			div26 = element("div");
    			div26.textContent = "2";
    			t62 = space();
    			div27 = element("div");
    			div27.textContent = "Наушники Sony";
    			t64 = space();
    			div28 = element("div");
    			div28.textContent = "40 000 ₽";
    			t66 = space();
    			div33 = element("div");
    			div30 = element("div");
    			div30.textContent = "3";
    			t68 = space();
    			div31 = element("div");
    			div31.textContent = "Наушники Sony";
    			t70 = space();
    			div32 = element("div");
    			div32.textContent = "30 000 ₽";
    			t72 = space();
    			div37 = element("div");
    			div34 = element("div");
    			div34.textContent = "4";
    			t74 = space();
    			div35 = element("div");
    			div35.textContent = "Винный шкаф Kitfort";
    			t76 = space();
    			div36 = element("div");
    			div36.textContent = "20 000 ₽";
    			t78 = space();
    			div41 = element("div");
    			div38 = element("div");
    			div38.textContent = "5";
    			t80 = space();
    			div39 = element("div");
    			div39.textContent = "Винный шкаф Kitfort";
    			t82 = space();
    			div40 = element("div");
    			div40.textContent = "10 000 ₽";
    			t84 = space();
    			div45 = element("div");
    			div42 = element("div");
    			div42.textContent = "6-10";
    			t86 = space();
    			div43 = element("div");
    			div43.textContent = "Фитнес трекер Xiaomi";
    			t88 = space();
    			div44 = element("div");
    			div44.textContent = "7 000 ₽";
    			t90 = space();
    			div51 = element("div");
    			div50 = element("div");
    			div48 = element("div");
    			t91 = space();
    			div49 = element("div");
    			span9 = element("span");
    			span9.textContent = "Мерч разыгран";
    			t93 = space();
    			section2 = element("section");
    			div60 = element("div");
    			div56 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t95 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t97 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t99 = space();
    			div55 = element("div");
    			div54 = element("div");
    			t100 = space();
    			div59 = element("div");
    			div58 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t102 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t104 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «ига Ставок» в разделе «Промокоды».";
    			t106 = space();
    			div57 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t108 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t110 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			t112 = space();
    			create_component(screen4.$$.fragment);
    			t113 = space();
    			create_component(screen5.$$.fragment);
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			attr_dev(source, "class", "svelte-q7couu");
    			add_location(source, file$1, 16, 8, 471);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-q7couu");
    			add_location(img0, file$1, 17, 8, 547);
    			attr_dev(div0, "class", "candy-cane svelte-q7couu");
    			add_location(div0, file$1, 18, 8, 622);
    			attr_dev(picture, "class", "svelte-q7couu");
    			add_location(picture, file$1, 15, 6, 453);
    			attr_dev(br, "class", "svelte-q7couu");
    			add_location(br, file$1, 24, 23, 783);
    			attr_dev(h1, "class", "title svelte-q7couu");
    			add_location(h1, file$1, 23, 10, 741);
    			attr_dev(p0, "class", "description svelte-q7couu");
    			add_location(p0, file$1, 27, 10, 841);
    			attr_dev(p1, "class", "description svelte-q7couu");
    			add_location(p1, file$1, 32, 10, 1154);
    			attr_dev(button0, "class", "promo-button svelte-q7couu");
    			add_location(button0, file$1, 35, 10, 1318);
    			attr_dev(div1, "class", "left-side svelte-q7couu");
    			add_location(div1, file$1, 22, 8, 707);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-q7couu");
    			add_location(img1, file$1, 40, 10, 1484);
    			attr_dev(div2, "class", "right-side svelte-q7couu");
    			add_location(div2, file$1, 39, 8, 1449);
    			attr_dev(div3, "class", "content svelte-q7couu");
    			add_location(div3, file$1, 21, 6, 677);
    			attr_dev(section0, "class", "first-screen svelte-q7couu");
    			add_location(section0, file$1, 14, 4, 416);
    			attr_dev(div4, "class", "screen-container svelte-q7couu");
    			add_location(div4, file$1, 13, 2, 381);
    			attr_dev(span0, "class", "prize-label svelte-q7couu");
    			add_location(span0, file$1, 51, 10, 1788);
    			attr_dev(div5, "class", "prize-header svelte-q7couu");
    			add_location(div5, file$1, 50, 8, 1751);
    			attr_dev(h20, "class", "prize-title svelte-q7couu");
    			add_location(h20, file$1, 54, 8, 1866);
    			attr_dev(span1, "class", "spec-label svelte-q7couu");
    			add_location(span1, file$1, 59, 14, 2043);
    			attr_dev(span2, "class", "spec-value svelte-q7couu");
    			add_location(span2, file$1, 60, 14, 2102);
    			attr_dev(div6, "class", "spec-item svelte-q7couu");
    			add_location(div6, file$1, 58, 12, 2005);
    			attr_dev(span3, "class", "spec-label svelte-q7couu");
    			add_location(span3, file$1, 63, 14, 2210);
    			attr_dev(span4, "class", "spec-value svelte-q7couu");
    			add_location(span4, file$1, 64, 14, 2266);
    			attr_dev(div7, "class", "spec-item svelte-q7couu");
    			add_location(div7, file$1, 62, 12, 2172);
    			attr_dev(div8, "class", "specs-column svelte-q7couu");
    			add_location(div8, file$1, 57, 10, 1966);
    			attr_dev(span5, "class", "spec-label svelte-q7couu");
    			add_location(span5, file$1, 69, 14, 2432);
    			attr_dev(span6, "class", "spec-value svelte-q7couu");
    			add_location(span6, file$1, 70, 14, 2483);
    			attr_dev(div9, "class", "spec-item svelte-q7couu");
    			add_location(div9, file$1, 68, 12, 2394);
    			attr_dev(span7, "class", "spec-label svelte-q7couu");
    			add_location(span7, file$1, 73, 14, 2603);
    			attr_dev(span8, "class", "spec-value svelte-q7couu");
    			add_location(span8, file$1, 74, 14, 2656);
    			attr_dev(div10, "class", "spec-item svelte-q7couu");
    			add_location(div10, file$1, 72, 12, 2565);
    			attr_dev(div11, "class", "specs-column svelte-q7couu");
    			add_location(div11, file$1, 67, 10, 2355);
    			attr_dev(div12, "class", "specs-container svelte-q7couu");
    			add_location(div12, file$1, 56, 8, 1926);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/iphone14pro.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "iPhone 14 Pro");
    			attr_dev(img2, "class", "prize-image svelte-q7couu");
    			add_location(img2, file$1, 79, 8, 2762);
    			attr_dev(div13, "class", "main-prize svelte-q7couu");
    			add_location(div13, file$1, 49, 6, 1718);
    			attr_dev(h30, "class", "prize-card-category svelte-q7couu");
    			add_location(h30, file$1, 84, 10, 2933);
    			attr_dev(h40, "class", "prize-card-model svelte-q7couu");
    			add_location(h40, file$1, 85, 10, 2989);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/Naychniki.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Sony WH-1000XM4");
    			attr_dev(img3, "class", "prize-card-image svelte-q7couu");
    			add_location(img3, file$1, 86, 10, 3049);
    			attr_dev(div14, "class", "prize-card svelte-q7couu");
    			add_location(div14, file$1, 83, 8, 2898);
    			attr_dev(h31, "class", "prize-card-category svelte-q7couu");
    			add_location(h31, file$1, 90, 10, 3189);
    			attr_dev(h41, "class", "prize-card-model svelte-q7couu");
    			add_location(h41, file$1, 91, 10, 3248);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/wine-fridge.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Kitfort KT-2403");
    			attr_dev(img4, "class", "prize-card-image svelte-q7couu");
    			add_location(img4, file$1, 92, 10, 3308);
    			attr_dev(div15, "class", "prize-card svelte-q7couu");
    			add_location(div15, file$1, 89, 8, 3154);
    			attr_dev(h32, "class", "prize-card-category svelte-q7couu");
    			add_location(h32, file$1, 96, 10, 3450);
    			attr_dev(h42, "class", "prize-card-model svelte-q7couu");
    			add_location(h42, file$1, 97, 10, 3511);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/mi-band.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img5, "class", "prize-card-image svelte-q7couu");
    			add_location(img5, file$1, 98, 10, 3572);
    			attr_dev(div16, "class", "prize-card svelte-q7couu");
    			add_location(div16, file$1, 95, 8, 3415);
    			attr_dev(div17, "class", "additional-prizes svelte-q7couu");
    			add_location(div17, file$1, 82, 6, 2858);
    			attr_dev(div18, "class", "header-place svelte-q7couu");
    			add_location(div18, file$1, 105, 12, 3811);
    			attr_dev(div19, "class", "header-prize svelte-q7couu");
    			add_location(div19, file$1, 106, 12, 3861);
    			attr_dev(div20, "class", "header-freebet svelte-q7couu");
    			add_location(div20, file$1, 107, 12, 3910);
    			attr_dev(div21, "class", "leaderboard-headers svelte-q7couu");
    			add_location(div21, file$1, 104, 10, 3765);
    			attr_dev(div22, "class", "place svelte-q7couu");
    			add_location(div22, file$1, 112, 14, 4066);
    			attr_dev(div23, "class", "prize svelte-q7couu");
    			add_location(div23, file$1, 113, 14, 4107);
    			attr_dev(div24, "class", "freebet svelte-q7couu");
    			add_location(div24, file$1, 114, 14, 4160);
    			attr_dev(div25, "class", "leaderboard-row svelte-q7couu");
    			add_location(div25, file$1, 111, 12, 4022);
    			attr_dev(div26, "class", "place svelte-q7couu");
    			add_location(div26, file$1, 118, 14, 4272);
    			attr_dev(div27, "class", "prize svelte-q7couu");
    			add_location(div27, file$1, 119, 14, 4313);
    			attr_dev(div28, "class", "freebet svelte-q7couu");
    			add_location(div28, file$1, 120, 14, 4366);
    			attr_dev(div29, "class", "leaderboard-row svelte-q7couu");
    			add_location(div29, file$1, 117, 12, 4228);
    			attr_dev(div30, "class", "place svelte-q7couu");
    			add_location(div30, file$1, 124, 14, 4478);
    			attr_dev(div31, "class", "prize svelte-q7couu");
    			add_location(div31, file$1, 125, 14, 4519);
    			attr_dev(div32, "class", "freebet svelte-q7couu");
    			add_location(div32, file$1, 126, 14, 4572);
    			attr_dev(div33, "class", "leaderboard-row svelte-q7couu");
    			add_location(div33, file$1, 123, 12, 4434);
    			attr_dev(div34, "class", "place svelte-q7couu");
    			add_location(div34, file$1, 130, 14, 4684);
    			attr_dev(div35, "class", "prize svelte-q7couu");
    			add_location(div35, file$1, 131, 14, 4725);
    			attr_dev(div36, "class", "freebet svelte-q7couu");
    			add_location(div36, file$1, 132, 14, 4784);
    			attr_dev(div37, "class", "leaderboard-row svelte-q7couu");
    			add_location(div37, file$1, 129, 12, 4640);
    			attr_dev(div38, "class", "place svelte-q7couu");
    			add_location(div38, file$1, 136, 14, 4896);
    			attr_dev(div39, "class", "prize svelte-q7couu");
    			add_location(div39, file$1, 137, 14, 4937);
    			attr_dev(div40, "class", "freebet svelte-q7couu");
    			add_location(div40, file$1, 138, 14, 4996);
    			attr_dev(div41, "class", "leaderboard-row svelte-q7couu");
    			add_location(div41, file$1, 135, 12, 4852);
    			attr_dev(div42, "class", "place svelte-q7couu");
    			add_location(div42, file$1, 142, 14, 5108);
    			attr_dev(div43, "class", "prize svelte-q7couu");
    			add_location(div43, file$1, 143, 14, 5152);
    			attr_dev(div44, "class", "freebet svelte-q7couu");
    			add_location(div44, file$1, 144, 14, 5212);
    			attr_dev(div45, "class", "leaderboard-row svelte-q7couu");
    			add_location(div45, file$1, 141, 12, 5064);
    			attr_dev(div46, "class", "leaderboard-rows svelte-q7couu");
    			add_location(div46, file$1, 110, 10, 3979);
    			attr_dev(div47, "class", "leaderboard-content svelte-q7couu");
    			add_location(div47, file$1, 103, 8, 3721);
    			attr_dev(div48, "class", "merch-images svelte-q7couu");
    			add_location(div48, file$1, 151, 12, 5384);
    			attr_dev(span9, "class", "svelte-q7couu");
    			add_location(span9, file$1, 155, 14, 5536);
    			attr_dev(div49, "class", "merch-status svelte-q7couu");
    			add_location(div49, file$1, 154, 12, 5495);
    			attr_dev(div50, "class", "merch-content svelte-q7couu");
    			add_location(div50, file$1, 150, 10, 5344);
    			attr_dev(div51, "class", "merch-column svelte-q7couu");
    			add_location(div51, file$1, 149, 8, 5307);
    			attr_dev(div52, "class", "leaderboard svelte-q7couu");
    			add_location(div52, file$1, 102, 6, 3687);
    			attr_dev(section1, "class", "second-screen svelte-q7couu");
    			add_location(section1, file$1, 48, 4, 1680);
    			attr_dev(div53, "class", "screen-container svelte-q7couu");
    			add_location(div53, file$1, 47, 2, 1645);
    			attr_dev(h21, "class", "leaderboard-title svelte-q7couu");
    			add_location(h21, file$1, 167, 8, 5798);
    			attr_dev(p2, "class", "leaderboard-description svelte-q7couu");
    			add_location(p2, file$1, 168, 8, 5858);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-q7couu");
    			add_location(a, file$1, 171, 8, 6004);
    			attr_dev(div54, "class", "table-frame svelte-q7couu");
    			add_location(div54, file$1, 175, 10, 6180);
    			attr_dev(div55, "class", "leaderboard-table svelte-q7couu");
    			add_location(div55, file$1, 173, 8, 6099);
    			attr_dev(div56, "class", "leaderboard-left svelte-q7couu");
    			add_location(div56, file$1, 166, 6, 5759);
    			attr_dev(button1, "class", "action-button svelte-q7couu");
    			add_location(button1, file$1, 183, 8, 6385);
    			attr_dev(button2, "class", "action-button svelte-q7couu");
    			add_location(button2, file$1, 184, 8, 6449);
    			attr_dev(p3, "class", "promo-description svelte-q7couu");
    			add_location(p3, file$1, 186, 8, 6518);
    			attr_dev(p4, "class", "svelte-q7couu");
    			add_location(p4, file$1, 192, 12, 6775);
    			attr_dev(p5, "class", "svelte-q7couu");
    			add_location(p5, file$1, 193, 12, 6887);
    			attr_dev(p6, "class", "svelte-q7couu");
    			add_location(p6, file$1, 194, 12, 6941);
    			attr_dev(div57, "class", "additional-info svelte-q7couu");
    			add_location(div57, file$1, 191, 10, 6733);
    			attr_dev(div58, "class", "actions-container svelte-q7couu");
    			add_location(div58, file$1, 182, 6, 6345);
    			attr_dev(div59, "class", "leaderboard-right svelte-q7couu");
    			add_location(div59, file$1, 181, 4, 6307);
    			attr_dev(div60, "class", "leaderboard-container svelte-q7couu");
    			add_location(div60, file$1, 165, 4, 5717);
    			attr_dev(section2, "class", "third-screen svelte-q7couu");
    			add_location(section2, file$1, 164, 2, 5682);
    			attr_dev(div61, "class", "page-wrapper svelte-q7couu");
    			add_location(div61, file$1, 11, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div61, anchor);
    			append_dev(div61, div4);
    			append_dev(div4, section0);
    			append_dev(section0, picture);
    			append_dev(picture, source);
    			append_dev(picture, t0);
    			append_dev(picture, img0);
    			append_dev(picture, t1);
    			append_dev(picture, div0);
    			append_dev(section0, t2);
    			append_dev(section0, div3);
    			append_dev(div3, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t3);
    			append_dev(h1, br);
    			append_dev(h1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p0);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(div1, t9);
    			append_dev(div1, button0);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div61, t12);
    			append_dev(div61, div53);
    			append_dev(div53, section1);
    			append_dev(section1, div13);
    			append_dev(div13, div5);
    			append_dev(div5, span0);
    			append_dev(div13, t14);
    			append_dev(div13, h20);
    			append_dev(div13, t16);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, span1);
    			append_dev(div6, t18);
    			append_dev(div6, span2);
    			append_dev(div8, t20);
    			append_dev(div8, div7);
    			append_dev(div7, span3);
    			append_dev(div7, t22);
    			append_dev(div7, span4);
    			append_dev(div12, t24);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, span5);
    			append_dev(div9, t26);
    			append_dev(div9, span6);
    			append_dev(div11, t28);
    			append_dev(div11, div10);
    			append_dev(div10, span7);
    			append_dev(div10, t30);
    			append_dev(div10, span8);
    			append_dev(div13, t32);
    			append_dev(div13, img2);
    			append_dev(section1, t33);
    			append_dev(section1, div17);
    			append_dev(div17, div14);
    			append_dev(div14, h30);
    			append_dev(div14, t35);
    			append_dev(div14, h40);
    			append_dev(div14, t37);
    			append_dev(div14, img3);
    			append_dev(div17, t38);
    			append_dev(div17, div15);
    			append_dev(div15, h31);
    			append_dev(div15, t40);
    			append_dev(div15, h41);
    			append_dev(div15, t42);
    			append_dev(div15, img4);
    			append_dev(div17, t43);
    			append_dev(div17, div16);
    			append_dev(div16, h32);
    			append_dev(div16, t45);
    			append_dev(div16, h42);
    			append_dev(div16, t47);
    			append_dev(div16, img5);
    			append_dev(section1, t48);
    			append_dev(section1, div52);
    			append_dev(div52, div47);
    			append_dev(div47, div21);
    			append_dev(div21, div18);
    			append_dev(div21, t50);
    			append_dev(div21, div19);
    			append_dev(div21, t52);
    			append_dev(div21, div20);
    			append_dev(div47, t54);
    			append_dev(div47, div46);
    			append_dev(div46, div25);
    			append_dev(div25, div22);
    			append_dev(div25, t56);
    			append_dev(div25, div23);
    			append_dev(div25, t58);
    			append_dev(div25, div24);
    			append_dev(div46, t60);
    			append_dev(div46, div29);
    			append_dev(div29, div26);
    			append_dev(div29, t62);
    			append_dev(div29, div27);
    			append_dev(div29, t64);
    			append_dev(div29, div28);
    			append_dev(div46, t66);
    			append_dev(div46, div33);
    			append_dev(div33, div30);
    			append_dev(div33, t68);
    			append_dev(div33, div31);
    			append_dev(div33, t70);
    			append_dev(div33, div32);
    			append_dev(div46, t72);
    			append_dev(div46, div37);
    			append_dev(div37, div34);
    			append_dev(div37, t74);
    			append_dev(div37, div35);
    			append_dev(div37, t76);
    			append_dev(div37, div36);
    			append_dev(div46, t78);
    			append_dev(div46, div41);
    			append_dev(div41, div38);
    			append_dev(div41, t80);
    			append_dev(div41, div39);
    			append_dev(div41, t82);
    			append_dev(div41, div40);
    			append_dev(div46, t84);
    			append_dev(div46, div45);
    			append_dev(div45, div42);
    			append_dev(div45, t86);
    			append_dev(div45, div43);
    			append_dev(div45, t88);
    			append_dev(div45, div44);
    			append_dev(div52, t90);
    			append_dev(div52, div51);
    			append_dev(div51, div50);
    			append_dev(div50, div48);
    			append_dev(div50, t91);
    			append_dev(div50, div49);
    			append_dev(div49, span9);
    			append_dev(div61, t93);
    			append_dev(div61, section2);
    			append_dev(section2, div60);
    			append_dev(div60, div56);
    			append_dev(div56, h21);
    			append_dev(div56, t95);
    			append_dev(div56, p2);
    			append_dev(div56, t97);
    			append_dev(div56, a);
    			append_dev(div56, t99);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div60, t100);
    			append_dev(div60, div59);
    			append_dev(div59, div58);
    			append_dev(div58, button1);
    			append_dev(div58, t102);
    			append_dev(div58, button2);
    			append_dev(div58, t104);
    			append_dev(div58, p3);
    			append_dev(div58, t106);
    			append_dev(div58, div57);
    			append_dev(div57, p4);
    			append_dev(div57, t108);
    			append_dev(div57, p5);
    			append_dev(div57, t110);
    			append_dev(div57, p6);
    			append_dev(div61, t112);
    			mount_component(screen4, div61, null);
    			append_dev(div61, t113);
    			mount_component(screen5, div61, null);
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
    			if (detaching) detach_dev(div61);
    			destroy_component(screen4);
    			destroy_component(screen5);
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
