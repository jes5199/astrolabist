// A Treatise on the Astrolabe, Part I, 1: "Thyn Astrolabie hath a ring to putten on the thoumbe of thy right
// hand in taking the heighte of thinges."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The instrument hangs by its ring from a peg (the thumb's place), swings as a thing hung does, and comes to
// rest plumb; the ring shows silver.  Outlines of our constructed drawing of Oxford inv. 47869 (shared module);
// the plate is computed.  Original line work; nothing is traced.

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

const LOOP = 14000;
const C = { x: 0, y: 26, k: 0.64 };
const PIVOT = -181; // where the ring bears on the thumb, instrument units above the centre
const SWING = 13; // degrees

export function mount(el) {
  if (instances.has(el)) return;
  const uid = "p-" + Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const hang = node("g", {}, g);
  throne(hang, ["base", "boss", "stem", "shackle"]);
  limb(hang);
  plate(hang, uid, 10);
  rete(node("g", { transform: `rotate(${A.morning.rot})` }, hang));
  node("circle", { r: 4.2, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.8, ...NSS }, hang);
  node("path", { d: A.throneFront.ring, fill: "none", stroke: "currentColor", "stroke-width": 0.8, ...NSS }, hang);
  const ring = node("path", { d: A.throneFront.ring, fill: "none", stroke: SILVER, "stroke-width": 1.6, ...NSS }, hang);
  // the peg it hangs on
  node("line", { x1: -9, y1: PIVOT + 2.2, x2: 9, y2: PIVOT + 2.2, stroke: SILVER, "stroke-width": 2.6, "stroke-linecap": "round", ...NSS }, g);
  el.appendChild(svg);
  const s = { hang, ring, raf: 0, t0: 0, tm: LOOP * 0.8 };
  instances.set(el, s);
  draw(s, 0.8); // the still: at rest, plumb, the ring shown
}

function draw(s, u) {
  // let go from one side, the swing dying away; at rest for the last third
  const x = Math.min(1, u / 0.62);
  const a = SWING * Math.exp(-3.6 * x) * Math.cos(x * Math.PI * 7) * (1 - span(x, 0.85, 1)) * (1 - span(u, 0.95, 1)) + SWING * span(u, 0.95, 1);
  s.hang.setAttribute("transform", `rotate(${f(a)} 0 ${PIVOT})`);
  s.ring.setAttribute("opacity", f(0.35 + 0.65 * span(u, 0.62, 0.7) * (1 - span(u, 0.92, 0.97))));
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
