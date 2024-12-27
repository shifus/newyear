
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
    	let a;
    	let t6;
    	let p1;
    	let t8;
    	let button;
    	let span;
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
    			button = element("button");
    			span = element("span");
    			span.textContent = "ПОЛУЧИТЬ ПРОМОКОД";
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
    			attr_dev(h2, "class", "project-title svelte-1fi8a5n");
    			add_location(h2, file$3, 10, 2, 291);
    			attr_dev(div0, "class", "santa-image svelte-1fi8a5n");
    			add_location(div0, file$3, 13, 4, 390);
    			attr_dev(p0, "class", "highlight-text svelte-1fi8a5n");
    			add_location(p0, file$3, 16, 6, 471);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "rules-text svelte-1fi8a5n");
    			add_location(a, file$3, 19, 6, 605);
    			attr_dev(p1, "class", "details-text svelte-1fi8a5n");
    			add_location(p1, file$3, 20, 6, 660);
    			attr_dev(span, "class", "promo-button-text svelte-1fi8a5n");
    			add_location(span, file$3, 26, 8, 1023);
    			attr_dev(button, "class", "promo-button svelte-1fi8a5n");
    			add_location(button, file$3, 25, 6, 957);
    			attr_dev(div1, "class", "project-description svelte-1fi8a5n");
    			add_location(div1, file$3, 15, 4, 431);
    			attr_dev(div2, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div2, file$3, 34, 10, 1281);
    			attr_dev(div3, "class", "image-frame svelte-1fi8a5n");
    			add_location(div3, file$3, 33, 8, 1245);
    			attr_dev(p2, "class", "row-text svelte-1fi8a5n");
    			add_location(p2, file$3, 36, 8, 1341);
    			attr_dev(div4, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div4, file$3, 32, 6, 1207);
    			attr_dev(div5, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div5, file$3, 42, 10, 1538);
    			attr_dev(div6, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div6, file$3, 43, 10, 1585);
    			attr_dev(div7, "class", "image-frame svelte-1fi8a5n");
    			add_location(div7, file$3, 41, 8, 1502);
    			attr_dev(p3, "class", "row-text svelte-1fi8a5n");
    			add_location(p3, file$3, 45, 8, 1645);
    			attr_dev(div8, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div8, file$3, 40, 6, 1464);
    			attr_dev(div9, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div9, file$3, 51, 10, 1870);
    			attr_dev(div10, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div10, file$3, 52, 10, 1917);
    			attr_dev(div11, "class", "image image-lamp svelte-1fi8a5n");
    			add_location(div11, file$3, 53, 10, 1964);
    			attr_dev(div12, "class", "image-frame svelte-1fi8a5n");
    			add_location(div12, file$3, 50, 8, 1834);
    			attr_dev(p4, "class", "row-text svelte-1fi8a5n");
    			add_location(p4, file$3, 55, 8, 2024);
    			attr_dev(div13, "class", "lamp-text-block svelte-1fi8a5n");
    			add_location(div13, file$3, 49, 6, 1796);
    			attr_dev(div14, "class", "right-column svelte-1fi8a5n");
    			add_location(div14, file$3, 30, 4, 1112);
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
    			append_dev(div1, a);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(div1, t8);
    			append_dev(div1, button);
    			append_dev(button, span);
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
    	let div70;
    	let div13;
    	let section0;
    	let div6;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div5;
    	let div2;
    	let t3;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div12;
    	let div9;
    	let h1;
    	let t9;
    	let br;
    	let t10;
    	let t11;
    	let p0;
    	let t13;
    	let p1;
    	let t15;
    	let div8;
    	let button0;
    	let t17;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let div11;
    	let div10;
    	let img3;
    	let img3_src_value;
    	let t19;
    	let img4;
    	let img4_src_value;
    	let t20;
    	let div62;
    	let section1;
    	let div22;
    	let div14;
    	let span0;
    	let t22;
    	let h20;
    	let t24;
    	let div21;
    	let div17;
    	let div15;
    	let span1;
    	let t26;
    	let span2;
    	let t28;
    	let div16;
    	let span3;
    	let t30;
    	let span4;
    	let t32;
    	let div20;
    	let div18;
    	let span5;
    	let t34;
    	let span6;
    	let t36;
    	let div19;
    	let span7;
    	let t38;
    	let span8;
    	let t40;
    	let img5;
    	let img5_src_value;
    	let t41;
    	let div26;
    	let div23;
    	let h30;
    	let t43;
    	let h40;
    	let t45;
    	let img6;
    	let img6_src_value;
    	let t46;
    	let div24;
    	let h31;
    	let t48;
    	let h41;
    	let t50;
    	let img7;
    	let img7_src_value;
    	let t51;
    	let div25;
    	let h32;
    	let t53;
    	let h42;
    	let t55;
    	let img8;
    	let img8_src_value;
    	let t56;
    	let div61;
    	let div56;
    	let div30;
    	let div27;
    	let t58;
    	let div28;
    	let t60;
    	let div29;
    	let t62;
    	let div55;
    	let div34;
    	let div31;
    	let t64;
    	let div32;
    	let t66;
    	let div33;
    	let t68;
    	let div38;
    	let div35;
    	let t70;
    	let div36;
    	let t72;
    	let div37;
    	let t74;
    	let div42;
    	let div39;
    	let t76;
    	let div40;
    	let t78;
    	let div41;
    	let t80;
    	let div46;
    	let div43;
    	let t82;
    	let div44;
    	let t84;
    	let div45;
    	let t86;
    	let div50;
    	let div47;
    	let t88;
    	let div48;
    	let t90;
    	let div49;
    	let t92;
    	let div54;
    	let div51;
    	let t94;
    	let div52;
    	let t96;
    	let div53;
    	let t98;
    	let div60;
    	let div59;
    	let div57;
    	let t99;
    	let div58;
    	let span9;
    	let t101;
    	let section2;
    	let div69;
    	let div65;
    	let h21;
    	let t103;
    	let p2;
    	let t105;
    	let a;
    	let t107;
    	let div64;
    	let div63;
    	let t108;
    	let div68;
    	let div67;
    	let button1;
    	let t110;
    	let button2;
    	let t112;
    	let p3;
    	let t114;
    	let div66;
    	let p4;
    	let t116;
    	let p5;
    	let t118;
    	let p6;
    	let t120;
    	let screen4;
    	let t121;
    	let screen5;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div70 = element("div");
    			div13 = element("div");
    			section0 = element("section");
    			div6 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div2.textContent = "Таблица участников";
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "О проекте";
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Призы";
    			t7 = space();
    			div7 = element("div");
    			img1 = element("img");
    			t8 = space();
    			div12 = element("div");
    			div9 = element("div");
    			h1 = element("h1");
    			t9 = text("В НОВЫЙ ГОД");
    			br = element("br");
    			t10 = text("\n            С ЛИГОЙ СТАВОК");
    			t11 = space();
    			p0 = element("p");
    			p0.textContent = "Лига ставок поздравляет всех с Новым Годом! Желаем всего да побольше, особенно больше высоких выигрышных кэфов!\n            И анонсируем новый спецпроект, где больше однозначно лучше! \n            Получите уникальный промокод для участия в розыгрыше.";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Заключайте пари на высокие коэффициенты. Призы достанутся 100 одателям самых больших выигрышных кэфов!";
    			t15 = space();
    			div8 = element("div");
    			button0 = element("button");
    			button0.textContent = "Получить промокод";
    			t17 = space();
    			img2 = element("img");
    			t18 = space();
    			div11 = element("div");
    			div10 = element("div");
    			img3 = element("img");
    			t19 = space();
    			img4 = element("img");
    			t20 = space();
    			div62 = element("div");
    			section1 = element("section");
    			div22 = element("div");
    			div14 = element("div");
    			span0 = element("span");
    			span0.textContent = "Главный приз";
    			t22 = space();
    			h20 = element("h2");
    			h20.textContent = "iPhone 14 Pro";
    			t24 = space();
    			div21 = element("div");
    			div17 = element("div");
    			div15 = element("div");
    			span1 = element("span");
    			span1.textContent = "Объем памяти";
    			t26 = space();
    			span2 = element("span");
    			span2.textContent = "128 GB";
    			t28 = space();
    			div16 = element("div");
    			span3 = element("span");
    			span3.textContent = "Процессор";
    			t30 = space();
    			span4 = element("span");
    			span4.textContent = "A16 Bionic";
    			t32 = space();
    			div20 = element("div");
    			div18 = element("div");
    			span5 = element("span");
    			span5.textContent = "Цвет";
    			t34 = space();
    			span6 = element("span");
    			span6.textContent = "Космический черный";
    			t36 = space();
    			div19 = element("div");
    			span7 = element("span");
    			span7.textContent = "Камера";
    			t38 = space();
    			span8 = element("span");
    			span8.textContent = "48 МП";
    			t40 = space();
    			img5 = element("img");
    			t41 = space();
    			div26 = element("div");
    			div23 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t43 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t45 = space();
    			img6 = element("img");
    			t46 = space();
    			div24 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t48 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t50 = space();
    			img7 = element("img");
    			t51 = space();
    			div25 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t53 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t55 = space();
    			img8 = element("img");
    			t56 = space();
    			div61 = element("div");
    			div56 = element("div");
    			div30 = element("div");
    			div27 = element("div");
    			div27.textContent = "Место";
    			t58 = space();
    			div28 = element("div");
    			div28.textContent = "Приз";
    			t60 = space();
    			div29 = element("div");
    			div29.textContent = "Фрибет";
    			t62 = space();
    			div55 = element("div");
    			div34 = element("div");
    			div31 = element("div");
    			div31.textContent = "1";
    			t64 = space();
    			div32 = element("div");
    			div32.textContent = "iPhone 14 Pro";
    			t66 = space();
    			div33 = element("div");
    			div33.textContent = "50 000 ₽";
    			t68 = space();
    			div38 = element("div");
    			div35 = element("div");
    			div35.textContent = "2";
    			t70 = space();
    			div36 = element("div");
    			div36.textContent = "Наушники Sony";
    			t72 = space();
    			div37 = element("div");
    			div37.textContent = "40 000 ₽";
    			t74 = space();
    			div42 = element("div");
    			div39 = element("div");
    			div39.textContent = "3";
    			t76 = space();
    			div40 = element("div");
    			div40.textContent = "Наушники Sony";
    			t78 = space();
    			div41 = element("div");
    			div41.textContent = "30 000 ₽";
    			t80 = space();
    			div46 = element("div");
    			div43 = element("div");
    			div43.textContent = "4";
    			t82 = space();
    			div44 = element("div");
    			div44.textContent = "Винный шкаф Kitfort";
    			t84 = space();
    			div45 = element("div");
    			div45.textContent = "20 000 ₽";
    			t86 = space();
    			div50 = element("div");
    			div47 = element("div");
    			div47.textContent = "5";
    			t88 = space();
    			div48 = element("div");
    			div48.textContent = "Винный шкаф Kitfort";
    			t90 = space();
    			div49 = element("div");
    			div49.textContent = "10 000 ₽";
    			t92 = space();
    			div54 = element("div");
    			div51 = element("div");
    			div51.textContent = "6-10";
    			t94 = space();
    			div52 = element("div");
    			div52.textContent = "Фитнес трекер Xiaomi";
    			t96 = space();
    			div53 = element("div");
    			div53.textContent = "7 000 ₽";
    			t98 = space();
    			div60 = element("div");
    			div59 = element("div");
    			div57 = element("div");
    			t99 = space();
    			div58 = element("div");
    			span9 = element("span");
    			span9.textContent = "Мерч разыгран";
    			t101 = space();
    			section2 = element("section");
    			div69 = element("div");
    			div65 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t103 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t105 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t107 = space();
    			div64 = element("div");
    			div63 = element("div");
    			t108 = space();
    			div68 = element("div");
    			div67 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t110 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t112 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «ига Ставок»  разделе «Промокоды».";
    			t114 = space();
    			div66 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t116 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t118 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			t120 = space();
    			create_component(screen4.$$.fragment);
    			t121 = space();
    			create_component(screen5.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/Ligalogo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Логотип");
    			attr_dev(img0, "class", "logo svelte-hs7405");
    			add_location(img0, file$1, 17, 10, 520);
    			attr_dev(div0, "class", "candy-cane svelte-hs7405");
    			add_location(div0, file$1, 18, 10, 592);
    			attr_dev(div1, "class", "logo-container svelte-hs7405");
    			add_location(div1, file$1, 16, 8, 481);
    			attr_dev(div2, "class", "menu-item svelte-hs7405");
    			add_location(div2, file$1, 21, 10, 675);
    			attr_dev(div3, "class", "menu-item svelte-hs7405");
    			add_location(div3, file$1, 22, 10, 733);
    			attr_dev(div4, "class", "menu-item svelte-hs7405");
    			add_location(div4, file$1, 23, 10, 782);
    			attr_dev(div5, "class", "menu svelte-hs7405");
    			add_location(div5, file$1, 20, 8, 646);
    			attr_dev(div6, "class", "header svelte-hs7405");
    			add_location(div6, file$1, 15, 6, 452);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/header_mob.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Мобильный заголовок");
    			attr_dev(img1, "class", "header-mobile-image svelte-hs7405");
    			add_location(img1, file$1, 27, 8, 887);
    			attr_dev(div7, "class", "header-mobile svelte-hs7405");
    			add_location(div7, file$1, 26, 6, 851);
    			attr_dev(br, "class", "svelte-hs7405");
    			add_location(br, file$1, 33, 23, 1104);
    			attr_dev(h1, "class", "title svelte-hs7405");
    			add_location(h1, file$1, 32, 10, 1062);
    			attr_dev(p0, "class", "description svelte-hs7405");
    			add_location(p0, file$1, 36, 10, 1162);
    			attr_dev(p1, "class", "description svelte-hs7405");
    			add_location(p1, file$1, 41, 10, 1474);
    			attr_dev(button0, "class", "promo-button svelte-hs7405");
    			add_location(button0, file$1, 45, 12, 1680);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/santa.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Санта");
    			attr_dev(img2, "class", "santa-image svelte-hs7405");
    			add_location(img2, file$1, 48, 12, 1804);
    			attr_dev(div8, "class", "promo-container svelte-hs7405");
    			add_location(div8, file$1, 44, 10, 1638);
    			attr_dev(div9, "class", "left-side svelte-hs7405");
    			add_location(div9, file$1, 31, 8, 1028);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/christmas-tree.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Ёлка");
    			attr_dev(img3, "class", "tree-image svelte-hs7405");
    			add_location(img3, file$1, 53, 12, 1984);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/Подарки.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Подарки");
    			attr_dev(img4, "class", "gifts-image svelte-hs7405");
    			add_location(img4, file$1, 54, 12, 2067);
    			attr_dev(div10, "class", "tree-container svelte-hs7405");
    			add_location(div10, file$1, 52, 10, 1943);
    			attr_dev(div11, "class", "right-side svelte-hs7405");
    			add_location(div11, file$1, 51, 8, 1908);
    			attr_dev(div12, "class", "content svelte-hs7405");
    			add_location(div12, file$1, 30, 6, 998);
    			attr_dev(section0, "class", "first-screen svelte-hs7405");
    			add_location(section0, file$1, 14, 4, 415);
    			attr_dev(div13, "class", "screen-container svelte-hs7405");
    			add_location(div13, file$1, 13, 2, 380);
    			attr_dev(span0, "class", "prize-label svelte-hs7405");
    			add_location(span0, file$1, 66, 10, 2376);
    			attr_dev(div14, "class", "prize-header svelte-hs7405");
    			add_location(div14, file$1, 65, 8, 2339);
    			attr_dev(h20, "class", "prize-title svelte-hs7405");
    			add_location(h20, file$1, 69, 8, 2454);
    			attr_dev(span1, "class", "spec-label svelte-hs7405");
    			add_location(span1, file$1, 74, 14, 2631);
    			attr_dev(span2, "class", "spec-value svelte-hs7405");
    			add_location(span2, file$1, 75, 14, 2690);
    			attr_dev(div15, "class", "spec-item svelte-hs7405");
    			add_location(div15, file$1, 73, 12, 2593);
    			attr_dev(span3, "class", "spec-label svelte-hs7405");
    			add_location(span3, file$1, 78, 14, 2798);
    			attr_dev(span4, "class", "spec-value svelte-hs7405");
    			add_location(span4, file$1, 79, 14, 2854);
    			attr_dev(div16, "class", "spec-item svelte-hs7405");
    			add_location(div16, file$1, 77, 12, 2760);
    			attr_dev(div17, "class", "specs-column svelte-hs7405");
    			add_location(div17, file$1, 72, 10, 2554);
    			attr_dev(span5, "class", "spec-label svelte-hs7405");
    			add_location(span5, file$1, 84, 14, 3020);
    			attr_dev(span6, "class", "spec-value svelte-hs7405");
    			add_location(span6, file$1, 85, 14, 3071);
    			attr_dev(div18, "class", "spec-item svelte-hs7405");
    			add_location(div18, file$1, 83, 12, 2982);
    			attr_dev(span7, "class", "spec-label svelte-hs7405");
    			add_location(span7, file$1, 88, 14, 3191);
    			attr_dev(span8, "class", "spec-value svelte-hs7405");
    			add_location(span8, file$1, 89, 14, 3244);
    			attr_dev(div19, "class", "spec-item svelte-hs7405");
    			add_location(div19, file$1, 87, 12, 3153);
    			attr_dev(div20, "class", "specs-column svelte-hs7405");
    			add_location(div20, file$1, 82, 10, 2943);
    			attr_dev(div21, "class", "specs-container svelte-hs7405");
    			add_location(div21, file$1, 71, 8, 2514);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/iphone14pro.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "iPhone 14 Pro");
    			attr_dev(img5, "class", "prize-image svelte-hs7405");
    			add_location(img5, file$1, 94, 8, 3350);
    			attr_dev(div22, "class", "main-prize svelte-hs7405");
    			add_location(div22, file$1, 64, 6, 2306);
    			attr_dev(h30, "class", "prize-card-category svelte-hs7405");
    			add_location(h30, file$1, 99, 10, 3521);
    			attr_dev(h40, "class", "prize-card-model svelte-hs7405");
    			add_location(h40, file$1, 100, 10, 3577);
    			if (!src_url_equal(img6.src, img6_src_value = "/images/Naychniki.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Sony WH-1000XM4");
    			attr_dev(img6, "class", "prize-card-image svelte-hs7405");
    			add_location(img6, file$1, 101, 10, 3637);
    			attr_dev(div23, "class", "prize-card svelte-hs7405");
    			add_location(div23, file$1, 98, 8, 3486);
    			attr_dev(h31, "class", "prize-card-category svelte-hs7405");
    			add_location(h31, file$1, 105, 10, 3777);
    			attr_dev(h41, "class", "prize-card-model svelte-hs7405");
    			add_location(h41, file$1, 106, 10, 3836);
    			if (!src_url_equal(img7.src, img7_src_value = "/images/wine-fridge.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Kitfort KT-2403");
    			attr_dev(img7, "class", "prize-card-image svelte-hs7405");
    			add_location(img7, file$1, 107, 10, 3896);
    			attr_dev(div24, "class", "prize-card svelte-hs7405");
    			add_location(div24, file$1, 104, 8, 3742);
    			attr_dev(h32, "class", "prize-card-category svelte-hs7405");
    			add_location(h32, file$1, 111, 10, 4038);
    			attr_dev(h42, "class", "prize-card-model svelte-hs7405");
    			add_location(h42, file$1, 112, 10, 4099);
    			if (!src_url_equal(img8.src, img8_src_value = "/images/mi-band.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img8, "class", "prize-card-image svelte-hs7405");
    			add_location(img8, file$1, 113, 10, 4160);
    			attr_dev(div25, "class", "prize-card svelte-hs7405");
    			add_location(div25, file$1, 110, 8, 4003);
    			attr_dev(div26, "class", "additional-prizes svelte-hs7405");
    			add_location(div26, file$1, 97, 6, 3446);
    			attr_dev(div27, "class", "header-place svelte-hs7405");
    			add_location(div27, file$1, 120, 12, 4399);
    			attr_dev(div28, "class", "header-prize svelte-hs7405");
    			add_location(div28, file$1, 121, 12, 4449);
    			attr_dev(div29, "class", "header-freebet svelte-hs7405");
    			add_location(div29, file$1, 122, 12, 4498);
    			attr_dev(div30, "class", "leaderboard-headers svelte-hs7405");
    			add_location(div30, file$1, 119, 10, 4353);
    			attr_dev(div31, "class", "place svelte-hs7405");
    			add_location(div31, file$1, 127, 14, 4654);
    			attr_dev(div32, "class", "prize svelte-hs7405");
    			add_location(div32, file$1, 128, 14, 4695);
    			attr_dev(div33, "class", "freebet svelte-hs7405");
    			add_location(div33, file$1, 129, 14, 4748);
    			attr_dev(div34, "class", "leaderboard-row svelte-hs7405");
    			add_location(div34, file$1, 126, 12, 4610);
    			attr_dev(div35, "class", "place svelte-hs7405");
    			add_location(div35, file$1, 133, 14, 4860);
    			attr_dev(div36, "class", "prize svelte-hs7405");
    			add_location(div36, file$1, 134, 14, 4901);
    			attr_dev(div37, "class", "freebet svelte-hs7405");
    			add_location(div37, file$1, 135, 14, 4954);
    			attr_dev(div38, "class", "leaderboard-row svelte-hs7405");
    			add_location(div38, file$1, 132, 12, 4816);
    			attr_dev(div39, "class", "place svelte-hs7405");
    			add_location(div39, file$1, 139, 14, 5066);
    			attr_dev(div40, "class", "prize svelte-hs7405");
    			add_location(div40, file$1, 140, 14, 5107);
    			attr_dev(div41, "class", "freebet svelte-hs7405");
    			add_location(div41, file$1, 141, 14, 5160);
    			attr_dev(div42, "class", "leaderboard-row svelte-hs7405");
    			add_location(div42, file$1, 138, 12, 5022);
    			attr_dev(div43, "class", "place svelte-hs7405");
    			add_location(div43, file$1, 145, 14, 5272);
    			attr_dev(div44, "class", "prize svelte-hs7405");
    			add_location(div44, file$1, 146, 14, 5313);
    			attr_dev(div45, "class", "freebet svelte-hs7405");
    			add_location(div45, file$1, 147, 14, 5372);
    			attr_dev(div46, "class", "leaderboard-row svelte-hs7405");
    			add_location(div46, file$1, 144, 12, 5228);
    			attr_dev(div47, "class", "place svelte-hs7405");
    			add_location(div47, file$1, 151, 14, 5484);
    			attr_dev(div48, "class", "prize svelte-hs7405");
    			add_location(div48, file$1, 152, 14, 5525);
    			attr_dev(div49, "class", "freebet svelte-hs7405");
    			add_location(div49, file$1, 153, 14, 5584);
    			attr_dev(div50, "class", "leaderboard-row svelte-hs7405");
    			add_location(div50, file$1, 150, 12, 5440);
    			attr_dev(div51, "class", "place svelte-hs7405");
    			add_location(div51, file$1, 157, 14, 5696);
    			attr_dev(div52, "class", "prize svelte-hs7405");
    			add_location(div52, file$1, 158, 14, 5740);
    			attr_dev(div53, "class", "freebet svelte-hs7405");
    			add_location(div53, file$1, 159, 14, 5800);
    			attr_dev(div54, "class", "leaderboard-row svelte-hs7405");
    			add_location(div54, file$1, 156, 12, 5652);
    			attr_dev(div55, "class", "leaderboard-rows svelte-hs7405");
    			add_location(div55, file$1, 125, 10, 4567);
    			attr_dev(div56, "class", "leaderboard-content svelte-hs7405");
    			add_location(div56, file$1, 118, 8, 4309);
    			attr_dev(div57, "class", "merch-images svelte-hs7405");
    			add_location(div57, file$1, 166, 12, 5972);
    			attr_dev(span9, "class", "svelte-hs7405");
    			add_location(span9, file$1, 170, 14, 6124);
    			attr_dev(div58, "class", "merch-status svelte-hs7405");
    			add_location(div58, file$1, 169, 12, 6083);
    			attr_dev(div59, "class", "merch-content svelte-hs7405");
    			add_location(div59, file$1, 165, 10, 5932);
    			attr_dev(div60, "class", "merch-column svelte-hs7405");
    			add_location(div60, file$1, 164, 8, 5895);
    			attr_dev(div61, "class", "leaderboard svelte-hs7405");
    			add_location(div61, file$1, 117, 6, 4275);
    			attr_dev(section1, "class", "second-screen svelte-hs7405");
    			add_location(section1, file$1, 63, 4, 2268);
    			attr_dev(div62, "class", "screen-container svelte-hs7405");
    			add_location(div62, file$1, 62, 2, 2233);
    			attr_dev(h21, "class", "leaderboard-title svelte-hs7405");
    			add_location(h21, file$1, 182, 8, 6386);
    			attr_dev(p2, "class", "leaderboard-description svelte-hs7405");
    			add_location(p2, file$1, 183, 8, 6446);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-hs7405");
    			add_location(a, file$1, 186, 8, 6592);
    			attr_dev(div63, "class", "table-frame svelte-hs7405");
    			add_location(div63, file$1, 190, 10, 6768);
    			attr_dev(div64, "class", "leaderboard-table svelte-hs7405");
    			add_location(div64, file$1, 188, 8, 6687);
    			attr_dev(div65, "class", "leaderboard-left svelte-hs7405");
    			add_location(div65, file$1, 181, 6, 6347);
    			attr_dev(button1, "class", "action-button svelte-hs7405");
    			add_location(button1, file$1, 198, 8, 6973);
    			attr_dev(button2, "class", "action-button svelte-hs7405");
    			add_location(button2, file$1, 199, 8, 7037);
    			attr_dev(p3, "class", "promo-description svelte-hs7405");
    			add_location(p3, file$1, 201, 8, 7106);
    			attr_dev(p4, "class", "svelte-hs7405");
    			add_location(p4, file$1, 207, 12, 7362);
    			attr_dev(p5, "class", "svelte-hs7405");
    			add_location(p5, file$1, 208, 12, 7474);
    			attr_dev(p6, "class", "svelte-hs7405");
    			add_location(p6, file$1, 209, 12, 7528);
    			attr_dev(div66, "class", "additional-info svelte-hs7405");
    			add_location(div66, file$1, 206, 10, 7320);
    			attr_dev(div67, "class", "actions-container svelte-hs7405");
    			add_location(div67, file$1, 197, 6, 6933);
    			attr_dev(div68, "class", "leaderboard-right svelte-hs7405");
    			add_location(div68, file$1, 196, 4, 6895);
    			attr_dev(div69, "class", "leaderboard-container svelte-hs7405");
    			add_location(div69, file$1, 180, 4, 6305);
    			attr_dev(section2, "class", "third-screen svelte-hs7405");
    			add_location(section2, file$1, 179, 2, 6270);
    			attr_dev(div70, "class", "page-wrapper svelte-hs7405");
    			add_location(div70, file$1, 11, 0, 321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div70, anchor);
    			append_dev(div70, div13);
    			append_dev(div13, section0);
    			append_dev(section0, div6);
    			append_dev(div6, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(section0, t7);
    			append_dev(section0, div7);
    			append_dev(div7, img1);
    			append_dev(section0, t8);
    			append_dev(section0, div12);
    			append_dev(div12, div9);
    			append_dev(div9, h1);
    			append_dev(h1, t9);
    			append_dev(h1, br);
    			append_dev(h1, t10);
    			append_dev(div9, t11);
    			append_dev(div9, p0);
    			append_dev(div9, t13);
    			append_dev(div9, p1);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			append_dev(div8, button0);
    			append_dev(div8, t17);
    			append_dev(div8, img2);
    			append_dev(div12, t18);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, img3);
    			append_dev(div10, t19);
    			append_dev(div10, img4);
    			append_dev(div70, t20);
    			append_dev(div70, div62);
    			append_dev(div62, section1);
    			append_dev(section1, div22);
    			append_dev(div22, div14);
    			append_dev(div14, span0);
    			append_dev(div22, t22);
    			append_dev(div22, h20);
    			append_dev(div22, t24);
    			append_dev(div22, div21);
    			append_dev(div21, div17);
    			append_dev(div17, div15);
    			append_dev(div15, span1);
    			append_dev(div15, t26);
    			append_dev(div15, span2);
    			append_dev(div17, t28);
    			append_dev(div17, div16);
    			append_dev(div16, span3);
    			append_dev(div16, t30);
    			append_dev(div16, span4);
    			append_dev(div21, t32);
    			append_dev(div21, div20);
    			append_dev(div20, div18);
    			append_dev(div18, span5);
    			append_dev(div18, t34);
    			append_dev(div18, span6);
    			append_dev(div20, t36);
    			append_dev(div20, div19);
    			append_dev(div19, span7);
    			append_dev(div19, t38);
    			append_dev(div19, span8);
    			append_dev(div22, t40);
    			append_dev(div22, img5);
    			append_dev(section1, t41);
    			append_dev(section1, div26);
    			append_dev(div26, div23);
    			append_dev(div23, h30);
    			append_dev(div23, t43);
    			append_dev(div23, h40);
    			append_dev(div23, t45);
    			append_dev(div23, img6);
    			append_dev(div26, t46);
    			append_dev(div26, div24);
    			append_dev(div24, h31);
    			append_dev(div24, t48);
    			append_dev(div24, h41);
    			append_dev(div24, t50);
    			append_dev(div24, img7);
    			append_dev(div26, t51);
    			append_dev(div26, div25);
    			append_dev(div25, h32);
    			append_dev(div25, t53);
    			append_dev(div25, h42);
    			append_dev(div25, t55);
    			append_dev(div25, img8);
    			append_dev(section1, t56);
    			append_dev(section1, div61);
    			append_dev(div61, div56);
    			append_dev(div56, div30);
    			append_dev(div30, div27);
    			append_dev(div30, t58);
    			append_dev(div30, div28);
    			append_dev(div30, t60);
    			append_dev(div30, div29);
    			append_dev(div56, t62);
    			append_dev(div56, div55);
    			append_dev(div55, div34);
    			append_dev(div34, div31);
    			append_dev(div34, t64);
    			append_dev(div34, div32);
    			append_dev(div34, t66);
    			append_dev(div34, div33);
    			append_dev(div55, t68);
    			append_dev(div55, div38);
    			append_dev(div38, div35);
    			append_dev(div38, t70);
    			append_dev(div38, div36);
    			append_dev(div38, t72);
    			append_dev(div38, div37);
    			append_dev(div55, t74);
    			append_dev(div55, div42);
    			append_dev(div42, div39);
    			append_dev(div42, t76);
    			append_dev(div42, div40);
    			append_dev(div42, t78);
    			append_dev(div42, div41);
    			append_dev(div55, t80);
    			append_dev(div55, div46);
    			append_dev(div46, div43);
    			append_dev(div46, t82);
    			append_dev(div46, div44);
    			append_dev(div46, t84);
    			append_dev(div46, div45);
    			append_dev(div55, t86);
    			append_dev(div55, div50);
    			append_dev(div50, div47);
    			append_dev(div50, t88);
    			append_dev(div50, div48);
    			append_dev(div50, t90);
    			append_dev(div50, div49);
    			append_dev(div55, t92);
    			append_dev(div55, div54);
    			append_dev(div54, div51);
    			append_dev(div54, t94);
    			append_dev(div54, div52);
    			append_dev(div54, t96);
    			append_dev(div54, div53);
    			append_dev(div61, t98);
    			append_dev(div61, div60);
    			append_dev(div60, div59);
    			append_dev(div59, div57);
    			append_dev(div59, t99);
    			append_dev(div59, div58);
    			append_dev(div58, span9);
    			append_dev(div70, t101);
    			append_dev(div70, section2);
    			append_dev(section2, div69);
    			append_dev(div69, div65);
    			append_dev(div65, h21);
    			append_dev(div65, t103);
    			append_dev(div65, p2);
    			append_dev(div65, t105);
    			append_dev(div65, a);
    			append_dev(div65, t107);
    			append_dev(div65, div64);
    			append_dev(div64, div63);
    			append_dev(div69, t108);
    			append_dev(div69, div68);
    			append_dev(div68, div67);
    			append_dev(div67, button1);
    			append_dev(div67, t110);
    			append_dev(div67, button2);
    			append_dev(div67, t112);
    			append_dev(div67, p3);
    			append_dev(div67, t114);
    			append_dev(div67, div66);
    			append_dev(div66, p4);
    			append_dev(div66, t116);
    			append_dev(div66, p5);
    			append_dev(div66, t118);
    			append_dev(div66, p6);
    			append_dev(div70, t120);
    			mount_component(screen4, div70, null);
    			append_dev(div70, t121);
    			mount_component(screen5, div70, null);
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
    			if (detaching) detach_dev(div70);
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
