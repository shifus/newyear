
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
    	let div13;
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
    	let div4;
    	let section1;
    	let t12;
    	let section2;
    	let div11;
    	let div7;
    	let h2;
    	let t14;
    	let p2;
    	let t16;
    	let a;
    	let t18;
    	let div6;
    	let div5;
    	let t19;
    	let div10;
    	let div9;
    	let button1;
    	let t21;
    	let button2;
    	let t23;
    	let p3;
    	let t25;
    	let div8;
    	let p4;
    	let t27;
    	let p5;
    	let t29;
    	let p6;
    	let t31;
    	let div12;
    	let screen4;
    	let t32;
    	let screen5;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div13 = element("div");
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
    			p0.textContent = "Лига ставок, поздравляет всех с Новым Годом! Желает всего да побольше, особенно больше высоких выигрышных кэфов! \n            И анонсирует новый спецпроект, где больше однозначно лучше! \n            Получите уникальный промокод для участия в розыгрыше";
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
    			div4 = element("div");
    			section1 = element("section");
    			t12 = space();
    			section2 = element("section");
    			div11 = element("div");
    			div7 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Таблица конкурса";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t16 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t18 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t19 = space();
    			div10 = element("div");
    			div9 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t21 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t23 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n            Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».";
    			t25 = space();
    			div8 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t27 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t29 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			t31 = space();
    			div12 = element("div");
    			create_component(screen4.$$.fragment);
    			t32 = space();
    			create_component(screen5.$$.fragment);
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			attr_dev(source, "class", "svelte-14ygj7h");
    			add_location(source, file$1, 17, 8, 545);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-14ygj7h");
    			add_location(img0, file$1, 19, 8, 656);
    			attr_dev(picture, "class", "svelte-14ygj7h");
    			add_location(picture, file$1, 15, 6, 493);
    			attr_dev(br, "class", "svelte-14ygj7h");
    			add_location(br, file$1, 25, 23, 853);
    			attr_dev(h1, "class", "title svelte-14ygj7h");
    			add_location(h1, file$1, 24, 10, 811);
    			attr_dev(p0, "class", "description svelte-14ygj7h");
    			add_location(p0, file$1, 28, 10, 911);
    			attr_dev(p1, "class", "description svelte-14ygj7h");
    			add_location(p1, file$1, 33, 10, 1224);
    			attr_dev(button0, "class", "promo-button svelte-14ygj7h");
    			add_location(button0, file$1, 37, 10, 1435);
    			attr_dev(div0, "class", "left-side svelte-14ygj7h");
    			add_location(div0, file$1, 23, 8, 777);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-14ygj7h");
    			add_location(img1, file$1, 42, 10, 1601);
    			attr_dev(div1, "class", "right-side svelte-14ygj7h");
    			add_location(div1, file$1, 41, 8, 1566);
    			attr_dev(div2, "class", "content svelte-14ygj7h");
    			add_location(div2, file$1, 22, 6, 747);
    			attr_dev(section0, "class", "first-screen svelte-14ygj7h");
    			add_location(section0, file$1, 14, 4, 456);
    			attr_dev(div3, "class", "screen-container svelte-14ygj7h");
    			add_location(div3, file$1, 13, 2, 421);
    			attr_dev(section1, "class", "second-screen svelte-14ygj7h");
    			add_location(section1, file$1, 50, 4, 1797);
    			attr_dev(div4, "class", "screen-container svelte-14ygj7h");
    			add_location(div4, file$1, 49, 2, 1762);
    			attr_dev(h2, "class", "leaderboard-title svelte-14ygj7h");
    			add_location(h2, file$1, 60, 8, 2112);
    			attr_dev(p2, "class", "leaderboard-description svelte-14ygj7h");
    			add_location(p2, file$1, 61, 8, 2172);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-14ygj7h");
    			add_location(a, file$1, 64, 8, 2318);
    			attr_dev(div5, "class", "table-frame svelte-14ygj7h");
    			add_location(div5, file$1, 68, 10, 2494);
    			attr_dev(div6, "class", "leaderboard-table svelte-14ygj7h");
    			add_location(div6, file$1, 66, 8, 2413);
    			attr_dev(div7, "class", "leaderboard-left svelte-14ygj7h");
    			add_location(div7, file$1, 59, 6, 2073);
    			attr_dev(button1, "class", "action-button svelte-14ygj7h");
    			add_location(button1, file$1, 76, 10, 2705);
    			attr_dev(button2, "class", "action-button svelte-14ygj7h");
    			add_location(button2, file$1, 77, 10, 2771);
    			attr_dev(p3, "class", "promo-description svelte-14ygj7h");
    			add_location(p3, file$1, 79, 10, 2844);
    			attr_dev(p4, "class", "svelte-14ygj7h");
    			add_location(p4, file$1, 85, 12, 3108);
    			attr_dev(p5, "class", "svelte-14ygj7h");
    			add_location(p5, file$1, 86, 12, 3220);
    			attr_dev(p6, "class", "svelte-14ygj7h");
    			add_location(p6, file$1, 87, 12, 3274);
    			attr_dev(div8, "class", "additional-info svelte-14ygj7h");
    			add_location(div8, file$1, 84, 10, 3066);
    			attr_dev(div9, "class", "actions-container svelte-14ygj7h");
    			add_location(div9, file$1, 75, 8, 2663);
    			attr_dev(div10, "class", "leaderboard-right svelte-14ygj7h");
    			add_location(div10, file$1, 74, 6, 2623);
    			attr_dev(div11, "class", "leaderboard-container svelte-14ygj7h");
    			add_location(div11, file$1, 58, 4, 2031);
    			attr_dev(section2, "class", "third-screen svelte-14ygj7h");
    			add_location(section2, file$1, 57, 2, 1996);
    			attr_dev(div12, "class", "screen1 svelte-14ygj7h");
    			add_location(div12, file$1, 95, 2, 3491);
    			attr_dev(div13, "class", "page-wrapper svelte-14ygj7h");
    			add_location(div13, file$1, 11, 0, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div3);
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
    			append_dev(div13, t11);
    			append_dev(div13, div4);
    			append_dev(div4, section1);
    			append_dev(div13, t12);
    			append_dev(div13, section2);
    			append_dev(section2, div11);
    			append_dev(div11, div7);
    			append_dev(div7, h2);
    			append_dev(div7, t14);
    			append_dev(div7, p2);
    			append_dev(div7, t16);
    			append_dev(div7, a);
    			append_dev(div7, t18);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div11, t19);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, button1);
    			append_dev(div9, t21);
    			append_dev(div9, button2);
    			append_dev(div9, t23);
    			append_dev(div9, p3);
    			append_dev(div9, t25);
    			append_dev(div9, div8);
    			append_dev(div8, p4);
    			append_dev(div8, t27);
    			append_dev(div8, p5);
    			append_dev(div8, t29);
    			append_dev(div8, p6);
    			append_dev(div13, t31);
    			append_dev(div13, div12);
    			mount_component(screen4, div12, null);
    			append_dev(div12, t32);
    			mount_component(screen5, div12, null);
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
    			if (detaching) detach_dev(div13);
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
