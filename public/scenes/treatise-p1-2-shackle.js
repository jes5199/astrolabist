// A Treatise on the Astrolabe, Part I, 2: "This ring renneth in a maner turet, fast to the moder of thyn
// Astrolabie, in so rowm a space that hit desturbeth nat the instrument to hangen after his righte centre."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Close on the suspension.  The ring runs loosely in the shackle (the "turet"): the hand above tips it this
// way and that, and the body below does not follow; it hangs after its right centre, on the plumb line.
// Outlines of our constructed drawing of Oxford inv. 47869 (shared module).  Original line work; nothing traced.

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

const LOOP = 12000;
const K = 1.5;
const C = { x: 0, y: 215 }; // the instrument's centre, far below the window: we look at its top
const EYE = -146; // where the ring passes through the shackle, instrument units above the centre

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${K})` }, svg);
  // the plumb line through the ring's eye and the centre
  const plumb = node("line", { x1: 0, y1: EYE - 62, x2: 0, y2: 0, stroke: SILVER, "stroke-width": 0.7, "stroke-dasharray": "3 3", opacity: 0.6, ...NSS }, g);
  limb(g);
  throne(g, ["base", "boss", "stem"]);
  const ring = node("g", {}, g);
  node("path", { d: A.throneFront.ring, fill: "none", stroke: SILVER, "stroke-width": 1.5, ...NSS }, ring);
  // the thumb's place in the ring: a peg under its top
  node("line", { x1: -8, y1: EYE - 35, x2: 8, y2: EYE - 35, stroke: SILVER, "stroke-width": 3, "stroke-linecap": "round", ...NSS }, ring);
  const shackle = throne(g, ["shackle"]);
  el.appendChild(svg);
  const s = { ring, shackle, plumb, raf: 0, t0: 0, tm: LOOP * 0.25 };
  instances.set(el, s);
  draw(s, 0.25); // the still: the ring tipped to one side, the body plumb
}

function draw(s, u) {
  const a = 38 * Math.sin(u * 2 * Math.PI) + 6 * Math.sin(u * 6 * Math.PI);
  s.ring.setAttribute("transform", `rotate(${f(a)} 0 ${EYE})`);
  s.shackle.setAttribute("transform", `rotate(${f(a * 0.12)} 0 ${EYE + 6})`);
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
