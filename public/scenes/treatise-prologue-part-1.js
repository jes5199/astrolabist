// A Treatise on the Astrolabe, the Prologue: "this tretis, divided in fyve parties" ... "The firste partie of this tretis shal reherse the figures and the membres of thyn Astrolabie."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Part I, the instrument's figures and members: the front (limb, rete, label) and its suspension drawn in, whole and gold, and held.
// The part's state is Skeat's (Oxford Chaucer vol. III, 1894, introduction to the Treatise): "Of Part i. we have the whole."
// One of five small scenes, one beside each part in the Prologue; drawn so that what was finished looks finished and
// what was never made stays a drawing that stops.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const FAINT = "#a7b0d4";
function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a path drawn in from its start: share u (0..1) of its length shown, up to `stop` (an unfinished drawing stops short)
function drawIn(el, u, stop = 1) {
  el.setAttribute("stroke-dasharray", "1 1");
  el.setAttribute("stroke-dashoffset", f(1 - Math.min(stop, u)));
}
const LOOP = 6500;
const STILL = 4000; // ms: drawn whole
const K = 0.62;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(0 6) scale(${K})`, fill: "none", stroke: "currentColor", "stroke-linejoin": "round" }, svg);
  const w = (px) => f((1.9 * px) / K); // bold: the window is small
  const parts = [];
  const add = (d, width, extra = {}) => parts.push(node("path", { d, pathLength: 1, "stroke-width": w(width), ...extra }, g));
  for (const k of ["ring", "shackle", "stem", "boss", "base"]) add(A.throneFront[k], 1);
  add("M0 -100A100 100 0 1 1 0 100A100 100 0 1 1 0 -100", 1.4);
  add(`M0 ${-A.frontRadii.hollow}A${A.frontRadii.hollow} ${A.frontRadii.hollow} 0 1 1 0 ${A.frontRadii.hollow}A${A.frontRadii.hollow} ${A.frontRadii.hollow} 0 1 1 0 ${-A.frontRadii.hollow}`, 0.8);
  add(A.rete, 0.8, { transform: `rotate(${A.morning.rot})`, fill: "currentColor", "fill-opacity": 0 });
  add(A.rule.d, 0.9, { stroke: SILVER, transform: "rotate(-60)" });
  const num = node("text", { x: 0, y: 93, "text-anchor": "middle", "font-size": 24, fill: "currentColor", "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", opacity: 0.95 }, svg);
  num.textContent = "I";
  el.appendChild(svg);
  const s = { parts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 5.8, 6.4);
  s.parts.forEach((p, i) => {
    drawIn(p, span(t, 0.2 + 0.25 * i, 1.4 + 0.25 * i));
    p.setAttribute("opacity", f(out));
  });
  // the rete's metal fills in once it is drawn
  s.parts[7].setAttribute("fill-opacity", f(0.18 * span(t, 3.0, 3.6) * out));
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
