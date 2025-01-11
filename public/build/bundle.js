
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
    	let div77;
    	let div20;
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
    	let div13;
    	let div10;
    	let h10;
    	let span0;
    	let t10;
    	let span1;
    	let t12;
    	let div8;
    	let p0;
    	let t14;
    	let p1;
    	let t16;
    	let div9;
    	let button0;
    	let t18;
    	let img2;
    	let img2_src_value;
    	let t19;
    	let div12;
    	let div11;
    	let img3;
    	let img3_src_value;
    	let t20;
    	let img4;
    	let img4_src_value;
    	let t21;
    	let img5;
    	let img5_src_value;
    	let t22;
    	let img6;
    	let img6_src_value;
    	let t23;
    	let img7;
    	let img7_src_value;
    	let t24;
    	let div19;
    	let div16;
    	let h11;
    	let span2;
    	let t26;
    	let span3;
    	let t28;
    	let div14;
    	let p2;
    	let t30;
    	let p3;
    	let t32;
    	let div15;
    	let button1;
    	let t34;
    	let img8;
    	let img8_src_value;
    	let t35;
    	let div18;
    	let div17;
    	let img9;
    	let img9_src_value;
    	let t36;
    	let img10;
    	let img10_src_value;
    	let t37;
    	let img11;
    	let img11_src_value;
    	let t38;
    	let img12;
    	let img12_src_value;
    	let t39;
    	let img13;
    	let img13_src_value;
    	let t40;
    	let div69;
    	let section1;
    	let div29;
    	let div21;
    	let span4;
    	let t42;
    	let h20;
    	let t44;
    	let div28;
    	let div24;
    	let div22;
    	let span5;
    	let t46;
    	let span6;
    	let t48;
    	let div23;
    	let span7;
    	let t50;
    	let span8;
    	let t52;
    	let div27;
    	let div25;
    	let span9;
    	let t54;
    	let span10;
    	let t56;
    	let div26;
    	let span11;
    	let t58;
    	let span12;
    	let t60;
    	let img14;
    	let img14_src_value;
    	let t61;
    	let div33;
    	let div30;
    	let h30;
    	let t63;
    	let h40;
    	let t65;
    	let img15;
    	let img15_src_value;
    	let t66;
    	let div31;
    	let h31;
    	let t68;
    	let h41;
    	let t70;
    	let img16;
    	let img16_src_value;
    	let t71;
    	let div32;
    	let h32;
    	let t73;
    	let h42;
    	let t75;
    	let img17;
    	let img17_src_value;
    	let t76;
    	let div68;
    	let div63;
    	let div37;
    	let div34;
    	let t78;
    	let div35;
    	let t80;
    	let div36;
    	let t82;
    	let div62;
    	let div41;
    	let div38;
    	let t84;
    	let div39;
    	let t86;
    	let div40;
    	let t88;
    	let div45;
    	let div42;
    	let t90;
    	let div43;
    	let t92;
    	let div44;
    	let t94;
    	let div49;
    	let div46;
    	let t96;
    	let div47;
    	let t98;
    	let div48;
    	let t100;
    	let div53;
    	let div50;
    	let t102;
    	let div51;
    	let t104;
    	let div52;
    	let t106;
    	let div57;
    	let div54;
    	let t108;
    	let div55;
    	let t110;
    	let div56;
    	let t112;
    	let div61;
    	let div58;
    	let t114;
    	let div59;
    	let t116;
    	let div60;
    	let t118;
    	let div67;
    	let div66;
    	let div64;
    	let t119;
    	let div65;
    	let span13;
    	let t121;
    	let section2;
    	let div76;
    	let div72;
    	let h21;
    	let t123;
    	let p4;
    	let t125;
    	let a;
    	let t127;
    	let div71;
    	let div70;
    	let t128;
    	let div75;
    	let div74;
    	let button2;
    	let t130;
    	let button3;
    	let t132;
    	let p5;
    	let t134;
    	let div73;
    	let p6;
    	let t136;
    	let p7;
    	let t138;
    	let p8;
    	let t140;
    	let screen4;
    	let t141;
    	let screen5;
    	let current;
    	let mounted;
    	let dispose;
    	screen4 = new Screen4({ $$inline: true });
    	screen5 = new Screen5({ $$inline: true });

    	const block = {
    		c: function create() {
    			div77 = element("div");
    			div20 = element("div");
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
    			div13 = element("div");
    			div10 = element("div");
    			h10 = element("h1");
    			span0 = element("span");
    			span0.textContent = "В НОВЫЙ ГОД";
    			t10 = space();
    			span1 = element("span");
    			span1.textContent = "С ЛИГОЙ СТАВОК";
    			t12 = space();
    			div8 = element("div");
    			p0 = element("p");
    			p0.textContent = "Лига ставок поздравляет всех с Новым Годом! Желаем всего да побольше, особенно больше высоких выигрышных кэфов!\n              И анонсируем новый спецпроект, где больше однозначно лучше! \n              Получите уникальный промокод для участия в розыгрыше.";
    			t14 = space();
    			p1 = element("p");
    			p1.textContent = "Заключайте пари на высокие коэффициенты. Призы достанутся 100 обладателям самых больших выигрышных кэфов!";
    			t16 = space();
    			div9 = element("div");
    			button0 = element("button");
    			button0.textContent = "Получить промокод";
    			t18 = space();
    			img2 = element("img");
    			t19 = space();
    			div12 = element("div");
    			div11 = element("div");
    			img3 = element("img");
    			t20 = space();
    			img4 = element("img");
    			t21 = space();
    			img5 = element("img");
    			t22 = space();
    			img6 = element("img");
    			t23 = space();
    			img7 = element("img");
    			t24 = space();
    			div19 = element("div");
    			div16 = element("div");
    			h11 = element("h1");
    			span2 = element("span");
    			span2.textContent = "В НОВЫЙ ГОД";
    			t26 = space();
    			span3 = element("span");
    			span3.textContent = "С ЛИГОЙ СТАВОК";
    			t28 = space();
    			div14 = element("div");
    			p2 = element("p");
    			p2.textContent = "Лига ставок поздравляет всех с Новым Годом! Желаем всего да побольше, особенно больше высоких выигрышных кэфов!\n              И анонсируем новый спецпроект, где больше однозначно лучше! \n              Получите уникальный промокод для участия в розыгрыше.";
    			t30 = space();
    			p3 = element("p");
    			p3.textContent = "Заключайте пари на высокие коэффициенты. Призы достанутся 100 обладателям самых больших выигрышных кэфов!";
    			t32 = space();
    			div15 = element("div");
    			button1 = element("button");
    			button1.textContent = "Получить промокод";
    			t34 = space();
    			img8 = element("img");
    			t35 = space();
    			div18 = element("div");
    			div17 = element("div");
    			img9 = element("img");
    			t36 = space();
    			img10 = element("img");
    			t37 = space();
    			img11 = element("img");
    			t38 = space();
    			img12 = element("img");
    			t39 = space();
    			img13 = element("img");
    			t40 = space();
    			div69 = element("div");
    			section1 = element("section");
    			div29 = element("div");
    			div21 = element("div");
    			span4 = element("span");
    			span4.textContent = "Главный приз";
    			t42 = space();
    			h20 = element("h2");
    			h20.textContent = "iPhone 14 Pro";
    			t44 = space();
    			div28 = element("div");
    			div24 = element("div");
    			div22 = element("div");
    			span5 = element("span");
    			span5.textContent = "Объем памяти";
    			t46 = space();
    			span6 = element("span");
    			span6.textContent = "128 GB";
    			t48 = space();
    			div23 = element("div");
    			span7 = element("span");
    			span7.textContent = "Процессор";
    			t50 = space();
    			span8 = element("span");
    			span8.textContent = "A16 Bionic";
    			t52 = space();
    			div27 = element("div");
    			div25 = element("div");
    			span9 = element("span");
    			span9.textContent = "Цвет";
    			t54 = space();
    			span10 = element("span");
    			span10.textContent = "Космический черный";
    			t56 = space();
    			div26 = element("div");
    			span11 = element("span");
    			span11.textContent = "Камера";
    			t58 = space();
    			span12 = element("span");
    			span12.textContent = "48 МП";
    			t60 = space();
    			img14 = element("img");
    			t61 = space();
    			div33 = element("div");
    			div30 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t63 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t65 = space();
    			img15 = element("img");
    			t66 = space();
    			div31 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t68 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t70 = space();
    			img16 = element("img");
    			t71 = space();
    			div32 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t73 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t75 = space();
    			img17 = element("img");
    			t76 = space();
    			div68 = element("div");
    			div63 = element("div");
    			div37 = element("div");
    			div34 = element("div");
    			div34.textContent = "Место";
    			t78 = space();
    			div35 = element("div");
    			div35.textContent = "Приз";
    			t80 = space();
    			div36 = element("div");
    			div36.textContent = "Фрибет";
    			t82 = space();
    			div62 = element("div");
    			div41 = element("div");
    			div38 = element("div");
    			div38.textContent = "1";
    			t84 = space();
    			div39 = element("div");
    			div39.textContent = "iPhone 14 Pro";
    			t86 = space();
    			div40 = element("div");
    			div40.textContent = "50 000 ₽";
    			t88 = space();
    			div45 = element("div");
    			div42 = element("div");
    			div42.textContent = "2";
    			t90 = space();
    			div43 = element("div");
    			div43.textContent = "Наушники Sony";
    			t92 = space();
    			div44 = element("div");
    			div44.textContent = "40 000 ₽";
    			t94 = space();
    			div49 = element("div");
    			div46 = element("div");
    			div46.textContent = "3";
    			t96 = space();
    			div47 = element("div");
    			div47.textContent = "Наушники Sony";
    			t98 = space();
    			div48 = element("div");
    			div48.textContent = "30 000 ₽";
    			t100 = space();
    			div53 = element("div");
    			div50 = element("div");
    			div50.textContent = "4";
    			t102 = space();
    			div51 = element("div");
    			div51.textContent = "Винный шкаф Kitfort";
    			t104 = space();
    			div52 = element("div");
    			div52.textContent = "20 000 ₽";
    			t106 = space();
    			div57 = element("div");
    			div54 = element("div");
    			div54.textContent = "5";
    			t108 = space();
    			div55 = element("div");
    			div55.textContent = "Винный шкаф Kitfort";
    			t110 = space();
    			div56 = element("div");
    			div56.textContent = "10 000 ₽";
    			t112 = space();
    			div61 = element("div");
    			div58 = element("div");
    			div58.textContent = "6-10";
    			t114 = space();
    			div59 = element("div");
    			div59.textContent = "Фитнес трекер Xiaomi";
    			t116 = space();
    			div60 = element("div");
    			div60.textContent = "7 000 ₽";
    			t118 = space();
    			div67 = element("div");
    			div66 = element("div");
    			div64 = element("div");
    			t119 = space();
    			div65 = element("div");
    			span13 = element("span");
    			span13.textContent = "Мерч разыгран";
    			t121 = space();
    			section2 = element("section");
    			div76 = element("div");
    			div72 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t123 = space();
    			p4 = element("p");
    			p4.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t125 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t127 = space();
    			div71 = element("div");
    			div70 = element("div");
    			t128 = space();
    			div75 = element("div");
    			div74 = element("div");
    			button2 = element("button");
    			button2.textContent = "Введите промокод";
    			t130 = space();
    			button3 = element("button");
    			button3.textContent = "Узнать место";
    			t132 = space();
    			p5 = element("p");
    			p5.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «ига Ставок»  разделе «Промокоды».";
    			t134 = space();
    			div73 = element("div");
    			p6 = element("p");
    			p6.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t136 = space();
    			p7 = element("p");
    			p7.textContent = "Приз за первое место iPhone 14 Pro";
    			t138 = space();
    			p8 = element("p");
    			p8.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рассказание стримов смотрите ниже";
    			t140 = space();
    			create_component(screen4.$$.fragment);
    			t141 = space();
    			create_component(screen5.$$.fragment);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/Ligalogo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Логотип");
    			attr_dev(img0, "class", "logo svelte-sdjdsx");
    			add_location(img0, file$1, 17, 10, 520);
    			attr_dev(div0, "class", "candy-cane svelte-sdjdsx");
    			add_location(div0, file$1, 18, 10, 592);
    			attr_dev(div1, "class", "logo-container svelte-sdjdsx");
    			add_location(div1, file$1, 16, 8, 481);
    			attr_dev(div2, "class", "menu-item svelte-sdjdsx");
    			add_location(div2, file$1, 21, 10, 675);
    			attr_dev(div3, "class", "menu-item svelte-sdjdsx");
    			add_location(div3, file$1, 22, 10, 733);
    			attr_dev(div4, "class", "menu-item svelte-sdjdsx");
    			add_location(div4, file$1, 23, 10, 782);
    			attr_dev(div5, "class", "menu svelte-sdjdsx");
    			add_location(div5, file$1, 20, 8, 646);
    			attr_dev(div6, "class", "header svelte-sdjdsx");
    			add_location(div6, file$1, 15, 6, 452);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/header_mob.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Мобильный заголовок");
    			attr_dev(img1, "class", "header-mobile-image svelte-sdjdsx");
    			add_location(img1, file$1, 27, 8, 887);
    			attr_dev(div7, "class", "header-mobile svelte-sdjdsx");
    			add_location(div7, file$1, 26, 6, 851);
    			attr_dev(span0, "class", "first-line svelte-sdjdsx");
    			add_location(span0, file$1, 34, 12, 1134);
    			attr_dev(span1, "class", "second-line svelte-sdjdsx");
    			add_location(span1, file$1, 35, 12, 1190);
    			attr_dev(h10, "class", "title svelte-sdjdsx");
    			add_location(h10, file$1, 33, 10, 1103);
    			attr_dev(p0, "class", "description svelte-sdjdsx");
    			add_location(p0, file$1, 38, 12, 1312);
    			attr_dev(p1, "class", "description description-secondary svelte-sdjdsx");
    			add_location(p1, file$1, 44, 12, 1647);
    			attr_dev(div8, "class", "description-container svelte-sdjdsx");
    			add_location(div8, file$1, 37, 10, 1264);
    			attr_dev(button0, "class", "promo-button svelte-sdjdsx");
    			add_location(button0, file$1, 49, 12, 1899);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/santa.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Санта");
    			attr_dev(img2, "class", "santa-image svelte-sdjdsx");
    			add_location(img2, file$1, 52, 12, 2023);
    			attr_dev(div9, "class", "promo-container svelte-sdjdsx");
    			add_location(div9, file$1, 48, 10, 1857);
    			attr_dev(div10, "class", "left-side svelte-sdjdsx");
    			add_location(div10, file$1, 32, 8, 1069);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/christmas-tree.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Ёлка");
    			attr_dev(img3, "class", "tree-image svelte-sdjdsx");
    			add_location(img3, file$1, 58, 12, 2212);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/Подарки.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Подарки");
    			attr_dev(img4, "class", "gifts-image svelte-sdjdsx");
    			add_location(img4, file$1, 59, 12, 2295);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/zvezda_1.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Звезда 1");
    			attr_dev(img5, "class", "star star-1 svelte-sdjdsx");
    			add_location(img5, file$1, 60, 12, 2375);
    			if (!src_url_equal(img6.src, img6_src_value = "/images/zvezda_2.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Звезда 2");
    			attr_dev(img6, "class", "star star-2 svelte-sdjdsx");
    			add_location(img6, file$1, 61, 12, 2457);
    			if (!src_url_equal(img7.src, img7_src_value = "/images/zvezda_3.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Звезда 3");
    			attr_dev(img7, "class", "star star-3 svelte-sdjdsx");
    			add_location(img7, file$1, 62, 12, 2539);
    			attr_dev(div11, "class", "tree-container svelte-sdjdsx");
    			add_location(div11, file$1, 57, 10, 2171);
    			attr_dev(div12, "class", "right-side svelte-sdjdsx");
    			add_location(div12, file$1, 56, 8, 2136);
    			attr_dev(div13, "class", "content desktop-version svelte-sdjdsx");
    			add_location(div13, file$1, 31, 6, 1023);
    			attr_dev(span2, "class", "first-line svelte-sdjdsx");
    			add_location(span2, file$1, 71, 12, 2805);
    			attr_dev(span3, "class", "second-line svelte-sdjdsx");
    			add_location(span3, file$1, 72, 12, 2861);
    			attr_dev(h11, "class", "title svelte-sdjdsx");
    			add_location(h11, file$1, 70, 10, 2774);
    			attr_dev(p2, "class", "description svelte-sdjdsx");
    			add_location(p2, file$1, 75, 12, 2983);
    			attr_dev(p3, "class", "description description-secondary svelte-sdjdsx");
    			add_location(p3, file$1, 81, 12, 3318);
    			attr_dev(div14, "class", "description-container svelte-sdjdsx");
    			add_location(div14, file$1, 74, 10, 2935);
    			attr_dev(button1, "class", "promo-button svelte-sdjdsx");
    			add_location(button1, file$1, 86, 12, 3570);
    			if (!src_url_equal(img8.src, img8_src_value = "/images/santa.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Санта");
    			attr_dev(img8, "class", "santa-image svelte-sdjdsx");
    			add_location(img8, file$1, 89, 12, 3694);
    			attr_dev(div15, "class", "promo-container svelte-sdjdsx");
    			add_location(div15, file$1, 85, 10, 3528);
    			attr_dev(div16, "class", "left-side svelte-sdjdsx");
    			add_location(div16, file$1, 69, 8, 2740);
    			if (!src_url_equal(img9.src, img9_src_value = "/images/christmas-tree.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Ёлка");
    			attr_dev(img9, "class", "tree-image svelte-sdjdsx");
    			add_location(img9, file$1, 95, 12, 3883);
    			if (!src_url_equal(img10.src, img10_src_value = "/images/Подарки.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Подарки");
    			attr_dev(img10, "class", "gifts-image svelte-sdjdsx");
    			add_location(img10, file$1, 96, 12, 3966);
    			if (!src_url_equal(img11.src, img11_src_value = "/images/zvezda_1.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Звезда 1");
    			attr_dev(img11, "class", "star star-1 svelte-sdjdsx");
    			add_location(img11, file$1, 97, 12, 4046);
    			if (!src_url_equal(img12.src, img12_src_value = "/images/zvezda_2.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "Звезда 2");
    			attr_dev(img12, "class", "star star-2 svelte-sdjdsx");
    			add_location(img12, file$1, 98, 12, 4128);
    			if (!src_url_equal(img13.src, img13_src_value = "/images/zvezda_3.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "Звезда 3");
    			attr_dev(img13, "class", "star star-3 svelte-sdjdsx");
    			add_location(img13, file$1, 99, 12, 4210);
    			attr_dev(div17, "class", "tree-container svelte-sdjdsx");
    			add_location(div17, file$1, 94, 10, 3842);
    			attr_dev(div18, "class", "right-side svelte-sdjdsx");
    			add_location(div18, file$1, 93, 8, 3807);
    			attr_dev(div19, "class", "content mobile-container svelte-sdjdsx");
    			add_location(div19, file$1, 68, 6, 2693);
    			attr_dev(section0, "class", "first-screen svelte-sdjdsx");
    			add_location(section0, file$1, 14, 4, 415);
    			attr_dev(div20, "class", "screen-container svelte-sdjdsx");
    			add_location(div20, file$1, 13, 2, 380);
    			attr_dev(span4, "class", "prize-label svelte-sdjdsx");
    			add_location(span4, file$1, 111, 10, 4521);
    			attr_dev(div21, "class", "prize-header svelte-sdjdsx");
    			add_location(div21, file$1, 110, 8, 4484);
    			attr_dev(h20, "class", "prize-title svelte-sdjdsx");
    			add_location(h20, file$1, 114, 8, 4599);
    			attr_dev(span5, "class", "spec-label svelte-sdjdsx");
    			add_location(span5, file$1, 119, 14, 4776);
    			attr_dev(span6, "class", "spec-value svelte-sdjdsx");
    			add_location(span6, file$1, 120, 14, 4835);
    			attr_dev(div22, "class", "spec-item svelte-sdjdsx");
    			add_location(div22, file$1, 118, 12, 4738);
    			attr_dev(span7, "class", "spec-label svelte-sdjdsx");
    			add_location(span7, file$1, 123, 14, 4943);
    			attr_dev(span8, "class", "spec-value svelte-sdjdsx");
    			add_location(span8, file$1, 124, 14, 4999);
    			attr_dev(div23, "class", "spec-item svelte-sdjdsx");
    			add_location(div23, file$1, 122, 12, 4905);
    			attr_dev(div24, "class", "specs-column svelte-sdjdsx");
    			add_location(div24, file$1, 117, 10, 4699);
    			attr_dev(span9, "class", "spec-label svelte-sdjdsx");
    			add_location(span9, file$1, 129, 14, 5165);
    			attr_dev(span10, "class", "spec-value svelte-sdjdsx");
    			add_location(span10, file$1, 130, 14, 5216);
    			attr_dev(div25, "class", "spec-item svelte-sdjdsx");
    			add_location(div25, file$1, 128, 12, 5127);
    			attr_dev(span11, "class", "spec-label svelte-sdjdsx");
    			add_location(span11, file$1, 133, 14, 5336);
    			attr_dev(span12, "class", "spec-value svelte-sdjdsx");
    			add_location(span12, file$1, 134, 14, 5389);
    			attr_dev(div26, "class", "spec-item svelte-sdjdsx");
    			add_location(div26, file$1, 132, 12, 5298);
    			attr_dev(div27, "class", "specs-column svelte-sdjdsx");
    			add_location(div27, file$1, 127, 10, 5088);
    			attr_dev(div28, "class", "specs-container svelte-sdjdsx");
    			add_location(div28, file$1, 116, 8, 4659);
    			if (!src_url_equal(img14.src, img14_src_value = "/images/iphone14pro.png")) attr_dev(img14, "src", img14_src_value);
    			attr_dev(img14, "alt", "iPhone 14 Pro");
    			attr_dev(img14, "class", "prize-image svelte-sdjdsx");
    			add_location(img14, file$1, 139, 8, 5495);
    			attr_dev(div29, "class", "main-prize svelte-sdjdsx");
    			add_location(div29, file$1, 109, 6, 4451);
    			attr_dev(h30, "class", "prize-card-category svelte-sdjdsx");
    			add_location(h30, file$1, 144, 10, 5666);
    			attr_dev(h40, "class", "prize-card-model svelte-sdjdsx");
    			add_location(h40, file$1, 145, 10, 5722);
    			if (!src_url_equal(img15.src, img15_src_value = "/images/Naychniki.png")) attr_dev(img15, "src", img15_src_value);
    			attr_dev(img15, "alt", "Sony WH-1000XM4");
    			attr_dev(img15, "class", "prize-card-image svelte-sdjdsx");
    			add_location(img15, file$1, 146, 10, 5782);
    			attr_dev(div30, "class", "prize-card svelte-sdjdsx");
    			add_location(div30, file$1, 143, 8, 5631);
    			attr_dev(h31, "class", "prize-card-category svelte-sdjdsx");
    			add_location(h31, file$1, 150, 10, 5922);
    			attr_dev(h41, "class", "prize-card-model svelte-sdjdsx");
    			add_location(h41, file$1, 151, 10, 5981);
    			if (!src_url_equal(img16.src, img16_src_value = "/images/wine-fridge.png")) attr_dev(img16, "src", img16_src_value);
    			attr_dev(img16, "alt", "Kitfort KT-2403");
    			attr_dev(img16, "class", "prize-card-image svelte-sdjdsx");
    			add_location(img16, file$1, 152, 10, 6041);
    			attr_dev(div31, "class", "prize-card svelte-sdjdsx");
    			add_location(div31, file$1, 149, 8, 5887);
    			attr_dev(h32, "class", "prize-card-category svelte-sdjdsx");
    			add_location(h32, file$1, 156, 10, 6183);
    			attr_dev(h42, "class", "prize-card-model svelte-sdjdsx");
    			add_location(h42, file$1, 157, 10, 6244);
    			if (!src_url_equal(img17.src, img17_src_value = "/images/mi-band.png")) attr_dev(img17, "src", img17_src_value);
    			attr_dev(img17, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img17, "class", "prize-card-image svelte-sdjdsx");
    			add_location(img17, file$1, 158, 10, 6305);
    			attr_dev(div32, "class", "prize-card svelte-sdjdsx");
    			add_location(div32, file$1, 155, 8, 6148);
    			attr_dev(div33, "class", "additional-prizes svelte-sdjdsx");
    			add_location(div33, file$1, 142, 6, 5591);
    			attr_dev(div34, "class", "header-place svelte-sdjdsx");
    			add_location(div34, file$1, 165, 12, 6544);
    			attr_dev(div35, "class", "header-prize svelte-sdjdsx");
    			add_location(div35, file$1, 166, 12, 6594);
    			attr_dev(div36, "class", "header-freebet svelte-sdjdsx");
    			add_location(div36, file$1, 167, 12, 6643);
    			attr_dev(div37, "class", "leaderboard-headers svelte-sdjdsx");
    			add_location(div37, file$1, 164, 10, 6498);
    			attr_dev(div38, "class", "place svelte-sdjdsx");
    			add_location(div38, file$1, 172, 14, 6799);
    			attr_dev(div39, "class", "prize svelte-sdjdsx");
    			add_location(div39, file$1, 173, 14, 6840);
    			attr_dev(div40, "class", "freebet svelte-sdjdsx");
    			add_location(div40, file$1, 174, 14, 6893);
    			attr_dev(div41, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div41, file$1, 171, 12, 6755);
    			attr_dev(div42, "class", "place svelte-sdjdsx");
    			add_location(div42, file$1, 178, 14, 7005);
    			attr_dev(div43, "class", "prize svelte-sdjdsx");
    			add_location(div43, file$1, 179, 14, 7046);
    			attr_dev(div44, "class", "freebet svelte-sdjdsx");
    			add_location(div44, file$1, 180, 14, 7099);
    			attr_dev(div45, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div45, file$1, 177, 12, 6961);
    			attr_dev(div46, "class", "place svelte-sdjdsx");
    			add_location(div46, file$1, 184, 14, 7211);
    			attr_dev(div47, "class", "prize svelte-sdjdsx");
    			add_location(div47, file$1, 185, 14, 7252);
    			attr_dev(div48, "class", "freebet svelte-sdjdsx");
    			add_location(div48, file$1, 186, 14, 7305);
    			attr_dev(div49, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div49, file$1, 183, 12, 7167);
    			attr_dev(div50, "class", "place svelte-sdjdsx");
    			add_location(div50, file$1, 190, 14, 7417);
    			attr_dev(div51, "class", "prize svelte-sdjdsx");
    			add_location(div51, file$1, 191, 14, 7458);
    			attr_dev(div52, "class", "freebet svelte-sdjdsx");
    			add_location(div52, file$1, 192, 14, 7517);
    			attr_dev(div53, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div53, file$1, 189, 12, 7373);
    			attr_dev(div54, "class", "place svelte-sdjdsx");
    			add_location(div54, file$1, 196, 14, 7629);
    			attr_dev(div55, "class", "prize svelte-sdjdsx");
    			add_location(div55, file$1, 197, 14, 7670);
    			attr_dev(div56, "class", "freebet svelte-sdjdsx");
    			add_location(div56, file$1, 198, 14, 7729);
    			attr_dev(div57, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div57, file$1, 195, 12, 7585);
    			attr_dev(div58, "class", "place svelte-sdjdsx");
    			add_location(div58, file$1, 202, 14, 7841);
    			attr_dev(div59, "class", "prize svelte-sdjdsx");
    			add_location(div59, file$1, 203, 14, 7885);
    			attr_dev(div60, "class", "freebet svelte-sdjdsx");
    			add_location(div60, file$1, 204, 14, 7945);
    			attr_dev(div61, "class", "leaderboard-row svelte-sdjdsx");
    			add_location(div61, file$1, 201, 12, 7797);
    			attr_dev(div62, "class", "leaderboard-rows svelte-sdjdsx");
    			add_location(div62, file$1, 170, 10, 6712);
    			attr_dev(div63, "class", "leaderboard-content svelte-sdjdsx");
    			add_location(div63, file$1, 163, 8, 6454);
    			attr_dev(div64, "class", "merch-images svelte-sdjdsx");
    			add_location(div64, file$1, 211, 12, 8117);
    			attr_dev(span13, "class", "svelte-sdjdsx");
    			add_location(span13, file$1, 215, 14, 8269);
    			attr_dev(div65, "class", "merch-status svelte-sdjdsx");
    			add_location(div65, file$1, 214, 12, 8228);
    			attr_dev(div66, "class", "merch-content svelte-sdjdsx");
    			add_location(div66, file$1, 210, 10, 8077);
    			attr_dev(div67, "class", "merch-column svelte-sdjdsx");
    			add_location(div67, file$1, 209, 8, 8040);
    			attr_dev(div68, "class", "leaderboard svelte-sdjdsx");
    			add_location(div68, file$1, 162, 6, 6420);
    			attr_dev(section1, "class", "second-screen svelte-sdjdsx");
    			add_location(section1, file$1, 108, 4, 4413);
    			attr_dev(div69, "class", "screen-container svelte-sdjdsx");
    			add_location(div69, file$1, 107, 2, 4378);
    			attr_dev(h21, "class", "leaderboard-title svelte-sdjdsx");
    			add_location(h21, file$1, 227, 8, 8531);
    			attr_dev(p4, "class", "leaderboard-description svelte-sdjdsx");
    			add_location(p4, file$1, 228, 8, 8591);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-sdjdsx");
    			add_location(a, file$1, 231, 8, 8737);
    			attr_dev(div70, "class", "table-frame svelte-sdjdsx");
    			add_location(div70, file$1, 235, 10, 8913);
    			attr_dev(div71, "class", "leaderboard-table svelte-sdjdsx");
    			add_location(div71, file$1, 233, 8, 8832);
    			attr_dev(div72, "class", "leaderboard-left svelte-sdjdsx");
    			add_location(div72, file$1, 226, 6, 8492);
    			attr_dev(button2, "class", "action-button svelte-sdjdsx");
    			add_location(button2, file$1, 243, 8, 9118);
    			attr_dev(button3, "class", "action-button svelte-sdjdsx");
    			add_location(button3, file$1, 244, 8, 9182);
    			attr_dev(p5, "class", "promo-description svelte-sdjdsx");
    			add_location(p5, file$1, 246, 8, 9251);
    			attr_dev(p6, "class", "svelte-sdjdsx");
    			add_location(p6, file$1, 252, 12, 9507);
    			attr_dev(p7, "class", "svelte-sdjdsx");
    			add_location(p7, file$1, 253, 12, 9619);
    			attr_dev(p8, "class", "svelte-sdjdsx");
    			add_location(p8, file$1, 254, 12, 9673);
    			attr_dev(div73, "class", "additional-info svelte-sdjdsx");
    			add_location(div73, file$1, 251, 10, 9465);
    			attr_dev(div74, "class", "actions-container svelte-sdjdsx");
    			add_location(div74, file$1, 242, 6, 9078);
    			attr_dev(div75, "class", "leaderboard-right svelte-sdjdsx");
    			add_location(div75, file$1, 241, 4, 9040);
    			attr_dev(div76, "class", "leaderboard-container svelte-sdjdsx");
    			add_location(div76, file$1, 225, 4, 8450);
    			attr_dev(section2, "class", "third-screen svelte-sdjdsx");
    			add_location(section2, file$1, 224, 2, 8415);
    			attr_dev(div77, "class", "page-wrapper svelte-sdjdsx");
    			add_location(div77, file$1, 11, 0, 321);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div77, anchor);
    			append_dev(div77, div20);
    			append_dev(div20, section0);
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
    			append_dev(section0, div13);
    			append_dev(div13, div10);
    			append_dev(div10, h10);
    			append_dev(h10, span0);
    			append_dev(h10, t10);
    			append_dev(h10, span1);
    			append_dev(div10, t12);
    			append_dev(div10, div8);
    			append_dev(div8, p0);
    			append_dev(div8, t14);
    			append_dev(div8, p1);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, button0);
    			append_dev(div9, t18);
    			append_dev(div9, img2);
    			append_dev(div13, t19);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, img3);
    			append_dev(div11, t20);
    			append_dev(div11, img4);
    			append_dev(div11, t21);
    			append_dev(div11, img5);
    			append_dev(div11, t22);
    			append_dev(div11, img6);
    			append_dev(div11, t23);
    			append_dev(div11, img7);
    			append_dev(section0, t24);
    			append_dev(section0, div19);
    			append_dev(div19, div16);
    			append_dev(div16, h11);
    			append_dev(h11, span2);
    			append_dev(h11, t26);
    			append_dev(h11, span3);
    			append_dev(div16, t28);
    			append_dev(div16, div14);
    			append_dev(div14, p2);
    			append_dev(div14, t30);
    			append_dev(div14, p3);
    			append_dev(div16, t32);
    			append_dev(div16, div15);
    			append_dev(div15, button1);
    			append_dev(div15, t34);
    			append_dev(div15, img8);
    			append_dev(div19, t35);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, img9);
    			append_dev(div17, t36);
    			append_dev(div17, img10);
    			append_dev(div17, t37);
    			append_dev(div17, img11);
    			append_dev(div17, t38);
    			append_dev(div17, img12);
    			append_dev(div17, t39);
    			append_dev(div17, img13);
    			append_dev(div77, t40);
    			append_dev(div77, div69);
    			append_dev(div69, section1);
    			append_dev(section1, div29);
    			append_dev(div29, div21);
    			append_dev(div21, span4);
    			append_dev(div29, t42);
    			append_dev(div29, h20);
    			append_dev(div29, t44);
    			append_dev(div29, div28);
    			append_dev(div28, div24);
    			append_dev(div24, div22);
    			append_dev(div22, span5);
    			append_dev(div22, t46);
    			append_dev(div22, span6);
    			append_dev(div24, t48);
    			append_dev(div24, div23);
    			append_dev(div23, span7);
    			append_dev(div23, t50);
    			append_dev(div23, span8);
    			append_dev(div28, t52);
    			append_dev(div28, div27);
    			append_dev(div27, div25);
    			append_dev(div25, span9);
    			append_dev(div25, t54);
    			append_dev(div25, span10);
    			append_dev(div27, t56);
    			append_dev(div27, div26);
    			append_dev(div26, span11);
    			append_dev(div26, t58);
    			append_dev(div26, span12);
    			append_dev(div29, t60);
    			append_dev(div29, img14);
    			append_dev(section1, t61);
    			append_dev(section1, div33);
    			append_dev(div33, div30);
    			append_dev(div30, h30);
    			append_dev(div30, t63);
    			append_dev(div30, h40);
    			append_dev(div30, t65);
    			append_dev(div30, img15);
    			append_dev(div33, t66);
    			append_dev(div33, div31);
    			append_dev(div31, h31);
    			append_dev(div31, t68);
    			append_dev(div31, h41);
    			append_dev(div31, t70);
    			append_dev(div31, img16);
    			append_dev(div33, t71);
    			append_dev(div33, div32);
    			append_dev(div32, h32);
    			append_dev(div32, t73);
    			append_dev(div32, h42);
    			append_dev(div32, t75);
    			append_dev(div32, img17);
    			append_dev(section1, t76);
    			append_dev(section1, div68);
    			append_dev(div68, div63);
    			append_dev(div63, div37);
    			append_dev(div37, div34);
    			append_dev(div37, t78);
    			append_dev(div37, div35);
    			append_dev(div37, t80);
    			append_dev(div37, div36);
    			append_dev(div63, t82);
    			append_dev(div63, div62);
    			append_dev(div62, div41);
    			append_dev(div41, div38);
    			append_dev(div41, t84);
    			append_dev(div41, div39);
    			append_dev(div41, t86);
    			append_dev(div41, div40);
    			append_dev(div62, t88);
    			append_dev(div62, div45);
    			append_dev(div45, div42);
    			append_dev(div45, t90);
    			append_dev(div45, div43);
    			append_dev(div45, t92);
    			append_dev(div45, div44);
    			append_dev(div62, t94);
    			append_dev(div62, div49);
    			append_dev(div49, div46);
    			append_dev(div49, t96);
    			append_dev(div49, div47);
    			append_dev(div49, t98);
    			append_dev(div49, div48);
    			append_dev(div62, t100);
    			append_dev(div62, div53);
    			append_dev(div53, div50);
    			append_dev(div53, t102);
    			append_dev(div53, div51);
    			append_dev(div53, t104);
    			append_dev(div53, div52);
    			append_dev(div62, t106);
    			append_dev(div62, div57);
    			append_dev(div57, div54);
    			append_dev(div57, t108);
    			append_dev(div57, div55);
    			append_dev(div57, t110);
    			append_dev(div57, div56);
    			append_dev(div62, t112);
    			append_dev(div62, div61);
    			append_dev(div61, div58);
    			append_dev(div61, t114);
    			append_dev(div61, div59);
    			append_dev(div61, t116);
    			append_dev(div61, div60);
    			append_dev(div68, t118);
    			append_dev(div68, div67);
    			append_dev(div67, div66);
    			append_dev(div66, div64);
    			append_dev(div66, t119);
    			append_dev(div66, div65);
    			append_dev(div65, span13);
    			append_dev(div77, t121);
    			append_dev(div77, section2);
    			append_dev(section2, div76);
    			append_dev(div76, div72);
    			append_dev(div72, h21);
    			append_dev(div72, t123);
    			append_dev(div72, p4);
    			append_dev(div72, t125);
    			append_dev(div72, a);
    			append_dev(div72, t127);
    			append_dev(div72, div71);
    			append_dev(div71, div70);
    			append_dev(div76, t128);
    			append_dev(div76, div75);
    			append_dev(div75, div74);
    			append_dev(div74, button2);
    			append_dev(div74, t130);
    			append_dev(div74, button3);
    			append_dev(div74, t132);
    			append_dev(div74, p5);
    			append_dev(div74, t134);
    			append_dev(div74, div73);
    			append_dev(div73, p6);
    			append_dev(div73, t136);
    			append_dev(div73, p7);
    			append_dev(div73, t138);
    			append_dev(div73, p8);
    			append_dev(div77, t140);
    			mount_component(screen4, div77, null);
    			append_dev(div77, t141);
    			mount_component(screen5, div77, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", handlePromoClick, false, false, false, false),
    					listen_dev(button1, "click", handlePromoClick, false, false, false, false)
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
    			if (detaching) detach_dev(div77);
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
