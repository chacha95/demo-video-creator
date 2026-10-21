/* motion-kit.js (formerly evals-motion.js) — reusable motion devices from demo_en2.mp4 (= evals-hype/renders/evals-ref2-refined-en.mp4).
 *
 * Source of every curve: videos/evals-hype/ref2/build-A|B|C/index.html (per-frame tables measured from the
 * Motionfly reference) + videos/evals-hype/vo/{build_warp.py,warp.json,final_refined.py} (time-warp + post punch).
 * See ../references/MOTION_SPEC.md for the numbers and the source line for each device.
 *
 * Contract
 *  - Every device is   EM.<device>(hostEl, opts) -> { render(lf) }   where lf = LOCAL frame in 30fps "source frames"
 *    (0 = first frame of the device). render is a pure function of lf (no clocks, no randomness, seekable).
 *  - EM.film(...) builds the ONE paused GSAP timeline, maps composition time -> (segment, lf) with a per-segment
 *    speed (the demo_en2 time-warp sped devices up 0.85x-1.73x), toggles segment hosts and applies the post camera
 *    (2% exp punch on hits + slow end push) on one wrapper.
 *  - Call everything after fonts are loaded (EM.ready()).
 */
(function (g) {
  "use strict";
  const EM = {};
  EM.FPS = 30;

  /* ---------------- evals.ag tokens (live site probe 2026-10-08: v4kit/site/probe2.json) ---------------- */
  EM.C = {
    paper: "#F7F4ED",     // page canvas (body bg on evals.ag)
    surface: "#FCFAF5",   // cards / composer
    type: "#F7F4ED",      // v5: = paper, matches evals.ag/outputs body bg (user 2026-10-09)
    chip: "#EEE7DC",      // chip / pill fill on the site
    line: "#DDD5C9",      // 1px borders on the site (use sparingly; user dislikes hairlines in film)
    ink: "#40352C",       // site text / buttons
    inkDeep: "#2B231D",   // big display type in demo_en2
    muted: "#85796D",     // site secondary text
    dark: "#181515",      // dark sections
    onDark: "#F7F4ED",
    mutedDark: "#8C847C",
    accent: "#A13A2B",    // the ONE accent (coral)
    accentDark: "#E0573F",// accent on dark
    accentLight: "#E9A79A",
    hues: ["#8E64AD", "#337CA8", "#438261", "#C9902F"], // site pill hues (variant/skill chips)
    card: "#FFFFFF",      // inline logo/chip cards
    dot: "#E6DFD2",       // dot-field dots
    onDarkSoft: "#CFC7BD",// status text on dark
    darkDeep: "#0E0C0C",  // behind footage tiles
    shadowRGB: "43,35,29",// soft shadow tint (r,g,b) — keep it the ink colour, never pure black on light canvases
  };
  EM.FONT = { head: '"martina", Georgia, serif', ui: '"diatype", system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace' };
  // fonts EM.ready() waits for: [weight, family] pairs. A theme replaces this list.
  EM.FONT_LOAD = [["400", "diatype"], ["500", "diatype"], ["700", "diatype"], ["400", "martina"]];

  /* ---------------- theming ----------------
   * EM.theme(tokens) swaps the palette, fonts and brand mark BEFORE any device is built (devices read EM.C / EM.FONT
   * when they are constructed). tokens = one of assets/themes/*.json, inlined or fetched:
   *   { colors:{paper,surface,type,chip,ink,inkDeep,muted,dark,onDark,accent,accentLight,hues:[4],...},
   *     fonts:{head,ui,mono,load:[[weight,family],...]}, mark:{svg:'<path …/>', viewBox:'0 0 24 24', stroke:true} }
   * Unknown keys are ignored; missing keys keep the current value, so a theme can be partial. */
  EM.theme = function (t) {
    t = t || {};
    if (t.colors) Object.keys(t.colors).forEach((k) => { if (k in EM.C) EM.C[k] = t.colors[k]; });
    if (t.fonts) { ["head", "ui", "mono"].forEach((k) => { if (t.fonts[k]) EM.FONT[k] = t.fonts[k]; }); if (t.fonts.load) EM.FONT_LOAD = t.fonts.load; }
    if (t.mark) { if (t.mark.svg) EM.MARK = t.mark.svg; if (t.mark.viewBox) EM.MARK_VB = t.mark.viewBox; if ("stroke" in t.mark) EM.MARK_STROKE = !!t.mark.stroke; }
    return EM;
  };

  /* ---------------- math ---------------- */
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  // exponential approach: fraction k of the REMAINING distance per frame, starting after frame f0
  const appr = (f, f0, k) => (f <= f0 ? 0 : 1 - Math.pow(1 - k, f - f0));
  const E = (k, n) => (n <= 0 ? 0 : 1 - Math.pow(1 - k, n));
  // k per source frame -> k per output frame when the segment plays at `speed`
  const kAt = (k, speed) => 1 - Math.pow(1 - k, speed);
  function samp(arr, x) {
    if (x <= 0) return arr[0];
    if (x >= arr.length - 1) return arr[arr.length - 1];
    const i = Math.floor(x); return lerp(arr[i], arr[i + 1], x - i);
  }
  function tbl(t, f) {
    if (f <= t[0][0]) return t[0][1];
    for (let i = 1; i < t.length; i++) if (f <= t[i][0]) { const [a, va] = t[i - 1], [b, vb] = t[i]; return va + (vb - va) * (f - a) / (b - a); }
    return t[t.length - 1][1];
  }
  function prod(arr, a, b) { let p = 1; for (let i = Math.max(0, a); i <= b && i < arr.length; i++) p *= arr[i]; return p; }
  function sum(arr, a, b) { let p = 0; for (let i = Math.max(0, a); i <= b && i < arr.length; i++) p += arr[i]; return p; }
  const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); t = clamp(t); return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")"; };
  function rng(seed) { let s = seed || 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  Object.assign(EM, { clamp, lerp, appr, E, kAt, samp, tbl, prod, sum, sine, mix, rng });

  /* ---------------- DOM helpers ---------------- */
  function el(tag, parent, style, text, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) e.setAttribute("style", style);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  const ABS = "position:absolute;left:0;top:0;";
  const T = (font, size, weight, ls) => ABS + "white-space:nowrap;line-height:1;font-family:" + font + ";font-size:" + size + "px;font-weight:" + (weight || 400) + ";letter-spacing:" + (ls == null ? "-0.02em" : ls) + ";";
  function measure(text, font, size, weight, ls) {
    const e = el("span", document.body, T(font, size, weight, ls) + "visibility:hidden;", text);
    const w = e.getBoundingClientRect().width; e.remove(); return w;
  }
  const _bl = {};
  // baseline offset (fraction of font-size) inside a line-height:1 box, measured in the engine
  function baseline(font, weight) {
    const key = font + "|" + weight;
    if (_bl[key] != null) return _bl[key];
    const box = el("div", document.body, ABS + "visibility:hidden;line-height:1;font-size:100px;white-space:nowrap;font-family:" + font + ";font-weight:" + weight);
    box.appendChild(document.createTextNode("Hx"));
    const m = el("span", box, "display:inline-block;width:1px;height:0;vertical-align:baseline;");
    const v = (m.getBoundingClientRect().top - box.getBoundingClientRect().top) / 100;
    box.remove(); return (_bl[key] = v);
  }
  Object.assign(EM, { el, measure, baseline });
  EM.ready = (extra) => Promise.all(EM.FONT_LOAD.map(([w, fam]) => document.fonts.load(w + ' 100px "' + fam + '"'))
    .concat(extra || [])).then(() => document.fonts.ready);

  EM.MARK = '<path d="M9 5h14a4 4 0 0 1 0 8H9a4 4 0 0 1 0-8Zm0 0v22m0 0h14a4 4 0 0 0 0-8H9a4 4 0 0 0 0 8Zm14-14V5m0 8v14"/><path d="M13 9h6m-6 14h6" stroke-width="1.6"/>';
  EM.MARK_VB = "4 4 24 24"; EM.MARK_STROKE = true; // Evals mark; EM.theme({mark}) replaces it
  EM.markSVG = (size, color, viewBox) => {
    const c = color || EM.C.inkDeep, paint = EM.MARK_STROKE ? 'fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : 'fill="' + c + '"';
    return '<svg width="' + size + '" height="' + size + '" viewBox="' + (viewBox || EM.MARK_VB) + '" ' + paint + ' style="display:block;overflow:visible">' + EM.MARK + "</svg>";
  };
  const CURSOR = (fill, stroke) => '<svg width="26" height="34" viewBox="0 0 26 34" style="display:block;overflow:visible"><path d="M2 2 L2 28 L8.5 22 L13 32 L17.5 30 L13 20.5 L22 20.5 Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2" stroke-linejoin="round"/></svg>';

  /* =====================================================================================================
   * 1) LOGO REVEAL  (build-A shot 2, L32-105; demo_en2 4.40-6.13 at 0.85x)
   *    blurred oversized mark settles (scale 1.48 -> 1.0, blur 26 -> 0 over 11f) -> slides left (lf 14-29,
   *    measured progress table) while the wordmark types 1 char / 2f from lf 19. Optional backspace exit.
   * ===================================================================================================== */
  const LOGO_SC = [1.38, 1.285, 1.218, 1.167, 1.132, 1.104, 1.07, 1.045, 1.025, 1.01, 1.0];
  const LOGO_BL = [20, 16, 12, 9, 7, 5, 3.5, 2.2, 1.2, 0.5, 0];
  const LOGO_SLIDE = [0, 0.019, 0.047, 0.094, 0.182, 0.394, 0.664, 0.788, 0.860, 0.906, 0.937, 0.961, 0.978, 0.989, 0.994, 1];
  const LOGO_BACK = [197, 195, 190, 182, 170, 156, 142, 126, 108, 81];
  EM.logoReveal = function (host, o) {
    o = Object.assign({ word: "Evals", size: 229, mark: 197, gap: 81, color: EM.C.inkDeep, font: EM.FONT.ui, weight: 500,
      bg: EM.C.type, typeAt: 19, slideAt: 14, exitAt: null, cy: 540 }, o || {});
    host.style.background = o.bg;
    const lock = el("div", host, ABS + "width:1920px;height:1080px;");
    const m = el("div", lock, ABS + "width:" + o.mark + "px;height:" + o.mark + "px;transform-origin:50% 50%;");
    m.innerHTML = EM.markSVG(o.mark, o.color);
    const w = el("div", lock, T(o.font, o.size, o.weight) + "color:" + o.color);
    const ww = []; for (let n = 0; n <= o.word.length; n++) ww[n] = n ? measure(o.word.slice(0, n), o.font, o.size, o.weight) : 0;
    const W = o.mark + o.gap + ww[o.word.length], L = 960 - W / 2, C0 = 960 - o.mark / 2;
    const bl = baseline(o.font, o.weight), cap = 0.7 * o.size;
    return { render(f) {
      const F = Math.floor(f + 1e-6);
      const sc = f <= 0 ? 1.48 : samp(LOGO_SC, f - 1), blur = f <= 0 ? 26 : samp(LOGO_BL, f - 1);
      const p = samp(LOGO_SLIDE, f - o.slideAt);
      const left = lerp(C0, L, f < o.slideAt ? 0 : p);
      m.style.transform = "translate(" + left + "px," + (o.cy - o.mark / 2) + "px) scale(" + (f < o.slideAt ? sc : 1) + ")";
      m.style.filter = blur > 0.05 ? "blur(" + blur + "px)" : "none";
      m.style.opacity = clamp(0.55 + f * 0.06);
      let n = F >= o.typeAt ? clamp(Math.floor((F - o.typeAt) / 2) + 1, 0, o.word.length) : 0;
      if (o.exitAt != null && F >= o.exitAt) n = Math.max(0, o.word.length - 1 - Math.floor((F - o.exitAt) / 2));
      w.textContent = o.word.slice(0, n);
      w.style.transform = "translate(" + (left + o.mark + o.gap) + "px," + (o.cy + cap / 2 - bl * o.size) + "px)";
      if (o.exitAt != null && f >= o.exitAt - 1) { // backspace shrink of the whole lockup
        const h = samp(LOGO_BACK, f - o.exitAt + 1) / 197;
        lock.style.transformOrigin = (L + 0.11 * W) + "px " + o.cy + "px";
        lock.style.transform = "scale(" + h + ")"; lock.style.filter = "blur(" + clamp((f - o.exitAt - 1) * 0.45, 0, 3) + "px)";
      } else { lock.style.transform = "none"; lock.style.filter = "none"; }
    } };
  };

  /* =====================================================================================================
   * 2) KINETIC SENTENCE WITH INLINE CHIPS  (build-A shot 4, L193-263; demo_en2 6.14-8.30 at 1.01x)
   *    tokens: "word" strings or slot objects {logos:[src..]} | {pills:[[label,hue]..]} | {img:src, w, h}
   *    Words pop in compact (spaces only) on a 3f stagger, coral for 4f then fade to base over 3f.
   *    At openAt the slots grow out of the spaces: k = 0.25/frame (1-0.75^n). Logo/pill content swaps on
   *    `swaps` frames (3f cadence, then 6f). Exit: 6f horizontal squeeze + blur 3.2px/f (max 18) + 4f fade.
   *    settle:"tilt" = the "You didn't just [img] pick a model." entry (build-C L327: rot 6.9deg -> 0 over 9f,
   *    x +62 -> 0, scale 1.05 -> 1, word-spacing -0.3em -> 0, all k=0.4/frame), slots open instantly.
   * ===================================================================================================== */
  const SQUEEZE = [0, 8, 33, 74, 132, 207];
  EM.kineticChips = function (host, o) {
    o = Object.assign({ tokens: ["Models", { logos: [] }, "skills", { pills: [] }, "and", "environments"],
      colors: null, appear: null, openAt: 19, swaps: [29, 32, 35, 38, 41, 44, 47, 50, 56, 62], exitAt: null,
      fsMax: 134, maxW: 1830, font: EM.FONT.ui, weight: 500, ink: EM.C.inkDeep, accent: EM.C.accent, bg: EM.C.type,
      settle: null, cy: 540 }, o || {});
    host.style.background = o.bg;
    const words = o.tokens.filter((t) => typeof t === "string");
    const colors = o.colors || words.map((w) => (/^(and|or|a|the)$/i.test(w) ? EM.C.muted : o.ink));
    const appear = o.appear || words.map((w, i) => (i === 0 ? 0 : 7 + 3 * i));
    const line = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:960px " + o.cy + "px;");
    function layout(fs) {
      const cap = 0.7 * fs, sp = measure("a b", o.font, fs, o.weight) - measure("ab", o.font, fs, o.weight);
      let comp = 0, open = 0;
      const items = o.tokens.map((t) => {
        if (typeof t === "string") { const w = measure(t, o.font, fs, o.weight); return { kind: "w", text: t, w }; }
        if (t.thumbs) return { kind: "logo", thumb: true, src: t.thumbs, w: 4.2 * cap, h: 2.36 * cap, g: 0.45 * fs };
        if (t.logos && t.bare) return { kind: "logo", bare: true, src: t.logos, w: 1.15 * cap, h: 1.15 * cap, g: 0.3 * fs };
        if (t.logos) return { kind: "logo", src: t.logos, w: 1.9 * cap, h: 2.5 * cap, g: 0.45 * fs };
        if (t.pills) { const pf = 0.42 * cap, pad = 0.3 * cap; const pw = Math.max(...t.pills.map((p) => measure(p[0], o.font, pf, 500, "-0.01em"))) + 2 * pad; return { kind: "pill", items: t.pills, w: pw, h: 0.62 * cap, pf, g: 0.6 * fs }; }
        return { kind: "img", src: t.img, w: (t.w || 2.6) * cap, h: (t.h || 2.6) * cap, g: 0.45 * fs };
      });
      // x positions: compact (words + single spaces) and open (slots inserted with gaps)
      let cx = 0, ox = 0, prevWord = false;
      items.forEach((it) => {
        if (it.kind === "w") { if (prevWord) { cx += sp; ox += sp; } it.cx = cx; it.ox = ox; cx += it.w; ox += it.w; prevWord = true; }
        else { it.cc = cx + sp / 2; it.ox = ox + it.g; ox += it.g + it.w + it.g; cx += sp; prevWord = false; }
      });
      comp = cx; open = ox;
      return { fs, cap, sp, items, comp, open };
    }
    let Lo = layout(o.fsMax); Lo = layout(Math.min(o.fsMax, o.fsMax * o.maxW / Lo.open));
    const c0 = 960 - Lo.comp / 2, o0 = 960 - Lo.open / 2, bl = baseline(o.font, o.weight);
    let wi = 0;
    Lo.items.forEach((it) => {
      if (it.kind === "w") { it.e = el("div", line, T(o.font, Lo.fs, o.weight) + "transform-origin:0 0;"); it.e.textContent = it.text; it.idx = wi++; return; }
      it.e = el("div", line, ABS + "overflow:hidden;transform-origin:0 0;background:" + EM.C.card + ";box-shadow:0 1px 2px rgba(" + EM.C.shadowRGB + ",.08),0 10px 30px rgba(" + EM.C.shadowRGB + ",.14);");
      if (it.kind === "logo") {
        it.e.style.cssText += "width:" + it.w + "px;height:" + it.h + "px;border-radius:" + 0.16 * Lo.cap + "px;";
        if (it.thumb) { it.e.style.background = EM.C.dark; it.e.style.borderRadius = 0.12 * Lo.cap + "px"; it.e.style.boxShadow = "0 1px 2px rgba(" + EM.C.shadowRGB + ",.08),0 12px 34px rgba(" + EM.C.shadowRGB + ",.18)";
          it.imgs = it.src.map(() => el("img", it.e, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;")); }
        else if (it.bare) { it.e.style.background = "transparent"; it.e.style.boxShadow = "none"; it.e.style.overflow = "visible";
          it.imgs = it.src.map(() => el("img", it.e, "position:absolute;inset:0;width:100%;height:100%;")); }
        else it.imgs = it.src.map((s) => el("img", it.e, "position:absolute;width:" + 0.95 * Lo.cap + "px;height:" + 0.95 * Lo.cap + "px;left:" + (it.w - 0.95 * Lo.cap) / 2 + "px;top:" + (it.h - 0.95 * Lo.cap) / 2 + "px;"));
        it.imgs.forEach((im, i) => (im.src = it.src[i]));
      } else if (it.kind === "pill") {
        it.e.style.cssText += "width:" + it.w + "px;height:" + it.h + "px;border-radius:" + 0.2 * Lo.cap + "px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:" + o.font + ";font-weight:500;font-size:" + it.pf + "px;letter-spacing:-0.01em;white-space:nowrap;box-shadow:none;";
        it.cur = el("div", line, ABS + "transform-origin:0 0;");
        it.cur.innerHTML = '<svg width="' + 0.36 * Lo.cap + '" height="' + 0.36 * Lo.cap + '" viewBox="0 0 20 20" style="display:block;overflow:visible"><path d="M2 2 L18 8 L10.5 10.5 L8 18 Z"/></svg>';
      } else {
        it.e.style.cssText += "width:" + it.w + "px;height:" + it.h + "px;border-radius:" + 0.14 * Lo.cap + "px;background:" + EM.C.surface + ";";
        const im = el("img", it.e, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"); im.src = it.src;
      }
    });
    const tilt = o.settle === "tilt", ROT = [6.9, 3.7, 2.35, 1.4, 0.9, 0.5, 0.3, 0.06, 0];
    return { layout: Lo, render(f) {
      const F = Math.floor(f + 1e-6);
      const p = tilt ? 1 : (F >= o.openAt ? appr(f, o.openAt, 0.25) : 0);
      let squeeze = 1, blur = 0, op = 1;
      if (o.exitAt != null && f >= o.exitAt) {
        squeeze = 1 - samp(SQUEEZE, f - o.exitAt) / (960 - o0);
        blur = clamp((f - o.exitAt) * 3.2, 0, 18); op = clamp(1 - (f - o.exitAt - 2) / 4);
      }
      const X = (x) => 960 + (x - 960) * squeeze, ty = o.cy + Lo.cap / 2 - bl * Lo.fs;
      const swapIdx = o.swaps.filter((s) => F >= s).length;
      const fx = (blur ? "blur(" + blur + "px)" : "none");
      Lo.items.forEach((it) => {
        if (it.kind === "w") {
          const on = F >= appear[it.idx]; it.e.style.display = on ? "block" : "none"; if (!on) return;
          const age = f - appear[it.idx];
          it.e.style.color = tilt ? colors[it.idx] : (age < 4 ? o.accent : mix(o.accent, colors[it.idx], (age - 4) / 3));
          const x = lerp(c0 + it.cx, o0 + it.ox, p);
          it.e.style.transform = "translate(" + X(x) + "px," + ty + "px) scaleX(" + Math.max(0.2, squeeze) + ")";
          it.e.style.filter = fx; it.e.style.opacity = op; return;
        }
        const on = p > 0.001; it.e.style.display = on ? "block" : "none"; if (it.cur) it.cur.style.display = on ? "block" : "none";
        if (!on) return;
        if (it.kind === "pill") { it.e.style.display = "flex"; const pl = it.items[(swapIdx + 1) % it.items.length]; it.e.textContent = pl[0]; it.e.style.background = pl[1]; it.e.style.color = pl[2] || "#fff"; it.cur.querySelector("path").setAttribute("fill", pl[1]); }
        if (it.kind === "logo") it.imgs.forEach((im, i) => (im.style.display = i === swapIdx % it.imgs.length ? "block" : "none"));
        const c = lerp(c0 + it.cc, o0 + it.ox + it.w / 2, p), yOff = it.kind === "pill" ? 12 * Lo.fs / 134 : 0;
        it.e.style.transform = "translate(" + (X(c) - it.w * p * squeeze / 2) + "px," + (o.cy + yOff - it.h * p / 2) + "px) scale(" + p * squeeze + "," + p + ")";
        it.e.style.filter = fx; it.e.style.opacity = op;
        if (it.cur) { it.cur.style.transform = "translate(" + (X(c) + (it.w / 2 - 2) * p * squeeze) + "px," + (o.cy + yOff + (it.h / 2 - 4) * p) + "px) scale(" + p + ")"; it.cur.style.filter = fx; it.cur.style.opacity = op; }
      });
      if (tilt) {
        const q = 1 - E(0.4, f), rot = F < ROT.length ? samp(ROT, f) : 0;
        line.style.transform = "translate(" + 62 * q + "px,0) rotate(" + rot + "deg) scale(" + (1 + 0.05 * q) + ")";
        line.style.letterSpacing = (-0.02 - 0.05 * q) + "em";
      }
    } };
  };

  /* =====================================================================================================
   * 3) DOT-FIELD WORD REVEAL  (build-A shot 5, L264-339; demo_en2 8.48-9.80 at 1.01x)
   *    Seeded dot clusters (15px grid, 7px squares/dots, 2.5% in the 4 hues, quiet band behind the headline).
   *    Each word: blur 22 * (1-age/15)^2, opacity (age+1)/3, colour accentLight 3f -> ink over 3f.
   *    Accent highlight sweep (gradient band 340px core, 120px/frame) at sweeps[]. Exit: 8f squeeze to centre.
   * ===================================================================================================== */
  EM.dotReveal = function (host, o) {
    o = Object.assign({ words: ["in", "one", "battle."], appear: [0, 2, 9], fs: 206, font: EM.FONT.head, weight: 400,
      ls: "-0.022em", ink: EM.C.inkDeep, accent: EM.C.accent, light: EM.C.accentLight, bg: EM.C.type, sweeps: [26, 64],
      exitAt: 68, seed: 7, baselineY: 605 }, o || {});
    host.style.background = o.bg;
    const cv = el("canvas", host, ABS); cv.width = 1920; cv.height = 1080;
    (function () {
      const c = cv.getContext("2d"), rnd = rng(o.seed);
      const blobs = []; for (let i = 0; i < 22; i++) blobs.push([rnd() * 1920, rnd() * 1080, 90 + rnd() * 170]);
      const hues = EM.C.hues.concat([o.accent]);
      for (let y = 8; y < 1080; y += 15) for (let x = 8; x < 1920; x += 15) {
        let d = 0; for (const b of blobs) { const dx = x - b[0], dy = y - b[1]; d = Math.max(d, 1 - Math.sqrt(dx * dx + dy * dy) / b[2]); }
        if (d <= 0 || rnd() > d * 1.6) continue;
        const fade = 1 - 0.75 * Math.max(0, 1 - Math.abs(y - 540) / 140), r = rnd();
        if (r < 0.025) { c.fillStyle = hues[Math.floor(rnd() * 5)]; c.globalAlpha = 0.55 * fade; }
        else { c.fillStyle = EM.C.dot; c.globalAlpha = (0.5 + 0.5 * rnd()) * fade; }
        if (rnd() < 0.5) c.fillRect(x - 3.5, y - 3.5, 7, 7); else { c.beginPath(); c.arc(x, y, 3.6, 0, 6.283); c.fill(); }
      }
    })();
    const sp = measure("a b", o.font, o.fs, o.weight, o.ls) - measure("ab", o.font, o.fs, o.weight, o.ls);
    const ws = o.words.map((w) => measure(w, o.font, o.fs, o.weight, o.ls));
    const W = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    const xs = []; let x = 960 - W / 2; ws.forEach((w, i) => { xs[i] = x; x += w + sp; });
    const bl = baseline(o.font, o.weight);
    const els = o.words.map((w) => el("div", host, T(o.font, o.fs, o.weight, o.ls) + "padding:0 30px;margin-left:-30px;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;transform-origin:0 " + bl * o.fs + "px;", w));
    return { render(f) {
      let squeeze = 1;
      if (o.exitAt != null && f >= o.exitAt) squeeze = 1 - samp([0, 3, 8, 15, 26, 39, 57, 82], f - o.exitAt) / (960 - xs[0]);
      let band = null;
      o.sweeps.forEach((s) => { if (f >= s - 2 && f <= s + 14) band = 285 + (f - s) * 120; });
      els.forEach((e, i) => {
        const age = f - o.appear[i]; e.style.display = age >= 0 ? "block" : "none"; if (age < 0) return;
        const blur = age < 15 ? 22 * Math.pow(1 - age / 15, 2) : 0;
        const col = age < 3 ? o.light : mix(o.light, o.ink, (age - 3) / 3);
        const xx = 960 + (xs[i] - 960) * squeeze;
        if (band !== null) { const rel = band - xx + 30; e.style.backgroundImage = "linear-gradient(90deg," + col + " " + (rel - 420) + "px," + o.accent + " " + (rel - 170) + "px," + o.accent + " " + (rel + 170) + "px," + col + " " + (rel + 420) + "px)"; }
        else e.style.backgroundImage = "linear-gradient(" + col + "," + col + ")";
        e.style.transform = "translate(" + xx + "px," + (o.baselineY - bl * o.fs) + "px) scale(" + squeeze + ")";
        e.style.filter = blur > 0.05 ? "blur(" + blur + "px)" : "none"; e.style.opacity = clamp((age + 1) / 3);
      });
    } };
  };

  /* =====================================================================================================
   * 4) COMPOSER -> DARK "Running..." -> 2x2 GRID  (build-A shots 7-8, L416-615; demo_en2 9.80-14.77, 1.53x->1.13x)
   *    lf 0-57 type 0.7 char/f (from char `typedFrom`), cursor eases in (lf 20-44, ease-out cubic), click lf 53-56
   *    (send + cursor scale 0.88-0.9), HARD CUT to dark at lf 60: spinner -4.5deg/f + breathing dash; status text
   *    fades in 3f at lf 101, swaps at lf 121; camera zoom-out lf 128-140 (per-frame rate table, peak -6.4%/f);
   *    tiles stream in at lf 140/143/147/151 (blur 14 -> 0 and rise 14px over 6f); S-curve scroll -430px
   *    lf 152-187; punch-in lf 188-199 (+0.19% .. +7.2%/f, compounding) toward `punchAt`.
   * ===================================================================================================== */
  EM.composerGrid = function (host, o) {
    o = Object.assign({ prompt: "Build a polished playable Sonic-style 3D platform game for the browser.", typedFrom: 47,
      chips: ["Battle", "4 models"], status1: "Running 4 models…", status2: "Battle · 4 models",
      tiles: [], tileLabels: null, punchAt: [1330, 640], bg: EM.C.paper }, o || {});
    const light = el("div", host, ABS + "width:1920px;height:1080px;background:" + o.bg + ";");
    const bar = el("div", light, ABS + "left:212px;top:381px;width:1496px;height:317px;border-radius:30px;background:" + EM.C.surface + ";box-shadow:0 1px 2px rgba(" + EM.C.shadowRGB + ",.06),0 18px 50px rgba(" + EM.C.shadowRGB + ",.12);");
    const txt = el("div", bar, T(EM.FONT.ui, 30.8, 400, "0") + "left:45px;top:52px;color:" + EM.C.ink + ";");
    const car = el("div", bar, ABS + "width:3px;border-radius:1.5px;background:" + EM.C.accent + ";height:30px;top:50px;");
    let cx = 45; o.chips.forEach((c) => { const w = measure(c, EM.FONT.ui, 26, 400, "0") + 40; el("div", bar, ABS + "left:" + cx + "px;top:221px;height:48px;width:" + w + "px;border-radius:12px;background:" + EM.C.chip + ";color:" + EM.C.ink + ";font:400 26px " + EM.FONT.ui + ";display:flex;align-items:center;justify-content:center;", c); cx += w + 14; });
    const send = el("div", bar, ABS + "left:1359px;top:209px;width:75px;height:75px;border-radius:38px;background:" + EM.C.ink + ";transform-origin:37.5px 37.5px;");
    send.innerHTML = '<svg width="75" height="75" viewBox="0 0 75 75"><path d="M37.5 52V24M26 35l11.5-11.5L49 35" stroke="' + EM.C.surface + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const cur = el("div", light, ABS + "transform-origin:2px 2px;"); cur.innerHTML = CURSOR(EM.C.inkDeep, "#fff");
    const pw = []; for (let n = 0; n <= o.prompt.length; n++) pw[n] = n ? measure(o.prompt.slice(0, n), EM.FONT.ui, 30.8, 400, "0") : 0;

    const dark = el("div", host, ABS + "width:1920px;height:1080px;background:" + EM.C.dark + ";overflow:hidden;");
    const world = el("div", dark, ABS + "width:1920px;height:1080px;transform-origin:0 0;");
    const st = el("div", world, ABS);
    const spin = el("div", st, ABS + "left:-22px;top:-22px;width:124px;height:124px;transform-origin:62px 62px;");
    spin.innerHTML = '<svg width="124" height="124" viewBox="0 0 96 96" style="overflow:visible"><circle cx="48" cy="48" r="44" fill="none" stroke="' + EM.C.accentDark + '" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="62 300"/></svg>';
    const circ = spin.querySelector("circle");
    el("div", st, ABS + "width:80px;height:80px;").innerHTML = EM.markSVG(80, EM.C.onDark, "0 0 32 32");
    const t1 = el("div", st, T(EM.FONT.ui, 36, 400, "0") + "left:108px;top:24px;color:" + EM.C.onDarkSoft + ";", o.status1);
    const t2 = el("div", st, T(EM.FONT.ui, 36, 400, "0") + "left:108px;top:24px;color:" + EM.C.onDarkSoft + ";", o.status2);
    const t1w = measure(o.status1, EM.FONT.ui, 36, 400, "0"), t2w = measure(o.status2, EM.FONT.ui, 36, 400, "0");
    const pos = [[312, 400], [1052, 400], [312, 834], [1052, 834]], tAt = [140, 143, 147, 151];
    const tiles = o.tiles.slice(0, 4).map((src, i) => {
      const d = el("div", world, ABS + "left:" + pos[i][0] + "px;top:" + pos[i][1] + "px;width:700px;height:394px;border-radius:14px;overflow:hidden;background:" + EM.C.darkDeep + ";box-shadow:0 20px 60px rgba(0,0,0,.45);");
      const im = el("img", d, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"); im.src = src;
      if (o.tileLabels && o.tileLabels[i]) el("div", d, ABS + "left:16px;top:14px;padding:6px 14px;border-radius:10px;background:rgba(24,21,21,.72);color:" + EM.C.onDark + ";font:500 24px " + EM.FONT.ui + ";white-space:nowrap;", o.tileLabels[i]);
      return d;
    });
    const rates = [-0.25, -0.27, -0.76, -1.51, -2.12, -3.74, -6.31, -6.40, -4.58, -2.46, -2.11, -1.34];
    const zp = [1]; let pr = 1; rates.forEach((r) => { pr *= 1 + r / 100; zp.push(pr); });
    const s0 = 1 / pr, total = Math.log(s0);
    const pin = [0.19, 0.60, 0.82, 1.13, 1.50, 2.06, 2.57, 3.47, 4.64, 6.50, 7.20];
    const pp = [1]; let pz = 1; pin.forEach((r) => { pz *= 1 + r / 100; pp.push(pz); });
    const dcur = el("div", dark, ABS + "transform-origin:2px 2px;"); dcur.innerHTML = CURSOR("#fff", EM.C.inkDeep);
    return { render(f) {
      const F = Math.floor(f + 1e-6);
      const isDark = F >= 60;
      light.style.display = isDark ? "none" : "block"; dark.style.display = isDark ? "block" : "none";
      if (!isDark) {
        const n = clamp(o.typedFrom + Math.floor(f * 0.7 + 1e-6), 0, o.prompt.length);
        txt.textContent = o.prompt.slice(0, n);
        car.style.display = F < 57 ? "block" : "none"; car.style.left = 45 + pw[n] + 2 + "px";
        let x, y; if (f < 20) { x = 1980; y = 920; }
        else if (f < 29) { const t = 1 - Math.pow(1 - (f - 20) / 9, 2); x = lerp(1880, 1712, t); y = lerp(860, 712, t); }
        else { const t = 1 - Math.pow(1 - clamp((f - 29) / 15), 3); x = lerp(1712, 1608, t); y = lerp(712, 632, t); }
        const press = F >= 53 && F <= 56;
        cur.style.transform = "translate(" + x + "px," + y + "px) scale(" + (press ? 0.88 : 1) + ")";
        send.style.transform = press ? "scale(0.9)" : "scale(1)";
        return;
      }
      const L = f + 416; // source frame numbering (build-A)
      const s = s0 * samp(zp, L - 544), prog = 1 - Math.log(s) / total;
      const T0x = 400 - 312 * s0, T0y = 528 - 320 * s0;
      const sc = L < 568 ? 0 : L > 603 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * (L - 568) / 35);
      const ps = L < 604 ? 1 : samp(pp, L - 604), px = o.punchAt[0], py = o.punchAt[1];
      const tx = T0x * (1 - prog), ty = T0y * (1 - prog) - 430 * sc;
      world.style.transform = "translate(" + (px + (tx - px) * ps) + "px," + (py + (ty - py) * ps) + "px) scale(" + s * ps + ")";
      const LF = Math.floor(L + 1e-6), tw = LF < 537 ? t1w : t2w;
      let gx = 312; if (LF < 517) gx = (960 - T0x) / s0 - 40; else if (LF < 537) gx = (960 - T0x) / s0 - (108 + tw) / 2;
      st.style.transform = "translate(" + gx + "px,280px)";
      t1.style.display = LF >= 517 && LF < 537 ? "block" : "none"; t1.style.opacity = clamp((L - 516) / 3);
      t2.style.display = LF >= 537 ? "block" : "none";
      spin.style.display = LF < 537 ? "block" : "none";
      spin.style.transform = "rotate(" + (-4.5 * (L - 476) - 90) + "deg)";
      circ.setAttribute("stroke-dasharray", (40 + 30 * Math.sin((L - 476) / 6)).toFixed(1) + " 300");
      tiles.forEach((d, i) => {
        const age = f - tAt[i]; d.style.display = age >= 0 ? "block" : "none"; if (age < 0) return;
        d.style.opacity = clamp((age + 1) / 3); const b = age < 6 ? 14 * (1 - age / 6) : 0;
        d.style.filter = b > 0.05 ? "blur(" + b + "px)" : "none"; d.style.marginTop = (age < 6 ? 14 * Math.pow(1 - age / 6, 2) : 0) + "px";
      });
      dcur.style.display = L >= 580 ? "block" : "none";
      if (L >= 580) { const e = 1 - Math.pow(1 - clamp((L - 580) / 16), 3), cxw = lerp(1560, px, e), cyw = lerp(1110, py, e);
        dcur.style.transform = "translate(" + (px + (cxw - px) * ps) + "px," + (py + (cyw - py) * ps) + "px) scale(" + ps + ")"; }
    } };
  };

  /* =====================================================================================================
   * 5) SCATTERED CARD STACK -> DARK FLY-THROUGH  (build-B shots 11-13, L0-175; demo_en2 14.77-18.15, 1.6-1.73x)
   *    lf 0-22: dark kicker line (scale 1.348 -> 1 in 5f, then 1 -> 0.81) with the accent word dropping in.
   *    lf 23-26 grey flash (#CFCCC6 -> type bg). Two-line caps title (BATTLE / EVERY ...) whose gap splits open
   *    lf 52-78 (0 -> 1300px, accelerating) while the cluster grows from the gap (scale 0.05 -> 1.05 by lf 82,
   *    overshoot, then 1.0-1.1 drift). Cards settle toward pos@91 (k=0.2/f), then spread to pos@136 on a sine
   *    over lf 100-142 with cluster rotation -4deg; bg ramps type -> dark lf 107-126 (linear);
   *    word 1 (lf 118) and word 2 (lf 140) pop (k=0.35/f, scale 0.9 -> 1, 2f fade); push-through lf 146-175 x1.4.
   * ===================================================================================================== */
  const B_CARDS = [[300, [-273, -265], -1.5, [-525, -372], 350], [310, [108, -383], 1.5, [70, -505], 380], [160, [54, -470], -2, [60, -760], 200],
    [470, [365, -132], 1, [610, -440], 520], [560, [-14, 115], 0, [-20, -860], 600], [360, [-206, 313], -2.5, [-660, 270], 640],
    [150, [-182, 468], 2, [-350, 575], 260], [240, [185, 321], 2.5, [610, 350], 480], [300, [120, 470], -1, [140, 600], 300]];
  const B_ORDER = [8, 6, 1, 2, 0, 3, 7, 5, 4]; // DOM stacking order from build-B
  EM.cardCluster = function (host, o) {
    o = Object.assign({ kicker: ["New in Evals", "Battle"], title: ["BATTLE", "EVERY MODEL"], words: ["with", "Skills"], cards: [],
      font: EM.FONT.ui, startAt: 0 }, o || {});
    const bg = el("div", host, ABS + "width:1920px;height:1080px;");
    const k = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:960px 540px;");
    const kl = el("div", k, ABS + "top:445px;width:1920px;text-align:center;white-space:nowrap;font:500 190px/190px " + o.font + ";letter-spacing:-0.02em;color:" + EM.C.onDark);
    kl.appendChild(document.createTextNode(o.kicker[0] + " "));
    const kb = el("span", kl, "display:inline-block;color:" + EM.C.accentDark + ";transform-origin:50% 70%;", o.kicker[1]);
    const cards = B_ORDER.map((i) => {
      const c = B_CARDS[i], d = el("div", host, ABS + "width:" + c[0] + "px;padding:8px;box-sizing:border-box;background:" + EM.C.type + ";border-radius:16px;box-shadow:0 1px 2px rgba(" + EM.C.shadowRGB + ",.06),0 18px 50px rgba(" + EM.C.shadowRGB + ",.14);");
      const im = el("img", d, "display:block;width:100%;border-radius:10px;"); im.src = o.cards[i % Math.max(1, o.cards.length)] || "";
      return { el: d, w: c[0], p0: c[1], r: c[2], p1: c[3], w1: c[4] };
    });
    const line = (txt, w) => el("div", host, ABS + "width:1920px;text-align:center;white-space:nowrap;font-family:" + o.font + ";font-weight:" + w + ";letter-spacing:-0.015em;color:" + EM.C.inkDeep, txt);
    const lB = line(o.title[0], 700), lE = line(o.title[1], 700), wW = line(o.words[0], 500), wS = line(o.words[1], 500);
    wW.style.color = wS.style.color = EM.C.onDark;
    const BASE = baseline(o.font, 700), place = (e, fs, y) => { e.style.fontSize = fs + "px"; e.style.lineHeight = fs + "px"; e.style.top = (y - BASE * fs) + "px"; };
    const s11S = [[0, 1.348], [1, 1.227], [2, 1.128], [3, 1.057], [4, 1.021], [5, 1], [12, 1], [13, 0.9957], [14, 0.987], [15, 0.9775], [16, 0.96], [17, 0.944], [18, 0.923], [19, 0.898], [20, 0.873], [21, 0.8375], [22, 0.81]];
    const capB = [[23, 117], [26, 95], [29, 84], [32, 79], [35, 77], [38, 55], [41, 50], [44, 48], [47, 47]];
    const capE = [[23, 58], [26, 50], [29, 46], [32, 44], [35, 53], [38, 80], [41, 88], [44, 93], [47, 95], [50, 96]];
    const splitG = [[52, 0], [56, 20], [60, 66], [62, 102], [64, 150], [66, 217], [68, 306], [70, 415], [72, 566], [74, 759], [76, 1000], [78, 1300]];
    const camT = [[52, 1], [56, 1], [60, 1.03], [64, 1.07], [68, 1.13], [72, 1.24], [74, 1.3], [78, 1.42]];
    const clS = [[60, 0.05], [62, 0.09], [64, 0.13], [66, 0.19], [68, 0.29], [70, 0.41], [72, 0.58], [74, 0.66], [76, 0.73], [78, 0.84], [80, 0.95], [82, 1.05], [86, 1.03], [91, 1.0], [96, 1.03], [100, 1.05], [106, 1.07], [156, 1.1]];
    const PUSH = [[146, 1], [156, 1.08], [160, 1.1], [166, 1.17], [171, 1.27], [175, 1.4]];
    return { render(lf) {
      const f = lf + o.startAt, F = Math.floor(f + 1e-4);
      const kick = F <= 22;
      k.style.display = kick ? "block" : "none";
      [lB, lE, wW, wS].forEach((e) => (e.style.visibility = "hidden"));
      cards.forEach((c) => (c.el.style.visibility = "hidden"));
      if (kick) {
        bg.style.background = EM.C.dark;
        k.style.transform = "translateY(" + (tbl([[0, 532], [4, 526], [16, 550], [22, 565]], f) - 540) + "px) scale(" + tbl(s11S, f) + ")";
        kb.style.opacity = tbl([[1, 0], [2, 0.35], [3, 0.75], [4, 1]], f);
        kb.style.transform = "translateY(" + tbl([[2, -22], [4, 0]], f) + "px) scale(" + tbl([[1, 0.7], [2, 0.7], [3, 0.9], [4, 1]], f) + ")";
        return;
      }
      bg.style.background = F <= 26 ? mix("#CFCCC6", EM.C.type, tbl([[23, 0], [24, 0.5], [25, 0.78], [26, 1]], f)) : mix(EM.C.type, EM.C.dark, (f - 107) / 19);
      if (F <= 77) {
        const cb = tbl(capB, f), ce = tbl(capE, f), gap = 0.17 * ce, G = tbl(splitG, f), cam = tbl(camT, f);
        const top = 540 - (cb + gap + ce) / 2, yb = top + cb - G / 2, ye = top + cb + gap + ce + G / 2, map = (y) => 540 + (y - 540) * cam;
        const gB = tbl([[56, 1], [64, 1.12], [68, 1.3], [72, 1.95], [76, 2.6]], f);
        place(lB, (cb / 0.7) * cam * gB, map(yb) + (cb * cam * (gB - 1)) / 2); place(lE, (ce / 0.7) * cam, map(ye));
        lB.style.visibility = lE.style.visibility = "visible";
      }
      if (F >= 60) {
        const S = tbl(clS, f), cy = tbl([[60, 522], [74, 526], [82, 540]], f), e = sine(clamp((f - 100) / 42));
        const R = -4 * e - 1.2 * clamp((f - 146) / 30), push = tbl(PUSH, f), out = tbl([[136, 1], [146, 1.04], [160, 1.12], [175, 1.35]], f);
        const settle = lerp(0.82, 1, appr(f, 72, 0.2)), rr = R * Math.PI / 180, cs = Math.cos(rr), sn = Math.sin(rr);
        cards.forEach((c) => {
          let ox = lerp(c.p0[0] * settle, c.p1[0], e), oy = lerp(c.p0[1] * settle, c.p1[1], e);
          const kk = lerp(1, c.w1 / c.w, e); ox *= S * push * out; oy *= S * push * out;
          c.el.style.transform = "translate(" + (960 + ox * cs - oy * sn - c.w / 2) + "px," + (cy + ox * sn + oy * cs) + "px) translateY(-50%) rotate(" + (c.r + R) + "deg) scale(" + kk * S * push + ")";
          c.el.style.visibility = "visible";
        });
      }
      if (F >= 118 && F < 140) { const p = appr(f, 117, 0.35); place(wW, 97 * lerp(0.9, 1, p), 578); wW.style.opacity = clamp((f - 117) / 2); wW.style.visibility = "visible"; }
      if (F >= 140) { const p = appr(f, 139, 0.35), p2 = tbl(PUSH, f); place(wS, 131 * lerp(0.9, 1, p) * p2, 540 + 45 * p2); wS.style.opacity = clamp((f - 139) / 2); wS.style.visibility = "visible"; }
    } };
  };

  /* =====================================================================================================
   * 6) TYPE-ON WITH FLOATING CHIPS  (build-B shot 15, L250-326; demo_en2 18.15-21.03 at 0.88x)
   *    Line 1 static, line 2 types 1 char / 2f with an accent caret (off at lf 61). Four chips fly in from offsets
   *    with k = 0.12/frame (0.88^n), drift to a second layout on a sine over lf 26-56, then converge toward the
   *    centre (quadratic ease-in, lf 64-76) while the camera pulls back to 0.94.
   * ===================================================================================================== */
  const PILLS = [{ E: [892, 243], o: [-493, 99], f0: 0, D: [678, 273], Cv: [759, 381] }, { E: [1294, 354], o: [20, -330], f0: 0, D: [1392, 369], Cv: [1252, 390] },
    { E: [627, 780], o: [-45, 300], f0: 1, D: [530, 804], Cv: [643, 747] }, { E: [1054, 867], o: [414, -75], f0: 2, D: [1273, 834], Cv: [1171, 747] }];
  EM.typeChips = function (host, o) {
    o = Object.assign({ line1: "Vote blind.", line2: "The best model wins.", fs: 143, font: EM.FONT.head, weight: 400, ls: "-0.022em",
      chips: [{ label: "Variant A", hue: EM.C.hues[0] }, { label: "Variant B", hue: EM.C.hues[3] }, { label: "Prefer A", hue: EM.C.hues[2], icon: "←" }, { label: "Prefer B", hue: EM.C.hues[1], icon: "→" }],
      bg: EM.C.type, caretOff: 61 }, o || {});
    host.style.background = o.bg;
    const mk = (txt, col) => el("div", host, ABS + "width:1920px;text-align:center;white-space:nowrap;font-family:" + o.font + ";font-weight:" + o.weight + ";letter-spacing:" + o.ls + ";color:" + col, txt);
    const v1 = mk(o.at1 ? "" : o.line1, EM.C.inkDeep), v2 = mk("", EM.C.muted);
    const v1s = o.at1 ? o.line1.split(" ").map((w, i) => { if (i) v1.appendChild(document.createTextNode(" ")); return el("span", v1, "visibility:hidden;", w); }) : null;
    if (o.font2) v2.style.fontFamily = o.font2; if (o.weight2) v2.style.fontWeight = o.weight2;
    v1.setAttribute("data-layout-allow-overlap", ""); v2.setAttribute("data-layout-allow-overlap", "");
    const v2t = el("span", v2), v2c = el("span", v2, "display:inline-block;width:0.06em;height:0.8em;vertical-align:-0.07em;margin-left:0.03em;background:" + EM.C.accent);
    const BL = baseline(o.font, o.weight), place = (e, fs, y) => { e.style.fontSize = fs + "px"; e.style.lineHeight = fs + "px"; e.style.top = (y - BL * fs) + "px"; };
    const chips = o.chips.slice(0, 4).map((c, i) => {
      const pos = el("div", host, ABS + "width:0;height:0;transform-origin:0 0;");
      const p = el("div", pos, ABS + "transform:translate(-50%,-32px);height:64px;border-radius:10px;display:flex;align-items:center;gap:12px;padding:0 " + (c.noIcon ? "24px" : "20px 0 12px") + ";color:" + (c.ink || "#fff") + ";font:500 33px " + EM.FONT.ui + ";letter-spacing:-0.01em;white-space:nowrap;box-shadow:0 6px 18px rgba(" + EM.C.shadowRGB + ",.12);background:" + c.hue);
      const cur = el("div", p, "position:absolute;left:-20px;top:-32px;"); cur.innerHTML = CURSOR(c.hue, "#fff");
      const ic = c.noIcon ? null : el("span", p, "width:40px;height:40px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;color:" + EM.C.inkDeep + ";font-size:26px;");
      if (ic) { if (c.img) { const im = el("img", ic, "width:26px;height:26px;"); im.src = c.img; } else ic.textContent = c.icon || "●"; }
      p.appendChild(document.createTextNode(c.label));
      return Object.assign({ el: pos }, PILLS[i]);
    });
    return { render(f) {
      const F = Math.floor(f + 1e-6), cam = tbl([[64, 1], [70, 0.985], [76, 0.94]], f);
      const mx = (x) => 960 + (x - 960) * cam, my = (y) => 540 + (y - 540) * cam;
      place(v1, o.fs * cam, my(527)); place(v2, o.fs * cam, my(657));
      if (v1s) v1s.forEach((e, i) => { const a = f - o.at1[i]; e.style.visibility = a >= 0 ? "visible" : "hidden"; e.style.color = a >= 0 && a < 4 ? EM.C.accent : mix(EM.C.accent, EM.C.inkDeep, (a - 4) / 3); });
      if (o.at2) { // VO-synced type-on: each word starts typing at its lf, rate2 lf per char
        const w2 = o.line2.split(" "); let txt = "";
        w2.forEach((w, i) => { if (f >= o.at2[i]) { const n = clamp(Math.floor((f - o.at2[i]) / o.rate2) + 1, 0, w.length); txt += (i ? " " : "") + w.slice(0, n); } });
        v2t.textContent = txt; v2c.style.visibility = (o.at2.length && f >= o.at2[0] - 6 && f <= o.caretOff) ? "visible" : "hidden";
      } else {
      v2t.textContent = o.line2.slice(0, clamp(Math.floor(F / 2) + 1, 0, o.line2.length));
      v2c.style.visibility = F <= o.caretOff ? "visible" : "hidden"; }
      chips.forEach((p) => {
        let x, y; const d0 = Math.pow(0.88, Math.max(0, f - p.f0));
        if (f < 26) { x = p.E[0] + p.o[0] * d0; y = p.E[1] + p.o[1] * d0; }
        else if (f < 64) { const t = sine(clamp((f - 26) / 30)); x = lerp(p.E[0] + p.o[0] * d0, p.D[0], t); y = lerp(p.E[1] + p.o[1] * d0, p.D[1], t); }
        else { const t = Math.pow(clamp((f - 64) / 12), 2); x = lerp(p.D[0], 960 + (p.Cv[0] - 960) / 0.94, t); y = lerp(p.D[1], 540 + (p.Cv[1] - 540) / 0.94, t); }
        p.el.style.transform = "translate(" + mx(x) + "px," + my(y) + "px) scale(" + cam + ")";
      });
    } };
  };

  /* =====================================================================================================
   * 7) RADIAL THUMBNAIL RINGS -> DARK -> FINAL LINE -> IRIS  (build-C shots 23-25, L327-522; demo 21.03-25.24, 1.56x/1.53x)
   *    Inner ring 8 thumbs (132x74, r 430, +0.06deg/f), outer 28 (64x36, r 640, -0.04deg/f). Build at lf 34:
   *    radius grows 0.4 -> 1 (k 0.22) / 0.55 -> 1 (k 0.2); thumbs pop k=0.45 on a 0.4f / 0.15f stagger.
   *    Lead line ("You didn't just [card] pick a model.") enters with the tilt settle and fades lf 37-41.
   *    World camera zoom-out from lf 49: per-frame scale table S24 (0.97-0.99/f, compounding) revealing a lattice of
   *    other ring systems; bg S-curve paper -> dark lf 79-117 (LUM table); DOF blur 0 -> 6px + 25% darken lf 125-135;
   *    final words pop every 4f from lf 133 (accentDark 10f -> onDark); radial iris close lf 191-195
   *    (diameter 1863 -> 843, 75px feather) with words/world fading to 0.12-0.14.
   * ===================================================================================================== */
  const S24 = [1.0204, 1.016, 1.012, 1.0103, 1.0113, 1.0141, 1.0172, 1.0004, 1.0021, 1.0041, 1.0038, 1.0014, 1.001, 1.0012, 1.0003, 1.0001, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9998, 0.9998, 0.9995, 0.9989, 0.9991, 0.9984, 0.9979, 0.997, 0.997, 0.9966, 0.994, 0.9944, 0.9924, 0.9913, 0.9897, 0.989, 0.9878, 0.986, 0.9838, 0.9832, 0.9798, 0.9785, 0.9771, 0.9756, 0.9734, 0.9733, 0.9721, 0.9708, 0.9708, 0.9708, 0.9709, 0.9708, 0.9713, 0.9711, 0.9724, 0.974, 0.9725, 0.9734, 0.9747, 0.9764, 0.9742, 0.9755, 0.9761, 0.9736, 0.9765, 0.9774, 0.9781, 0.9776, 0.978, 0.9789, 0.9807, 0.9801, 0.9794, 0.9704, 0.9722, 0.9744, 0.9746, 0.9768, 0.9778, 0.9764, 0.9799, 0.9813, 0.976, 0.9813, 0.9783, 0.9808, 0.9798, 0.9814, 0.9815, 0.9843, 0.9833, 0.983, 0.9848, 0.9842, 0.9847, 0.9848, 0.9841, 0.9848, 0.9848, 0.9845, 0.9854, 0.9857, 0.9889, 0.9913, 0.9913, 0.9923, 0.9863, 0.9896, 0.9863, 0.9994, 0.9996, 0.9998, 0.9997, 0.9999, 0.9998, 0.9999, 0.9998, 0.9999, 0.9999, 0.9999, 0.9999, 0.9999, 0.9998, 0.9997, 0.9999, 0.9998, 0.9998, 0.9997, 0.9998, 0.9997, 0.9998, 0.9997, 0.9997, 0.9996, 0.9997, 0.9996, 0.9996, 0.9997, 0.9997, 0.9996, 0.9997, 0.9996, 0.9997, 0.9996, 0.9997, 0.9997, 0.9996, 0.9989, 0.9996, 0.9997, 0.9997, 0.9996, 0.9947, 0.9991, 0.9869, 0.9919, 0.9869];
  const LUM = [242, 239, 232, 218, 193, 147, 94, 58, 39, 28, 24, 23];
  const IRIS = [1863, 1384, 1043, 885, 843];
  EM.orbitFinale = function (host, o) {
    o = Object.assign({ card: "", thumbs: [], lead: ["You didn't just", "pick a model."], words: ["You", "found", "your", "model."],
      leadFont: EM.FONT.ui, wordFont: EM.FONT.head, wordWeight: 400, lattice: true }, o || {});
    const th = (i) => o.thumbs.length ? o.thumbs[i % o.thumbs.length] : "";
    host.style.backgroundColor = EM.C.paper;
    const world = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:960px 540px;");
    const systems = el("div", world, ABS), ringsEl = el("div", world, ABS);
    const line = el("div", world, ABS + "width:1920px;height:1080px;transform-origin:960px 540px;");
    const tA = el("div", line, "position:absolute;top:486px;right:1210px;text-align:right;font:500 90px/108px " + o.leadFont + ";letter-spacing:-0.02em;white-space:nowrap;color:" + EM.C.inkDeep, o.lead[0]);
    const card = el("div", line, ABS + "left:788px;top:368px;width:344px;height:344px;border-radius:18px;overflow:hidden;background:" + EM.C.type + ";box-shadow:0 1px 2px rgba(" + EM.C.shadowRGB + ",.06),0 18px 50px rgba(" + EM.C.shadowRGB + ",.12);");
    el("img", card, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;").src = o.card;
    const tB = el("div", line, "position:absolute;top:486px;left:1210px;font:500 90px/108px " + o.leadFont + ";letter-spacing:-0.02em;white-space:nowrap;color:" + EM.C.inkDeep, o.lead[1]);
    const words = el("div", host, ABS + "top:478px;width:1920px;text-align:center;font-family:" + o.wordFont + ";font-weight:" + o.wordWeight + ";font-size:115px;line-height:124px;letter-spacing:-0.02em;white-space:nowrap;color:" + EM.C.onDark);
    const wEls = o.words.map((w, i) => { if (i) words.appendChild(document.createTextNode(" ")); return el("span", words, "opacity:0", w); });
    function system(parent, cx, cy, seed, isMain) {
      const out = [], n1 = 8, n2 = isMain ? 28 : 16;
      for (let i = 0; i < n1 + n2; i++) {
        const inner = i < n1, w = inner ? 132 : 64, h = inner ? 74 : 36;
        const d = el("div", parent, ABS + "overflow:hidden;background:#ddd;box-shadow:0 2px 8px rgba(" + EM.C.shadowRGB + ",.12);transform-origin:50% 50%;width:" + w + "px;height:" + h + "px;border-radius:" + (inner ? 10 : 6) + "px;");
        el("img", d, "width:100%;height:100%;object-fit:cover;display:block;").src = th(seed * 7 + i * 5);
        const idx = inner ? i : i - n1;
        out.push({ el: d, inner, a0: inner ? -90 + idx * 45 + 22.5 : -90 + idx * (360 / n2), r: inner ? 430 : 640, w, h, cx, cy, i: idx });
      }
      if (!isMain) { const c = el("div", parent, ABS + "border-radius:18px;overflow:hidden;left:" + (cx - 172) + "px;top:" + (cy - 172) + "px;width:344px;height:344px;"); el("img", c, "width:100%;height:100%;object-fit:cover;display:block;").src = th(seed * 3); }
      return out;
    }
    function placeRing(arr, L, build) {
      arr.forEach((t) => {
        const a = (t.a0 + (t.inner ? 0.06 : -0.04) * (L - 362)) * Math.PI / 180;
        let s = 1, rr = t.r;
        if (build) { const gg = lerp(0.4, 1, E(0.22, L - 360)); rr = t.r * (t.inner ? gg : lerp(0.55, 1, E(0.2, L - 361))); s = E(0.45, L - (t.inner ? 360 + t.i * 0.4 : 361 + t.i * 0.15)) * (0.6 + 0.4 * gg); }
        t.el.style.transform = "translate(" + (t.cx + rr * Math.cos(a) - t.w / 2).toFixed(2) + "px," + (t.cy + rr * Math.sin(a) - t.h / 2).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      });
    }
    const MAIN = system(ringsEl, 960, 540, 0, true);
    if (o.lattice) { const others = []; for (let j = -1; j <= 1; j++) for (let i = -3; i <= 3; i++) { if (!i && !j) continue; others.push(...system(systems, 960 + i * 2050 + (j ? 1025 : 0), 540 + j * 1780, (i + 5) * 3 + (j + 2) * 11, false)); } placeRing(others, 362, false); }
    const ROT = [6.9, 3.7, 2.35, 1.4, 0.9, 0.5, 0.3, 0.06, 0];
    return { render(lf) {
      const L = lf + 327, F = Math.floor(L + 1e-6), k = lf;
      world.style.transform = "scale(" + (F < 376 ? 1 : prod(S24, 16, F - 360)).toFixed(5) + ")";
      const q = 1 - E(0.4, k);
      line.style.transform = "translate(" + (62 * q).toFixed(2) + "px,0) rotate(" + (k < ROT.length ? samp(ROT, k) : 0) + "deg) scale(" + (1 + 0.05 * q).toFixed(4) + ")";
      tA.style.wordSpacing = tB.style.wordSpacing = (-0.3 * q).toFixed(3) + "em";
      tA.style.opacity = tB.style.opacity = 1 - clamp((F - 364) / 4);
      ringsEl.style.visibility = F >= 361 ? "visible" : "hidden"; if (F >= 361) placeRing(MAIN, L, true);
      const lum = F < 406 ? 242 : samp(LUM, (L - 406) / 3.45), tt = clamp((242 - lum) / 219), c = (a, b) => Math.round(lerp(a, b, tt));
      host.style.backgroundColor = "rgb(" + c(247, 24) + "," + c(244, 21) + "," + c(237, 21) + ")";
      const blur = 6 * clamp((L - 452) / 10);
      world.style.filter = blur > 0 ? "blur(" + blur.toFixed(2) + "px) brightness(" + (1 - 0.25 * blur / 6).toFixed(3) + ")" : "none";
      wEls.forEach((w, i) => { const s = 460 + 4 * i; w.style.opacity = clamp((F - s + 1) / 2); w.style.color = F < s + 10 ? EM.C.accentDark : EM.C.onDark; });
      if (F >= 518) { const r = IRIS[Math.min(4, F - 518)] / 2, m = "radial-gradient(circle at 960px 540px, #000 " + (r - 75) + "px, transparent " + (r + 75) + "px)";
        host.style.webkitMaskImage = host.style.maskImage = m; words.style.opacity = lerp(1, 0.14, clamp((L - 517) / 3)); world.style.opacity = lerp(1, 0.12, clamp((L - 517) / 3)); }
      else { host.style.webkitMaskImage = host.style.maskImage = "none"; words.style.opacity = 1; world.style.opacity = 1; }
    } };
  };

  /* =====================================================================================================
   * 8) END CARD  (build-C shot 26, L523-653; demo_en2 25.24-28.05 at 1.53x -> 1.0x, then held to 28.81)
   *    Mark lands from 1040px to 131px over 29f (S26 per-frame scale table, ~0.36 then ~0.2 of remaining/frame),
   *    slides 58% of the way left over lf 29-38 (accelerating SLIDE26), wordmark appears at lf 38 and the lockup
   *    re-centres over lf 39-58 (decelerating RECENT26); sub line fades in over 10f at lf 63; optional end push
   *    (x1.0114, 1.0321, 1.0637, 1.1449) at endPushAt.
   * ===================================================================================================== */
  const S26 = [0.6204, 0.8202, 0.8705, 0.8935, 0.9042, 0.9086, 0.9217, 0.9237, 0.9263, 0.9366, 0.9378, 0.934, 0.9432, 0.9425, 0.9469, 0.9469, 0.9542, 0.9511, 0.9683, 0.9604, 0.9653, 0.9773, 0.9809, 0.9881, 0.9803, 0.9851, 0.9912, 0.9975, 0.9829];
  const SLIDE26 = [-3.1, -2, -2.9, -4, -4.7, -6, -7.6, -11.3, -16.9, -24];
  const RECENT26 = [-20.8, -16.8, -12, -10.2, -7.8, -6.9, -5.9, -5.6, -5, -4.3, -4.2, -3.7, -3, -3, -2.3, -2.1, -1.9, -1.7, -1.5, -1.3];
  const ENDPUSH = [1.0114, 1.0321, 1.0637, 1.1449];
  EM.endCard = function (host, o) {
    o = Object.assign({ word: "Evals", sub: "evals.ag · Available today", font: EM.FONT.ui, bg: EM.C.paper, endPushAt: null, cy: 500 }, o || {});
    host.style.background = o.bg;
    const g = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:0 0;");
    const lock = el("div", g, ABS + "width:0;height:0;");
    const m = el("div", lock, ABS + "left:-65.5px;top:-65.5px;width:131px;height:131px;"); m.innerHTML = EM.markSVG(131, EM.C.inkDeep);
    const w = el("div", lock, ABS + "left:98px;top:-64px;font:500 112px/128px " + o.font + ";letter-spacing:-0.02em;color:" + EM.C.inkDeep + ";white-space:nowrap;", o.word);
    const sub = el("div", g, ABS + "top:604px;width:1920px;text-align:center;font:500 28px/38px " + o.font + ";color:" + EM.C.muted + ";white-space:nowrap;opacity:0", o.sub);
    const WW = measure(o.word, o.font, 112, 500), W = 131 + 33 + WW, xF = 960 - W / 2 + 65.5, d1 = (960 - xF) * 0.58;
    const P28 = prod(S26, 0, 28), a = Math.log(131 / 1040) / Math.log(P28);
    return { render(f) {
      const F = Math.floor(f + 1e-6);
      const h = F <= 0 ? 1040 : F <= 29 ? 1040 * Math.pow(prod(S26, 0, F - 1), a) : 131;
      let X = 960;
      if (F > 29 && F < 38) X = 960 - d1 * sum(SLIDE26, 0, F - 29) / sum(SLIDE26, 0, 9);
      if (F >= 38) X = lerp(960 - d1, xF, F < 39 ? 0 : sum(RECENT26, 0, F - 39) / sum(RECENT26, 0, 19));
      w.style.visibility = F >= 38 ? "visible" : "hidden";
      lock.style.transform = "translate(" + X.toFixed(2) + "px," + o.cy + "px) scale(" + (h / 131).toFixed(5) + ")";
      sub.style.opacity = clamp((F - 63) / 10);
      if (o.endPushAt != null && F >= o.endPushAt) { const P = prod(ENDPUSH, 0, F - o.endPushAt); g.style.transform = "translate(" + (700 * (1 - P)).toFixed(2) + "px," + (470 * (1 - P)).toFixed(2) + "px) scale(" + P.toFixed(5) + ")"; }
      else g.style.transform = "none";
    } };
  };

  /* =====================================================================================================
   * GENERIC DEVICES (v2) — for cases that are not output battles: SaaS walkthroughs, dev tools, mobile apps,
   * extensions, feature launches. Same grammar: pure render(f), snappy k=0.25 / floaty k=0.12, holds drift,
   * newest word flashes the accent. f = local source frame (30fps grid).
   * ===================================================================================================== */
  const SNAP = 0.25, FLOAT = 0.12;
  EM.SNAP = SNAP; EM.FLOAT = FLOAT;
  const shadow = (a, b) => "0 1px 2px rgba(" + EM.C.shadowRGB + "," + (a || 0.08) + "),0 18px 50px rgba(" + EM.C.shadowRGB + "," + (b || 0.16) + ")";
  EM.shadow = shadow;

  /* 9) HEADLINE — tag + left-aligned headline revealed word by word.
   *    o: tag, lines:[["Ship", "faster."], ["with", "Acme."]], accent:["faster."], x 120, y 420, fs 150,
   *       at 0, stagger 3 (2–4f), lineGap 12f, drift 0.02 (scale over hold), exitAt (6f rise+blur out) */
  EM.headline = function (host, o) {
    o = Object.assign({ tag: null, lines: [["Headline"]], accent: [], x: 120, y: 420, fs: 150, lh: 1.02, font: EM.FONT.ui, weight: 600,
      ls: "-0.03em", ink: EM.C.inkDeep, muted: EM.C.muted, at: 0, stagger: 3, lineGap: 4, drift: 0.02, holdTo: 90, exitAt: null, bg: EM.C.type }, o || {});
    if (o.bg) host.style.background = o.bg;
    const g = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:" + o.x + "px " + o.y + "px;");
    let tagE = null;
    if (o.tag) tagE = el("div", g, T(EM.FONT.mono, 28, 500, "0.08em") + "text-transform:uppercase;color:" + o.muted + ";left:" + o.x + "px;top:" + (o.y - 70) + "px;", o.tag);
    const words = []; let k = 0;
    o.lines.forEach((ln, li) => {
      let x = o.x; const sp = measure("a b", o.font, o.fs, o.weight, o.ls) - measure("ab", o.font, o.fs, o.weight, o.ls);
      ln.forEach((w, wi) => {
        const e = el("div", g, T(o.font, o.fs, o.weight, o.ls), w);
        const at = o.at + k * o.stagger + li * o.lineGap;
        words.push({ e, x, y: o.y + li * o.fs * o.lh, at, base: o.accent.indexOf(w) >= 0 ? EM.C.accent : o.ink });
        x += measure(w, o.font, o.fs, o.weight, o.ls) + sp; k++;
      });
    });
    return { render(f) {
      const drift = 1 + o.drift * sine(clamp((f - o.at) / Math.max(1, o.holdTo - o.at)));
      let ex = 0; if (o.exitAt != null && f >= o.exitAt) ex = clamp((f - o.exitAt) / 6);
      g.style.transform = "scale(" + drift.toFixed(5) + ") translateY(" + (-40 * ex * ex).toFixed(2) + "px)";
      g.style.filter = ex > 0 ? "blur(" + (12 * ex).toFixed(2) + "px)" : "none"; g.style.opacity = 1 - ex;
      if (tagE) { const a = f - o.at + 2; tagE.style.opacity = clamp((a + 1) / 3); tagE.style.transform = "translate(0," + (10 * Math.pow(0.75, Math.max(0, a))).toFixed(2) + "px)"; }
      words.forEach((w) => {
        const age = f - w.at; w.e.style.display = age >= 0 ? "block" : "none"; if (age < 0) return;
        w.e.style.color = age < 4 ? EM.C.accent : mix(EM.C.accent, w.base, (age - 4) / 3);
        w.e.style.opacity = clamp((age + 1) / 2);
        w.e.style.transform = "translate(" + w.x + "px," + (w.y + 18 * Math.pow(1 - SNAP, age + 1)).toFixed(2) + "px)";
      });
    } };
  };

  /* 10) UI CARD — a REAL capture (img src or an existing node, e.g. a framework-owned <video> wrapper) as a rounded card.
   *     Enters with the floaty 3D settle, holds with a slow push, can punch into a focus rect (snappy, one way only —
   *     never zoom back out), and can drive a cursor with click pulses on given frames.
   *     o: src|node, w,h (source px of the capture crop), fit 0.78 (fraction of 1920 at rest), radius 20,
   *        enter:"settle"|"rise"|"none", focus:{at, rect:[x,y,w,h] in capture px, zoom (fraction of frame the rect fills, default 0.7)},
   *        cursor:[{f, x, y, click:true}] (capture px), cursorStyle "arrow"|"touch", cursorScale 1.6, push 0.025 over holdTo.
   *     Phone screens: pass the simulator recording as node, w/h = its pixel size, fit ≈0.3, radius ≈56. */
  EM.uiCard = function (host, o) {
    o = Object.assign({ src: null, node: null, w: 1600, h: 1000, fit: 0.78, radius: 20, enter: "settle", focus: null, cursor: null,
      push: 0.025, holdTo: 120, cx: 960, cy: 540, cursorScale: 1.6, bg: EM.C.paper }, o || {});
    if (o.bg) host.style.background = o.bg;
    host.style.perspective = "2400px";
    const s0 = Math.min(1920 * o.fit / o.w, 1080 * 0.86 / o.h);
    const card = el("div", host, ABS + "width:" + o.w + "px;height:" + o.h + "px;border-radius:" + (o.radius / s0) + "px;overflow:hidden;transform-origin:0 0;background:" + EM.C.surface + ";box-shadow:" + shadow(0.08, 0.18) + ";");
    if (o.node) { o.node.style.display = "block"; card.appendChild(o.node); }
    else if (o.src) el("img", card, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;").src = o.src;
    let cur = null, ring = null;
    const touch = o.cursorStyle === "touch"; // mobile: a soft finger disc instead of an arrow (simulators draw no touches)
    if (o.cursor) { cur = el("div", host, ABS + "transform-origin:" + (touch ? "0 0" : "2px 2px") + ";z-index:3;");
      cur.innerHTML = touch ? '<div style="width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:rgba(' + EM.C.shadowRGB + ',.28);box-shadow:0 0 0 3px rgba(255,255,255,.7)"></div>' : CURSOR(EM.C.inkDeep, "#fff");
      ring = el("div", host, ABS + "width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:" + EM.C.accent + ";opacity:0;z-index:2;"); }
    const curAt = (f) => { // piecewise snappy approach between cursor keys
      const K = o.cursor; if (f <= K[0].f) return [K[0].x, K[0].y];
      for (let i = 1; i < K.length; i++) if (f < K[i].f) { const a = K[i - 1], p = appr(f, a.f, SNAP); return [lerp(a.x, K[i].x, p), lerp(a.y, K[i].y, p)]; }
      const a = K[K.length - 2] || K[0], b = K[K.length - 1], p = appr(f, a.f, SNAP); return [lerp(a.x, b.x, p), lerp(a.y, b.y, p)];
    };
    return { render(f) {
      // rest transform: centre the card at scale s0, then slow push
      let s = s0 * (1 + o.push * sine(clamp(f / o.holdTo))), fx = o.w / 2, fy = o.h / 2;
      if (o.focus && f >= o.focus.at) { // one-way punch into the focus rect
        const r = o.focus.rect, p = appr(f, o.focus.at, SNAP), sz = Math.min(1920 * (o.focus.zoom || 0.7) / r[2], 1080 * (o.focus.zoom || 0.7) / r[3]);
        s = lerp(s, sz * (1 + 0.01 * sine(clamp((f - o.focus.at) / 60))), p); fx = lerp(fx, r[0] + r[2] / 2, p); fy = lerp(fy, r[1] + r[3] / 2, p);
      }
      let rx = 0, ry = 0, z = 1, blur = 0, ty = 0, op = 1;
      if (o.enter === "settle") { const q = 1 - E(FLOAT, f); rx = 12 * q; ry = -10 * q; z = 1 + 0.06 * q; blur = 10 * q * q; op = clamp((f + 1) / 3); }
      if (o.enter === "rise") { const q = 1 - E(SNAP, f); ty = 120 * q; blur = 8 * q * q; op = clamp((f + 1) / 3); }
      const S = s * z, tx = o.cx - fx * S, tY = o.cy - fy * S + ty;
      card.style.transform = "translate(" + tx.toFixed(2) + "px," + tY.toFixed(2) + "px) rotateX(" + rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg) scale(" + S.toFixed(5) + ")";
      card.style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none"; card.style.opacity = op;
      if (cur) {
        const [x, y] = curAt(f), X = tx + x * S, Y = tY + y * S; let press = 1, rp = 0;
        o.cursor.forEach((k) => { if (k.click && f >= k.f && f < k.f + 9) { const a = f - k.f; press = Math.min(press, a < 2 ? 0.86 : 0.86 + 0.14 * E(0.35, a - 2)); rp = Math.max(rp, 1 - a / 9); } });
        cur.style.transform = "translate(" + X.toFixed(2) + "px," + Y.toFixed(2) + "px) scale(" + (press * o.cursorScale).toFixed(4) + ")";
        cur.style.opacity = f < o.cursor[0].f - 6 ? 0 : 1;
        ring.style.opacity = (0.35 * rp).toFixed(3); ring.style.transform = "translate(" + X.toFixed(2) + "px," + Y.toFixed(2) + "px) scale(" + (0.4 + 0.9 * (1 - rp)).toFixed(3) + ")";
      }
    } };
  };

  /* 11) TERMINAL — a real command and its REAL output (paste from your own run; never invent output).
   *     o: lines:[{cmd:"npx acme init"} | {out:"✓ created acme.config.ts", color}], at 0, cps 0.8 (chars per source frame
   *        while typing a cmd), outGap 3 (frames between output lines), fs 40, w 1500, title "~/project" */
  EM.terminal = function (host, o) {
    o = Object.assign({ lines: [], at: 0, cps: 0.8, outGap: 3, cmdPause: 8, fs: 44, w: 1500, h: null, prompt: "$", title: null,
      bg: EM.C.paper, term: EM.C.dark, ink: EM.C.onDark, dim: EM.C.mutedDark, enter: "settle", push: 0.02, holdTo: 150 }, o || {});
    if (o.bg) host.style.background = o.bg;
    const lh = o.fs * 1.45, top0 = o.title ? 96 : 52;
    if (!o.h) o.h = Math.round(top0 + o.lines.length * lh + 56); // card hugs its content: no dead terminal space
    const card = el("div", host, ABS + "width:" + o.w + "px;height:" + o.h + "px;border-radius:22px;overflow:hidden;background:" + o.term + ";box-shadow:" + shadow(0.1, 0.24) + ";transform-origin:50% 50%;");
    if (o.title) el("div", card, T(EM.FONT.mono, 26, 500, "0") + "left:40px;top:30px;color:" + o.dim + ";", o.title);
    let t = o.at; const rows = [];
    o.lines.forEach((ln, i) => {
      const y = top0 + i * lh;
      if (ln.cmd != null) {
        const p = el("div", card, T(EM.FONT.mono, o.fs, 500, "0") + "left:48px;top:" + y + "px;color:" + EM.C.accentLight + ";", o.prompt);
        const tx = el("div", card, T(EM.FONT.mono, o.fs, 500, "0") + "left:" + (48 + 1.3 * o.fs) + "px;top:" + y + "px;color:" + o.ink + ";");
        const car = el("div", card, ABS + "width:" + 0.55 * o.fs + "px;height:" + 1.1 * o.fs + "px;top:" + (y + 0.05 * o.fs) + "px;background:" + EM.C.accent + ";");
        const cw = []; for (let n = 0; n <= ln.cmd.length; n++) cw[n] = n ? measure(ln.cmd.slice(0, n), EM.FONT.mono, o.fs, 500, "0") : 0;
        rows.push({ kind: "cmd", p, tx, car, cw, text: ln.cmd, at: t, end: t + ln.cmd.length / o.cps });
        t += ln.cmd.length / o.cps + o.cmdPause;
      } else {
        const e = el("div", card, T(EM.FONT.mono, o.fs, 400, "0") + "left:48px;top:" + y + "px;color:" + (ln.color || o.dim) + ";", ln.out);
        rows.push({ kind: "out", e, at: t }); t += o.outGap;
      }
    });
    const lastCmd = rows.filter((r) => r.kind === "cmd").pop();
    return { duration: t, render(f) {
      const q = o.enter === "settle" ? 1 - E(FLOAT, f) : 0, z = 1 + 0.05 * q + o.push * sine(clamp(f / o.holdTo));
      card.style.transform = "translate(" + (960 - o.w / 2) + "px," + (540 - o.h / 2 + 60 * q) + "px) rotateX(" + (10 * q).toFixed(3) + "deg) scale(" + z.toFixed(5) + ")";
      card.style.filter = q > 0.01 ? "blur(" + (8 * q * q).toFixed(2) + "px)" : "none"; card.style.opacity = clamp((f + 1) / 3);
      rows.forEach((r) => {
        if (r.kind === "cmd") {
          const on = f >= r.at; r.p.style.display = r.tx.style.display = on ? "block" : "none";
          const n = clamp(Math.floor((f - r.at) * o.cps), 0, r.text.length); r.tx.textContent = r.text.slice(0, n);
          // caret: solid, visible while typing and until the next row starts (the last caret stays)
          const next = rows[rows.indexOf(r) + 1], live = on && (!next || f < next.at || r === lastCmd && f < r.end + 20);
          r.car.style.display = live ? "block" : "none"; r.car.style.left = (48 + 1.3 * o.fs + r.cw[n] + 4) + "px";
        } else { const a = f - r.at; r.e.style.display = a >= 0 ? "block" : "none"; r.e.style.opacity = clamp((a + 1) / 3); r.e.style.transform = "translateY(" + (8 * Math.pow(1 - SNAP, Math.max(0, a))).toFixed(2) + "px)"; }
      });
    } };
  };

  /* 12) SPLIT — two real captures side by side (before/after, A vs B, manual vs product). The seam travels to
   *     `reveal` with the snappy curve, labels are screen-locked pills. o: a:{src|node,label}, b:{src|node,label},
   *     at 0, from 0.5, to 0.5 (seam x as a fraction), seamAt 12, vs:true */
  EM.split = function (host, o) {
    o = Object.assign({ a: {}, b: {}, from: 0.5, to: 0.5, seamAt: 12, vs: false, gap: 0, pillBg: EM.C.inkDeep, push: 0.02, holdTo: 90, bg: EM.C.paper }, o || {});
    if (o.bg) host.style.background = o.bg;
    const mk = (side) => { const w = el("div", host, ABS + "width:1920px;height:1080px;overflow:hidden;"), inner = el("div", w, ABS + "width:1920px;height:1080px;transform-origin:960px 540px;");
      if (side.node) { side.node.style.display = "block"; inner.appendChild(side.node); } else if (side.src) el("img", inner, "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;").src = side.src;
      let p = null; if (side.label) p = el("div", host, T(EM.FONT.ui, 30, 600, "0") + "padding:12px 22px;border-radius:10px;color:#fff;background:" + (side.hue || o.pillBg) + ";z-index:2;", side.label);
      return { w, inner, p }; };
    const A = mk(o.a), B = mk(o.b);
    // "vs" badge sits on the seam on a canvas-coloured disc so it reads over any footage
    let vs = null; if (o.vs) { vs = el("div", host, ABS + "width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:50%;background:" + EM.C.paper + ";box-shadow:" + shadow(0.1, 0.22) + ";z-index:3;display:flex;align-items:center;justify-content:center;");
      el("div", vs, "font:400 64px/1 " + EM.FONT.head + ";letter-spacing:-0.02em;color:" + EM.C.inkDeep + ";margin-top:-6px;", "vs"); }
    return { render(f) {
      const x = 1920 * lerp(o.from, o.to, appr(f, o.seamAt, SNAP)), z = 1 + o.push * sine(clamp(f / o.holdTo));
      A.w.style.clipPath = "inset(0 " + (1920 - x + o.gap / 2).toFixed(1) + "px 0 0)"; B.w.style.clipPath = "inset(0 0 0 " + (x + o.gap / 2).toFixed(1) + "px)";
      // each pane shows its footage centred in its own half (not the left/right half of a full-frame clip)
      A.inner.style.transform = "translateX(" + (x / 2 - 960).toFixed(1) + "px) scale(" + z.toFixed(5) + ")";
      B.inner.style.transform = "translateX(" + (x / 2).toFixed(1) + "px) scale(" + z.toFixed(5) + ")";
      const pin = (p, px, d) => { if (!p) return; const a = f - d; p.style.opacity = clamp((a + 1) / 3); p.style.transform = "translate(" + px.toFixed(1) + "px," + (48 + 12 * Math.pow(1 - SNAP, Math.max(0, a))).toFixed(1) + "px)"; };
      pin(A.p, 48, 2); pin(B.p, x + 48, 4);
      if (vs) { const a = f - 6; vs.style.opacity = clamp((a + 1) / 3); vs.style.transform = "translate(" + x.toFixed(1) + "px,540px) scale(" + (1 + 0.4 * Math.pow(1 - SNAP, Math.max(0, a))).toFixed(4) + ")"; }
    } };
  };

  /* 13) COUNTER — a REAL number from your captures rolls up (snappy), then holds with a drift. o: value 10486, at 0,
   *     prefix "", suffix "", label, fs 260, x 120, y 380, locale "en-US" */
  EM.counter = function (host, o) {
    o = Object.assign({ value: 0, at: 0, prefix: "", suffix: "", label: null, fs: 260, x: 120, y: 380, locale: "en-US", k: 0.16, drift: 0.02, holdTo: 90, bg: EM.C.type }, o || {});
    if (o.bg) host.style.background = o.bg;
    const g = el("div", host, ABS + "width:1920px;height:1080px;transform-origin:" + o.x + "px " + o.y + "px;");
    const n = el("div", g, T(EM.FONT.ui, o.fs, 600, "-0.04em") + "left:" + o.x + "px;top:" + o.y + "px;color:" + EM.C.inkDeep + ";font-variant-numeric:tabular-nums;");
    let lab = null; if (o.label) lab = el("div", g, T(EM.FONT.ui, 56, 500) + "left:" + (o.x + 8) + "px;top:" + (o.y + o.fs * 1.02) + "px;color:" + EM.C.muted + ";", o.label);
    const fmt = new Intl.NumberFormat(o.locale);
    return { render(f) {
      const p = appr(f, o.at, o.k), v = f >= o.at + 40 ? o.value : Math.round(o.value * p);
      n.textContent = o.prefix + fmt.format(v) + o.suffix; n.style.color = f - o.at < 40 ? EM.C.inkDeep : (f - o.at < 44 ? EM.C.accent : mix(EM.C.accent, EM.C.inkDeep, (f - o.at - 44) / 4));
      g.style.transform = "scale(" + (1 + o.drift * sine(clamp((f - o.at) / o.holdTo))).toFixed(5) + ")";
      n.style.opacity = clamp((f - o.at + 1) / 3);
      if (lab) { const a = f - o.at - 6; lab.style.opacity = clamp((a + 1) / 3); lab.style.transform = "translateY(" + (12 * Math.pow(1 - SNAP, Math.max(0, a))).toFixed(2) + "px)"; }
    } };
  };

  /* =====================================================================================================
   * FILM DRIVER + POST CAMERA (vo/final_refined.py): one paused timeline, hard cuts between segments,
   * per-segment speed (source frames per output frame), post zoom on `cam`:
   *   scale = 1 + sum(amp * exp(-(t-P)/tau) for hits P<=t) + push * clamp((t-pushFrom)/(pushTo-pushFrom))
   *   demo_en2: amp 0.02, tau 0.25s, hits at the dark-cut thump (11.10), the section thump (14.77) and the
   *   end-card thump (25.27); push 5% from 26.31 to 28.75.
   * ===================================================================================================== */
  EM.film = function (o) {
    const segs = o.segments.map((s) => Object.assign({ speed: 1, from: 0 }, s));
    const post = Object.assign({ hits: [], amp: 0.02, tau: 0.25, push: 0, pushFrom: 0, pushTo: 1 }, o.post || {});
    let lastIdx = -1;
    function render(t) {
      let idx = -1;
      segs.forEach((s, i) => { if (t >= s.start - 1e-6 && t < s.start + s.dur - 1e-6) idx = i; });
      if (idx < 0 && t >= segs[segs.length - 1].start) idx = segs.length - 1;
      if (idx !== lastIdx) { segs.forEach((s, i) => { s.host.style.visibility = i === idx ? "visible" : "hidden"; s.host.style.display = i === idx ? "block" : "none"; }); lastIdx = idx; }
      if (idx >= 0) { const s = segs[idx]; const of = Math.round((t - s.start) * EM.FPS * 1000) / 1000; s.render(s.from + of * s.speed); }
      if (o.cam) {
        let z = 1; post.hits.forEach((P) => { if (t >= P - 1e-3) z += post.amp * Math.exp(-(t - P) / post.tau); });
        if (post.push) z += post.push * clamp((t - post.pushFrom) / (post.pushTo - post.pushFrom));
        o.cam.style.transform = "scale(" + z.toFixed(5) + ")";
      }
    }
    const tl = gsap.timeline({ paused: true });
    const drv = { t: 0 };
    tl.to(drv, { t: o.duration, duration: o.duration, ease: "none", onUpdate: () => render(drv.t) }, 0);
    render(0);
    window.__timelines[o.id] = tl;
    return tl;
  };

  g.EM = EM;
})(window);
