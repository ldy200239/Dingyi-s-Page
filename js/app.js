/* Dingyi Li — portfolio. Single-page app with hash routes. */
(function () {
  "use strict";
  const S = window.SITE;
  const P = S.projects;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $("#app");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const desktop = () => matchMedia("(min-width: 761px)").matches;
  let framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }

  /* ---------- storage (may be unavailable) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- i18n ---------- */
  const t = (o) => (o && typeof o === "object" ? `<span data-l="en">${o.en}</span><span data-l="zh">${o.zh}</span>` : o || "");
  const lang = () => document.documentElement.lang;
  function setLang(l) {
    document.documentElement.lang = l;
    store.set("dl-lang", l);
  }
  setLang(store.get("dl-lang") || ((navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en"));

  /* ---------- icons ---------- */
  const I = {
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13L14 8z" fill="currentColor"/></svg>',
    out: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2H2v12h12v-4M9 2h5v5M14 2 7 9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  };

  /* ---------- sound (off by default) ---------- */
  let actx = null;
  let sfxOn = store.get("dl-sfx") === "1";
  function blip(freq = 660, dur = 0.05, type = "square", vol = 0.04) {
    if (!sfxOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g).connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur + 0.02);
    } catch (e) {}
  }

  /* ---------- smooth scroll ---------- */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToY = (y, immediate) => (lenis ? lenis.scrollTo(y, { immediate: !!immediate, duration: 1.2 }) : window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" }));
  const scrollToEl = (el) => el && scrollToY(el.getBoundingClientRect().top + window.scrollY - 60);

  /* ---------- header ---------- */
  const hud = $(".hud");
  addEventListener("scroll", () => hud.style.setProperty("--hud-bg", scrollY > 40 ? 1 : 0.7), { passive: true });
  $(".lang").addEventListener("click", () => { setLang(lang() === "en" ? "zh" : "en"); blip(520); });
  const sfxBtn = $(".sfx");
  sfxBtn.setAttribute("aria-pressed", String(sfxOn));
  sfxBtn.addEventListener("click", () => {
    sfxOn = !sfxOn;
    store.set("dl-sfx", sfxOn ? "1" : "0");
    sfxBtn.setAttribute("aria-pressed", String(sfxOn));
    blip(880, 0.08);
  });

  /* ---------- cursor ---------- */
  const cursor = $(".cursor");
  const cursorLabels = {
    view: { en: "View", zh: "查看" }, play: { en: "Play", zh: "播放" }, open: { en: "Open", zh: "进入" },
    drag: { en: "Drag", zh: "拖动" }, zoom: { en: "Zoom", zh: "放大" }, copy: { en: "Copy", zh: "复制" }
  };
  if (finePointer && cursor) {
    document.documentElement.classList.add("has-cursor");
    const label = $(".cursor__label", cursor);
    let cx = -100, cy = -100, x = -100, y = -100;
    addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      x += (cx - x) * 0.35; y += (cy - y) * 0.35;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest("[data-cursor]");
      if (el) {
        const l = cursorLabels[el.dataset.cursor];
        label.textContent = l ? l[lang()] : el.dataset.cursor;
        cursor.classList.add("has-label");
      } else cursor.classList.remove("has-label");
    });
  } else if (cursor) cursor.remove();

  /* ---------- pixel dissolve between routes ---------- */
  const dcv = $(".dissolve");
  const dctx = dcv.getContext("2d");
  function dissolve(color, cover) {
    if (reduced) return Promise.resolve();
    return new Promise((resolve) => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = innerWidth, h = innerHeight;
      dcv.width = w * dpr; dcv.height = h * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = w < 700 ? 22 : 30;
      const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
      const cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r, Math.random() * 0.55 + (cover ? c / cols : 1 - c / cols) * 0.45]);
      cells.sort((a, b) => a[2] - b[2]);
      const dur = cover ? 360 : 420;
      const start = performance.now();
      let drawn = 0;
      if (!cover) { dctx.fillStyle = color; dctx.fillRect(0, 0, w, h); }
      const frame = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const upto = Math.floor(p * cells.length);
        for (; drawn < upto; drawn++) {
          const [c, r] = cells[drawn];
          if (cover) { dctx.fillStyle = color; dctx.fillRect(c * size, r * size, size, size); }
          else dctx.clearRect(c * size, r * size, size, size);
        }
        if (p < 1) requestAnimationFrame(frame);
        else { if (!cover) dctx.clearRect(0, 0, w, h); resolve(); }
      };
      requestAnimationFrame(frame);
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $(".lightbox");
  const lbStage = $(".lightbox__stage", lb);
  const lbCap = $(".lightbox__cap", lb);
  const lbNav = $(".lightbox__nav", lb);
  let lbItems = [], lbIndex = 0, lbReturn = null;
  function lbRender() {
    const it = lbItems[lbIndex];
    lbStage.innerHTML = "";
    if (it.type === "yt") {
      lbStage.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${it.id}?autoplay=1&rel=0" title="${it.title || "Video"}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    } else if (it.type === "video") {
      lbStage.innerHTML = `<video src="${it.src}" ${it.poster ? `poster="${it.poster}"` : ""} controls autoplay playsinline></video>`;
    } else {
      lbStage.innerHTML = `<img src="${it.src}" alt="">`;
    }
    lbCap.innerHTML = it.cap ? t(it.cap) : (it.type === "yt" ? `<a href="https://youtu.be/${it.id}" target="_blank" rel="noopener">${t({ en: "Video not loading? Open it on YouTube", zh: "视频打不开？在 YouTube 上观看" })}</a>` : "");
    lbNav.hidden = lbItems.length < 2;
  }
  function openLightbox(items, index = 0) {
    lbItems = items; lbIndex = index; lbReturn = document.activeElement;
    lbRender();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    lenis && lenis.stop();
    $(".lightbox__close", lb).focus();
    blip(740, 0.06);
  }
  function closeLightbox() {
    if (!lb.classList.contains("open")) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    setTimeout(() => { lbStage.innerHTML = ""; }, 260);
    lenis && lenis.start();
    lbReturn && lbReturn.focus && lbReturn.focus();
  }
  const lbStep = (d) => { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; lbRender(); blip(600, 0.04); };
  $(".lightbox__close", lb).addEventListener("click", closeLightbox);
  $(".lb-prev", lb).addEventListener("click", () => lbStep(-1));
  $(".lb-next", lb).addEventListener("click", () => lbStep(1));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbStage) closeLightbox(); });

  /* ---------- per-page lifecycle ---------- */
  let cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);
  let ctx = null;
  let io = null;

  function autoVideos(root) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          const p = v.play(); p && p.catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.2 });
    $$("video[data-auto]", root).forEach((v) => io.observe(v));
    onCleanup(() => io.disconnect());
  }

  function bindZoom(root) {
    $$("[data-zoom]", root).forEach((el) => {
      el.addEventListener("click", () => {
        const group = el.dataset.group;
        const nodes = group ? $$(`[data-zoom][data-group="${group}"]`, root) : [el];
        const items = nodes.map((n) => ({ type: "img", src: n.dataset.zoom, cap: n.dataset.cap ? JSON.parse(n.dataset.cap) : null }));
        openLightbox(items, nodes.indexOf(el));
      });
    });
    $$("[data-yt]", root).forEach((el) => el.addEventListener("click", (e) => {
      if (framed) return; // embedded players are blocked inside framed previews: let the link open YouTube
      e.preventDefault();
      openLightbox([{ type: "yt", id: el.dataset.yt, title: el.dataset.title }]);
    }));
    $$("[data-video]", root).forEach((el) => el.addEventListener("click", () => openLightbox([{ type: "video", src: el.dataset.video, poster: el.dataset.poster }])));
  }

  /* ---------- shared templates ---------- */
  const idx = (id) => P.findIndex((p) => p.id === id);
  const num = (i) => String(i + 1).padStart(2, "0");
  const img = (src, alt = "", extra = "") => `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" ${extra}>`;
  const capAttr = (o) => (o ? ` data-cap='${JSON.stringify(o).replace(/'/g, "&#39;")}'` : "");

  function heroBody(p, actions) {
    const i = idx(p.id);
    return `
      <div class="p-hero__body">
        <div class="p-hero__title">
          <span class="p-hero__kind">${t({ en: "Stage", zh: "关卡" })} ${num(i)} / ${t(p.kind)}</span>
          <h1 class="display">${p.title}</h1>
          ${p.native ? `<span class="p-hero__native" lang="zh-CN">${p.native}</span>` : ""}
        </div>
        <div class="p-hero__left">
          <p class="lede">${t(p.line)}</p>
          <div class="actions">${actions}</div>
        </div>
        <dl class="meta">${p.meta.map((m) => `<dt>${t(m.k)}</dt><dd>${t(m.v)}</dd>`).join("")}</dl>
      </div>`;
  }

  function nextBlock(p) {
    const n = P[(idx(p.id) + 1) % P.length];
    return `
      <a class="next" href="#${n.id}" data-cursor="open" style="--accent:${n.accent}">
        ${img(n.cover)}
        <div class="next__body">
          <span class="pix">${t({ en: "Next stage", zh: "下一关" })} ${num(idx(n.id))} <span class="key">Enter</span></span>
          <span class="display" style="font-size:clamp(2.4rem,7vw,7rem)">${n.title}</span>
        </div>
      </a>`;
  }

  const btnYT = (id, label, solid) => `<a class="btn ${solid ? "btn--solid" : ""}" href="https://youtu.be/${id}" target="_blank" rel="noopener" data-yt="${id}" data-cursor="play">${I.play}${t(label)}</a>`;
  const btnOut = (href, label, solid) => `<a class="btn ${solid ? "btn--solid" : ""}" href="${href}" target="_blank" rel="noopener" data-cursor="open">${t(label)}${I.out}</a>`;

  /* =========================================================
     HOME
     ========================================================= */
  function home() {
    document.title = "Dingyi Li — Game designer";
    const ember = P[0];
    app.innerHTML = `
      <section class="stage" data-mode="text" aria-label="${S.name}">
        <canvas aria-hidden="true"></canvas>
        <div class="stage__fallback" aria-hidden="true">DINGYI<br>LI</div>
        <div class="stage__shade"></div>
        <h1 class="sr">Dingyi Li</h1>
        <p class="stage__intro">${t(S.intro)}</p>
        <div class="stage__now" aria-live="polite"><h2></h2><p></p></div>
        <div class="select" role="list">
          ${P.map((p, i) => `
            <button role="listitem" data-i="${i}" aria-current="false" data-cursor="open" aria-label="${p.title}">
              <span class="num">${num(i)}</span>
              <span class="ttl">${p.title}</span>
              <span class="knd">${t(p.kind)}</span>
            </button>`).join("")}
        </div>
        <div class="stage__keys">
          <span class="grp">
            <span><span class="key">←</span><span class="key">→</span> ${t({ en: "choose", zh: "选择" })}</span>
            <span><span class="key">Enter</span> ${t({ en: "open", zh: "进入" })}</span>
            <span><span class="key">Esc</span> ${t({ en: "back to name", zh: "回到名字" })}</span>
          </span>
          <span>${t({ en: "Scroll for more", zh: "向下滚动" })}</span>
        </div>
      </section>

      <section class="feature" style="--accent:${ember.accent}">
        <video data-auto muted loop playsinline preload="none" poster="${S.ember.teaserPoster}" aria-hidden="true"><source src="${S.ember.teaser}" type="video/mp4"></video>
        <span class="feature__tag"><i></i>${t({ en: "New: demo out now", zh: "新作：试玩版已上线" })}</span>
        <div class="feature__body">
          <div>
            <h2 class="display">${ember.title}</h2>
            <span class="feature__native" lang="zh-CN">${ember.native}</span>
          </div>
          <p class="lede">${t(ember.line)}</p>
          <div class="actions">
            <button class="btn btn--solid" data-video="${S.ember.trailer}" data-poster="${S.ember.trailerPoster}" data-cursor="play">${I.play}${t({ en: "Watch the trailer", zh: "观看预告片" })}</button>
            ${btnOut(S.links.itch, { en: "Play the free demo", zh: "免费试玩" })}
            <a class="btn" href="#${ember.id}" data-cursor="open">${t({ en: "See the project", zh: "查看项目" })}</a>
          </div>
        </div>
      </section>

      <section class="section wrap" id="works">
        <div class="index__head">
          <h2 class="h2">${t({ en: "All stages", zh: "全部关卡" })}</h2>
          <p>${t({ en: "Two games, two films and one interface, newest first.", zh: "两款游戏、两部影像、一个交互设计，按时间由新到旧。" })}</p>
        </div>
        <div class="rows">
          ${P.map((p, i) => `
            <a class="row" href="#${p.id}" style="--accent:${p.accent}" data-cursor="open">
              <div class="row__media">
                ${img(p.cover, p.title)}
                ${p.peek.map((s) => img(s, "", 'class="peek"')).join("")}
              </div>
              <div class="row__text">
                <span class="row__num">${num(i)}</span>
                <h3 class="row__title">${p.title}</h3>
                <span class="row__kind">${t(p.kind)}</span>
                <p class="row__line">${t(p.line)}</p>
                <span class="row__go">${t({ en: "Enter stage", zh: "进入关卡" })} <span class="key">Enter</span></span>
              </div>
            </a>`).join("")}
        </div>
      </section>

      <section class="section wrap" id="about">
        <div class="about">
          <p class="about__say">${t(S.about)}</p>
          <div class="about__side">
            <div><h3>${t({ en: "Tools I work in", zh: "常用工具" })}</h3>
              <ul class="tools">${S.tools.map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div><h3>${t({ en: "Languages", zh: "语言" })}</h3><p style="margin:0">${t({ en: "English and Mandarin Chinese", zh: "英语、普通话" })}</p></div>
          </div>
        </div>
        <div class="contact">
          <h3 class="dim" style="margin:0;font-weight:500;font-size:15px">${t({ en: "Say hello", zh: "联系我" })}</h3>
          <a class="mail" href="mailto:${S.email}">${S.email}</a>
          <button class="pix" data-copy style="justify-self:start;color:var(--accent)" data-cursor="copy">${t({ en: "Copy email address", zh: "复制邮箱地址" })}</button>
          <span class="mail__note" aria-live="polite"></span>
          <div class="contact__links">
            <a href="${S.links.itch}" target="_blank" rel="noopener">itch.io</a>
            <a href="${S.links.github}" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </section>
      <footer class="foot wrap"><span>© 2026 Dingyi Li</span><span class="pix">${t({ en: "Built by hand, pixel by pixel", zh: "一个像素一个像素搭起来的" })}</span></footer>`;

    autoVideos(app);
    bindZoom(app);

    // copy email
    const note = $(".mail__note");
    $("[data-copy]").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(S.email); note.innerHTML = t({ en: "Copied", zh: "已复制" }); }
      catch (e) { note.innerHTML = t({ en: "Copy failed. Select the address above instead.", zh: "复制失败，请手动选择上面的地址。" }); }
      blip(990, 0.07);
      setTimeout(() => (note.innerHTML = ""), 2400);
    });

    // index rows: step through peek frames on hover
    $$(".row").forEach((row) => {
      const frames = $$(".row__media img", row);
      let timer = null, k = 0;
      const show = (n) => frames.forEach((f, j) => (f.style.opacity = j === n || j === 0 ? 1 : 0));
      row.addEventListener("mouseenter", () => {
        k = 0;
        timer = setInterval(() => { k = (k + 1) % frames.length; show(k); }, 700);
      });
      row.addEventListener("mouseleave", () => { clearInterval(timer); show(0); });
      onCleanup(() => clearInterval(timer));
    });

    stage();
  }

  /* ---------- the stage: pixel field + stage select ---------- */
  function stage() {
    const sec = $(".stage");
    const canvas = $("canvas", sec);
    const nowH = $(".stage__now h2", sec), nowP = $(".stage__now p", sec);
    const btns = $$(".select button", sec);
    let field = null;
    try { field = new PixelField(canvas, { reduced }); }
    catch (e) { document.documentElement.classList.add("no-webgl"); }

    let current = -1;
    let attract = !reduced;
    let attractTimer = null, attractStep = 1, attractPaused = false;

    function choose(i, user) {
      if (user) stopAttract();
      if (i === current) return;
      current = i;
      btns.forEach((b, j) => b.setAttribute("aria-current", String(j === i)));
      if (i < 0) {
        sec.dataset.mode = "text";
        sec.style.removeProperty("--accent");
        field && field.showText();
        return;
      }
      const p = P[i];
      sec.dataset.mode = "image";
      sec.style.setProperty("--accent", p.accent);
      nowH.textContent = p.title;
      nowP.innerHTML = t(p.line);
      field && field.showImage(p.pixel);
      if (user) blip(520 + i * 90, 0.05);
    }
    function open(i) {
      blip(880, 0.06); setTimeout(() => blip(1320, 0.08), 70);
      location.hash = "#" + P[i].id;
    }
    function stopAttract() { attract = false; clearTimeout(attractTimer); }
    function runAttract(step) {
      if (!attract) return;
      // name → each stage → name …
      const seq = [-1, 0, 1, 2, 3, 4];
      const i = seq[step % seq.length];
      attractStep = step;
      choose(i, false);
      attractTimer = setTimeout(() => runAttract(step + 1), i === -1 ? 5200 : 3400);
    }

    let lastType = "mouse", downAt = 0;
    btns.forEach((b, i) => {
      b.addEventListener("pointerdown", (e) => { lastType = e.pointerType; downAt = performance.now(); });
      b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") choose(i, true); });
      b.addEventListener("focus", () => { if (performance.now() - downAt > 600) choose(i, true); });
      b.addEventListener("click", () => {
        if (lastType !== "mouse" && current !== i) { choose(i, true); return; }
        open(i);
      });
    });

    function onKey(e) {
      if (lb.classList.contains("open")) return;
      if (scrollY > innerHeight * 0.6) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const d = e.key === "ArrowRight" ? 1 : -1;
        choose(current < 0 ? (d > 0 ? 0 : P.length - 1) : (current + d + P.length) % P.length, true);
      } else if (e.key === "Enter" && current >= 0 && document.activeElement === document.body) {
        open(current);
      } else if (e.key === "Escape") { stopAttract(); choose(-1, true); }
    }
    addEventListener("keydown", onKey);
    onCleanup(() => removeEventListener("keydown", onKey));

    if (field) {
      const move = (e) => field.setPointer(e.clientX, e.clientY);
      const leave = () => field.clearPointer();
      sec.addEventListener("pointermove", move, { passive: true });
      sec.addEventListener("pointerleave", leave);
      let rz = null;
      const onResize = () => { clearTimeout(rz); rz = setTimeout(() => field.resize(), 150); };
      addEventListener("resize", onResize);
      onCleanup(() => { removeEventListener("resize", onResize); field.destroy(); });

      ctx.add(() => {
        ScrollTrigger.create({
          trigger: sec, start: "top top", end: "bottom top",
          onUpdate: (self) => { field.scatter = self.progress; },
          onToggle: (self) => {
            if (self.isActive) { field.start(); if (attractPaused) { attractPaused = false; attract = true; runAttract(attractStep); } }
            else { field.stop(); if (attract) { attractPaused = true; stopAttract(); } }
          }
        });
      });

      const fontReady = document.fonts && document.fonts.load ? Promise.race([document.fonts.load('900 120px "Archivo Variable"'), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
      fontReady.then(() => {
        field.resize();
        field.showText();
        field.start();
        // preload the stage images so the first morph is instant
        P.forEach((p) => field.loadImage(p.pixel));
        if (attract) attractTimer = setTimeout(() => runAttract(1), 5600);
      });
    }
    onCleanup(stopAttract);
  }

  /* =========================================================
     EMBER PROTOCOL
     ========================================================= */
  function ember() {
    const p = P[0], E = S.ember;
    app.innerHTML = `
      <section class="p-hero">
        <div class="p-hero__media"><video data-auto muted loop playsinline preload="auto" poster="${E.teaserPoster}" aria-hidden="true"><source src="${E.teaser}" type="video/mp4"></video></div>
        ${heroBody(p, `
          <button class="btn btn--solid" data-video="${E.trailer}" data-poster="${E.trailerPoster}" data-cursor="play">${I.play}${t({ en: "Watch the trailer", zh: "观看预告片" })}</button>
          ${btnOut(S.links.itch, { en: "Play the free demo", zh: "免费试玩" })}`)}
      </section>

      <section class="section wrap">
        <div class="block-head">
          <h2 class="h2">${t({ en: "Two halves of one loop", zh: "一个循环的两半" })}</h2>
          <p>${t({ en: "Runs feed the shelter, and the shelter decides what you can use on the next run.", zh: "远征养家园，家园决定下一次远征能用什么。" })}</p>
        </div>
        <div class="pair">
          ${E.loop.map((l, i) => `
            <figure>
              <div class="frame"><video data-auto muted loop playsinline preload="none" poster="${l.clip}.webp" aria-hidden="true"><source src="${l.clip}.mp4" type="video/mp4"></video></div>
              <figcaption><span class="pair__arrow">${i === 0 ? t({ en: "Run", zh: "远征" }) : t({ en: "Shelter", zh: "家园" })}</span><b>${t(l.t)}</b><span>${t(l.d)}</span></figcaption>
            </figure>`).join("")}
        </div>
      </section>

      <section class="section wrap" id="cores">
        <div class="block-head">
          <h2 class="h2">${t({ en: "Six fighting schools", zh: "六种战斗流派" })}</h2>
          <p>${t({ en: "Each outfit brings its own core and five signature moves. Pick a school.", zh: "每套织装带着自己的核心和五个招牌技。选一个流派看看。" })}</p>
        </div>
        <div class="cores">
          <div class="cores__tabs" role="tablist" aria-label="Fighting schools">
            ${E.schools.map((s, i) => `
              <button role="tab" aria-selected="${i === 0}" data-i="${i}" style="--c:${s.color}">
                <i></i><span class="en">${s.en}</span><span class="zh" lang="zh-CN">${s.zh}</span>
              </button>`).join("")}
          </div>
          <div class="cores__view">
            <div class="cores__screen">
              <video muted playsinline preload="none" aria-label="Skill demo"></video>
              <div class="cores__label"><b></b><span></span></div>
            </div>
            <div class="cores__thumbs"></div>
          </div>
        </div>
      </section>

      <section class="section wrap" id="wonders">
        <div class="block-head">
          <h2 class="h2">${t({ en: "The shelter grows back", zh: "避难所会长回来" })}</h2>
          <p>${t({ en: "Each floor has a wonder that rebuilds itself as you upgrade the facilities around it. Drag across the picture.", zh: "每层都有一座奇观，会随着周围设施的升级一起修复。在图上左右拖动看看。" })}</p>
        </div>
        <div class="wonder">
          <div class="wonder__tabs" role="tablist">
            ${E.wonders.map((w, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${t({ en: w.en, zh: w.zh })}</button>`).join("")}
          </div>
          <div class="wonder__screen" data-cursor="drag"><span class="wonder__badge"></span></div>
          <div class="wonder__track">
            ${E.stages.map((s, i) => `<button data-s="${i}"><span class="pix">${i + 1}/4</span>${t(s)}</button>`).join("")}
            <input type="range" min="0" max="3" step="1" value="0" aria-label="Wonder stage">
          </div>
        </div>
      </section>

      <section class="section wrap">
        <div class="block-head"><h2 class="h2">${t({ en: "From the build", zh: "实机画面" })}</h2></div>
        <div class="bento">
          ${E.gallery.map(([f, cap]) => `<button data-zoom="assets/ember/shots/${f}.webp" data-group="ember"${capAttr(cap)} data-cursor="zoom" aria-label="${cap.en}">${img(`assets/ember/shots/${f}.webp`, cap.en)}</button>`).join("")}
        </div>
      </section>

      <section class="section wrap" style="padding-top:0">
        <button class="reel" data-video="${E.trailer}" data-poster="${E.trailerPoster}" data-cursor="play">
          ${img(E.trailerPoster, "")}
          <span class="reel__play">${I.play}${t({ en: "Watch the trailer", zh: "观看预告片" })} <span class="pix" style="opacity:.7">1:11</span></span>
        </button>
        <div class="credits" style="margin-top:28px">
          <div><b>${t({ en: "Made by Lee and Henry", zh: "由 Lee 和 Henry 制作" })}</b></div>
          <span>${t({ en: "We shared game design and development across the whole project.", zh: "我们两人共同负责整款游戏的设计与开发。" })}</span>
          ${btnOut(S.links.itch, { en: "Play the free demo on itch.io", zh: "去 itch.io 免费试玩" }, true)}
        </div>
      </section>
      ${nextBlock(p)}`;

    autoVideos(app);
    bindZoom(app);
    cores();
    wonders();
  }

  function cores() {
    const E = S.ember;
    const tabs = $$(".cores__tabs button");
    const screen = $(".cores__screen");
    const video = $("video", screen);
    const lab = $(".cores__label");
    const thumbs = $(".cores__thumbs");
    let s = 0, k = 0, visible = false;

    function load() {
      const school = E.schools[s];
      const [file, name] = school.skills[k];
      screen.style.setProperty("--c", school.color);
      thumbs.style.setProperty("--c", school.color);
      lab.innerHTML = `<b>${school.en} <span lang="zh-CN">${school.zh}</span></b><span>${k + 1}/5 ${name}</span>`;
      video.src = `assets/ember/skills/${file}.mp4`;
      video.poster = `assets/ember/skills/${file}.webp`;
      $$("button", thumbs).forEach((b, j) => { b.setAttribute("aria-pressed", String(j === k)); $(".bar", b).style.width = "0"; });
      if (visible) { const pr = video.play(); pr && pr.catch(() => {}); }
    }
    function buildThumbs() {
      const school = E.schools[s];
      thumbs.innerHTML = school.skills.map(([f, n], j) => `
        <button aria-pressed="${j === k}" data-j="${j}" aria-label="${n}" data-cursor="play">
          ${img(`assets/ember/skills/${f}.webp`, "")}<span>${j + 1}</span><i class="bar"></i>
        </button>`).join("");
      $$("button", thumbs).forEach((b) => b.addEventListener("click", () => { k = +b.dataset.j; load(); blip(700, 0.04); }));
    }
    function pick(i) {
      s = i; k = 0;
      tabs.forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
      buildThumbs(); load();
    }
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => { pick(i); blip(480 + i * 70, 0.05); });
      b.addEventListener("keydown", (e) => {
        const cols = desktop() ? 1 : 3;
        let n = null;
        if (e.key === "ArrowDown") n = i + cols; else if (e.key === "ArrowUp") n = i - cols;
        else if (e.key === "ArrowRight") n = i + 1; else if (e.key === "ArrowLeft") n = i - 1;
        if (n !== null) { e.preventDefault(); n = (n + tabs.length) % tabs.length; tabs[n].focus(); pick(n); }
      });
    });
    video.addEventListener("timeupdate", () => {
      const b = $(`button[data-j="${k}"] .bar`, thumbs);
      if (b && video.duration) b.style.width = (video.currentTime / video.duration) * 100 + "%";
    });
    video.addEventListener("ended", () => { k = (k + 1) % 5; load(); });
    const obs = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) { if (!video.src) load(); const pr = video.play(); pr && pr.catch(() => {}); } else video.pause();
    }, { threshold: 0.3 });
    obs.observe(screen);
    onCleanup(() => obs.disconnect());
    buildThumbs();
  }

  function wonders() {
    const E = S.ember;
    const screen = $(".wonder__screen");
    const badge = $(".wonder__badge", screen);
    const tabs = $$(".wonder__tabs button");
    const marks = $$(".wonder__track button");
    const range = $(".wonder input[type=range]");
    let w = 0, st = 0, imgs = [];

    function build() {
      imgs.forEach((i) => i.remove());
      imgs = [0, 1, 2, 3].map((n) => {
        const el = document.createElement("img");
        el.src = `assets/ember/wonders/${E.wonders[w].id}_stage${n}.webp`;
        el.alt = `${E.wonders[w].en}, ${E.stages[n].en}`;
        el.decoding = "async";
        screen.insertBefore(el, badge);
        return el;
      });
      set(st, true);
    }
    function set(n, silent) {
      n = Math.max(0, Math.min(3, n));
      if (n !== st && !silent) blip(400 + n * 160, 0.06);
      st = n;
      imgs.forEach((im, j) => im.classList.toggle("on", j === n));
      marks.forEach((m, j) => m.classList.toggle("done", j <= n));
      range.value = n;
      badge.innerHTML = `${t({ en: E.wonders[w].en, zh: E.wonders[w].zh })} / ${t(E.stages[n])}`;
    }
    tabs.forEach((b, i) => b.addEventListener("click", () => {
      w = i; tabs.forEach((x, j) => x.setAttribute("aria-selected", String(j === i))); build(); demo();
    }));
    marks.forEach((m, i) => m.addEventListener("click", () => set(i)));
    range.addEventListener("input", () => set(+range.value));
    let dragging = false;
    const fromX = (e) => { const r = screen.getBoundingClientRect(); set(Math.floor(((e.clientX - r.left) / r.width) * 4)); };
    screen.addEventListener("pointerdown", (e) => { dragging = true; screen.setPointerCapture(e.pointerId); fromX(e); stopDemo(); });
    screen.addEventListener("pointermove", (e) => { if (dragging) fromX(e); });
    screen.addEventListener("pointerup", () => (dragging = false));

    let demoT = [];
    function stopDemo() { demoT.forEach(clearTimeout); demoT = []; }
    function demo() {
      stopDemo(); if (reduced) { set(3, true); return; }
      set(0, true);
      [1, 2, 3].forEach((n, j) => demoT.push(setTimeout(() => set(n), 650 * (j + 1))));
    }
    build();
    let shown = false;
    const obs = new IntersectionObserver(([en]) => { if (en.isIntersecting && !shown) { shown = true; demo(); } }, { threshold: 0.5 });
    obs.observe(screen);
    onCleanup(() => { obs.disconnect(); stopDemo(); });
  }

  /* =========================================================
     GEMINI AFTERLIFE
     ========================================================= */
  function gemini() {
    const p = P[1], G = S.gemini;
    app.innerHTML = `
      <section class="p-hero">
        <div class="p-hero__media"><canvas aria-hidden="true"></canvas></div>
        ${heroBody(p, `
          ${btnOut(G.play, { en: "Play in your browser", zh: "在浏览器里玩" }, true)}
          ${btnYT(G.trailer, { en: "Trailer", zh: "预告片" })}
          ${btnYT(G.walkthrough, { en: "Walkthrough", zh: "流程实录" })}`)}
      </section>

      <section class="section wrap">
        <div class="block-head">
          <h2 class="h2">${t({ en: "Two characters, one pair of hands", zh: "两个角色，一双手" })}</h2>
          <p>${t({ en: "The keyboard is Adam's body and the mouse is Steve's will. You have to stop one to fully use the other.", zh: "键盘是亚当的身体，鼠标是史蒂夫的意志。要用好一个，就得先让另一个停下来。" })}</p>
        </div>
        <div class="mech">
          <button class="frame" data-zoom="assets/gemini/launch.webp" data-group="mech" data-cursor="zoom" aria-label="Launch">${img("assets/gemini/launch.webp", "Launching Steve")}</button>
          <div class="stack">
            <button class="frame" data-zoom="assets/gemini/steve_light.webp" data-group="mech"${capAttr({ en: "Steve is also the light in dark rooms", zh: "史蒂夫也是暗处的光源" })} data-cursor="zoom" aria-label="Steve as light">${img("assets/gemini/steve_light.webp", "Steve lighting a dark room")}</button>
            <button class="frame" data-zoom="assets/gemini/health.webp" data-group="mech"${capAttr({ en: "Health is shown by the screen's color, not a bar", zh: "生命值用画面颜色表现，没有血条" })} data-cursor="zoom" aria-label="Health as screen tone">${img("assets/gemini/health.webp", "Low health turns the screen red")}</button>
          </div>
        </div>
        <ul class="controls">
          ${G.controls.map((c) => `<li><span class="keys">${c.keys.map((k) => `<span class="key">${k}</span>`).join("")}</span><span>${t(c.t)}</span></li>`).join("")}
        </ul>
      </section>

      <section class="floors" aria-label="Level design">
        <div class="floors__pin">
          <div class="floors__rail">${G.floors.map((f, i) => `<button data-i="${i}" aria-current="${i === 0}"><i></i>${f.tag}</button>`).join("")}</div>
          <div class="floors__view">
            <div class="block-head" style="margin:0">
              <h2 class="h2">${t({ en: "Level design, floor by floor", zh: "逐层的关卡设计" })}</h2>
            </div>
            <div class="floors__screens">
              ${G.floors.map((f, i) => `<div class="scr ${i === 0 ? "on" : ""}">${img(f.shot, f.t.en)}</div>`).join("")}
              <button class="floors__map" data-cursor="zoom" aria-label="Open level map"><span>${t({ en: "Level map", zh: "关卡地图" })}</span>${img(G.floors[0].map, "Level map")}</button>
            </div>
            <div class="floors__cap"><b></b><span></span></div>
            <div class="floor-m-list">
              ${G.floors.map((f) => `
                <div class="floor-m">
                  <span class="pix" style="color:var(--accent)">${f.tag}</span>
                  <div class="frame">${img(f.shot, f.t.en)}</div>
                  <b style="font-stretch:118%;font-size:1.3rem;text-transform:uppercase">${t(f.t)}</b>
                  <span class="dim">${t(f.d)}</span>
                  ${f.map ? `<button class="btn" data-zoom="${f.map}" style="justify-self:start">${t({ en: "Open level map", zh: "查看关卡地图" })}</button>` : ""}
                </div>`).join("")}
            </div>
          </div>
        </div>
      </section>

      <section class="section wrap">
        <div class="credits">
          <div><b>Kosima Productions</b></div>
          <div class="team">${G.team.map(([n, r]) => `<div><b>${n}</b><span>${t(r)}</span></div>`).join("")}</div>
        </div>
      </section>
      ${nextBlock(p)}`;

    bindZoom(app);
    pixelReveal($(".p-hero canvas"), "assets/gemini/card.webp");
    floors();
  }

  function pixelReveal(canvas, src) {
    const im = new Image();
    im.src = src;
    let alive = true;
    onCleanup(() => (alive = false));
    const c = canvas.getContext("2d");
    const draw = (block) => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      const s = Math.max(canvas.width / im.width, canvas.height / im.height);
      const dw = im.width * s, dh = im.height * s, dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
      if (block <= 1) { c.imageSmoothingEnabled = true; c.drawImage(im, dx, dy, dw, dh); return; }
      const sw = Math.max(1, Math.round(canvas.width / (block * dpr))), sh = Math.max(1, Math.round(canvas.height / (block * dpr)));
      const off = document.createElement("canvas"); off.width = sw; off.height = sh;
      const oc = off.getContext("2d");
      oc.drawImage(im, dx * sw / canvas.width, dy * sh / canvas.height, dw * sw / canvas.width, dh * sh / canvas.height);
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.drawImage(off, 0, 0, canvas.width, canvas.height);
    };
    im.onload = () => {
      const steps = reduced ? [1] : [64, 40, 28, 20, 14, 10, 7, 5, 3, 2, 1];
      let i = 0;
      const next = () => { if (!alive) return; draw(steps[i]); if (++i < steps.length) setTimeout(next, 110); };
      next();
      const onR = () => alive && draw(1);
      addEventListener("resize", onR);
      onCleanup(() => removeEventListener("resize", onR));
    };
  }

  function floors() {
    const G = S.gemini;
    const sec = $(".floors");
    const scr = $$(".floors__screens .scr", sec);
    const rail = $$(".floors__rail button", sec);
    const map = $(".floors__map", sec);
    const mapImg = $("img", map);
    const capB = $(".floors__cap b", sec), capS = $(".floors__cap span", sec);
    let cur = -1, st = null;

    function show(i) {
      if (i === cur) return;
      const prev = cur; cur = i;
      const f = G.floors[i];
      rail.forEach((b, j) => b.setAttribute("aria-current", String(j === i)));
      capB.innerHTML = t(f.t); capS.innerHTML = t(f.d);
      map.hidden = !f.map;
      if (f.map) mapImg.src = f.map;
      scr.forEach((s, j) => {
        if (j === i) {
          s.style.zIndex = 2;
          if (prev >= 0 && !reduced) {
            const down = i > prev;
            gsap.fromTo(s, { clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.6, ease: "power3.inOut" });
          } else s.style.clipPath = "inset(0 0 0 0)";
        } else {
          s.style.zIndex = j === prev ? 1 : 0;
          if (j !== prev) s.style.clipPath = "inset(100% 0 0 0)";
        }
      });
      if (prev >= 0) blip(300 + i * 120, 0.07, "triangle");
    }
    show(0);
    map.addEventListener("click", () => openLightbox([{ type: "img", src: G.floors[cur].map, cap: { en: `${G.floors[cur].tag} level map`, zh: `${G.floors[cur].tag} 关卡地图` } }]));

    ctx.add(() => {
      const mm = gsap.matchMedia(); onCleanup(() => mm.revert());
      mm.add("(min-width: 761px)", () => {
        st = ScrollTrigger.create({
          trigger: sec, pin: $(".floors__pin", sec), start: "top top", end: () => "+=" + innerHeight * G.floors.length * 0.75,
          onUpdate: (self) => show(Math.min(G.floors.length - 1, Math.floor(self.progress * G.floors.length * 0.999)))
        });
        return () => { st = null; };
      });
    });
    rail.forEach((b, i) => b.addEventListener("click", () => {
      if (!st) return show(i);
      scrollToY(st.start + (st.end - st.start) * ((i + 0.5) / G.floors.length));
    }));
  }

  /* =========================================================
     CAN WORLD
     ========================================================= */
  function canworld() {
    const p = P[2], C = S.canworld;
    app.innerHTML = `
      <section class="p-hero">
        <div class="p-hero__media">${img(p.cover, "Can World")}</div>
        ${heroBody(p, btnYT(C.film, { en: "Watch the film", zh: "观看影片" }, true))}
      </section>

      <section class="hscroll" aria-label="Scenes">
        <div class="hscroll__track">
          <div class="hscroll__intro">
            <h2 class="h2">${t({ en: "Five rooms of one system", zh: "一个系统里的五个房间" })}</h2>
            <p class="dim" style="margin:0;max-width:30ch">${t({ en: "Modeled in Cinema 4D, built and lit in Unreal Engine 5, with generative layers from TouchDesigner.", zh: "在 Cinema 4D 建模，在 Unreal Engine 5 搭建和打光，再叠加 TouchDesigner 的生成式图层。" })}</p>
            <span class="pix" style="color:var(--accent)"><span class="hs-count">01</span> / 05</span>
          </div>
          ${C.scenes.map((s, i) => `
            <figure class="hscroll__panel" style="margin:0">
              <button class="frame" data-zoom="${s.img}" data-group="cw"${capAttr(s.t)} data-cursor="zoom" aria-label="${s.t.en}">${img(s.img, s.t.en)}</button>
              <figcaption class="cap"><span class="pix">${num(i)}</span><b>${t(s.t)}</b><span>${t(s.d)}</span></figcaption>
            </figure>`).join("")}
        </div>
      </section>

      <section class="section wrap">
        <div class="block-head"><h2 class="h2">${t({ en: "Storyboard and pipeline", zh: "分镜与制作流程" })}</h2></div>
        <div class="process">
          ${C.process.map((s, i) => `<button class="frame" data-zoom="${s}" data-group="cwp" data-cursor="zoom" aria-label="Process ${i + 1}">${img(s, "")}</button>`).join("")}
        </div>
        <div style="margin-top:40px">${btnYT(C.film, { en: "Watch the film", zh: "观看影片" }, true)}</div>
      </section>
      ${nextBlock(p)}`;
    bindZoom(app);

    const sec = $(".hscroll"), track = $(".hscroll__track", sec), count = $(".hs-count", sec);
    ctx.add(() => {
      const mm = gsap.matchMedia(); onCleanup(() => mm.revert());
      mm.add("(min-width: 761px)", () => {
        const dist = () => track.scrollWidth - innerWidth;
        gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: sec, pin: true, scrub: 0.8, start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true,
            onUpdate: (self) => { count.textContent = num(Math.min(4, Math.floor(self.progress * 5 * 0.999))); }
          }
        });
      });
    });
  }

  /* =========================================================
     BLIND LOOP
     ========================================================= */
  function blindloop() {
    const p = P[3], B = S.blindloop;
    app.innerHTML = `
      <section class="p-hero">
        <div class="p-hero__media">${img(p.cover, "Blind Loop")}</div>
        ${heroBody(p, btnYT(B.film, { en: "Watch the film", zh: "观看影片" }, true))}
      </section>

      <section class="ring" aria-label="The loop">
        <div class="ring__spin">
          ${B.ring.map((r, i) => `<figure class="ring__item" style="margin:0" data-i="${i}"><div class="frame">${img(r.img, r.t.en)}</div></figure>`).join("")}
        </div>
        <div class="ring__center" style="top:auto;bottom:72px">
          <span class="pix" style="color:var(--accent)"><span class="ring-n">1</span> / ${B.ring.length}</span>
          <span class="h2 ring-t" style="font-size:clamp(1.6rem,3.4vw,3rem)"></span>
        </div>
        <span class="ring__hint"><span class="key">${t({ en: "Drag", zh: "拖动" })}</span>${t({ en: "or scroll. It never ends.", zh: "或滚动。它永远转不完。" })}</span>
      </section>

      <section class="section wrap">
        <div class="block-head">
          <h2 class="h2">${t({ en: "Point clouds, then light", zh: "先是点云，然后是光" })}</h2>
          <p>${t({ en: "Cinema 4D models became point clouds in MeshLab, were broken apart in TouchDesigner, and were lit in Unreal Engine 5.", zh: "Cinema 4D 模型在 MeshLab 里转成点云，在 TouchDesigner 里被打散，最后在 Unreal Engine 5 中打光。" })}</p>
        </div>
        <div class="process">
          ${B.process.map((s, i) => `<button class="frame" data-zoom="${s}" data-group="blp" data-cursor="zoom" aria-label="Process ${i + 1}" style="aspect-ratio:${i === 0 ? "16/10" : "2.4/1"}">${img(s, "")}</button>`).join("")}
        </div>
        <div style="margin-top:40px">${btnYT(B.film, { en: "Watch the film", zh: "观看影片" }, true)}</div>
      </section>
      ${nextBlock(p)}`;
    bindZoom(app);
    ring();
  }

  function ring() {
    const B = S.blindloop;
    const sec = $(".ring"), spin = $(".ring__spin", sec);
    const items = $$(".ring__item", sec);
    const nEl = $(".ring-n", sec), tEl = $(".ring-t", sec);
    const n = items.length, step = 360 / n;
    let scrollRot = 0, dragRot = 0, auto = 0, rot = 0, last = -1, visible = false;

    function layout() {
      const w = spin.getBoundingClientRect().width;
      const radius = (w / 2) / Math.tan(Math.PI / n) * 1.12;
      items.forEach((it, i) => (it.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
      spin.style.transform = `translateZ(${-radius}px) rotateY(${-rot}deg)`;
      spin.dataset.r = radius;
    }
    function render() {
      const target = scrollRot + dragRot + auto;
      rot += (target - rot) * (reduced ? 1 : 0.12);
      const radius = +spin.dataset.r || 600;
      spin.style.transform = `translateZ(${-radius}px) rotateY(${-rot}deg)`;
      items.forEach((it, i) => {
        let d = ((i * step - rot) % 360 + 540) % 360 - 180;
        const f = Math.cos((d * Math.PI) / 180);
        it.style.opacity = (0.12 + 0.88 * Math.max(0, f) ** 1.6).toFixed(3);
      });
      const front = ((Math.round(rot / step) % n) + n) % n;
      if (front !== last) {
        last = front;
        nEl.textContent = front + 1;
        tEl.innerHTML = t(B.ring[front].t);
        blip(220 + front * 40, 0.05, "sine", 0.05);
      }
    }
    layout();
    const tick = () => { if (visible) { if (!desktop() && !dragging && !reduced) auto += 0.06; render(); } };
    gsap.ticker.add(tick);
    onCleanup(() => gsap.ticker.remove(tick));
    const vis = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    vis.observe(sec);
    onCleanup(() => vis.disconnect());
    addEventListener("resize", layout);
    onCleanup(() => removeEventListener("resize", layout));

    let dragging = false, sx = 0, base = 0;
    sec.addEventListener("pointerdown", (e) => { dragging = true; sx = e.clientX; base = dragRot; sec.classList.add("dragging"); sec.setPointerCapture(e.pointerId); });
    sec.addEventListener("pointermove", (e) => { if (dragging) dragRot = base - (e.clientX - sx) * 0.25; });
    const up = () => { if (!dragging) return; dragging = false; sec.classList.remove("dragging"); dragRot = Math.round((dragRot + scrollRot + auto) / step) * step - scrollRot - auto; };
    sec.addEventListener("pointerup", up);
    sec.addEventListener("pointercancel", up);
    sec.setAttribute("data-cursor", "drag");

    ctx.add(() => {
      const mm = gsap.matchMedia(); onCleanup(() => mm.revert());
      mm.add("(min-width: 761px)", () => {
        ScrollTrigger.create({
          trigger: sec, pin: true, start: "top top", end: "+=180%", scrub: true,
          onUpdate: (self) => (scrollRot = self.progress * 360)
        });
      });
    });
  }

  /* =========================================================
     AERO GUIDE
     ========================================================= */
  function aero() {
    const p = P[4], A = S.aero;
    app.innerHTML = `
      <section class="p-hero">
        <div class="p-hero__media">${img("assets/aero/hifi.webp", "Aero Guide screens")}</div>
        ${heroBody(p, btnYT(A.film, { en: "Watch the prototype", zh: "观看原型演示" }, true))}
      </section>

      <section class="section wrap">
        <div class="voice">
          <div class="voice__orb">
            <i class="wave"></i><i class="wave"></i><i class="wave"></i><i class="wave"></i>
            <button aria-label="${"Talk to Aero Guide"}" aria-pressed="false" data-cursor="play">${I.mic}</button>
          </div>
          <div class="voice__say">
            <span class="pix" style="color:var(--accent)">${t({ en: "Tap the mic", zh: "点一下麦克风" })}</span>
            <p class="voice__q" aria-live="polite"></p>
            <p class="dim" style="margin:0;max-width:40ch">${t({ en: "Travelers ask in a few words while walking. Answers are short, and the screen only confirms.", zh: "旅客边走边用几个词提问；回答简短，屏幕只负责确认。" })}</p>
            <div class="stats">${A.stats.map((s) => `<div><b>${s.n}</b><span>${t(s.t)}</span></div>`).join("")}</div>
            <span class="dim" style="font-size:13px">${t({ en: "From a survey of 100 travelers", zh: "来自 100 位旅客的问卷" })}</span>
          </div>
        </div>
      </section>

      <section class="section wrap" style="padding-top:0">
        <div class="block-head"><h2 class="h2">${t({ en: "Screens", zh: "界面" })}</h2></div>
        <div class="screens">
          <button class="frame" data-zoom="assets/aero/cover.webp" data-group="aero" data-cursor="zoom" aria-label="Screens">${img("assets/aero/cover.webp", "Aero Guide screens")}</button>
          <button class="frame" data-zoom="assets/aero/hifi.webp" data-group="aero" data-cursor="zoom" aria-label="More screens">${img("assets/aero/hifi.webp", "Aero Guide high fidelity screens")}</button>
        </div>
      </section>

      <section class="section wrap" style="padding-top:0">
        <div class="block-head"><h2 class="h2">${t({ en: "From sketch to flow", zh: "从草图到流程" })}</h2></div>
        <div class="aero-flow">
          <button class="frame" data-zoom="assets/aero/lofi.webp" data-group="aerof" data-cursor="zoom" aria-label="Flow">${img("assets/aero/lofi.webp", "Task flow")}</button>
          <div class="stack">
            <button class="frame" data-zoom="assets/aero/paper.webp" data-group="aerof" data-cursor="zoom" aria-label="Paper prototype">${img("assets/aero/paper.webp", "Paper prototype")}</button>
            <button class="frame" data-zoom="assets/aero/card.webp" data-group="aerof" data-cursor="zoom" aria-label="Style guide">${img("assets/aero/card.webp", "UI style guide")}</button>
          </div>
        </div>
      </section>
      ${nextBlock(p)}`;
    bindZoom(app);

    const orb = $(".voice__orb"), btn = $("button", orb), q = $(".voice__q");
    let k = 0, timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    function type(text, done) {
      q.textContent = "";
      const chars = Array.from(text);
      chars.forEach((ch, i) => timers.push(setTimeout(() => { q.textContent += ch; if (i % 3 === 0) blip(1400 + Math.random() * 300, 0.015, "sine", 0.02); }, reduced ? 0 : 38 * i)));
      timers.push(setTimeout(done, reduced ? 1600 : 38 * chars.length + 1600));
    }
    function listen() {
      clear();
      orb.classList.add("listening"); btn.setAttribute("aria-pressed", "true");
      const loop = () => { type(A.queries[k % A.queries.length][lang()], () => { k++; loop(); }); };
      loop();
    }
    function stop() { clear(); orb.classList.remove("listening"); btn.setAttribute("aria-pressed", "false"); }
    btn.addEventListener("click", () => (orb.classList.contains("listening") ? stop() : listen()));
    q.textContent = A.queries[0][lang()];
    onCleanup(clear);
  }

  /* =========================================================
     Router
     ========================================================= */
  const routes = { "": home, "ember-protocol": ember, "gemini-afterlife": gemini, "can-world": canworld, "blind-loop": blindloop, "aero-guide": aero };
  let firstLoad = true;
  let busy = false, queued = null, pendingScroll = null;

  let rendered = null;
  const hashKey = () => location.hash.replace(/^#\/?/, "");
  async function route() {
    if (busy) { queued = true; return; }
    const key = hashKey();
    const view = routes[key] ? key : "";
    const section = key === "works" || key === "about" ? key : null;
    if (section && rendered === "") { scrollToEl(document.getElementById(section)); return; }
    if (section) pendingScroll = section;
    busy = true;
    const proj = P.find((p) => p.id === view);
    const color = proj ? proj.accent : "#0b1018";
    closeLightbox();
    if (!firstLoad) await dissolve(color, true);

    cleanups.forEach((fn) => { try { fn(); } catch (e) {} });
    cleanups = [];
    if (ctx) ctx.revert();
    ScrollTrigger.getAll().forEach((s) => s.kill());
    scrollToY(0, true);
    window.scrollTo(0, 0);

    document.documentElement.style.setProperty("--accent", proj ? proj.accent : "");
    if (!proj) document.documentElement.style.removeProperty("--accent");
    $(".back").hidden = !proj;
    $$(".hud .home-only").forEach((el) => (el.hidden = !!proj));
    if (proj) document.title = `${proj.title} — Dingyi Li`;

    ctx = gsap.context(() => {});
    routes[view]();
    rendered = view;
    app.focus({ preventScroll: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());
    // refresh again once images settle (layout shifts change pin distances)
    const imgs = $$("img", app).filter((i) => !i.complete).slice(0, 12);
    if (imgs.length) Promise.race([Promise.all(imgs.map((i) => new Promise((r) => (i.onload = i.onerror = r)))), new Promise((r) => setTimeout(r, 2500))]).then(() => ScrollTrigger.refresh());

    if (!firstLoad) await dissolve(color, false);
    firstLoad = false;
    busy = false;
    if (queued) { queued = null; route(); }
    if (pendingScroll) { const id = pendingScroll; pendingScroll = null; setTimeout(() => scrollToEl(document.getElementById(id)), 80); }
  }

  // clicking Work / About again while the hash already matches still scrolls
  $$("[data-goto]").forEach((a) => a.addEventListener("click", (e) => {
    if (hashKey() === a.dataset.goto && rendered === "") { e.preventDefault(); scrollToEl(document.getElementById(a.dataset.goto)); }
  }));

  addEventListener("keydown", (e) => {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") lbStep(1);
      else if (e.key === "ArrowLeft") lbStep(-1);
      return;
    }
    const onProject = !!P.find((p) => p.id === hashKey());
    if (onProject && e.key === "Escape") location.hash = "#home";
    if (onProject && e.key === "Enter" && document.activeElement === document.body || onProject && e.key === "Enter" && document.activeElement === app) {
      const nx = $(".next");
      if (nx && nx.getBoundingClientRect().top < innerHeight) location.hash = nx.getAttribute("href");
    }
  });

  addEventListener("hashchange", route);
  route();
})();
