// A Treatise on the Astrolabe, Part I, 3: "The Moder of thyn Astrolabie is the thikkeste plate, perced with a
// large hole, that resseyveth in hir wombe the thinne plates compowned for diverse clymatz, and thy riet
// shapen in manere of a net or of a webbe of a loppe."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The parts drawn apart, seen from the side: the mother with her hollow, two thin plates, the rete.  They go
// in one after another; then the whole turns to face us, the net over the plate.  Outlines of our constructed
// drawing of Oxford inv. 47869 (shared module); the plates are computed for two latitudes' worth of circles.
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const RAD = Math.PI / 180;
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const FAINT = "#a7b0d4";
const NSS = { "vector-effect": "non-scaling-stroke" };

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (u, a, b) => ease((u - a) / (b - a));
const rim = (deg, r) => [r * Math.sin(deg * RAD), -r * Math.cos(deg * RAD)];
function almucantar(alt) {
  const den = Math.sin(A.plate.latitude * RAD) + Math.sin(alt * RAD);
  return [(A.plate.equator * Math.cos(A.plate.latitude * RAD)) / den, (A.plate.equator * Math.cos(alt * RAD)) / den];
}

// the suspension, piece by piece: base, boss, stem, shackle; the ring separately
function throne(parent, pieces) {
  const g = node("g", { fill: NIGHT, "fill-opacity": 0.72, stroke: "currentColor", "stroke-width": 0.8, "stroke-linejoin": "round" }, parent);
  for (const k of pieces) node("path", { d: A.throneFront[k], ...NSS }, g);
  return g;
}
// the rim of the front: its circles and the 24 hour marks with the cross on the noon line
function limb(parent) {
  const R = A.frontRadii;
  const g = node("g", { fill: "none", stroke: "currentColor" }, parent);
  node("circle", { r: R.outer, fill: NIGHT, "fill-opacity": 0.72, "stroke-width": 1.2, ...NSS }, g);
  node("circle", { r: R.blocks, "stroke-width": 0.4, opacity: 0.7, ...NSS }, g);
  node("circle", { r: R.hollow, "stroke-width": 0.7, ...NSS }, g);
  let d = "";
  for (let i = 1; i < 24; i++) {
    const a = rim(15 * i, R.blocks + 1.6);
    const b = rim(15 * i, R.hours - 0.6);
    d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  const top = (R.blocks + R.hours) / 2;
  d += `M0 ${f(-top - 3)}V${f(-top + 3)}M-3 ${f(-top)}H3`;
  node("path", { d, "stroke-width": 0.9, "stroke-linecap": "round", opacity: 0.85, ...NSS }, g);
  return g;
}
// a plate: its edge, the tropics and equator, the horizon and the circles of altitude, the meridian
function plate(parent, uid, step) {
  const g = node("g", { fill: "none", stroke: FAINT }, parent);
  const r0 = A.plate.capricorn;
  node("circle", { r: r0 }, node("clipPath", { id: uid }, g));
  node("circle", { r: r0, fill: NIGHT, "fill-opacity": 0.8, stroke: "currentColor", "stroke-width": 0.6, ...NSS }, g);
  const c = node("g", { "clip-path": `url(#${uid})` }, g);
  for (const r of [A.plate.cancer, A.plate.equator])
    node("circle", { r: f(r), "stroke-width": 0.35, opacity: 0.5, "stroke-dasharray": "1.5 2.5", ...NSS }, c);
  for (let alt = 0; alt <= 80; alt += step) {
    const [up, r] = almucantar(alt);
    node("circle", { cy: f(-up), r: f(r), "stroke-width": alt ? 0.35 : 0.8, opacity: alt ? 0.55 : 0.9, ...NSS }, c);
  }
  node("path", { d: `M0 ${-r0}V${r0}M${-r0} 0H${r0}`, "stroke-width": 0.35, opacity: 0.5, ...NSS }, c);
  return g;
}
function rete(parent) {
  return node("path", { d: A.rete, fill: "currentColor", "fill-opacity": 0.2, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": 0.75, "stroke-linejoin": "round", ...NSS }, parent);
}

const LOOP = 20000;
const TILT = 64; // degrees: how far the instrument is turned away at the start
const APART = [0, 46, 84, 126]; // how far each part stands off the mother when drawn apart: mother, plate, plate, rete

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const layers = [];
  const layer = () => {
    const g = node("g", {}, svg);
    layers.push(g);
    return g;
  };
  const mother = layer();
  throne(mother, ["base", "boss", "stem", "shackle"]);
  node("path", { d: A.throneFront.ring, fill: "none", stroke: "currentColor", "stroke-width": 0.8, ...NSS }, mother);
  limb(mother);
  node("circle", { r: A.frontRadii.hollow, fill: "#050816", "fill-opacity": 0.55, stroke: "none" }, mother);
  plate(layer(), "a-" + uid, 20);
  plate(layer(), "b-" + uid, 10);
  const net = layer();
  rete(net);
  node("circle", { r: 4.2, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.8, ...NSS }, net);
  el.appendChild(svg);
  const s = { layers, raf: 0, t0: 0, tm: 0 };
  instances.set(el, s);
  draw(s, 0); // the still: the parts drawn apart
}

function draw(s, u) {
  const back = span(u, 0.9, 1); // the loop's end: apart again
  const inn = [0, span(u, 0.1, 0.24), span(u, 0.26, 0.4), span(u, 0.42, 0.56)]; // each part gone in
  const face = span(u, 0.6, 0.76) * (1 - back); // turned to face us
  const tilt = TILT * (1 - face) * RAD;
  const k = 0.55 + 0.05 * face;
  const gone = inn[3] * (1 - back);
  const cx = -31 * (1 - face) * (1 - 0.6 * gone);
  const cy = 22 + 4 * face;
  s.layers.forEach((g, i) => {
    const z = APART[i] * (1 - inn[i] * (1 - back)) + i * 1.5;
    g.setAttribute("transform", `translate(${f(cx + k * z * Math.sin(tilt))} ${f(cy)}) scale(${f(k * Math.cos(tilt))} ${f(k)})`);
  });
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, s.tm / LOOP);
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
  draw(s, s.tm / LOOP);
}
