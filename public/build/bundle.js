
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
    	let div53;
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
    	let section2;
    	let div60;
    	let div56;
    	let h21;
    	let t94;
    	let p2;
    	let t96;
    	let a;
    	let t98;
    	let div55;
    	let div54;
    	let t99;
    	let div59;
    	let div58;
    	let button1;
    	let t101;
    	let button2;
    	let t103;
    	let p3;
    	let t105;
    	let div57;
    	let p4;
    	let t107;
    	let p5;
    	let t109;
    	let p6;

    	const block = {
    		c: function create() {
    			div53 = element("div");
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
    			section2 = element("section");
    			div60 = element("div");
    			div56 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Таблица конкурса";
    			t94 = space();
    			p2 = element("p");
    			p2.textContent = "100 призов достанутся участникам, с самыми большими выигрышными коэффициентами";
    			t96 = space();
    			a = element("a");
    			a.textContent = "Смотреть предыдущих победителей";
    			t98 = space();
    			div55 = element("div");
    			div54 = element("div");
    			t99 = space();
    			div59 = element("div");
    			div58 = element("div");
    			button1 = element("button");
    			button1.textContent = "Введите промокод";
    			t101 = space();
    			button2 = element("button");
    			button2.textContent = "Узнать место";
    			t103 = space();
    			p3 = element("p");
    			p3.textContent = "Введите уникальный промокод, чтобы узнать своё место в таблице. \n          Промокод находится в личном кабинете БК «Лига Ставок» в разделе «Промокоды».";
    			t105 = space();
    			div57 = element("div");
    			p4 = element("p");
    			p4.textContent = "Участники акции занимают место в таблице согласно наиболее высокому выигрышному коэффициенту";
    			t107 = space();
    			p5 = element("p");
    			p5.textContent = "Приз за первое место iPhone 14 Pro";
    			t109 = space();
    			p6 = element("p");
    			p6.textContent = "Розыгрыш призов проходит на лайв-стримах канала twitch.tv/cq_ru. Рас��казание стримов смотрите ниже";
    			attr_dev(source, "srcset", "/images/header_mob.png");
    			attr_dev(source, "media", "(max-width: 768px)");
    			add_location(source, file$1, 9, 8, 213);
    			if (!src_url_equal(img0.src, img0_src_value = "/images/header.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Header");
    			attr_dev(img0, "class", "header-image svelte-rz96eh");
    			add_location(img0, file$1, 11, 8, 324);
    			add_location(picture, file$1, 7, 6, 161);
    			attr_dev(br, "class", "svelte-rz96eh");
    			add_location(br, file$1, 17, 23, 521);
    			attr_dev(h1, "class", "title svelte-rz96eh");
    			add_location(h1, file$1, 16, 10, 479);
    			attr_dev(p0, "class", "description svelte-rz96eh");
    			add_location(p0, file$1, 20, 10, 579);
    			attr_dev(p1, "class", "description svelte-rz96eh");
    			add_location(p1, file$1, 25, 10, 892);
    			attr_dev(button0, "class", "promo-button svelte-rz96eh");
    			add_location(button0, file$1, 28, 10, 1056);
    			attr_dev(div0, "class", "left-side svelte-rz96eh");
    			add_location(div0, file$1, 15, 8, 445);
    			if (!src_url_equal(img1.src, img1_src_value = "/images/christmas-tree.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Новогодняя ёлка");
    			attr_dev(img1, "class", "tree-image svelte-rz96eh");
    			add_location(img1, file$1, 33, 10, 1194);
    			attr_dev(div1, "class", "right-side svelte-rz96eh");
    			add_location(div1, file$1, 32, 8, 1159);
    			attr_dev(div2, "class", "content svelte-rz96eh");
    			add_location(div2, file$1, 14, 6, 415);
    			attr_dev(section0, "class", "first-screen svelte-rz96eh");
    			add_location(section0, file$1, 6, 4, 124);
    			attr_dev(div3, "class", "screen-container");
    			add_location(div3, file$1, 5, 2, 89);
    			attr_dev(span0, "class", "prize-label svelte-rz96eh");
    			add_location(span0, file$1, 43, 10, 1474);
    			attr_dev(div4, "class", "prize-header svelte-rz96eh");
    			add_location(div4, file$1, 42, 8, 1437);
    			attr_dev(h20, "class", "prize-title svelte-rz96eh");
    			add_location(h20, file$1, 46, 8, 1552);
    			attr_dev(span1, "class", "spec-label svelte-rz96eh");
    			add_location(span1, file$1, 51, 14, 1729);
    			attr_dev(span2, "class", "spec-value svelte-rz96eh");
    			add_location(span2, file$1, 52, 14, 1788);
    			attr_dev(div5, "class", "spec-item svelte-rz96eh");
    			add_location(div5, file$1, 50, 12, 1691);
    			attr_dev(span3, "class", "spec-label svelte-rz96eh");
    			add_location(span3, file$1, 55, 14, 1896);
    			attr_dev(span4, "class", "spec-value svelte-rz96eh");
    			add_location(span4, file$1, 56, 14, 1952);
    			attr_dev(div6, "class", "spec-item svelte-rz96eh");
    			add_location(div6, file$1, 54, 12, 1858);
    			attr_dev(div7, "class", "specs-column svelte-rz96eh");
    			add_location(div7, file$1, 49, 10, 1652);
    			attr_dev(span5, "class", "spec-label svelte-rz96eh");
    			add_location(span5, file$1, 61, 14, 2118);
    			attr_dev(span6, "class", "spec-value svelte-rz96eh");
    			add_location(span6, file$1, 62, 14, 2169);
    			attr_dev(div8, "class", "spec-item svelte-rz96eh");
    			add_location(div8, file$1, 60, 12, 2080);
    			attr_dev(span7, "class", "spec-label svelte-rz96eh");
    			add_location(span7, file$1, 65, 14, 2289);
    			attr_dev(span8, "class", "spec-value svelte-rz96eh");
    			add_location(span8, file$1, 66, 14, 2342);
    			attr_dev(div9, "class", "spec-item svelte-rz96eh");
    			add_location(div9, file$1, 64, 12, 2251);
    			attr_dev(div10, "class", "specs-column svelte-rz96eh");
    			add_location(div10, file$1, 59, 10, 2041);
    			attr_dev(div11, "class", "specs-container svelte-rz96eh");
    			add_location(div11, file$1, 48, 8, 1612);
    			if (!src_url_equal(img2.src, img2_src_value = "/images/iphone14pro.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "iPhone 14 Pro");
    			attr_dev(img2, "class", "prize-image svelte-rz96eh");
    			add_location(img2, file$1, 71, 8, 2448);
    			attr_dev(div12, "class", "main-prize svelte-rz96eh");
    			add_location(div12, file$1, 41, 6, 1404);
    			attr_dev(h30, "class", "prize-card-category svelte-rz96eh");
    			add_location(h30, file$1, 76, 10, 2619);
    			attr_dev(h40, "class", "prize-card-model svelte-rz96eh");
    			add_location(h40, file$1, 77, 10, 2675);
    			if (!src_url_equal(img3.src, img3_src_value = "/images/Naychniki.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Sony WH-1000XM4");
    			attr_dev(img3, "class", "prize-card-image svelte-rz96eh");
    			add_location(img3, file$1, 78, 10, 2735);
    			attr_dev(div13, "class", "prize-card svelte-rz96eh");
    			add_location(div13, file$1, 75, 8, 2584);
    			attr_dev(h31, "class", "prize-card-category svelte-rz96eh");
    			add_location(h31, file$1, 82, 6, 2867);
    			attr_dev(h41, "class", "prize-card-model svelte-rz96eh");
    			add_location(h41, file$1, 83, 6, 2922);
    			if (!src_url_equal(img4.src, img4_src_value = "/images/wine-fridge.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Kitfort KT-2403");
    			attr_dev(img4, "class", "prize-card-image svelte-rz96eh");
    			add_location(img4, file$1, 84, 6, 2978);
    			attr_dev(div14, "class", "prize-card svelte-rz96eh");
    			add_location(div14, file$1, 81, 4, 2836);
    			attr_dev(h32, "class", "prize-card-category svelte-rz96eh");
    			add_location(h32, file$1, 88, 6, 3108);
    			attr_dev(h42, "class", "prize-card-model svelte-rz96eh");
    			add_location(h42, file$1, 89, 6, 3165);
    			if (!src_url_equal(img5.src, img5_src_value = "/images/mi-band.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Xiaomi Mi Band 7");
    			attr_dev(img5, "class", "prize-card-image svelte-rz96eh");
    			add_location(img5, file$1, 90, 6, 3222);
    			attr_dev(div15, "class", "prize-card svelte-rz96eh");
    			add_location(div15, file$1, 87, 4, 3077);
    			attr_dev(div16, "class", "additional-prizes svelte-rz96eh");
    			add_location(div16, file$1, 74, 6, 2544);
    			attr_dev(div17, "class", "header-place svelte-rz96eh");
    			add_location(div17, file$1, 97, 12, 3453);
    			attr_dev(div18, "class", "header-prize svelte-rz96eh");
    			add_location(div18, file$1, 98, 12, 3503);
    			attr_dev(div19, "class", "header-freebet svelte-rz96eh");
    			add_location(div19, file$1, 99, 12, 3552);
    			attr_dev(div20, "class", "leaderboard-headers svelte-rz96eh");
    			add_location(div20, file$1, 96, 10, 3407);
    			attr_dev(div21, "class", "place svelte-rz96eh");
    			add_location(div21, file$1, 104, 14, 3708);
    			attr_dev(div22, "class", "prize svelte-rz96eh");
    			add_location(div22, file$1, 105, 14, 3749);
    			attr_dev(div23, "class", "freebet svelte-rz96eh");
    			add_location(div23, file$1, 106, 14, 3802);
    			attr_dev(div24, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div24, file$1, 103, 12, 3664);
    			attr_dev(div25, "class", "place svelte-rz96eh");
    			add_location(div25, file$1, 110, 14, 3914);
    			attr_dev(div26, "class", "prize svelte-rz96eh");
    			add_location(div26, file$1, 111, 14, 3955);
    			attr_dev(div27, "class", "freebet svelte-rz96eh");
    			add_location(div27, file$1, 112, 14, 4008);
    			attr_dev(div28, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div28, file$1, 109, 12, 3870);
    			attr_dev(div29, "class", "place svelte-rz96eh");
    			add_location(div29, file$1, 116, 14, 4120);
    			attr_dev(div30, "class", "prize svelte-rz96eh");
    			add_location(div30, file$1, 117, 14, 4161);
    			attr_dev(div31, "class", "freebet svelte-rz96eh");
    			add_location(div31, file$1, 118, 14, 4214);
    			attr_dev(div32, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div32, file$1, 115, 12, 4076);
    			attr_dev(div33, "class", "place svelte-rz96eh");
    			add_location(div33, file$1, 122, 16, 4330);
    			attr_dev(div34, "class", "prize svelte-rz96eh");
    			add_location(div34, file$1, 123, 16, 4373);
    			attr_dev(div35, "class", "freebet svelte-rz96eh");
    			add_location(div35, file$1, 124, 16, 4434);
    			attr_dev(div36, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div36, file$1, 121, 14, 4284);
    			attr_dev(div37, "class", "place svelte-rz96eh");
    			add_location(div37, file$1, 128, 16, 4552);
    			attr_dev(div38, "class", "prize svelte-rz96eh");
    			add_location(div38, file$1, 129, 16, 4595);
    			attr_dev(div39, "class", "freebet svelte-rz96eh");
    			add_location(div39, file$1, 130, 16, 4656);
    			attr_dev(div40, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div40, file$1, 127, 14, 4506);
    			attr_dev(div41, "class", "place svelte-rz96eh");
    			add_location(div41, file$1, 134, 16, 4774);
    			attr_dev(div42, "class", "prize svelte-rz96eh");
    			add_location(div42, file$1, 135, 16, 4820);
    			attr_dev(div43, "class", "freebet svelte-rz96eh");
    			add_location(div43, file$1, 136, 16, 4882);
    			attr_dev(div44, "class", "leaderboard-row svelte-rz96eh");
    			add_location(div44, file$1, 133, 14, 4728);
    			attr_dev(div45, "class", "leaderboard-rows svelte-rz96eh");
    			add_location(div45, file$1, 102, 10, 3621);
    			attr_dev(div46, "class", "leaderboard-content svelte-rz96eh");
    			add_location(div46, file$1, 95, 8, 3363);
    			attr_dev(div47, "class", "merch-images");
    			add_location(div47, file$1, 143, 12, 5060);
    			attr_dev(span9, "class", "svelte-rz96eh");
    			add_location(span9, file$1, 147, 14, 5212);
    			attr_dev(div48, "class", "merch-status svelte-rz96eh");
    			add_location(div48, file$1, 146, 12, 5171);
    			attr_dev(div49, "class", "merch-content svelte-rz96eh");
    			add_location(div49, file$1, 142, 10, 5020);
    			attr_dev(div50, "class", "merch-column svelte-rz96eh");
    			add_location(div50, file$1, 141, 8, 4983);
    			attr_dev(div51, "class", "leaderboard svelte-rz96eh");
    			add_location(div51, file$1, 94, 6, 3329);
    			attr_dev(section1, "class", "second-screen svelte-rz96eh");
    			add_location(section1, file$1, 40, 4, 1366);
    			attr_dev(div52, "class", "screen-container");
    			add_location(div52, file$1, 39, 2, 1331);
    			attr_dev(div53, "class", "page-wrapper svelte-rz96eh");
    			add_location(div53, file$1, 4, 0, 60);
    			attr_dev(h21, "class", "leaderboard-title svelte-rz96eh");
    			add_location(h21, file$1, 159, 6, 5445);
    			attr_dev(p2, "class", "leaderboard-description svelte-rz96eh");
    			add_location(p2, file$1, 160, 6, 5503);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "previous-winners-link svelte-rz96eh");
    			add_location(a, file$1, 163, 6, 5643);
    			attr_dev(div54, "class", "table-frame svelte-rz96eh");
    			add_location(div54, file$1, 167, 8, 5811);
    			attr_dev(div55, "class", "leaderboard-table");
    			add_location(div55, file$1, 165, 6, 5734);
    			attr_dev(div56, "class", "leaderboard-left svelte-rz96eh");
    			add_location(div56, file$1, 158, 4, 5408);
    			attr_dev(button1, "class", "action-button svelte-rz96eh");
    			add_location(button1, file$1, 175, 8, 6008);
    			attr_dev(button2, "class", "action-button svelte-rz96eh");
    			add_location(button2, file$1, 176, 8, 6072);
    			attr_dev(p3, "class", "promo-description svelte-rz96eh");
    			add_location(p3, file$1, 178, 8, 6141);
    			attr_dev(p4, "class", "svelte-rz96eh");
    			add_location(p4, file$1, 184, 10, 6395);
    			attr_dev(p5, "class", "svelte-rz96eh");
    			add_location(p5, file$1, 185, 10, 6505);
    			attr_dev(p6, "class", "svelte-rz96eh");
    			add_location(p6, file$1, 186, 10, 6557);
    			attr_dev(div57, "class", "additional-info svelte-rz96eh");
    			add_location(div57, file$1, 183, 8, 6355);
    			attr_dev(div58, "class", "actions-container");
    			add_location(div58, file$1, 174, 6, 5968);
    			attr_dev(div59, "class", "leaderboard-right svelte-rz96eh");
    			add_location(div59, file$1, 173, 4, 5930);
    			attr_dev(div60, "class", "leaderboard-container svelte-rz96eh");
    			add_location(div60, file$1, 157, 2, 5368);
    			attr_dev(section2, "class", "third-screen svelte-rz96eh");
    			add_location(section2, file$1, 156, 0, 5335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div53, anchor);
    			append_dev(div53, div3);
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
    			append_dev(div53, t11);
    			append_dev(div53, div52);
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
    			insert_dev(target, t92, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div60);
    			append_dev(div60, div56);
    			append_dev(div56, h21);
    			append_dev(div56, t94);
    			append_dev(div56, p2);
    			append_dev(div56, t96);
    			append_dev(div56, a);
    			append_dev(div56, t98);
    			append_dev(div56, div55);
    			append_dev(div55, div54);
    			append_dev(div60, t99);
    			append_dev(div60, div59);
    			append_dev(div59, div58);
    			append_dev(div58, button1);
    			append_dev(div58, t101);
    			append_dev(div58, button2);
    			append_dev(div58, t103);
    			append_dev(div58, p3);
    			append_dev(div58, t105);
    			append_dev(div58, div57);
    			append_dev(div57, p4);
    			append_dev(div57, t107);
    			append_dev(div57, p5);
    			append_dev(div57, t109);
    			append_dev(div57, p6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div53);
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
