// A Treatise on the Astrolabe, Prologue: "A-nother cause is this; that sothly, in any tretis of the Astrolabie that I
// have seyn, there ben some conclusions that wole nat in alle thinges performen hir bihestes".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The second cause, its first limb (jes tg 17876/17880).  COLOURED WOODCUT on vellum.  An old treatise lies open;
// its rubric gives a setting.  The rule on the instrument's back is set as the book says; the sight goes out along
// it, and misses the star.  A red cross: the conclusion does not keep its promise.  Shared lib/back-ink.js; our own
// drawing (the book and its setting are illustrative).

import A from "./lib/astrolabe-47869.js";
import { back, node, f, label, RED, VELLUM, WASH } from "./lib/back-ink.js";
import { woodcut } from "./lib/woodcut.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 8200; // ms: the sight gone out, the star missed, the cross
const RAD = Math.PI / 180;
const B = { x: -44, y: 48, k: 0.36 }; // the instrument's back
const SAYS = 40; // the book's setting, degrees
const TRUE = 49; // where the star truly stands
const REACH = 128;
const STAR = [B.x + REACH * Math.cos(TRUE * RAD), B.y - REACH * Math.sin(TRUE * RAD)];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 1.0, seed: 43 });
  // the book, open: two leaves, lines of writing, a red rubric with the setting
  const book = node("g", { filter: wc.rough, opacity: 0 }, svg);
  const BX = -92;
  const BY = -90;
  node("path", wc.wash({ d: `M${BX - 3} ${BY + 7}V${BY + 56}Q${BX + 40} ${BY + 50} ${BX + 83} ${BY + 56}V${BY + 7}`, fill: WASH.red, "fill-opacity": 0.5 }), book);
  node("path", { d: `M${BX} ${BY + 4}Q${BX + 20} ${BY} ${BX + 40} ${BY + 4}V${BY + 52}Q${BX + 20} ${BY + 48} ${BX} ${BY + 52}Z`, fill: VELLUM, stroke: "currentColor", "stroke-width": 1.4 }, book);
  node("path", { d: `M${BX + 40} ${BY + 4}Q${BX + 60} ${BY} ${BX + 80} ${BY + 4}V${BY + 52}Q${BX + 60} ${BY + 48} ${BX + 40} ${BY + 52}Z`, fill: VELLUM, stroke: "currentColor", "stroke-width": 1.4 }, book);
  let lines = "";
  for (let i = 0; i < 8; i++) {
    const y = BY + 12 + i * 4.6;
    lines += `M${BX + 5} ${y}H${BX + 35}`;
    if (i !== 3) lines += `M${BX + 45} ${y}H${BX + 75}`;
  }
  node("path", { d: lines, stroke: "currentColor", "stroke-width": 0.9, opacity: 0.75 }, book);
  const rub = node("text", { x: BX + 60, y: BY + 30, "text-anchor": "middle", "font-size": 9, "font-weight": 700, fill: RED, opacity: 0, "font-family": "inherit" }, svg);
  rub.textContent = `set at ${SAYS}°`;
  // the star, ochre, inked
  const star = node("path", { d: "M0 -7L1.8 -1.8L7 0L1.8 1.8L0 7L-1.8 1.8L-7 0L-1.8 -1.8Z", transform: `translate(${f(STAR[0])} ${f(STAR[1])})`, fill: WASH.ochre, stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round" }, svg);
  // the instrument's back, its rule, set as the book says
  const g = node("g", { transform: `translate(${B.x} ${B.y}) scale(${B.k})` }, svg);
  const bk = back(g, { scale: B.k, ticks: true });
  const rule = node("g", { filter: bk.wc.rough }, g);
  node("path", { d: A.alidade.body, fill: VELLUM }, rule);
  node("path", bk.wc.wash({ d: A.alidade.body, fill: WASH.ochre, "fill-opacity": 0.85 }), rule);
  node("path", { d: A.alidade.body, fill: "none", stroke: "currentColor", "stroke-width": f(1.3 / B.k), "stroke-linejoin": "round" }, rule);
  for (const v of A.alidade.vanes) node("path", { d: v, fill: "currentColor" }, rule);
  node("circle", { r: 4.6, fill: VELLUM, stroke: "currentColor", "stroke-width": f(1.2 / B.k) }, g);
  // the sight along the rule, and the cross by the star it misses
  const sight = node("line", { x1: B.x, y1: B.y, stroke: RED, "stroke-width": 1.2, "stroke-dasharray": "3 2.5", opacity: 0 }, svg);
  const cross = node("path", { d: `M${f(STAR[0] + 6)} ${f(STAR[1] - 4)}l8 8m0 -8l-8 8`, stroke: RED, "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0 }, svg);
  const c1 = label(svg, 0, 92, "the book's setting", 13);
  const c2 = label(svg, 0, 92, "it does not keep its promise", 13);
  el.appendChild(svg);
  const s = { book, rub, rule, sight, cross, c1, c2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 10.6, 11.4);
  s.book.setAttribute("opacity", f(span(t, 0.2, 0.8) * out));
  s.rub.setAttribute("opacity", f(span(t, 1.0, 1.5) * out));
  const a = SAYS * span(t, 2.0, 3.6) * (1 - span(t, 10.8, 11.8));
  s.rule.setAttribute("transform", `rotate(${f(-a)})`);
  const reach = REACH * 1.15 * span(t, 3.9, 5.0);
  s.sight.setAttribute("x2", f(B.x + reach * Math.cos(SAYS * RAD)));
  s.sight.setAttribute("y2", f(B.y - reach * Math.sin(SAYS * RAD)));
  s.sight.setAttribute("opacity", f(span(t, 3.8, 4.0) * out));
  s.cross.setAttribute("opacity", f(span(t, 5.3, 5.7) * out));
  s.c1.setAttribute("opacity", f(span(t, 1.2, 1.7) * (1 - span(t, 5.4, 5.8))));
  s.c2.setAttribute("opacity", f(span(t, 5.9, 6.4) * out));
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
