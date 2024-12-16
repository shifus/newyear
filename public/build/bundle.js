
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
    	let div11;
    	let div3;
    	let span0;
    	let t13;
    	let h20;
    	let t15;
    	let div10;
    	let div6;
    	let div4;
    	let span1;
    	let t17;
    	let span2;
    	let t19;
    	let div5;
    	let span3;
    	let t21;
    	let span4;
    	let t23;
    	let div9;
    	let div7;
    	let span5;
    	let t25;
    	let span6;
    	let t27;
    	let div8;
    	let span7;
    	let t29;
    	let span8;
    	let t31;
    	let img2;
    	let img2_src_value;
    	let t32;
    	let div15;
    	let div12;
    	let h30;
    	let t34;
    	let h40;
    	let t36;
    	let img3;
    	let img3_src_value;
    	let t37;
    	let div13;
    	let h31;
    	let t39;
    	let h41;
    	let t41;
    	let img4;
    	let img4_src_value;
    	let t42;
    	let div14;
    	let h32;
    	let t44;
    	let h42;
    	let t46;
    	let img5;
    	let img5_src_value;
    	let t47;
    	let div50;
    	let div45;
    	let div19;
    	let div16;
    	let t49;
    	let div17;
    	let t51;
    	let div18;
    	let t53;
    	let div44;
    	let div23;
    	let div20;
    	let t55;
    	let div21;
    	let t57;
    	let div22;
    	let t59;
    	let div27;
    	let div24;
    	let t61;
    	let div25;
    	let t63;
    	let div26;
    	let t65;
    	let div31;
    	let div28;
    	let t67;
    	let div29;
    	let t69;
    	let div30;
    	let t71;
    	let div35;
    	let div32;
    	let t73;
    	let div33;
    	let t75;
    	let div34;
    	let t77;
    	let div39;
    	let div36;
    	let t79;
    	let div37;
    	let t81;
    	let div38;
    	let t83;
    	let div43;
    	let div40;
    	let t85;
    	let div41;
    	let t87;
    	let div42;
    	let t89;
    	let div49;
    	let div48;
    	let div46;
    	let t90;
    	let div47;
    	let span9;
    	let t92;
    	let section2;
    	let div57;
    	let div53;
    	let h21;
    	let t94;
    	let p2;
    	let t96;
    	let a;
    	let t98;
    	let div52;
    	let div51;
    	let t99;
    	let div56;
    	let div55;
    	let button1;
    	let t101;
    	let button2;
    	let t103;
    	let p3;
    	let t105;
    	let div54;
    	let p4;
    	let t107;
    	let p5;
    	let t109;
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
    			div11 = element("div");
    			div3 = element("div");
    			span0 = element("span");
    			span0.textContent = "Главный приз";
    			t13 = space();
    			h20 = element("h2");
    			h20.textContent = "iPhone 14 Pro";
    			t15 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			span1 = element("span");
    			span1.textContent = "Объем памяти";
    			t17 = space();
    			span2 = element("span");
    			span2.textContent = "128 GB";
    			t19 = space();
    			div5 = element("div");
    			span3 = element("span");
    			span3.textContent = "Процессор";
    			t21 = space();
    			span4 = element("span");
    			span4.textContent = "A16 Bionic";
    			t23 = space();
    			div9 = element("div");
    			div7 = element("div");
    			span5 = element("span");
    			span5.textContent = "Цвет";
    			t25 = space();
    			span6 = element("span");
    			span6.textContent = "Космический черный";
    			t27 = space();
    			div8 = element("div");
    			span7 = element("span");
    			span7.textContent = "Камера";
    			t29 = space();
    			span8 = element("span");
    			span8.textContent = "48 МП";
    			t31 = space();
    			img2 = element("img");
    			t32 = space();
    			div15 = element("div");
    			div12 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Наушники";
    			t34 = space();
    			h40 = element("h4");
    			h40.textContent = "Sony WH-1000XM4";
    			t36 = space();
    			img3 = element("img");
    			t37 = space();
    			div13 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Винный шкаф";
    			t39 = space();
    			h41 = element("h4");
    			h41.textContent = "Kitfort KT-2403";
    			t41 = space();
    			img4 = element("img");
    			t42 = space();
    			div14 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Фитнес трекер";
    			t44 = space();
    			h42 = element("h4");
    			h42.textContent = "Xiaomi Mi Band 7";
    			t46 = space();
    			img5 = element("img");
    			t47 = space();
    			div50 = element("div");
    			div45 = element("div");
    			div19 = element("div");
    			div16 = element("div");
    			div16.textContent = "Место";
    			t49 = space();
    			div17 = element("div");
    			div17.textContent = "Приз";
    			t51 = space();
    			div18 = element("div");
    			div18.textContent = "Фрибет";
    			t53 = space();
    			div44 = element("div");
    			div23 = element("div");
    			div20 = element("div");
    			div20.textContent = "1";
    			t55 = space();
    			div21 = element("div");
    			div21.textContent = "iPhone 14 Pro";
    			t57 = space();
    			div22 = element("div");
    			div22.textContent = "50 000 ₽";
    			t59 = space();
    			div27 = element("div");
    			div24 = element("div");
    			div24.textContent = "2";
    			t61 = space();
    			div25 = element("div");
    			div25.textContent = "Наушники Sony";
    			t63 = space();
    			div26 = element("div");
    			div26.textContent = "40 000 ₽";
    			t65 = space();
    			div31 = element("div");
    			div28 = element("div");
    			div28.textContent = "3";
    			t67 = space();
    			div29 = element("div");
    			div29.textContent = "Наушники Sony";
    			t69 = space();
    			div30 = element("div");
    			div30.textContent = "30 000 ₽";
    			t71 = space();
    			div35 = element("div");
    			div32 = element("div");
    			div32.textContent = "4";
    			t73 = space();
    			div33 = element("div");
    			div33.textContent = "Винный шкаф Kitfort";
    			t75 = space();
    			div34 = element("div");
    			div34.textContent = "20 000 ₽";
    			t77 = space();
    			div39 = element("div");
    			div36 = element("div");
    			div36.textContent = "5";
    			t79 = space();
    			div37 = element("div");
    			div37.textContent = "Винный шкаф Kitfort";
    			t81 = space();
    			div38 = element("div");
    			div38.textContent = "10 000 ₽";
    			t83 = space();
    			div43 = element("div");
    			div40 = element("div");
    			div40.textContent = "6-10";
    			t85 = space();
    			div41 = element("div");
    			div41.textContent = "Фитнес трекер Xiaomi";
    			t87 = space();
    			div42 = element("div");
    			div42.textContent = "7 000 ₽";
    			t89 = space();
    			div49 = element("div");
    			div48 = element("div");
    			div46 = element("div");
    			t90 = space();
    			div47 = element("div");
    			span9 = element("span");
    			span9.textContent = "Мерч разыгран";
    			t92 = space();
    			section2 = element("section");
    			div57 = element("div");
    			div53 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t94 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t96 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t98 = space();
    			div52 = element("div");
    			div51 = element("div");
    			t99 = space();
    			div56 = element("div");
    			div55 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t101 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t103 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальны�� промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».";
    			t105 = space();
    			div54 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t107 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t109 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Расписание стримов смотрите ниже";
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			add_location(source, file$1, 7, 2, 138);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-tnbu7o");
    			add_location(img0, file$1, 9, 2, 237);
    			add_location(picture, file$1, 5, 0, 98);
    			attr_dev(br, "class", "svelte-tnbu7o");
    			add_location(br, file$1, 15, 17, 404);
    			attr_dev(h1, "class", "title svelte-tnbu7o");
    			add_location(h1, file$1, 14, 4, 368);
    			attr_dev(p0, "class", "description svelte-tnbu7o");
    			add_location(p0, file$1, 18, 4, 444);
    			attr_dev(p1, "class", "description svelte-tnbu7o");
    			add_location(p1, file$1, 23, 4, 727);
    			attr_dev(button0, "class", "promo-button svelte-tnbu7o");
    			add_location(button0, file$1, 26, 4, 873);
    			attr_dev(div0, "class", "left-side svelte-tnbu7o");
    			add_location(div0, file$1, 13, 2, 340);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-tnbu7o");
    			add_location(img1, file$1, 31, 4, 981);
    			attr_dev(div1, "class", "right-side svelte-tnbu7o");
    			add_location(div1, file$1, 30, 2, 952);
    			attr_dev(div2, "class", "content svelte-tnbu7o");
    			add_location(div2, file$1, 12, 0, 316);
    			attr_dev(section0, "class", "screen first-screen svelte-tnbu7o");
    			add_location(section0, file$1, 4, 0, 60);
    			attr_dev(span0, "class", "prize-label svelte-tnbu7o");
    			add_location(span0, file$1, 39, 6, 1185);
    			attr_dev(div3, "class", "prize-header svelte-tnbu7o");
    			add_location(div3, file$1, 38, 4, 1152);
    			attr_dev(h20, "class", "prize-title svelte-tnbu7o");
    			add_location(h20, file$1, 42, 4, 1251);
    			attr_dev(span1, "class", "spec-label svelte-tnbu7o");
    			add_location(span1, file$1, 47, 10, 1408);
    			attr_dev(span2, "class", "spec-value svelte-tnbu7o");
    			add_location(span2, file$1, 48, 10, 1463);
    			attr_dev(div4, "class", "spec-item svelte-tnbu7o");
    			add_location(div4, file$1, 46, 8, 1374);
    			attr_dev(span3, "class", "spec-label svelte-tnbu7o");
    			add_location(span3, file$1, 51, 10, 1559);
    			attr_dev(span4, "class", "spec-value svelte-tnbu7o");
    			add_location(span4, file$1, 52, 10, 1611);
    			attr_dev(div5, "class", "spec-item svelte-tnbu7o");
    			add_location(div5, file$1, 50, 8, 1525);
    			attr_dev(div6, "class", "specs-column svelte-tnbu7o");
    			add_location(div6, file$1, 45, 6, 1339);
    			attr_dev(span5, "class", "spec-label svelte-tnbu7o");
    			add_location(span5, file$1, 57, 10, 1757);
    			attr_dev(span6, "class", "spec-value svelte-tnbu7o");
    			add_location(span6, file$1, 58, 10, 1804);
    			attr_dev(div7, "class", "spec-item svelte-tnbu7o");
    			add_location(div7, file$1, 56, 8, 1723);
    			attr_dev(span7, "class", "spec-label svelte-tnbu7o");
    			add_location(span7, file$1, 61, 10, 1912);
    			attr_dev(span8, "class", "spec-value svelte-tnbu7o");
    			add_location(span8, file$1, 62, 10, 1961);
    			attr_dev(div8, "class", "spec-item svelte-tnbu7o");
    			add_location(div8, file$1, 60, 8, 1878);
    			attr_dev(div9, "class", "specs-column svelte-tnbu7o");
    			add_location(div9, file$1, 55, 6, 1688);
    			attr_dev(div10, "class", "specs-container svelte-tnbu7o");
    			add_location(div10, file$1, 44, 4, 1303);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/iphone14pro.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "iPhone 14 Pro");
    			attr_dev(img2, "class", "prize-image svelte-tnbu7o");
    			add_location(img2, file$1, 67, 4, 2047);
    			attr_dev(div11, "class", "main-prize svelte-tnbu7o");
    			add_location(div11, file$1, 37, 2, 1123);
    			attr_dev(h30, "class", "prize-card-category svelte-tnbu7o");
    			add_location(h30, file$1, 72, 6, 2202);
    			attr_dev(h40, "class", "prize-card-model svelte-tnbu7o");
    			add_location(h40, file$1, 73, 6, 2254);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/Naychniki.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Sony WH-1000XM4");
    			attr_dev(img3, "class", "prize-card-image svelte-tnbu7o");
    			add_location(img3, file$1, 74, 6, 2310);
    			attr_dev(div12, "class", "prize-card svelte-tnbu7o");
    			add_location(div12, file$1, 71, 4, 2171);
    			attr_dev(h31, "class", "prize-card-category svelte-tnbu7o");
    			add_location(h31, file$1, 78, 6, 2438);
    			attr_dev(h41, "class", "prize-card-model svelte-tnbu7o");
    			add_location(h41, file$1, 79, 6, 2493);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/wine-fridge.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Kitfort KT-2403");
    			attr_dev(img4, "class", "prize-card-image svelte-tnbu7o");
    			add_location(img4, file$1, 80, 6, 2549);
    			attr_dev(div13, "class", "prize-card svelte-tnbu7o");
    			add_location(div13, file$1, 77, 4, 2407);
    			attr_dev(h32, "class", "prize-card-category svelte-tnbu7o");
    			add_location(h32, file$1, 84, 6, 2679);
    			attr_dev(h42, "class", "prize-card-model svelte-tnbu7o");
    			add_location(h42, file$1, 85, 6, 2736);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/mi-band.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img5, "class", "prize-card-image svelte-tnbu7o");
    			add_location(img5, file$1, 86, 6, 2793);
    			attr_dev(div14, "class", "prize-card svelte-tnbu7o");
    			add_location(div14, file$1, 83, 4, 2648);
    			attr_dev(div15, "class", "additional-prizes svelte-tnbu7o");
    			add_location(div15, file$1, 70, 2, 2135);
    			attr_dev(div16, "class", "header-place svelte-tnbu7o");
    			add_location(div16, file$1, 93, 8, 3008);
    			attr_dev(div17, "class", "header-prize svelte-tnbu7o");
    			add_location(div17, file$1, 94, 8, 3054);
    			attr_dev(div18, "class", "header-freebet svelte-tnbu7o");
    			add_location(div18, file$1, 95, 8, 3099);
    			attr_dev(div19, "class", "leaderboard-headers svelte-tnbu7o");
    			add_location(div19, file$1, 92, 6, 2966);
    			attr_dev(div20, "class", "place svelte-tnbu7o");
    			add_location(div20, file$1, 100, 10, 3239);
    			attr_dev(div21, "class", "prize svelte-tnbu7o");
    			add_location(div21, file$1, 101, 10, 3276);
    			attr_dev(div22, "class", "freebet svelte-tnbu7o");
    			add_location(div22, file$1, 102, 10, 3325);
    			attr_dev(div23, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div23, file$1, 99, 8, 3199);
    			attr_dev(div24, "class", "place svelte-tnbu7o");
    			add_location(div24, file$1, 106, 10, 3425);
    			attr_dev(div25, "class", "prize svelte-tnbu7o");
    			add_location(div25, file$1, 107, 10, 3462);
    			attr_dev(div26, "class", "freebet svelte-tnbu7o");
    			add_location(div26, file$1, 108, 10, 3511);
    			attr_dev(div27, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div27, file$1, 105, 8, 3385);
    			attr_dev(div28, "class", "place svelte-tnbu7o");
    			add_location(div28, file$1, 112, 10, 3611);
    			attr_dev(div29, "class", "prize svelte-tnbu7o");
    			add_location(div29, file$1, 113, 10, 3648);
    			attr_dev(div30, "class", "freebet svelte-tnbu7o");
    			add_location(div30, file$1, 114, 10, 3697);
    			attr_dev(div31, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div31, file$1, 111, 8, 3571);
    			attr_dev(div32, "class", "place svelte-tnbu7o");
    			add_location(div32, file$1, 118, 10, 3797);
    			attr_dev(div33, "class", "prize svelte-tnbu7o");
    			add_location(div33, file$1, 119, 10, 3834);
    			attr_dev(div34, "class", "freebet svelte-tnbu7o");
    			add_location(div34, file$1, 120, 10, 3889);
    			attr_dev(div35, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div35, file$1, 117, 8, 3757);
    			attr_dev(div36, "class", "place svelte-tnbu7o");
    			add_location(div36, file$1, 124, 10, 3989);
    			attr_dev(div37, "class", "prize svelte-tnbu7o");
    			add_location(div37, file$1, 125, 10, 4026);
    			attr_dev(div38, "class", "freebet svelte-tnbu7o");
    			add_location(div38, file$1, 126, 10, 4081);
    			attr_dev(div39, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div39, file$1, 123, 8, 3949);
    			attr_dev(div40, "class", "place svelte-tnbu7o");
    			add_location(div40, file$1, 130, 10, 4181);
    			attr_dev(div41, "class", "prize svelte-tnbu7o");
    			add_location(div41, file$1, 131, 10, 4221);
    			attr_dev(div42, "class", "freebet svelte-tnbu7o");
    			add_location(div42, file$1, 132, 10, 4277);
    			attr_dev(div43, "class", "leaderboard-row svelte-tnbu7o");
    			add_location(div43, file$1, 129, 8, 4141);
    			attr_dev(div44, "class", "leaderboard-rows svelte-tnbu7o");
    			add_location(div44, file$1, 98, 6, 3160);
    			attr_dev(div45, "class", "leaderboard-content svelte-tnbu7o");
    			add_location(div45, file$1, 91, 4, 2926);
    			attr_dev(div46, "class", "merch-images");
    			add_location(div46, file$1, 139, 8, 4425);
    			attr_dev(span9, "class", "svelte-tnbu7o");
    			add_location(span9, file$1, 143, 10, 4561);
    			attr_dev(div47, "class", "merch-status svelte-tnbu7o");
    			add_location(div47, file$1, 142, 8, 4524);
    			attr_dev(div48, "class", "merch-content svelte-tnbu7o");
    			add_location(div48, file$1, 138, 6, 4389);
    			attr_dev(div49, "class", "merch-column svelte-tnbu7o");
    			add_location(div49, file$1, 137, 4, 4356);
    			attr_dev(div50, "class", "leaderboard svelte-tnbu7o");
    			add_location(div50, file$1, 90, 2, 2896);
    			attr_dev(section1, "class", "second-screen svelte-tnbu7o");
    			add_location(section1, file$1, 36, 0, 1089);
    			attr_dev(h21, "class", "leaderboard-title svelte-tnbu7o");
    			add_location(h21, file$1, 153, 6, 4758);
    			attr_dev(p2, "class", "leaderboard-description svelte-tnbu7o");
    			add_location(p2, file$1, 154, 6, 4816);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-tnbu7o");
    			add_location(a, file$1, 157, 6, 4956);
    			attr_dev(div51, "class", "table-frame svelte-tnbu7o");
    			add_location(div51, file$1, 161, 8, 5124);
    			attr_dev(div52, "class", "leaderboard-table");
    			add_location(div52, file$1, 159, 6, 5047);
    			attr_dev(div53, "class", "leaderboard-left svelte-tnbu7o");
    			add_location(div53, file$1, 152, 4, 4721);
    			attr_dev(button1, "class", "action-button svelte-tnbu7o");
    			add_location(button1, file$1, 169, 8, 5321);
    			attr_dev(button2, "class", "action-button svelte-tnbu7o");
    			add_location(button2, file$1, 170, 8, 5385);
    			attr_dev(p3, "class", "promo-description svelte-tnbu7o");
    			add_location(p3, file$1, 172, 8, 5454);
    			attr_dev(p4, "class", "svelte-tnbu7o");
    			add_location(p4, file$1, 178, 10, 5709);
    			attr_dev(p5, "class", "svelte-tnbu7o");
    			add_location(p5, file$1, 179, 10, 5819);
    			attr_dev(p6, "class", "svelte-tnbu7o");
    			add_location(p6, file$1, 180, 10, 5871);
    			attr_dev(div54, "class", "additional-info svelte-tnbu7o");
    			add_location(div54, file$1, 177, 8, 5669);
    			attr_dev(div55, "class", "actions-container");
    			add_location(div55, file$1, 168, 6, 5281);
    			attr_dev(div56, "class", "leaderboard-right svelte-tnbu7o");
    			add_location(div56, file$1, 167, 4, 5243);
    			attr_dev(div57, "class", "leaderboard-container svelte-tnbu7o");
    			add_location(div57, file$1, 151, 2, 4681);
    			attr_dev(section2, "class", "third-screen svelte-tnbu7o");
    			add_location(section2, file$1, 150, 0, 4648);
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
    			append_dev(section1, div11);
    			append_dev(div11, div3);
    			append_dev(div3, span0);
    			append_dev(div11, t13);
    			append_dev(div11, h20);
    			append_dev(div11, t15);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div4, span1);
    			append_dev(div4, t17);
    			append_dev(div4, span2);
    			append_dev(div6, t19);
    			append_dev(div6, div5);
    			append_dev(div5, span3);
    			append_dev(div5, t21);
    			append_dev(div5, span4);
    			append_dev(div10, t23);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, span5);
    			append_dev(div7, t25);
    			append_dev(div7, span6);
    			append_dev(div9, t27);
    			append_dev(div9, div8);
    			append_dev(div8, span7);
    			append_dev(div8, t29);
    			append_dev(div8, span8);
    			append_dev(div11, t31);
    			append_dev(div11, img2);
    			append_dev(section1, t32);
    			append_dev(section1, div15);
    			append_dev(div15, div12);
    			append_dev(div12, h30);
    			append_dev(div12, t34);
    			append_dev(div12, h40);
    			append_dev(div12, t36);
    			append_dev(div12, img3);
    			append_dev(div15, t37);
    			append_dev(div15, div13);
    			append_dev(div13, h31);
    			append_dev(div13, t39);
    			append_dev(div13, h41);
    			append_dev(div13, t41);
    			append_dev(div13, img4);
    			append_dev(div15, t42);
    			append_dev(div15, div14);
    			append_dev(div14, h32);
    			append_dev(div14, t44);
    			append_dev(div14, h42);
    			append_dev(div14, t46);
    			append_dev(div14, img5);
    			append_dev(section1, t47);
    			append_dev(section1, div50);
    			append_dev(div50, div45);
    			append_dev(div45, div19);
    			append_dev(div19, div16);
    			append_dev(div19, t49);
    			append_dev(div19, div17);
    			append_dev(div19, t51);
    			append_dev(div19, div18);
    			append_dev(div45, t53);
    			append_dev(div45, div44);
    			append_dev(div44, div23);
    			append_dev(div23, div20);
    			append_dev(div23, t55);
    			append_dev(div23, div21);
    			append_dev(div23, t57);
    			append_dev(div23, div22);
    			append_dev(div44, t59);
    			append_dev(div44, div27);
    			append_dev(div27, div24);
    			append_dev(div27, t61);
    			append_dev(div27, div25);
    			append_dev(div27, t63);
    			append_dev(div27, div26);
    			append_dev(div44, t65);
    			append_dev(div44, div31);
    			append_dev(div31, div28);
    			append_dev(div31, t67);
    			append_dev(div31, div29);
    			append_dev(div31, t69);
    			append_dev(div31, div30);
    			append_dev(div44, t71);
    			append_dev(div44, div35);
    			append_dev(div35, div32);
    			append_dev(div35, t73);
    			append_dev(div35, div33);
    			append_dev(div35, t75);
    			append_dev(div35, div34);
    			append_dev(div44, t77);
    			append_dev(div44, div39);
    			append_dev(div39, div36);
    			append_dev(div39, t79);
    			append_dev(div39, div37);
    			append_dev(div39, t81);
    			append_dev(div39, div38);
    			append_dev(div44, t83);
    			append_dev(div44, div43);
    			append_dev(div43, div40);
    			append_dev(div43, t85);
    			append_dev(div43, div41);
    			append_dev(div43, t87);
    			append_dev(div43, div42);
    			append_dev(div50, t89);
    			append_dev(div50, div49);
    			append_dev(div49, div48);
    			append_dev(div48, div46);
    			append_dev(div48, t90);
    			append_dev(div48, div47);
    			append_dev(div47, span9);
    			insert_dev(target, t92, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div57);
    			append_dev(div57, div53);
    			append_dev(div53, h21);
    			append_dev(div53, t94);
    			append_dev(div53, p2);
    			append_dev(div53, t96);
    			append_dev(div53, a);
    			append_dev(div53, t98);
    			append_dev(div53, div52);
    			append_dev(div52, div51);
    			append_dev(div57, t99);
    			append_dev(div57, div56);
    			append_dev(div56, div55);
    			append_dev(div55, button1);
    			append_dev(div55, t101);
    			append_dev(div55, button2);
    			append_dev(div55, t103);
    			append_dev(div55, p3);
    			append_dev(div55, t105);
    			append_dev(div55, div54);
    			append_dev(div54, p4);
    			append_dev(div54, t107);
    			append_dev(div54, p5);
    			append_dev(div54, t109);
    			append_dev(div54, p6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t92);
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
