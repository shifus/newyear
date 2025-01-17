
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
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    	let a;
    	let t6;
    	let p1;
    	let t8;
    	let button0;
    	let span0;
    	let t10;
    	let div14;
    	let div4;
    	let div3;
    	let div2;
    	let t11;
    	let p2;
    	let t13;
    	let div8;
    	let div7;
    	let div5;
    	let t14;
    	let div6;
    	let t15;
    	let p3;
    	let t17;
    	let div13;
    	let div12;
    	let div9;
    	let t18;
    	let div10;
    	let t19;
    	let div11;
    	let t20;
    	let p4;
    	let t22;
    	let button1;
    	let span1;
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
    			a = element("a");
    			a.textContent = "Правила акции";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "CQ.ru совместно с букмекерской компанией «Лига Ставок» запустили новогодний проект. Делайте ставки на спортивные события с большими коэффициентами и выигрывайте топовые призы!";
    			t8 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "ПОЛУЧИТЬ ПРОМОКОД";
    			t10 = space();
    			div14 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Получите промокод";
    			t13 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			t14 = space();
    			div6 = element("div");
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "Заключайте пари в «Лиге Ставок»";
    			t17 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div9 = element("div");
    			t18 = space();
    			div10 = element("div");
    			t19 = space();
    			div11 = element("div");
    			t20 = space();
    			p4 = element("p");
    			p4.textContent = "Следите за розыгрышами призов";
    			t22 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "ПОЛУЧИТЬ ПРОМОКОД";
    			attr_dev(h2, "class", "project-title svelte-aeh72f");
    			add_location(h2, file$3, 10, 2, 291);
    			attr_dev(div0, "class", "santa-image svelte-aeh72f");
    			add_location(div0, file$3, 13, 4, 390);
    			attr_dev(p0, "class", "highlight-text svelte-aeh72f");
    			add_location(p0, file$3, 16, 6, 471);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "rules-text svelte-aeh72f");
    			add_location(a, file$3, 19, 6, 605);
    			attr_dev(p1, "class", "details-text svelte-aeh72f");
    			add_location(p1, file$3, 20, 6, 660);
    			attr_dev(span0, "class", "promo-button-text svelte-aeh72f");
    			add_location(span0, file$3, 24, 8, 952);
    			attr_dev(button0, "class", "promo-button svelte-aeh72f");
    			add_location(button0, file$3, 23, 6, 886);
    			attr_dev(div1, "class", "project-description svelte-aeh72f");
    			add_location(div1, file$3, 15, 4, 431);
    			attr_dev(div2, "class", "image image-lamp svelte-aeh72f");
    			add_location(div2, file$3, 32, 10, 1210);
    			attr_dev(div3, "class", "image-frame svelte-aeh72f");
    			add_location(div3, file$3, 31, 8, 1174);
    			attr_dev(p2, "class", "row-text svelte-aeh72f");
    			add_location(p2, file$3, 34, 8, 1270);
    			attr_dev(div4, "class", "lamp-text-block svelte-aeh72f");
    			add_location(div4, file$3, 30, 6, 1136);
    			attr_dev(div5, "class", "image image-lamp svelte-aeh72f");
    			add_location(div5, file$3, 40, 10, 1467);
    			attr_dev(div6, "class", "image image-lamp svelte-aeh72f");
    			add_location(div6, file$3, 41, 10, 1514);
    			attr_dev(div7, "class", "image-frame svelte-aeh72f");
    			add_location(div7, file$3, 39, 8, 1431);
    			attr_dev(p3, "class", "row-text svelte-aeh72f");
    			add_location(p3, file$3, 43, 8, 1574);
    			attr_dev(div8, "class", "lamp-text-block svelte-aeh72f");
    			add_location(div8, file$3, 38, 6, 1393);
    			attr_dev(div9, "class", "image image-lamp svelte-aeh72f");
    			add_location(div9, file$3, 49, 10, 1799);
    			attr_dev(div10, "class", "image image-lamp svelte-aeh72f");
    			add_location(div10, file$3, 50, 10, 1846);
    			attr_dev(div11, "class", "image image-lamp svelte-aeh72f");
    			add_location(div11, file$3, 51, 10, 1893);
    			attr_dev(div12, "class", "image-frame svelte-aeh72f");
    			add_location(div12, file$3, 48, 8, 1763);
    			attr_dev(p4, "class", "row-text svelte-aeh72f");
    			add_location(p4, file$3, 53, 8, 1953);
    			attr_dev(div13, "class", "lamp-text-block svelte-aeh72f");
    			add_location(div13, file$3, 47, 6, 1725);
    			attr_dev(span1, "class", "promo-button-text svelte-aeh72f");
    			add_location(span1, file$3, 57, 8, 2093);
    			attr_dev(button1, "class", "promo-button svelte-aeh72f");
    			add_location(button1, file$3, 56, 6, 2027);
    			attr_dev(div14, "class", "right-column svelte-aeh72f");
    			add_location(div14, file$3, 28, 4, 1041);
    			attr_dev(div15, "class", "project-frame svelte-aeh72f");
    			add_location(div15, file$3, 11, 2, 334);
    			attr_dev(div16, "class", "about-project svelte-aeh72f");
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
    			append_dev(div1, a);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(div1, t8);
    			append_dev(div1, button0);
    			append_dev(button0, span0);
    			append_dev(div15, t10);
    			append_dev(div15, div14);
    			append_dev(div14, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div4, t11);
    			append_dev(div4, p2);
    			append_dev(div14, t13);
    			append_dev(div14, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div8, t15);
    			append_dev(div8, p3);
    			append_dev(div14, t17);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div9);
    			append_dev(div12, t18);
    			append_dev(div12, div10);
    			append_dev(div12, t19);
    			append_dev(div12, div11);
    			append_dev(div13, t20);
    			append_dev(div13, p4);
    			append_dev(div14, t22);
    			append_dev(div14, button1);
    			append_dev(button1, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", handlePromoClick$1, false, false, false, false),
    					listen_dev(button1, "click", handlePromoClick$1, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			run_all(dispose);
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
    	let div5;
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
    	let div4;
    	let a1;
    	let t10;
    	let div3;
    	let p2;
    	let t12;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div5 = element("div");
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
    			div4 = element("div");
    			a1 = element("a");
    			a1.textContent = "Пользовательское соглашение";
    			t10 = space();
    			div3 = element("div");
    			p2 = element("p");
    			p2.textContent = "Разработчик проекта:";
    			t12 = space();
    			img = element("img");
    			attr_dev(h2, "class", "schedule-title svelte-agv9v9");
    			add_location(h2, file$2, 6, 2, 108);
    			attr_dev(p0, "class", "stream-date svelte-agv9v9");
    			add_location(p0, file$2, 9, 6, 231);
    			attr_dev(p1, "class", "stream-description svelte-agv9v9");
    			add_location(p1, file$2, 10, 6, 284);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "stream-link svelte-agv9v9");
    			add_location(a0, file$2, 11, 6, 357);
    			attr_dev(div0, "class", "schedule-details svelte-agv9v9");
    			add_location(div0, file$2, 8, 4, 194);
    			attr_dev(div1, "class", "bell svelte-agv9v9");
    			add_location(div1, file$2, 13, 4, 417);
    			attr_dev(div2, "class", "schedule-frame svelte-agv9v9");
    			add_location(div2, file$2, 7, 2, 161);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "user-agreement svelte-agv9v9");
    			add_location(a1, file$2, 16, 4, 484);
    			attr_dev(p2, "class", "developer-text svelte-agv9v9");
    			add_location(p2, file$2, 18, 6, 595);
    			if (!src_url_equal(img.src, img_src_value = "/images/Лого.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Лого");
    			attr_dev(img, "class", "logo svelte-agv9v9");
    			add_location(img, file$2, 19, 6, 652);
    			attr_dev(div3, "class", "developer-container svelte-agv9v9");
    			add_location(div3, file$2, 17, 4, 555);
    			attr_dev(div4, "class", "footer-frame svelte-agv9v9");
    			add_location(div4, file$2, 15, 2, 453);
    			attr_dev(div5, "class", "Screen5 svelte-agv9v9");
    			add_location(div5, file$2, 5, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h2);
    			append_dev(div5, t1);
    			append_dev(div5, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, a0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, a1);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, p2);
    			append_dev(div3, t12);
    			append_dev(div3, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
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
    	let div122;
    	let div17;
    	let section0;
    	let div3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div2;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let a2;
    	let t7;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div10;
    	let div7;
    	let h10;
    	let span0;
    	let t10;
    	let span1;
    	let t12;
    	let div5;
    	let p0;
    	let span2;
    	let t14;
    	let span3;
    	let t16;
    	let span4;
    	let t18;
    	let span5;
    	let t20;
    	let p1;
    	let span6;
    	let t22;
    	let span7;
    	let t24;
    	let span8;
    	let t26;
    	let div6;
    	let button0;
    	let t28;
    	let img2;
    	let img2_src_value;
    	let t29;
    	let div9;
    	let div8;
    	let img3;
    	let img3_src_value;
    	let t30;
    	let img4;
    	let img4_src_value;
    	let t31;
    	let img5;
    	let img5_src_value;
    	let t32;
    	let img6;
    	let img6_src_value;
    	let t33;
    	let img7;
    	let img7_src_value;
    	let t34;
    	let div16;
    	let div13;
    	let h11;
    	let span9;
    	let t36;
    	let span10;
    	let t38;
    	let div11;
    	let p2;
    	let span11;
    	let t40;
    	let span12;
    	let t42;
    	let span13;
    	let t44;
    	let span14;
    	let t46;
    	let p3;
    	let span15;
    	let t48;
    	let span16;
    	let t50;
    	let span17;
    	let t52;
    	let div12;
    	let button1;
    	let t54;
    	let img8;
    	let img8_src_value;
    	let t55;
    	let div15;
    	let div14;
    	let img9;
    	let img9_src_value;
    	let t56;
    	let img10;
    	let img10_src_value;
    	let t57;
    	let img11;
    	let img11_src_value;
    	let t58;
    	let img12;
    	let img12_src_value;
    	let t59;
    	let img13;
    	let img13_src_value;
    	let t60;
    	let div73;
    	let section1;
    	let div34;
    	let div18;
    	let span18;
    	let t62;
    	let h2;
    	let t64;
    	let div33;
    	let div25;
    	let div21;
    	let div19;
    	let t66;
    	let div20;
    	let t68;
    	let div24;
    	let div22;
    	let t70;
    	let div23;
    	let t72;
    	let div32;
    	let div28;
    	let div26;
    	let t74;
    	let div27;
    	let t76;
    	let div31;
    	let div29;
    	let t78;
    	let div30;
    	let t80;
    	let img14;
    	let img14_src_value;
    	let t81;
    	let img15;
    	let img15_src_value;
    	let t82;
    	let div38;
    	let div35;
    	let h30;
    	let t84;
    	let h40;
    	let t86;
    	let img16;
    	let img16_src_value;
    	let t87;
    	let div36;
    	let h31;
    	let t89;
    	let h41;
    	let t91;
    	let img17;
    	let img17_src_value;
    	let t92;
    	let div37;
    	let h32;
    	let t94;
    	let h42;
    	let t96;
    	let img18;
    	let img18_src_value;
    	let t97;
    	let div72;
    	let div68;
    	let div42;
    	let div39;
    	let t99;
    	let div40;
    	let t101;
    	let div41;
    	let t103;
    	let div67;
    	let div46;
    	let div43;
    	let t105;
    	let div44;
    	let t107;
    	let div45;
    	let t109;
    	let div50;
    	let div47;
    	let t111;
    	let div48;
    	let t113;
    	let div49;
    	let t115;
    	let div54;
    	let div51;
    	let t117;
    	let div52;
    	let t119;
    	let div53;
    	let t121;
    	let div58;
    	let div55;
    	let t123;
    	let div56;
    	let t125;
    	let div57;
    	let t127;
    	let div62;
    	let div59;
    	let t129;
    	let div60;
    	let t131;
    	let div61;
    	let t133;
    	let div66;
    	let div63;
    	let t135;
    	let div64;
    	let t137;
    	let div65;
    	let t139;
    	let div71;
    	let div70;
    	let div69;
    	let img19;
    	let img19_src_value;
    	let t140;
    	let section2;
    	let div121;
    	let div117;
    	let div116;
    	let div74;
    	let t142;
    	let div75;
    	let t144;
    	let a3;
    	let t146;
    	let div78;
    	let div76;
    	let t148;
    	let div77;
    	let t150;
    	let div115;
    	let div84;
    	let div81;
    	let div79;
    	let t152;
    	let div80;
    	let t154;
    	let div83;
    	let div82;
    	let t156;
    	let div90;
    	let div87;
    	let div85;
    	let t158;
    	let div86;
    	let t160;
    	let div89;
    	let div88;
    	let t162;
    	let div96;
    	let div93;
    	let div91;
    	let t164;
    	let div92;
    	let t166;
    	let div95;
    	let div94;
    	let t168;
    	let div102;
    	let div99;
    	let div97;
    	let t170;
    	let div98;
    	let t172;
    	let div101;
    	let div100;
    	let t174;
    	let div108;
    	let div105;
    	let div103;
    	let t176;
    	let div104;
    	let t178;
    	let div107;
    	let div106;
    	let t180;
    	let div114;
    	let div111;
    	let div109;
    	let t182;
    	let div110;
    	let t184;
    	let div113;
    	let div112;
    	let t186;
    	let div120;
    	let div119;
    	let button2;
    	let t188;
    	let button3;
    	let t190;
    	let p4;
    	let t192;
    	let div118;
    	let p5;
    	let t194;
    	let p6;
    	let t196;
    	let p7;
    	let t198;
    	let section3;
    	let screen4;
    	let t199;
    	let screen5;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div122 = element("div");
    			div17 = element("div");
    			section0 = element("section");
    			div3 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			a0 = element("a");
    			a0.textContent = "Таблица участников";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "О проекте";
    			t5 = space();
    			a2 = element("a");
    			a2.textContent = "Призы";
    			t7 = space();
    			div4 = element("div");
    			img1 = element("img");
    			t8 = space();
    			div10 = element("div");
    			div7 = element("div");
    			h10 = element("h1");
    			span0 = element("span");
    			span0.textContent = "В НОВЫЙ ГОД";
    			t10 = space();
    			span1 = element("span");
    			span1.textContent = "С ЛИГОЙ СТАВОК";
    			t12 = space();
    			div5 = element("div");
    			p0 = element("p");
    			span2 = element("span");
    			span2.textContent = "Лига ставок, поздравляет всех с Новым Годом!";
    			t14 = space();
    			span3 = element("span");
    			span3.textContent = "Желает всего да побольше, особенно больше высоких выигрышных кэфов!";
    			t16 = space();
    			span4 = element("span");
    			span4.textContent = "И анонсирует новый спецпроект, где больше однозначно лучше!";
    			t18 = space();
    			span5 = element("span");
    			span5.textContent = "Получите уникальный промокод для участия в розыгрыше.";
    			t20 = space();
    			p1 = element("p");
    			span6 = element("span");
    			span6.textContent = "Заключайте пари на высокие коэффициенты.";
    			t22 = space();
    			span7 = element("span");
    			span7.textContent = "Призы достанутся 100 обладателям самых больших";
    			t24 = space();
    			span8 = element("span");
    			span8.textContent = "выигрышных кэфов!";
    			t26 = space();
    			div6 = element("div");
    			button0 = element("button");
    			button0.textContent = "Получить промокод";
    			t28 = space();
    			img2 = element("img");
    			t29 = space();
    			div9 = element("div");
    			div8 = element("div");
    			img3 = element("img");
    			t30 = space();
    			img4 = element("img");
    			t31 = space();
    			img5 = element("img");
    			t32 = space();
    			img6 = element("img");
    			t33 = space();
    			img7 = element("img");
    			t34 = space();
    			div16 = element("div");
    			div13 = element("div");
    			h11 = element("h1");
    			span9 = element("span");
    			span9.textContent = "В НОВЫЙ ГОД";
    			t36 = space();
    			span10 = element("span");
    			span10.textContent = "С ЛИГОЙ СТАВОК";
    			t38 = space();
    			div11 = element("div");
    			p2 = element("p");
    			span11 = element("span");
    			span11.textContent = "Лига ставок, поздравляет всех с Новым Годом!";
    			t40 = space();
    			span12 = element("span");
    			span12.textContent = "Желает всего да побольше, особенно больше высоких выигрышных кэфов!";
    			t42 = space();
    			span13 = element("span");
    			span13.textContent = "И анонсирует новый спецпроект, где больше однозначно лучше!";
    			t44 = space();
    			span14 = element("span");
    			span14.textContent = "Получите уникальный промокод для участия в розыгрыше.";
    			t46 = space();
    			p3 = element("p");
    			span15 = element("span");
    			span15.textContent = "Заключайте пари на высокие коэффициенты.";
    			t48 = space();
    			span16 = element("span");
    			span16.textContent = "Призы достанутся 100 обладателям самых больших";
    			t50 = space();
    			span17 = element("span");
    			span17.textContent = "выигрышных кэфов!";
    			t52 = space();
    			div12 = element("div");
    			button1 = element("button");
    			button1.textContent = "ПОЛУЧИТЬ ПРОМОКОД";
    			t54 = space();
    			img8 = element("img");
    			t55 = space();
    			div15 = element("div");
    			div14 = element("div");
    			img9 = element("img");
    			t56 = space();
    			img10 = element("img");
    			t57 = space();
    			img11 = element("img");
    			t58 = space();
    			img12 = element("img");
    			t59 = space();
    			img13 = element("img");
    			t60 = space();
    			div73 = element("div");
    			section1 = element("section");
    			div34 = element("div");
    			div18 = element("div");
    			span18 = element("span");
    			span18.textContent = "Главный приз";
    			t62 = space();
    			h2 = element("h2");
    			h2.textContent = "iPhone 14 Pro";
    			t64 = space();
    			div33 = element("div");
    			div25 = element("div");
    			div21 = element("div");
    			div19 = element("div");
    			div19.textContent = "Объем памяти";
    			t66 = space();
    			div20 = element("div");
    			div20.textContent = "128 GB";
    			t68 = space();
    			div24 = element("div");
    			div22 = element("div");
    			div22.textContent = "Процессор";
    			t70 = space();
    			div23 = element("div");
    			div23.textContent = "A16 Bionic";
    			t72 = space();
    			div32 = element("div");
    			div28 = element("div");
    			div26 = element("div");
    			div26.textContent = "Цвет";
    			t74 = space();
    			div27 = element("div");
    			div27.textContent = "Космический черный";
    			t76 = space();
    			div31 = element("div");
    			div29 = element("div");
    			div29.textContent = "Камера";
    			t78 = space();
    			div30 = element("div");
    			div30.textContent = "48 МП";
    			t80 = space();
    			img14 = element("img");
    			t81 = space();
    			img15 = element("img");
    			t82 = space();
    			div38 = element("div");
    			div35 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t84 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t86 = space();
    			img16 = element("img");
    			t87 = space();
    			div36 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t89 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t91 = space();
    			img17 = element("img");
    			t92 = space();
    			div37 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t94 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t96 = space();
    			img18 = element("img");
    			t97 = space();
    			div72 = element("div");
    			div68 = element("div");
    			div42 = element("div");
    			div39 = element("div");
    			div39.textContent = "Место";
    			t99 = space();
    			div40 = element("div");
    			div40.textContent = "Приз";
    			t101 = space();
    			div41 = element("div");
    			div41.textContent = "Фрибет";
    			t103 = space();
    			div67 = element("div");
    			div46 = element("div");
    			div43 = element("div");
    			div43.textContent = "1";
    			t105 = space();
    			div44 = element("div");
    			div44.textContent = "iPhone 14 Pro";
    			t107 = space();
    			div45 = element("div");
    			div45.textContent = "50 000 ₽";
    			t109 = space();
    			div50 = element("div");
    			div47 = element("div");
    			div47.textContent = "2";
    			t111 = space();
    			div48 = element("div");
    			div48.textContent = "Наушники Sony";
    			t113 = space();
    			div49 = element("div");
    			div49.textContent = "40 000 ₽";
    			t115 = space();
    			div54 = element("div");
    			div51 = element("div");
    			div51.textContent = "3";
    			t117 = space();
    			div52 = element("div");
    			div52.textContent = "Наушники Sony";
    			t119 = space();
    			div53 = element("div");
    			div53.textContent = "30 000 ₽";
    			t121 = space();
    			div58 = element("div");
    			div55 = element("div");
    			div55.textContent = "4";
    			t123 = space();
    			div56 = element("div");
    			div56.textContent = "Винный шкаф Kitfort";
    			t125 = space();
    			div57 = element("div");
    			div57.textContent = "20 000 ₽";
    			t127 = space();
    			div62 = element("div");
    			div59 = element("div");
    			div59.textContent = "5";
    			t129 = space();
    			div60 = element("div");
    			div60.textContent = "Винный шкаф Kitfort";
    			t131 = space();
    			div61 = element("div");
    			div61.textContent = "10 000 ₽";
    			t133 = space();
    			div66 = element("div");
    			div63 = element("div");
    			div63.textContent = "6-10";
    			t135 = space();
    			div64 = element("div");
    			div64.textContent = "Фитнес трекер Xiaomi";
    			t137 = space();
    			div65 = element("div");
    			div65.textContent = "7 000 ₽";
    			t139 = space();
    			div71 = element("div");
    			div70 = element("div");
    			div69 = element("div");
    			img19 = element("img");
    			t140 = space();
    			section2 = element("section");
    			div121 = element("div");
    			div117 = element("div");
    			div116 = element("div");
    			div74 = element("div");
    			div74.textContent = "Таблица конкурса";
    			t142 = space();
    			div75 = element("div");
    			div75.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t144 = space();
    			a3 = element("a");
    			a3.textContent = "Смотреть предыдущих победителей";
    			t146 = space();
    			div78 = element("div");
    			div76 = element("div");
    			div76.textContent = "Имя";
    			t148 = space();
    			div77 = element("div");
    			div77.textContent = "Коэффициент";
    			t150 = space();
    			div115 = element("div");
    			div84 = element("div");
    			div81 = element("div");
    			div79 = element("div");
    			div79.textContent = "1. Михаил";
    			t152 = space();
    			div80 = element("div");
    			div80.textContent = "+7 (999) *** ** 32";
    			t154 = space();
    			div83 = element("div");
    			div82 = element("div");
    			div82.textContent = "10.65";
    			t156 = space();
    			div90 = element("div");
    			div87 = element("div");
    			div85 = element("div");
    			div85.textContent = "2. Александр";
    			t158 = space();
    			div86 = element("div");
    			div86.textContent = "+7 (999) *** ** 45";
    			t160 = space();
    			div89 = element("div");
    			div88 = element("div");
    			div88.textContent = "9.87";
    			t162 = space();
    			div96 = element("div");
    			div93 = element("div");
    			div91 = element("div");
    			div91.textContent = "3. Дмитрий";
    			t164 = space();
    			div92 = element("div");
    			div92.textContent = "+7 (999) *** ** 78";
    			t166 = space();
    			div95 = element("div");
    			div94 = element("div");
    			div94.textContent = "9.54";
    			t168 = space();
    			div102 = element("div");
    			div99 = element("div");
    			div97 = element("div");
    			div97.textContent = "4. Иван";
    			t170 = space();
    			div98 = element("div");
    			div98.textContent = "+7 (999) *** ** 91";
    			t172 = space();
    			div101 = element("div");
    			div100 = element("div");
    			div100.textContent = "9.21";
    			t174 = space();
    			div108 = element("div");
    			div105 = element("div");
    			div103 = element("div");
    			div103.textContent = "5. Сергей";
    			t176 = space();
    			div104 = element("div");
    			div104.textContent = "+7 (999) *** ** 23";
    			t178 = space();
    			div107 = element("div");
    			div106 = element("div");
    			div106.textContent = "8.95";
    			t180 = space();
    			div114 = element("div");
    			div111 = element("div");
    			div109 = element("div");
    			div109.textContent = "6. Андрей";
    			t182 = space();
    			div110 = element("div");
    			div110.textContent = "+7 (999) *** ** 67";
    			t184 = space();
    			div113 = element("div");
    			div112 = element("div");
    			div112.textContent = "8.76";
    			t186 = space();
    			div120 = element("div");
    			div119 = element("div");
    			button2 = element("button");
    			button2.textContent = "Введите промокод";
    			t188 = space();
    			button3 = element("button");
    			button3.textContent = "Узнать место";
    			t190 = space();
    			p4 = element("p");
    			p4.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n            Промокод находится в личном кабинете БК «ига Ставок» разделе «Промокоды».";
    			t192 = space();
    			div118 = element("div");
    			p5 = element("p");
    			p5.textContent = "-Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t194 = space();
    			p6 = element("p");
    			p6.textContent = "-Приз за первое место iPhone 14 Pro";
    			t196 = space();
    			p7 = element("p");
    			p7.textContent = "-Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			t198 = space();
    			section3 = element("section");
    			create_component(screen4.$$.fragment);
    			t199 = space();
    			create_component(screen5.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/Ligalogo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Логотип");
    			attr_dev(img0, "class", "logo svelte-1vvpxxq");
    			add_location(img0, file$1, 39, 10, 1098);
    			attr_dev(div0, "class", "candy-cane svelte-1vvpxxq");
    			add_location(div0, file$1, 40, 10, 1170);
    			attr_dev(div1, "class", "logo-container svelte-1vvpxxq");
    			add_location(div1, file$1, 38, 8, 1059);
    			attr_dev(a0, "href", "#leaderboard-table");
    			attr_dev(a0, "class", "menu-item svelte-1vvpxxq");
    			add_location(a0, file$1, 43, 10, 1253);
    			attr_dev(a1, "href", "#about-project");
    			attr_dev(a1, "class", "menu-item svelte-1vvpxxq");
    			add_location(a1, file$1, 44, 10, 1333);
    			attr_dev(a2, "href", "#prizes");
    			attr_dev(a2, "class", "menu-item svelte-1vvpxxq");
    			add_location(a2, file$1, 45, 10, 1400);
    			attr_dev(div2, "class", "menu svelte-1vvpxxq");
    			add_location(div2, file$1, 42, 8, 1224);
    			attr_dev(div3, "class", "header svelte-1vvpxxq");
    			add_location(div3, file$1, 37, 6, 1030);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/header_mob.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Мобильный заголовок");
    			attr_dev(img1, "class", "header-mobile-image svelte-1vvpxxq");
    			add_location(img1, file$1, 49, 8, 1516);
    			attr_dev(div4, "class", "header-mobile svelte-1vvpxxq");
    			add_location(div4, file$1, 48, 6, 1480);
    			attr_dev(span0, "class", "first-line svelte-1vvpxxq");
    			add_location(span0, file$1, 56, 12, 1763);
    			attr_dev(span1, "class", "second-line svelte-1vvpxxq");
    			add_location(span1, file$1, 57, 12, 1819);
    			attr_dev(h10, "class", "title svelte-1vvpxxq");
    			add_location(h10, file$1, 55, 10, 1732);
    			attr_dev(span2, "class", "description-line svelte-1vvpxxq");
    			add_location(span2, file$1, 61, 14, 1979);
    			attr_dev(span3, "class", "description-line svelte-1vvpxxq");
    			add_location(span3, file$1, 62, 14, 2076);
    			attr_dev(span4, "class", "description-line svelte-1vvpxxq");
    			add_location(span4, file$1, 63, 14, 2196);
    			attr_dev(span5, "class", "description-line svelte-1vvpxxq");
    			add_location(span5, file$1, 64, 14, 2308);
    			attr_dev(p0, "class", "description svelte-1vvpxxq");
    			add_location(p0, file$1, 60, 12, 1941);
    			attr_dev(span6, "class", "description-line svelte-1vvpxxq");
    			add_location(span6, file$1, 68, 14, 2502);
    			attr_dev(span7, "class", "description-line svelte-1vvpxxq");
    			add_location(span7, file$1, 69, 14, 2595);
    			attr_dev(span8, "class", "description-line svelte-1vvpxxq");
    			add_location(span8, file$1, 70, 14, 2694);
    			attr_dev(p1, "class", "description description-secondary svelte-1vvpxxq");
    			add_location(p1, file$1, 67, 12, 2442);
    			attr_dev(div5, "class", "description-container svelte-1vvpxxq");
    			add_location(div5, file$1, 59, 10, 1893);
    			attr_dev(button0, "class", "promo-button svelte-1vvpxxq");
    			add_location(button0, file$1, 74, 12, 2836);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/santa.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Санта");
    			attr_dev(img2, "class", "santa-image svelte-1vvpxxq");
    			add_location(img2, file$1, 77, 12, 2960);
    			attr_dev(div6, "class", "promo-container svelte-1vvpxxq");
    			add_location(div6, file$1, 73, 10, 2794);
    			attr_dev(div7, "class", "left-side svelte-1vvpxxq");
    			add_location(div7, file$1, 54, 8, 1698);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/christmas-tree.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Ёлка");
    			attr_dev(img3, "class", "tree-image svelte-1vvpxxq");
    			add_location(img3, file$1, 83, 12, 3149);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/Подарки.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Подарки");
    			attr_dev(img4, "class", "gifts-image svelte-1vvpxxq");
    			add_location(img4, file$1, 84, 12, 3232);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/zvezda_1.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Звезда 1");
    			attr_dev(img5, "class", "star star-1 svelte-1vvpxxq");
    			add_location(img5, file$1, 85, 12, 3312);
    			if (!src_url_equal(img6.src, img6_src_value = "/images/zvezda_2.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Звезда 2");
    			attr_dev(img6, "class", "star star-2 svelte-1vvpxxq");
    			add_location(img6, file$1, 86, 12, 3394);
    			if (!src_url_equal(img7.src, img7_src_value = "/images/zvezda_3.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Звезда 3");
    			attr_dev(img7, "class", "star star-3 svelte-1vvpxxq");
    			add_location(img7, file$1, 87, 12, 3476);
    			attr_dev(div8, "class", "tree-container svelte-1vvpxxq");
    			add_location(div8, file$1, 82, 10, 3108);
    			attr_dev(div9, "class", "right-side svelte-1vvpxxq");
    			add_location(div9, file$1, 81, 8, 3073);
    			attr_dev(div10, "class", "content desktop-version svelte-1vvpxxq");
    			add_location(div10, file$1, 53, 6, 1652);
    			attr_dev(span9, "class", "first-line svelte-1vvpxxq");
    			add_location(span9, file$1, 96, 12, 3742);
    			attr_dev(span10, "class", "second-line svelte-1vvpxxq");
    			add_location(span10, file$1, 97, 12, 3798);
    			attr_dev(h11, "class", "title svelte-1vvpxxq");
    			add_location(h11, file$1, 95, 10, 3711);
    			attr_dev(span11, "class", "description-line svelte-1vvpxxq");
    			add_location(span11, file$1, 101, 14, 3958);
    			attr_dev(span12, "class", "description-line svelte-1vvpxxq");
    			add_location(span12, file$1, 102, 14, 4055);
    			attr_dev(span13, "class", "description-line svelte-1vvpxxq");
    			add_location(span13, file$1, 103, 14, 4175);
    			attr_dev(span14, "class", "description-line svelte-1vvpxxq");
    			add_location(span14, file$1, 104, 14, 4287);
    			attr_dev(p2, "class", "description svelte-1vvpxxq");
    			add_location(p2, file$1, 100, 12, 3920);
    			attr_dev(span15, "class", "description-line svelte-1vvpxxq");
    			add_location(span15, file$1, 108, 14, 4481);
    			attr_dev(span16, "class", "description-line svelte-1vvpxxq");
    			add_location(span16, file$1, 109, 14, 4574);
    			attr_dev(span17, "class", "description-line svelte-1vvpxxq");
    			add_location(span17, file$1, 110, 14, 4673);
    			attr_dev(p3, "class", "description description-secondary svelte-1vvpxxq");
    			add_location(p3, file$1, 107, 12, 4421);
    			attr_dev(div11, "class", "description-container svelte-1vvpxxq");
    			add_location(div11, file$1, 99, 10, 3872);
    			attr_dev(button1, "class", "promo-button svelte-1vvpxxq");
    			add_location(button1, file$1, 114, 12, 4815);
    			if (!src_url_equal(img8.src, img8_src_value = "/images/santa.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Санта");
    			attr_dev(img8, "class", "santa-image svelte-1vvpxxq");
    			add_location(img8, file$1, 117, 12, 4939);
    			attr_dev(div12, "class", "promo-container svelte-1vvpxxq");
    			add_location(div12, file$1, 113, 10, 4773);
    			attr_dev(div13, "class", "left-side svelte-1vvpxxq");
    			add_location(div13, file$1, 94, 8, 3677);
    			if (!src_url_equal(img9.src, img9_src_value = "/images/christmas-tree.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Ёлка");
    			attr_dev(img9, "class", "tree-image svelte-1vvpxxq");
    			add_location(img9, file$1, 123, 12, 5128);
    			if (!src_url_equal(img10.src, img10_src_value = "/images/Подарки.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Подарки");
    			attr_dev(img10, "class", "gifts-image svelte-1vvpxxq");
    			add_location(img10, file$1, 124, 12, 5211);
    			if (!src_url_equal(img11.src, img11_src_value = "/images/zvezda_1.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Звезда 1");
    			attr_dev(img11, "class", "star star-1 svelte-1vvpxxq");
    			add_location(img11, file$1, 125, 12, 5291);
    			if (!src_url_equal(img12.src, img12_src_value = "/images/zvezda_2.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "Звезда 2");
    			attr_dev(img12, "class", "star star-2 svelte-1vvpxxq");
    			add_location(img12, file$1, 126, 12, 5373);
    			if (!src_url_equal(img13.src, img13_src_value = "/images/zvezda_3.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "Звезда 3");
    			attr_dev(img13, "class", "star star-3 svelte-1vvpxxq");
    			add_location(img13, file$1, 127, 12, 5455);
    			attr_dev(div14, "class", "tree-container svelte-1vvpxxq");
    			add_location(div14, file$1, 122, 10, 5087);
    			attr_dev(div15, "class", "right-side svelte-1vvpxxq");
    			add_location(div15, file$1, 121, 8, 5052);
    			attr_dev(div16, "class", "content mobile-container svelte-1vvpxxq");
    			add_location(div16, file$1, 93, 6, 3630);
    			attr_dev(section0, "class", "first-screen svelte-1vvpxxq");
    			add_location(section0, file$1, 36, 4, 993);
    			attr_dev(div17, "class", "screen-container svelte-1vvpxxq");
    			add_location(div17, file$1, 35, 2, 958);
    			attr_dev(span18, "class", "prize-label svelte-1vvpxxq");
    			add_location(span18, file$1, 139, 10, 5806);
    			attr_dev(div18, "class", "prize-header svelte-1vvpxxq");
    			add_location(div18, file$1, 138, 8, 5769);
    			attr_dev(h2, "class", "prize-title svelte-1vvpxxq");
    			add_location(h2, file$1, 142, 8, 5884);
    			attr_dev(div19, "class", "spec-label svelte-1vvpxxq");
    			add_location(div19, file$1, 147, 14, 6061);
    			attr_dev(div20, "class", "spec-value svelte-1vvpxxq");
    			add_location(div20, file$1, 148, 14, 6118);
    			attr_dev(div21, "class", "spec-item svelte-1vvpxxq");
    			add_location(div21, file$1, 146, 12, 6023);
    			attr_dev(div22, "class", "spec-label svelte-1vvpxxq");
    			add_location(div22, file$1, 151, 14, 6224);
    			attr_dev(div23, "class", "spec-value svelte-1vvpxxq");
    			add_location(div23, file$1, 152, 14, 6278);
    			attr_dev(div24, "class", "spec-item svelte-1vvpxxq");
    			add_location(div24, file$1, 150, 12, 6186);
    			attr_dev(div25, "class", "specs-column svelte-1vvpxxq");
    			add_location(div25, file$1, 145, 10, 5984);
    			attr_dev(div26, "class", "spec-label svelte-1vvpxxq");
    			add_location(div26, file$1, 157, 14, 6442);
    			attr_dev(div27, "class", "spec-value svelte-1vvpxxq");
    			add_location(div27, file$1, 158, 14, 6491);
    			attr_dev(div28, "class", "spec-item svelte-1vvpxxq");
    			add_location(div28, file$1, 156, 12, 6404);
    			attr_dev(div29, "class", "spec-label svelte-1vvpxxq");
    			add_location(div29, file$1, 161, 14, 6609);
    			attr_dev(div30, "class", "spec-value svelte-1vvpxxq");
    			add_location(div30, file$1, 162, 14, 6660);
    			attr_dev(div31, "class", "spec-item svelte-1vvpxxq");
    			add_location(div31, file$1, 160, 12, 6571);
    			attr_dev(div32, "class", "specs-column svelte-1vvpxxq");
    			add_location(div32, file$1, 155, 10, 6365);
    			attr_dev(div33, "class", "specs-container svelte-1vvpxxq");
    			add_location(div33, file$1, 144, 8, 5944);
    			if (!src_url_equal(img14.src, img14_src_value = "/images/iphone14pro.png")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "iPhone 14 Pro");
    			attr_dev(img14, "class", "prize-image svelte-1vvpxxq");
    			add_location(img14, file$1, 167, 8, 6764);
    			if (!src_url_equal(img15.src, img15_src_value = "/images/gift.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "class", "gift-decoration svelte-1vvpxxq");
    			attr_dev(img15, "alt", "gift");
    			set_style(img15, "position", "absolute");
    			set_style(img15, "top", "-80px");
    			set_style(img15, "right", "-50px");
    			set_style(img15, "width", "180px");
    			set_style(img15, "height", "auto");
    			set_style(img15, "z-index", "-1");
    			set_style(img15, "mix-blend-mode", "multiply");
    			add_location(img15, file$1, 168, 8, 6848);
    			attr_dev(div34, "class", "main-prize svelte-1vvpxxq");
    			set_style(div34, "position", "relative");
    			add_location(div34, file$1, 137, 6, 5708);
    			attr_dev(h30, "class", "prize-card-category svelte-1vvpxxq");
    			add_location(h30, file$1, 173, 10, 7128);
    			attr_dev(h40, "class", "prize-card-model svelte-1vvpxxq");
    			add_location(h40, file$1, 174, 10, 7184);
    			if (!src_url_equal(img16.src, img16_src_value = "/images/Naychniki.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "Sony WH-1000XM4");
    			attr_dev(img16, "class", "prize-card-image svelte-1vvpxxq");
    			add_location(img16, file$1, 175, 10, 7244);
    			attr_dev(div35, "class", "prize-card svelte-1vvpxxq");
    			add_location(div35, file$1, 172, 8, 7093);
    			attr_dev(h31, "class", "prize-card-category svelte-1vvpxxq");
    			add_location(h31, file$1, 179, 10, 7384);
    			attr_dev(h41, "class", "prize-card-model svelte-1vvpxxq");
    			add_location(h41, file$1, 180, 10, 7443);
    			if (!src_url_equal(img17.src, img17_src_value = "/images/wine-fridge.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "alt", "Kitfort KT-2403");
    			attr_dev(img17, "class", "prize-card-image svelte-1vvpxxq");
    			add_location(img17, file$1, 181, 10, 7503);
    			attr_dev(div36, "class", "prize-card svelte-1vvpxxq");
    			add_location(div36, file$1, 178, 8, 7349);
    			attr_dev(h32, "class", "prize-card-category svelte-1vvpxxq");
    			add_location(h32, file$1, 185, 10, 7645);
    			attr_dev(h42, "class", "prize-card-model svelte-1vvpxxq");
    			add_location(h42, file$1, 186, 10, 7706);
    			if (!src_url_equal(img18.src, img18_src_value = "/images/mi-band.png")) attr_dev(img18, "src", img18_src_value);
    			attr_dev(img18, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img18, "class", "prize-card-image svelte-1vvpxxq");
    			add_location(img18, file$1, 187, 10, 7767);
    			attr_dev(div37, "class", "prize-card svelte-1vvpxxq");
    			add_location(div37, file$1, 184, 8, 7610);
    			attr_dev(div38, "class", "additional-prizes svelte-1vvpxxq");
    			add_location(div38, file$1, 171, 6, 7053);
    			attr_dev(div39, "class", "header-place svelte-1vvpxxq");
    			add_location(div39, file$1, 194, 12, 8006);
    			attr_dev(div40, "class", "header-prize svelte-1vvpxxq");
    			add_location(div40, file$1, 195, 12, 8056);
    			attr_dev(div41, "class", "header-freebet svelte-1vvpxxq");
    			add_location(div41, file$1, 196, 12, 8105);
    			attr_dev(div42, "class", "leaderboard-headers svelte-1vvpxxq");
    			add_location(div42, file$1, 193, 10, 7960);
    			attr_dev(div43, "class", "place svelte-1vvpxxq");
    			add_location(div43, file$1, 201, 14, 8261);
    			attr_dev(div44, "class", "prize svelte-1vvpxxq");
    			add_location(div44, file$1, 202, 14, 8302);
    			attr_dev(div45, "class", "freebet svelte-1vvpxxq");
    			add_location(div45, file$1, 203, 14, 8355);
    			attr_dev(div46, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div46, file$1, 200, 12, 8217);
    			attr_dev(div47, "class", "place svelte-1vvpxxq");
    			add_location(div47, file$1, 207, 14, 8467);
    			attr_dev(div48, "class", "prize svelte-1vvpxxq");
    			add_location(div48, file$1, 208, 14, 8508);
    			attr_dev(div49, "class", "freebet svelte-1vvpxxq");
    			add_location(div49, file$1, 209, 14, 8561);
    			attr_dev(div50, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div50, file$1, 206, 12, 8423);
    			attr_dev(div51, "class", "place svelte-1vvpxxq");
    			add_location(div51, file$1, 213, 14, 8673);
    			attr_dev(div52, "class", "prize svelte-1vvpxxq");
    			add_location(div52, file$1, 214, 14, 8714);
    			attr_dev(div53, "class", "freebet svelte-1vvpxxq");
    			add_location(div53, file$1, 215, 14, 8767);
    			attr_dev(div54, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div54, file$1, 212, 12, 8629);
    			attr_dev(div55, "class", "place svelte-1vvpxxq");
    			add_location(div55, file$1, 219, 14, 8879);
    			attr_dev(div56, "class", "prize svelte-1vvpxxq");
    			add_location(div56, file$1, 220, 14, 8920);
    			attr_dev(div57, "class", "freebet svelte-1vvpxxq");
    			add_location(div57, file$1, 221, 14, 8979);
    			attr_dev(div58, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div58, file$1, 218, 12, 8835);
    			attr_dev(div59, "class", "place svelte-1vvpxxq");
    			add_location(div59, file$1, 225, 14, 9091);
    			attr_dev(div60, "class", "prize svelte-1vvpxxq");
    			add_location(div60, file$1, 226, 14, 9132);
    			attr_dev(div61, "class", "freebet svelte-1vvpxxq");
    			add_location(div61, file$1, 227, 14, 9191);
    			attr_dev(div62, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div62, file$1, 224, 12, 9047);
    			attr_dev(div63, "class", "place svelte-1vvpxxq");
    			add_location(div63, file$1, 231, 14, 9303);
    			attr_dev(div64, "class", "prize svelte-1vvpxxq");
    			add_location(div64, file$1, 232, 14, 9347);
    			attr_dev(div65, "class", "freebet svelte-1vvpxxq");
    			add_location(div65, file$1, 233, 14, 9407);
    			attr_dev(div66, "class", "leaderboard-row svelte-1vvpxxq");
    			add_location(div66, file$1, 230, 12, 9259);
    			attr_dev(div67, "class", "leaderboard-rows svelte-1vvpxxq");
    			add_location(div67, file$1, 199, 10, 8174);
    			attr_dev(div68, "class", "leaderboard-content svelte-1vvpxxq");
    			add_location(div68, file$1, 192, 8, 7916);
    			if (!src_url_equal(img19.src, img19_src_value = "/images/Merch.png")) attr_dev(img19, "src", img19_src_value);
    			attr_dev(img19, "alt", "Мерч");
    			set_style(img19, "width", "100%");
    			set_style(img19, "height", "100%");
    			set_style(img19, "object-fit", "cover");
    			attr_dev(img19, "class", "svelte-1vvpxxq");
    			add_location(img19, file$1, 241, 14, 9620);
    			attr_dev(div69, "class", "merch-images svelte-1vvpxxq");
    			add_location(div69, file$1, 240, 12, 9579);
    			attr_dev(div70, "class", "merch-content svelte-1vvpxxq");
    			add_location(div70, file$1, 239, 10, 9539);
    			attr_dev(div71, "class", "merch-column svelte-1vvpxxq");
    			add_location(div71, file$1, 238, 8, 9502);
    			attr_dev(div72, "class", "leaderboard svelte-1vvpxxq");
    			add_location(div72, file$1, 191, 6, 7882);
    			attr_dev(section1, "class", "second-screen svelte-1vvpxxq");
    			attr_dev(section1, "id", "prizes");
    			add_location(section1, file$1, 136, 4, 5658);
    			attr_dev(div73, "class", "screen-container svelte-1vvpxxq");
    			add_location(div73, file$1, 135, 2, 5623);
    			attr_dev(div74, "class", "contest-title svelte-1vvpxxq");
    			add_location(div74, file$1, 255, 10, 10047);
    			attr_dev(div75, "class", "contest-description svelte-1vvpxxq");
    			add_location(div75, file$1, 256, 10, 10107);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "previous-winners-link svelte-1vvpxxq");
    			add_location(a3, file$1, 257, 10, 10235);
    			attr_dev(div76, "class", "header-left svelte-1vvpxxq");
    			add_location(div76, file$1, 261, 12, 10393);
    			attr_dev(div77, "class", "header-right svelte-1vvpxxq");
    			add_location(div77, file$1, 262, 12, 10440);
    			attr_dev(div78, "class", "table-headers svelte-1vvpxxq");
    			add_location(div78, file$1, 260, 10, 10353);
    			attr_dev(div79, "class", "name svelte-1vvpxxq");
    			add_location(div79, file$1, 269, 16, 10663);
    			attr_dev(div80, "class", "phone svelte-1vvpxxq");
    			add_location(div80, file$1, 270, 16, 10713);
    			attr_dev(div81, "class", "left-column svelte-1vvpxxq");
    			add_location(div81, file$1, 268, 14, 10621);
    			attr_dev(div82, "class", "coefficient svelte-1vvpxxq");
    			add_location(div82, file$1, 273, 16, 10835);
    			attr_dev(div83, "class", "right-column svelte-1vvpxxq");
    			add_location(div83, file$1, 272, 14, 10792);
    			attr_dev(div84, "class", "table-row svelte-1vvpxxq");
    			add_location(div84, file$1, 267, 12, 10583);
    			attr_dev(div85, "class", "name svelte-1vvpxxq");
    			add_location(div85, file$1, 278, 16, 11004);
    			attr_dev(div86, "class", "phone svelte-1vvpxxq");
    			add_location(div86, file$1, 279, 16, 11057);
    			attr_dev(div87, "class", "left-column svelte-1vvpxxq");
    			add_location(div87, file$1, 277, 14, 10962);
    			attr_dev(div88, "class", "coefficient svelte-1vvpxxq");
    			add_location(div88, file$1, 282, 16, 11179);
    			attr_dev(div89, "class", "right-column svelte-1vvpxxq");
    			add_location(div89, file$1, 281, 14, 11136);
    			attr_dev(div90, "class", "table-row svelte-1vvpxxq");
    			add_location(div90, file$1, 276, 12, 10924);
    			attr_dev(div91, "class", "name svelte-1vvpxxq");
    			add_location(div91, file$1, 287, 16, 11347);
    			attr_dev(div92, "class", "phone svelte-1vvpxxq");
    			add_location(div92, file$1, 288, 16, 11398);
    			attr_dev(div93, "class", "left-column svelte-1vvpxxq");
    			add_location(div93, file$1, 286, 14, 11305);
    			attr_dev(div94, "class", "coefficient svelte-1vvpxxq");
    			add_location(div94, file$1, 291, 16, 11520);
    			attr_dev(div95, "class", "right-column svelte-1vvpxxq");
    			add_location(div95, file$1, 290, 14, 11477);
    			attr_dev(div96, "class", "table-row svelte-1vvpxxq");
    			add_location(div96, file$1, 285, 12, 11267);
    			attr_dev(div97, "class", "name svelte-1vvpxxq");
    			add_location(div97, file$1, 296, 16, 11688);
    			attr_dev(div98, "class", "phone svelte-1vvpxxq");
    			add_location(div98, file$1, 297, 16, 11736);
    			attr_dev(div99, "class", "left-column svelte-1vvpxxq");
    			add_location(div99, file$1, 295, 14, 11646);
    			attr_dev(div100, "class", "coefficient svelte-1vvpxxq");
    			add_location(div100, file$1, 300, 16, 11858);
    			attr_dev(div101, "class", "right-column svelte-1vvpxxq");
    			add_location(div101, file$1, 299, 14, 11815);
    			attr_dev(div102, "class", "table-row svelte-1vvpxxq");
    			add_location(div102, file$1, 294, 12, 11608);
    			attr_dev(div103, "class", "name svelte-1vvpxxq");
    			add_location(div103, file$1, 305, 16, 12026);
    			attr_dev(div104, "class", "phone svelte-1vvpxxq");
    			add_location(div104, file$1, 306, 16, 12076);
    			attr_dev(div105, "class", "left-column svelte-1vvpxxq");
    			add_location(div105, file$1, 304, 14, 11984);
    			attr_dev(div106, "class", "coefficient svelte-1vvpxxq");
    			add_location(div106, file$1, 309, 16, 12198);
    			attr_dev(div107, "class", "right-column svelte-1vvpxxq");
    			add_location(div107, file$1, 308, 14, 12155);
    			attr_dev(div108, "class", "table-row svelte-1vvpxxq");
    			add_location(div108, file$1, 303, 12, 11946);
    			attr_dev(div109, "class", "name svelte-1vvpxxq");
    			add_location(div109, file$1, 314, 16, 12366);
    			attr_dev(div110, "class", "phone svelte-1vvpxxq");
    			add_location(div110, file$1, 315, 16, 12416);
    			attr_dev(div111, "class", "left-column svelte-1vvpxxq");
    			add_location(div111, file$1, 313, 14, 12324);
    			attr_dev(div112, "class", "coefficient svelte-1vvpxxq");
    			add_location(div112, file$1, 318, 16, 12538);
    			attr_dev(div113, "class", "right-column svelte-1vvpxxq");
    			add_location(div113, file$1, 317, 14, 12495);
    			attr_dev(div114, "class", "table-row svelte-1vvpxxq");
    			add_location(div114, file$1, 312, 12, 12286);
    			attr_dev(div115, "class", "table-rows svelte-1vvpxxq");
    			add_location(div115, file$1, 266, 10, 10546);
    			attr_dev(div116, "class", "table-frame svelte-1vvpxxq");
    			add_location(div116, file$1, 253, 8, 9973);
    			attr_dev(div117, "class", "leaderboard-left svelte-1vvpxxq");
    			add_location(div117, file$1, 252, 6, 9934);
    			attr_dev(button2, "class", "action-button svelte-1vvpxxq");
    			add_location(button2, file$1, 327, 10, 12800);
    			attr_dev(button3, "class", "action-button svelte-1vvpxxq");
    			add_location(button3, file$1, 328, 10, 12898);
    			attr_dev(p4, "class", "promo-description svelte-1vvpxxq");
    			add_location(p4, file$1, 330, 10, 12999);
    			attr_dev(p5, "class", "svelte-1vvpxxq");
    			add_location(p5, file$1, 336, 12, 13260);
    			attr_dev(p6, "class", "svelte-1vvpxxq");
    			add_location(p6, file$1, 337, 12, 13373);
    			attr_dev(p7, "class", "svelte-1vvpxxq");
    			add_location(p7, file$1, 338, 12, 13428);
    			attr_dev(div118, "class", "additional-info svelte-1vvpxxq");
    			add_location(div118, file$1, 335, 10, 13218);
    			attr_dev(div119, "class", "actions-container actions-container-mobile svelte-1vvpxxq");
    			set_style(div119, "margin-top", "190px");
    			add_location(div119, file$1, 326, 8, 12706);
    			attr_dev(div120, "class", "leaderboard-right svelte-1vvpxxq");
    			add_location(div120, file$1, 325, 6, 12666);
    			attr_dev(div121, "class", "leaderboard-container svelte-1vvpxxq");
    			add_location(div121, file$1, 251, 4, 9892);
    			attr_dev(section2, "class", "third-screen svelte-1vvpxxq");
    			attr_dev(section2, "id", "leaderboard-table");
    			add_location(section2, file$1, 250, 2, 9834);
    			attr_dev(section3, "id", "about-project");
    			attr_dev(section3, "class", "svelte-1vvpxxq");
    			add_location(section3, file$1, 346, 2, 13628);
    			attr_dev(div122, "class", "page-wrapper svelte-1vvpxxq");
    			add_location(div122, file$1, 33, 0, 899);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div122, anchor);
    			append_dev(div122, div17);
    			append_dev(div17, section0);
    			append_dev(section0, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, a0);
    			append_dev(div2, t3);
    			append_dev(div2, a1);
    			append_dev(div2, t5);
    			append_dev(div2, a2);
    			append_dev(section0, t7);
    			append_dev(section0, div4);
    			append_dev(div4, img1);
    			append_dev(section0, t8);
    			append_dev(section0, div10);
    			append_dev(div10, div7);
    			append_dev(div7, h10);
    			append_dev(h10, span0);
    			append_dev(h10, t10);
    			append_dev(h10, span1);
    			append_dev(div7, t12);
    			append_dev(div7, div5);
    			append_dev(div5, p0);
    			append_dev(p0, span2);
    			append_dev(p0, t14);
    			append_dev(p0, span3);
    			append_dev(p0, t16);
    			append_dev(p0, span4);
    			append_dev(p0, t18);
    			append_dev(p0, span5);
    			append_dev(div5, t20);
    			append_dev(div5, p1);
    			append_dev(p1, span6);
    			append_dev(p1, t22);
    			append_dev(p1, span7);
    			append_dev(p1, t24);
    			append_dev(p1, span8);
    			append_dev(div7, t26);
    			append_dev(div7, div6);
    			append_dev(div6, button0);
    			append_dev(div6, t28);
    			append_dev(div6, img2);
    			append_dev(div10, t29);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, img3);
    			append_dev(div8, t30);
    			append_dev(div8, img4);
    			append_dev(div8, t31);
    			append_dev(div8, img5);
    			append_dev(div8, t32);
    			append_dev(div8, img6);
    			append_dev(div8, t33);
    			append_dev(div8, img7);
    			append_dev(section0, t34);
    			append_dev(section0, div16);
    			append_dev(div16, div13);
    			append_dev(div13, h11);
    			append_dev(h11, span9);
    			append_dev(h11, t36);
    			append_dev(h11, span10);
    			append_dev(div13, t38);
    			append_dev(div13, div11);
    			append_dev(div11, p2);
    			append_dev(p2, span11);
    			append_dev(p2, t40);
    			append_dev(p2, span12);
    			append_dev(p2, t42);
    			append_dev(p2, span13);
    			append_dev(p2, t44);
    			append_dev(p2, span14);
    			append_dev(div11, t46);
    			append_dev(div11, p3);
    			append_dev(p3, span15);
    			append_dev(p3, t48);
    			append_dev(p3, span16);
    			append_dev(p3, t50);
    			append_dev(p3, span17);
    			append_dev(div13, t52);
    			append_dev(div13, div12);
    			append_dev(div12, button1);
    			append_dev(div12, t54);
    			append_dev(div12, img8);
    			append_dev(div16, t55);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, img9);
    			append_dev(div14, t56);
    			append_dev(div14, img10);
    			append_dev(div14, t57);
    			append_dev(div14, img11);
    			append_dev(div14, t58);
    			append_dev(div14, img12);
    			append_dev(div14, t59);
    			append_dev(div14, img13);
    			append_dev(div122, t60);
    			append_dev(div122, div73);
    			append_dev(div73, section1);
    			append_dev(section1, div34);
    			append_dev(div34, div18);
    			append_dev(div18, span18);
    			append_dev(div34, t62);
    			append_dev(div34, h2);
    			append_dev(div34, t64);
    			append_dev(div34, div33);
    			append_dev(div33, div25);
    			append_dev(div25, div21);
    			append_dev(div21, div19);
    			append_dev(div21, t66);
    			append_dev(div21, div20);
    			append_dev(div25, t68);
    			append_dev(div25, div24);
    			append_dev(div24, div22);
    			append_dev(div24, t70);
    			append_dev(div24, div23);
    			append_dev(div33, t72);
    			append_dev(div33, div32);
    			append_dev(div32, div28);
    			append_dev(div28, div26);
    			append_dev(div28, t74);
    			append_dev(div28, div27);
    			append_dev(div32, t76);
    			append_dev(div32, div31);
    			append_dev(div31, div29);
    			append_dev(div31, t78);
    			append_dev(div31, div30);
    			append_dev(div34, t80);
    			append_dev(div34, img14);
    			append_dev(div34, t81);
    			append_dev(div34, img15);
    			append_dev(section1, t82);
    			append_dev(section1, div38);
    			append_dev(div38, div35);
    			append_dev(div35, h30);
    			append_dev(div35, t84);
    			append_dev(div35, h40);
    			append_dev(div35, t86);
    			append_dev(div35, img16);
    			append_dev(div38, t87);
    			append_dev(div38, div36);
    			append_dev(div36, h31);
    			append_dev(div36, t89);
    			append_dev(div36, h41);
    			append_dev(div36, t91);
    			append_dev(div36, img17);
    			append_dev(div38, t92);
    			append_dev(div38, div37);
    			append_dev(div37, h32);
    			append_dev(div37, t94);
    			append_dev(div37, h42);
    			append_dev(div37, t96);
    			append_dev(div37, img18);
    			append_dev(section1, t97);
    			append_dev(section1, div72);
    			append_dev(div72, div68);
    			append_dev(div68, div42);
    			append_dev(div42, div39);
    			append_dev(div42, t99);
    			append_dev(div42, div40);
    			append_dev(div42, t101);
    			append_dev(div42, div41);
    			append_dev(div68, t103);
    			append_dev(div68, div67);
    			append_dev(div67, div46);
    			append_dev(div46, div43);
    			append_dev(div46, t105);
    			append_dev(div46, div44);
    			append_dev(div46, t107);
    			append_dev(div46, div45);
    			append_dev(div67, t109);
    			append_dev(div67, div50);
    			append_dev(div50, div47);
    			append_dev(div50, t111);
    			append_dev(div50, div48);
    			append_dev(div50, t113);
    			append_dev(div50, div49);
    			append_dev(div67, t115);
    			append_dev(div67, div54);
    			append_dev(div54, div51);
    			append_dev(div54, t117);
    			append_dev(div54, div52);
    			append_dev(div54, t119);
    			append_dev(div54, div53);
    			append_dev(div67, t121);
    			append_dev(div67, div58);
    			append_dev(div58, div55);
    			append_dev(div58, t123);
    			append_dev(div58, div56);
    			append_dev(div58, t125);
    			append_dev(div58, div57);
    			append_dev(div67, t127);
    			append_dev(div67, div62);
    			append_dev(div62, div59);
    			append_dev(div62, t129);
    			append_dev(div62, div60);
    			append_dev(div62, t131);
    			append_dev(div62, div61);
    			append_dev(div67, t133);
    			append_dev(div67, div66);
    			append_dev(div66, div63);
    			append_dev(div66, t135);
    			append_dev(div66, div64);
    			append_dev(div66, t137);
    			append_dev(div66, div65);
    			append_dev(div72, t139);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div70, div69);
    			append_dev(div69, img19);
    			append_dev(div122, t140);
    			append_dev(div122, section2);
    			append_dev(section2, div121);
    			append_dev(div121, div117);
    			append_dev(div117, div116);
    			append_dev(div116, div74);
    			append_dev(div116, t142);
    			append_dev(div116, div75);
    			append_dev(div116, t144);
    			append_dev(div116, a3);
    			append_dev(div116, t146);
    			append_dev(div116, div78);
    			append_dev(div78, div76);
    			append_dev(div78, t148);
    			append_dev(div78, div77);
    			append_dev(div116, t150);
    			append_dev(div116, div115);
    			append_dev(div115, div84);
    			append_dev(div84, div81);
    			append_dev(div81, div79);
    			append_dev(div81, t152);
    			append_dev(div81, div80);
    			append_dev(div84, t154);
    			append_dev(div84, div83);
    			append_dev(div83, div82);
    			append_dev(div115, t156);
    			append_dev(div115, div90);
    			append_dev(div90, div87);
    			append_dev(div87, div85);
    			append_dev(div87, t158);
    			append_dev(div87, div86);
    			append_dev(div90, t160);
    			append_dev(div90, div89);
    			append_dev(div89, div88);
    			append_dev(div115, t162);
    			append_dev(div115, div96);
    			append_dev(div96, div93);
    			append_dev(div93, div91);
    			append_dev(div93, t164);
    			append_dev(div93, div92);
    			append_dev(div96, t166);
    			append_dev(div96, div95);
    			append_dev(div95, div94);
    			append_dev(div115, t168);
    			append_dev(div115, div102);
    			append_dev(div102, div99);
    			append_dev(div99, div97);
    			append_dev(div99, t170);
    			append_dev(div99, div98);
    			append_dev(div102, t172);
    			append_dev(div102, div101);
    			append_dev(div101, div100);
    			append_dev(div115, t174);
    			append_dev(div115, div108);
    			append_dev(div108, div105);
    			append_dev(div105, div103);
    			append_dev(div105, t176);
    			append_dev(div105, div104);
    			append_dev(div108, t178);
    			append_dev(div108, div107);
    			append_dev(div107, div106);
    			append_dev(div115, t180);
    			append_dev(div115, div114);
    			append_dev(div114, div111);
    			append_dev(div111, div109);
    			append_dev(div111, t182);
    			append_dev(div111, div110);
    			append_dev(div114, t184);
    			append_dev(div114, div113);
    			append_dev(div113, div112);
    			append_dev(div121, t186);
    			append_dev(div121, div120);
    			append_dev(div120, div119);
    			append_dev(div119, button2);
    			append_dev(div119, t188);
    			append_dev(div119, button3);
    			append_dev(div119, t190);
    			append_dev(div119, p4);
    			append_dev(div119, t192);
    			append_dev(div119, div118);
    			append_dev(div118, p5);
    			append_dev(div118, t194);
    			append_dev(div118, p6);
    			append_dev(div118, t196);
    			append_dev(div118, p7);
    			append_dev(div122, t198);
    			append_dev(div122, section3);
    			mount_component(screen4, section3, null);
    			append_dev(div122, t199);
    			mount_component(screen5, div122, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", handlePromoClick, false, false, false, false),
    					listen_dev(button1, "click", handlePromoClick, false, false, false, false),
    					listen_dev(button2, "click", handlePromoCodeInput, false, false, false, false),
    					listen_dev(button3, "click", handleCheckPlace, false, false, false, false)
    				];

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
    			if (detaching) detach_dev(div122);
    			destroy_component(screen4);
    			destroy_component(screen5);
    			mounted = false;
    			run_all(dispose);
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

    // Функция для обработки ввода промокода
    function handlePromoCodeInput() {
    	alert('Вы успешно ввели промокод!');
    }

    // Функция для обработки проверки места
    function handleCheckPlace() {
    	alert('Вот ваше место');
    }

    // Добавим плавный скролл для всех внутренних ссылок
    function handleScroll(e) {
    	const href = e.currentTarget.getAttribute('href');

    	if (href.startsWith('#')) {
    		e.preventDefault();
    		const element = document.querySelector(href);

    		if (element) {
    			element.scrollIntoView({ behavior: 'smooth' });
    		}
    	}
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Screen1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Screen4,
    		Screen5,
    		handlePromoClick,
    		handlePromoCodeInput,
    		handleCheckPlace,
    		handleScroll
    	});

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
