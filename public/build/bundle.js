
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

    /* src/components/Screen1.svelte generated by Svelte v3.59.2 */

    const file$1 = "src/components/Screen1.svelte";

    function create_fragment$1(ctx) {
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
    	let section1;
    	let img2;
    	let img2_src_value;
    	let t12;
    	let section2;
    	let div9;
    	let div5;
    	let h2;
    	let t14;
    	let p2;
    	let t16;
    	let a;
    	let t18;
    	let div4;
    	let div3;
    	let t19;
    	let div8;
    	let div7;
    	let button1;
    	let t21;
    	let button2;
    	let t23;
    	let p3;
    	let t25;
    	let div6;
    	let p4;
    	let t27;
    	let p5;
    	let t29;
    	let p6;

    	const block = {
    		c: function create() {
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
    			t3 = text("\n      С ЛИГОЙ СТАВОК");
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Лига ставок, поздравляет всех с Новым Годом! Желает всего да побольше, особенно больше высоких выигрышных кэфов! \n      И анонсирует новый спецпроект, где больше однозначно лучше! \n      Получите уникальный промокод для участия в розыгрыше";
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
    			section1 = element("section");
    			img2 = element("img");
    			t12 = space();
    			section2 = element("section");
    			div9 = element("div");
    			div5 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Таблица конкурса";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t16 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t18 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t19 = space();
    			div8 = element("div");
    			div7 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t21 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t23 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».";
    			t25 = space();
    			div6 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t27 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t29 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Расписание стримов смотрите ниже";
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			add_location(source, file$1, 7, 2, 138);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-jizewo");
    			add_location(img0, file$1, 9, 2, 237);
    			add_location(picture, file$1, 5, 0, 98);
    			attr_dev(br, "class", "svelte-jizewo");
    			add_location(br, file$1, 15, 17, 404);
    			attr_dev(h1, "class", "title svelte-jizewo");
    			add_location(h1, file$1, 14, 4, 368);
    			attr_dev(p0, "class", "description svelte-jizewo");
    			add_location(p0, file$1, 18, 4, 444);
    			attr_dev(p1, "class", "description svelte-jizewo");
    			add_location(p1, file$1, 23, 4, 727);
    			attr_dev(button0, "class", "promo-button svelte-jizewo");
    			add_location(button0, file$1, 26, 4, 873);
    			attr_dev(div0, "class", "left-side svelte-jizewo");
    			add_location(div0, file$1, 13, 2, 340);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-jizewo");
    			add_location(img1, file$1, 31, 4, 981);
    			attr_dev(div1, "class", "right-side svelte-jizewo");
    			add_location(div1, file$1, 30, 2, 952);
    			attr_dev(div2, "class", "content svelte-jizewo");
    			add_location(div2, file$1, 12, 0, 316);
    			attr_dev(section0, "class", "screen first-screen svelte-jizewo");
    			add_location(section0, file$1, 4, 0, 60);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/второй_экран.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Описание призов");
    			attr_dev(img2, "class", "second-screen-image svelte-jizewo");
    			add_location(img2, file$1, 37, 2, 1123);
    			attr_dev(section1, "class", "second-screen svelte-jizewo");
    			add_location(section1, file$1, 36, 0, 1089);
    			attr_dev(h2, "class", "leaderboard-title svelte-jizewo");
    			add_location(h2, file$1, 43, 6, 1332);
    			attr_dev(p2, "class", "leaderboard-description svelte-jizewo");
    			add_location(p2, file$1, 44, 6, 1390);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-jizewo");
    			add_location(a, file$1, 47, 6, 1530);
    			attr_dev(div3, "class", "table-frame svelte-jizewo");
    			add_location(div3, file$1, 51, 8, 1698);
    			attr_dev(div4, "class", "leaderboard-table");
    			add_location(div4, file$1, 49, 6, 1621);
    			attr_dev(div5, "class", "leaderboard-left svelte-jizewo");
    			add_location(div5, file$1, 42, 4, 1295);
    			attr_dev(button1, "class", "action-button svelte-jizewo");
    			add_location(button1, file$1, 59, 8, 1895);
    			attr_dev(button2, "class", "action-button svelte-jizewo");
    			add_location(button2, file$1, 60, 8, 1959);
    			attr_dev(p3, "class", "promo-description svelte-jizewo");
    			add_location(p3, file$1, 62, 8, 2028);
    			attr_dev(p4, "class", "svelte-jizewo");
    			add_location(p4, file$1, 68, 10, 2282);
    			attr_dev(p5, "class", "svelte-jizewo");
    			add_location(p5, file$1, 69, 10, 2392);
    			attr_dev(p6, "class", "svelte-jizewo");
    			add_location(p6, file$1, 70, 10, 2444);
    			attr_dev(div6, "class", "additional-info svelte-jizewo");
    			add_location(div6, file$1, 67, 8, 2242);
    			attr_dev(div7, "class", "actions-container");
    			add_location(div7, file$1, 58, 6, 1855);
    			attr_dev(div8, "class", "leaderboard-right svelte-jizewo");
    			add_location(div8, file$1, 57, 4, 1817);
    			attr_dev(div9, "class", "leaderboard-container svelte-jizewo");
    			add_location(div9, file$1, 41, 2, 1255);
    			attr_dev(section2, "class", "third-screen svelte-jizewo");
    			add_location(section2, file$1, 40, 0, 1222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
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
    			insert_dev(target, t11, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, img2);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div9);
    			append_dev(div9, div5);
    			append_dev(div5, h2);
    			append_dev(div5, t14);
    			append_dev(div5, p2);
    			append_dev(div5, t16);
    			append_dev(div5, a);
    			append_dev(div5, t18);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, button1);
    			append_dev(div7, t21);
    			append_dev(div7, button2);
    			append_dev(div7, t23);
    			append_dev(div7, p3);
    			append_dev(div7, t25);
    			append_dev(div7, div6);
    			append_dev(div6, p4);
    			append_dev(div6, t27);
    			append_dev(div6, p5);
    			append_dev(div6, t29);
    			append_dev(div6, p6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(section2);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Screen1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Screen1> was created with unknown prop '${key}'`);
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
    			add_location(main, file, 4, 0, 72);
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

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
