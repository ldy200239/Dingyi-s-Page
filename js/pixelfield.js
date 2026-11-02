/*
 * PixelField: a full-bleed grid of square "pixels" rendered with WebGL.
 * Each pixel is a particle with spring physics. It can form a line of text
 * (the name) or the downsampled image of a project, and the pointer pushes
 * pixels away as it moves.
 */
(function () {
  const VS = `
    attribute vec2 a_pos;
    attribute vec4 a_col;
    uniform vec2 u_res;
    uniform float u_size;
    varying vec4 v_col;
    void main() {
      vec2 p = a_pos / u_res * 2.0 - 1.0;
      gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
      gl_PointSize = u_size;
      v_col = a_col;
    }`;
  const FS = `
    precision mediump float;
    varying vec4 v_col;
    void main() { gl_FragColor = vec4(v_col.rgb * v_col.a, v_col.a); }`;

  function shader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  class PixelField {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.opts = Object.assign({ text: "DINGYI LI", font: "'Archivo Variable', Archivo, sans-serif", reduced: false }, opts);
      const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
      if (!gl) throw new Error("no webgl");
      this.gl = gl;
      const prog = gl.createProgram();
      gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      this.prog = prog;
      this.loc = {
        pos: gl.getAttribLocation(prog, "a_pos"),
        col: gl.getAttribLocation(prog, "a_col"),
        res: gl.getUniformLocation(prog, "u_res"),
        size: gl.getUniformLocation(prog, "u_size")
      };
      this.posBuf = gl.createBuffer();
      this.colBuf = gl.createBuffer();
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      this.pointer = { x: -9999, y: -9999, active: false, vx: 0, vy: 0 };
      this.scatter = 0;
      this.running = false;
      this.mode = "text";
      this.imageCache = new Map();
      this.tick = this.tick.bind(this);
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = w; this.h = h; this.dpr = dpr;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      // Cell size: aim for roughly 18-24k pixels on desktop, fewer on phones.
      const target = w < 700 ? 5200 : 21000;
      let cell = Math.sqrt((w * h) / target);
      cell = Math.max(w < 700 ? 6 : 7, Math.round(cell));
      this.cell = cell;
      this.cols = Math.ceil(w / cell);
      this.rows = Math.ceil(h / cell);
      const n = this.cols * this.rows;
      const old = this.n || 0;
      this.n = n;

      const grow = (arr, size, fill) => {
        const next = new Float32Array(size);
        if (arr) next.set(arr.subarray(0, Math.min(arr.length, size)));
        if (fill !== undefined) for (let i = arr ? arr.length : 0; i < size; i++) next[i] = fill();
        return next;
      };
      this.x = grow(this.x, n, () => Math.random() * w);
      this.y = grow(this.y, n, () => Math.random() * h);
      this.vx = grow(this.vx, n, () => 0);
      this.vy = grow(this.vy, n, () => 0);
      this.tx = new Float32Array(n);
      this.ty = new Float32Array(n);
      this.c = grow(this.c, n * 4, () => 0);           // current rgba 0..1
      this.tc = new Float32Array(n * 4);               // target rgba
      this.switchAt = new Float32Array(n);
      this.ptx = new Float32Array(n); this.pty = new Float32Array(n); this.ptc = new Float32Array(n * 4);
      this.seed = new Float32Array(n);
      this.sx = new Float32Array(n); this.sy = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        this.seed[i] = Math.random();
        const a = Math.random() * Math.PI * 2;
        const r = 0.3 + Math.random() * 0.9;
        this.sx[i] = Math.cos(a) * r * w * 0.6;
        this.sy[i] = Math.sin(a) * r * h * 0.6 - h * 0.25 * Math.random();
      }
      this.posOut = new Float32Array(n * 2);
      this.colOut = new Float32Array(n * 4);
      if (this.layout) this.relayout();
    }

    relayout() {
      if (this.mode === "image" && this.current) this.showImage(this.current, true);
      else this.showText(true);
    }

    /* ---------- targets ---------- */

    textMask() {
      const { cols, rows } = this;
      const cv = document.createElement("canvas");
      cv.width = cols; cv.height = rows;
      const ctx = cv.getContext("2d");
      try { ctx.fontStretch = "expanded"; } catch (e) {}
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      const words = this.opts.text.split(" ");
      const narrow = cols / rows < 1.2;
      const lines = narrow ? words : [this.opts.text];
      const maxW = cols * (narrow ? 0.86 : 0.9);
      let size = rows;
      const fontFor = (s) => `900 ${s}px ${this.opts.font}`;
      ctx.font = fontFor(size);
      // fit
      while (size > 4) {
        ctx.font = fontFor(size);
        const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
        const totalH = size * 0.8 * lines.length + size * 0.12 * (lines.length - 1);
        if (widest <= maxW && totalH <= rows * (narrow ? 0.5 : 0.42)) break;
        size -= 1;
      }
      ctx.font = fontFor(size);
      const lineH = size * 0.92;
      const blockH = lineH * lines.length;
      const top = rows * (narrow ? 0.30 : 0.36) - blockH / 2;
      const left = Math.round(cols * (narrow ? 0.07 : 0.05));
      lines.forEach((l, i) => ctx.fillText(l, left, top + lineH * (i + 1) - size * 0.1));
      const data = ctx.getImageData(0, 0, cols, rows).data;
      const cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (data[(r * cols + c) * 4 + 3] > 110) cells.push([c, r]);
      }
      return cells;
    }

    showText(instant) {
      this.mode = "text";
      this.current = null;
      const { n, cell, w, h } = this;
      const cells = this.textMask();
      // shuffle assignment
      const order = new Uint32Array(n);
      for (let i = 0; i < n; i++) order[i] = i;
      for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = order[i]; order[i] = order[j]; order[j] = t; }
      const ember = hexToRgb("#f2a33a"), signal = hexToRgb("#7fd8ff"), ink = hexToRgb("#e9edf3");
      const now = performance.now();
      const maxCol = this.cols;
      for (let k = 0; k < n; k++) {
        const i = order[k];
        let px, py, col, a;
        if (k < cells.length) {
          const [c, r] = cells[k];
          px = c * cell + cell / 2; py = r * cell + cell / 2;
          const roll = this.seed[i];
          col = roll < 0.08 ? ember : roll < 0.11 ? signal : ink;
          a = 0.95;
          this.switchAt[i] = now + (instant ? 0 : (c / maxCol) * 700 + this.seed[i] * 260);
        } else {
          // ambient dust: sparse, dim, grid-snapped
          const c = (Math.random() * this.cols) | 0, r = (Math.random() * this.rows) | 0;
          px = c * cell + cell / 2; py = r * cell + cell / 2;
          const roll = this.seed[i];
          col = roll < 0.018 ? ember : roll < 0.03 ? signal : [120, 140, 170];
          a = roll < 0.03 ? 0.55 : (roll < 0.6 ? 0.0 : 0.09 * roll);
          this.switchAt[i] = now + (instant ? 0 : this.seed[i] * 500);
        }
        this.ptx[i] = px; this.pty[i] = py;
        this.ptc[i * 4] = col[0] / 255; this.ptc[i * 4 + 1] = col[1] / 255; this.ptc[i * 4 + 2] = col[2] / 255; this.ptc[i * 4 + 3] = a;
        if (instant) this.commit(i);
      }
      this.layout = true;
    }

    loadImage(src) {
      if (this.imageCache.has(src)) return this.imageCache.get(src);
      const p = new Promise((res, rej) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });
      this.imageCache.set(src, p);
      return p;
    }

    async showImage(src, instant) {
      this.mode = "image";
      this.current = src;
      let img;
      try { img = await this.loadImage(src); } catch (e) { return; }
      if (this.current !== src) return;
      const { cols, rows, cell, n } = this;
      const cv = document.createElement("canvas");
      cv.width = cols; cv.height = rows;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      // cover fit
      const s = Math.max(cols / img.width, rows / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      const data = ctx.getImageData(0, 0, cols, rows).data;
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = (i / cols) | 0;
        this.ptx[i] = c * cell + cell / 2;
        this.pty[i] = r * cell + cell / 2;
        const o = i * 4;
        // slight dimming toward the bottom keeps the interface readable
        const shade = 0.92 - Math.max(0, (r / rows) - 0.55) * 0.9;
        this.ptc[o] = (data[o] / 255) * shade;
        this.ptc[o + 1] = (data[o + 1] / 255) * shade;
        this.ptc[o + 2] = (data[o + 2] / 255) * shade;
        this.ptc[o + 3] = 1;
        this.switchAt[i] = now + (instant ? 0 : (c / cols) * 520 + this.seed[i] * 220 + (r / rows) * 80);
        if (instant) this.commit(i);
      }
    }

    commit(i) {
      this.tx[i] = this.ptx[i]; this.ty[i] = this.pty[i];
      const o = i * 4;
      this.tc[o] = this.ptc[o]; this.tc[o + 1] = this.ptc[o + 1]; this.tc[o + 2] = this.ptc[o + 2]; this.tc[o + 3] = this.ptc[o + 3];
      this.switchAt[i] = Infinity;
    }

    /* ---------- loop ---------- */

    start() {
      if (this.running) return;
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame(this.tick);
    }
    stop() { this.running = false; }

    tick(now) {
      if (!this.running) return;
      const dt = Math.min(2.5, (now - this.last) / 16.667);
      this.last = now;
      this.step(now, dt);
      this.draw();
      requestAnimationFrame(this.tick);
    }

    step(now, dt) {
      const { n, x, y, vx, vy, tx, ty, c, tc, switchAt, pointer } = this;
      const reduced = this.opts.reduced;
      const k = reduced ? 1 : 0.075 * dt;
      const damp = Math.pow(0.8, dt);
      const R = this.mode === "image" ? 110 : 130;
      const R2 = R * R;
      const pa = pointer.active && !reduced;
      const px = pointer.x, py = pointer.y;
      const colorRate = Math.min(1, 0.09 * dt);
      const t = now * 0.001;
      for (let i = 0; i < n; i++) {
        if (now >= switchAt[i]) this.commit(i);
        let ax = (tx[i] - x[i]) * k;
        let ay = (ty[i] - y[i]) * k;
        if (pa) {
          const dx = x[i] - px, dy = y[i] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R);
            const push = f * f * 9 * dt;
            ax += (dx / d) * push + pointer.vx * f * 0.06;
            ay += (dy / d) * push + pointer.vy * f * 0.06;
          }
        }
        if (reduced) { x[i] = tx[i]; y[i] = ty[i]; vx[i] = 0; vy[i] = 0; }
        else {
          vx[i] = (vx[i] + ax) * damp;
          vy[i] = (vy[i] + ay) * damp;
          x[i] += vx[i] * dt;
          y[i] += vy[i] * dt;
        }
        const o = i * 4;
        c[o] += (tc[o] - c[o]) * colorRate;
        c[o + 1] += (tc[o + 1] - c[o + 1]) * colorRate;
        c[o + 2] += (tc[o + 2] - c[o + 2]) * colorRate;
        c[o + 3] += (tc[o + 3] - c[o + 3]) * colorRate;
      }
      pointer.vx *= 0.85; pointer.vy *= 0.85;
      this.time = t;
    }

    draw() {
      const { gl, n, x, y, c, posOut, colOut, sx, sy, seed } = this;
      const s = this.scatter;
      const s2 = s * s;
      const flicker = this.mode === "text" ? 1 : 0;
      const t = this.time || 0;
      for (let i = 0; i < n; i++) {
        posOut[i * 2] = x[i] + sx[i] * s2;
        posOut[i * 2 + 1] = y[i] + sy[i] * s2;
        const o = i * 4;
        let a = c[o + 3] * (1 - s * 0.85);
        if (flicker && seed[i] < 0.11) a *= 0.75 + 0.25 * Math.sin(t * 3 + seed[i] * 60);
        colOut[o] = c[o]; colOut[o + 1] = c[o + 1]; colOut[o + 2] = c[o + 2]; colOut[o + 3] = a;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(this.loc.res, this.w, this.h);
      gl.uniform1f(this.loc.size, Math.max(1, (this.cell - (this.cell > 7 ? 1.5 : 1)) * this.dpr));
      gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, posOut, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.loc.pos);
      gl.vertexAttribPointer(this.loc.pos, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuf);
      gl.bufferData(gl.ARRAY_BUFFER, colOut, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.loc.col);
      gl.vertexAttribPointer(this.loc.col, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, n);
    }

    setPointer(clientX, clientY) {
      const r = this.canvas.getBoundingClientRect();
      const nx = clientX - r.left, ny = clientY - r.top;
      if (this.pointer.active) {
        this.pointer.vx = nx - this.pointer.x;
        this.pointer.vy = ny - this.pointer.y;
      }
      this.pointer.x = nx; this.pointer.y = ny; this.pointer.active = true;
    }
    clearPointer() { this.pointer.active = false; }

    destroy() {
      this.stop();
      const ext = this.gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    }
  }

  window.PixelField = PixelField;
})();
