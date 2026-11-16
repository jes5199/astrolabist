// A Treatise on the Astrolabe, Prologue: "I seye a certein of conclusiouns, for three causes.  The furste cause is
// this: truste wel that alle the conclusiouns that han ben founde ... ben un-knowe perfitly to any mortal man in this
// regioun ... A-nother cause is this; that sothly, in any tretis of the Astrolabie that I have seyn, there ben some
// conclusions that wole nat in alle thinges performen hir bihestes; and some of hem ben to harde to thy tendre age of
// ten yeer to conseyve.  This tretis ... wole I shewe thee under ful lighte rewles and naked wordes in English".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The three causes in one loop (jes tg 18066), replacing the three cause scenes.  COLOURED WOODCUT on vellum.  The
// instrument's back hangs throughout, a caption is always up, and over it a small line says which cause this is.
// First: out of the instrument the conclusions, numbered, spiral away past the edge of the leaf (more than anyone
// knows); they draw back in.  Second: an old treatise lies open, its rubric gives a setting; the rule is set as the
// book says, the sight goes out along it and misses the star; a red cross.  Third: the old book's writing crowds
// thicker (too hard at ten years old); it gives way to a slim book of a few plain lines, the rule is set again, and
// the sight finds the star.  Then the slim book goes as the numbers pour out again: never a bare leaf (tg 18016,
// 18021).  The books and their settings are illustrative; shared lib/back-ink.js; our own drawing.

import A from "./lib/astrolabe-47869.js";
import { back, node, f, label, RED, VELLUM, WASH } from "./lib/back-ink.js";
import { woodcut } from "./lib/woodcut.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 8800; // ms: the second cause: the sight gone out, the star missed, the cross
const RAD = Math.PI / 180;
const B = { x: 12, y: 22, k: 0.34 }; // the instrument's back
const SAYS = 40; // the old book's setting, degrees
const TRUE = 49; // where the star truly stands (the slim book's setting)
const REACH = 104;
const STAR = [B.x + REACH * Math.cos(TRUE * RAD), B.y - REACH * Math.sin(TRUE * RAD)];
const N = 260; // numbers drawn; beyond the leaf they go on unseen
const GOLDEN = 137.508;
// which cause, and what the caption says, by time: one line each, its words changed at a moment's dimming
const ACTS = [
  { at: 0, head: "the first cause", say: "more than anyone knows" },
  { at: 5.0, head: "the second cause", say: "some books break their promise" },
  { at: 10.2, head: "the third cause", say: "too hard at ten years old" },
  { at: 12.8, head: "the third cause", say: "plain words, in English" },
  { at: 17.6, head: "the first cause", say: "more than anyone knows" },
];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// where number n stands: a spiral out from the instrument's rim
const place = (n) => {
  const r = 38 + 5.6 * Math.sqrt(n);
  const a = (n * GOLDEN * Math.PI) / 180;
  return [B.x + r * Math.cos(a), B.y + r * Math.sin(a) * 0.92];
};

// a book open on the leaf, woodcut: two leaves of writing (rows per leaf), a block of pages under (thick), a wash
function book(svg, wc, x, y, w, h, rows, thick, wash) {
  const g = node("g", { filter: wc.rough, opacity: 0 }, svg);
  const m = w / 2;
  node("path", wc.wash({ d: `M${x - 3} ${y + 7}V${y + h + 4 + thick}H${x + w + 3}V${y + 7}`, fill: wash, "fill-opacity": 0.5 }), g);
  if (thick) {
    node("path", { d: `M${x} ${y + h}V${y + h + thick}H${x + w}V${y + h}`, fill: VELLUM, stroke: "currentColor", "stroke-width": 1.2 }, g);
    let p = "";
    for (let i = 1.5; i < thick; i += 1.6) p += `M${x + 1} ${y + h + i}H${x + w - 1}`;
    node("path", { d: p, stroke: "currentColor", "stroke-width": 0.5, opacity: 0.6 }, g);
  }
  node("path", { d: `M${x} ${y + 4}Q${x + m / 2} ${y} ${x + m} ${y + 4}V${y + h}Q${x + m / 2} ${y + h - 4} ${x} ${y + h}Z`, fill: VELLUM, stroke: "currentColor", "stroke-width": 1.4 }, g);
  node("path", { d: `M${x + m} ${y + 4}Q${x + m * 1.5} ${y} ${x + w} ${y + 4}V${y + h}Q${x + m * 1.5} ${y + h - 4} ${x + m} ${y + h}Z`, fill: VELLUM, stroke: "currentColor", "stroke-width": 1.4 }, g);
  const line = (rs, skip) => {
    let d = "";
    const gap = (h - 16) / (rs - 1);
    for (let i = 0; i < rs; i++) {
      const yy = y + 10 + i * gap;
      d += `M${x + 5} ${f(yy)}H${x + m - 5}`;
      if (!skip(i)) d += `M${x + m + 5} ${f(yy)}H${x + w - 5}`;
    }
    return d;
  };
  return { g, line };
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 1.0, seed: 43 });
  // the first cause: the conclusions, numbered
  const nums = [];
  for (let n = 1; n <= N; n++) {
    const [x, y] = place(n);
    const t = node("text", { x: f(x), y: f(y + 3), "text-anchor": "middle", "font-size": f(Math.max(4.4, 8.6 - n * 0.016)), "font-weight": 600, fill: "currentColor", opacity: 0, "font-family": "inherit" }, svg);
    t.textContent = n;
    nums.push({ e: t, keep: Math.min(1, Math.max(0, (64 - y) / 10), Math.max(0, (90 - Math.abs(x)) / 10), Math.max(0, (y + 88) / 10)) }); // none over the captions or past the leaf
  }
  // the old treatise: thick, close-written, its rubric the setting; and over its writing, more and closer
  const BX = -94;
  const BY = -92;
  const old = book(svg, wc, BX, BY, 80, 50, 0, 9, WASH.red);
  node("path", { d: old.line(8, (i) => i === 3), stroke: "currentColor", "stroke-width": 0.9, opacity: 0.75 }, old.g);
  const crowd = node("path", { d: old.line(15, () => false), stroke: "currentColor", "stroke-width": 0.7, opacity: 0 }, old.g);
  const rub = node("text", { x: BX + 60, y: BY + 27, "text-anchor": "middle", "font-size": 9, "font-weight": 700, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 2.5, "paint-order": "stroke" }, svg);
  rub.textContent = `alt. ${SAYS}°`; // the star's altitude, not a latitude (boss #48144)
  // the slim book: a few plain lines, its setting the true one
  const slim = book(svg, wc, BX + 8, BY + 6, 64, 40, 0, 2, WASH.blue);
  node("path", { d: slim.line(4, (i) => i === 1), stroke: "currentColor", "stroke-width": 1.3, opacity: 0.8 }, slim.g);
  const rub2 = node("text", { x: BX + 8 + 48, y: BY + 6 + 22, "text-anchor": "middle", "font-size": 9, "font-weight": 700, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 2.5, "paint-order": "stroke" }, svg);
  rub2.textContent = `alt. ${TRUE}°`;
  // the star, ochre, inked; the ring that lights when the sight finds it
  const star = node("path", { d: "M0 -7L1.8 -1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8 -1.8Z", transform: `translate(${f(STAR[0])} ${f(STAR[1])})`, fill: WASH.ochre, stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round", opacity: 0 }, svg);
  const found = node("circle", { cx: f(STAR[0]), cy: f(STAR[1]), r: 11, fill: "none", stroke: RED, "stroke-width": 1.8, opacity: 0 }, svg);
  // the instrument's back and its rule
  const g = node("g", { transform: `translate(${B.x} ${B.y}) scale(${B.k})` }, svg);
  const bk = back(g, { scale: B.k, ticks: true });
  const rule = node("g", { filter: bk.wc.rough }, g);
  node("path", { d: A.alidade.body, fill: VELLUM }, rule);
  node("path", bk.wc.wash({ d: A.alidade.body, fill: WASH.ochre, "fill-opacity": 0.85 }), rule);
  node("path", { d: A.alidade.body, fill: "none", stroke: "currentColor", "stroke-width": f(1.3 / B.k), "stroke-linejoin": "round" }, rule);
  for (const v of A.alidade.vanes) node("path", { d: v, fill: "currentColor" }, rule);
  node("circle", { r: 4.6, fill: VELLUM, stroke: "currentColor", "stroke-width": f(1.2 / B.k) }, g);
  const sight = node("line", { x1: B.x, y1: B.y, stroke: RED, "stroke-width": 1.2, "stroke-dasharray": "3 2.5", opacity: 0 }, svg);
  const cross = node("path", { d: `M${f(STAR[0] + 6)} ${f(STAR[1] - 4)}l8 8m0 -8l-8 8`, stroke: RED, "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0 }, svg);
  // which cause, small, in ink; the caption under it in red
  const head = node("text", { x: 0, y: 77, "text-anchor": "middle", "font-size": 9.5, "font-style": "italic", fill: "currentColor", "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const say = label(svg, 0, 92, "", 12.5);
  el.appendChild(svg);
  const s = { nums, old, crowd, rub, slim, rub2, star, found, rule, sight, cross, head, say, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  // the first cause: the numbers pour out one after another, faster and faster, and draw back in, the farthest first
  s.nums.forEach(({ e, keep }, i) => {
    const n = i + 1;
    const at = 0.05 + 3.4 * Math.sqrt(n / N);
    const home = 4.4 + 1.2 * (1 - Math.sqrt(n / N));
    const a = span(t, at, at + 0.35) * (1 - span(t, home, home + 0.3)) * Math.max(0.2, 1 - n / 300) * keep;
    e.setAttribute("opacity", f(a));
  });
  // the second: the old book, its setting, the rule set by it, the sight, the miss
  const oldIn = span(t, 4.8, 5.6) * (1 - span(t, 12.4, 13.2));
  s.old.g.setAttribute("opacity", f(oldIn));
  s.rub.setAttribute("opacity", f(span(t, 5.4, 5.9) * (1 - span(t, 10.2, 10.8))));
  s.star.setAttribute("transform", `translate(${f(STAR[0])} ${f(STAR[1])}) rotate(${f(12 * Math.sin(t * 2.1))}) scale(${f(1 + 0.1 * Math.sin(t * 3.3))})`);
  s.star.setAttribute("opacity", f(span(t, 5.2, 5.8) * (1 - span(t, 17.0, 17.8))));
  // the third: the old book's writing crowds; the slim book; the rule set again; the sight finds the star
  s.crowd.setAttribute("opacity", f(0.85 * span(t, 10.4, 11.4)));
  const slimIn = span(t, 12.6, 13.4) * (1 - span(t, 17.0, 17.8));
  s.slim.g.setAttribute("opacity", f(slimIn));
  s.rub2.setAttribute("opacity", f(span(t, 13.2, 13.7) * (1 - span(t, 16.9, 17.5))));
  // the rule: to the old setting, back, to the true one, back
  const a = t < 9 ? SAYS * span(t, 5.6, 6.8) : t < 12.8 ? SAYS * (1 - span(t, 10.2, 11.4)) : TRUE * span(t, 13.4, 14.6) * (1 - span(t, 16.8, 17.9));
  s.rule.setAttribute("transform", `rotate(${f(-a)})`);
  const sweep = t < 12 ? span(t, 7.0, 7.9) : span(t, 14.8, 15.6);
  const dir = t < 12 ? SAYS : TRUE;
  const reach = (t < 12 ? REACH * 1.03 : REACH - 9) * sweep;
  s.sight.setAttribute("x2", f(B.x + reach * Math.cos(dir * RAD)));
  s.sight.setAttribute("y2", f(B.y - reach * Math.sin(dir * RAD)));
  s.sight.setAttribute("opacity", f(sweep > 0 ? (t < 12 ? 1 - span(t, 10.0, 10.5) : 1 - span(t, 16.8, 17.3)) : 0));
  s.cross.setAttribute("opacity", f(span(t, 8.1, 8.5) * (1 - span(t, 10.0, 10.5))));
  s.found.setAttribute("opacity", f(span(t, 15.6, 16.0) * (1 - span(t, 16.8, 17.3))));
  // the captions: one line each, never gone and never doubled
  let k = 0;
  for (let i = 0; i < ACTS.length; i++) if (t >= ACTS[i].at) k = i;
  const near = Math.min(...ACTS.slice(1).map((c) => Math.abs(t - c.at)));
  const dip = Math.max(0, 1 - near / 0.3);
  s.head.textContent = ACTS[k].head;
  s.say.textContent = ACTS[k].say;
  s.say.setAttribute("opacity", f(1 - 0.5 * dip));
  s.head.setAttribute("opacity", f(0.85 * (1 - 0.5 * dip)));
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, s.tm / 1000);
    s.raf = requestAnimationFrame(step);
  };
  s.raf = requestAnimationFrame(step);
}

export function stop(el) {
  const s = instances.get(el);
  if (!s || !s.raf) return;
  cancelAnimationFrame(s.raf);
  s.raf = 0;
}

// for tests and stills: draw one moment of the loop without animating
export function seek(el, ms) {
  const s = instances.get(el);
  if (!s) return;
  s.tm = ((ms % LOOP) + LOOP) % LOOP;
  draw(s, s.tm / 1000);
}
