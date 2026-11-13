// A Treatise on the Astrolabe, Part I, 13: "Thanne hastow a brood Rewle, that hath on either ende a square plate
// perced with a certein holes, some more and some lesse, to resseyven the stremes of the sonne by day, and eek by
// mediacioun of thyn eye, to knowe the altitude of sterres by nighte."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The rule seen a little from the side and above, so that its two sights show their faces: a broad bar, a square
// plate standing up at each end, each pierced with a larger hole and a smaller.  The plates rise; by day a sunbeam
// comes down the rule through both larger holes and makes a spot of light beyond; by night the eye at the lower
// plate's small hole sees a star through the upper one.  Proportions of the rule and the sights' places from our
// drawing of inv. 47869 (shared module); the holes' sizes are not recorded, so they are shown only as larger and
// smaller.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 14000;
const STILL = 4600; // ms: the sunbeam through both sights
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const SUN = "#f6d77a";
const RAD = Math.PI / 180;
const ALT = 25.5; // the rule tilted at Chaucer's altitude of the sun (II 2)
const U = [Math.cos(ALT * RAD), -Math.sin(ALT * RAD)]; // along the rule, up towards the sun
const N = [-Math.sin(ALT * RAD), -Math.cos(ALT * RAD)]; // square to it in the plane of the back: its breadth
// toward us, off the back (the way the sights stand), as seen from a little below and along the rule
const Z = [0.72 * U[0] + 0.3 * N[0], 0.72 * U[1] + 0.3 * N[1]];
const HALF = 84; // half the rule's length, window units
const WIDE = 2 * A.alidade.read.width * HALF; // the rule's breadth (the drawing gives its half-width)
const AT = A.alidade.read.vane[0] * HALF; // where each sight stands from the middle
const SIDE = A.alidade.read.vane[1] * HALF; // a sight's side
const O = [-6, 4]; // the rule's middle in the window

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a point: s along the rule, h up off its face (toward us), d across its breadth (0 one edge, 1 the other)
const pt = (s, h, d) => [O[0] + U[0] * s + Z[0] * h + N[0] * (d - 0.5) * WIDE, O[1] + U[1] * s + Z[1] * h + N[1] * (d - 0.5) * WIDE];
const poly = (ps) => "M" + ps.map((p) => f(p[0]) + " " + f(p[1])).join("L") + "Z";
const HOLES = [
  { h: 0.66, r: 0.17 }, // the larger, for the sun (radius as a share of the plate's side)
  { h: 0.28, r: 0.08 }, // the smaller, for the eye and a star
];

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const sky = node("rect", { x: -120, y: -120, width: 240, height: 240, fill: NIGHT, opacity: 0 }, svg);
  // the rule: its face and its near edge
  const g = node("g", { stroke: "currentColor", "stroke-width": 1, "stroke-linejoin": "round" }, svg);
  node("path", { d: poly([pt(-HALF, 0, 0), pt(HALF, 0, 0), pt(HALF, -3, 0), pt(-HALF, -3, 0)]), fill: NIGHT, "fill-opacity": 0.8 }, g);
  node("path", { d: poly([pt(-HALF, 0, 0), pt(HALF, 0, 0), pt(HALF, 0, 1), pt(-HALF, 0, 1)]), fill: "currentColor", "fill-opacity": 0.14 }, g);
  node("circle", { cx: f(pt(0, 0, 0.5)[0]), cy: f(pt(0, 0, 0.5)[1]), r: 3, fill: NIGHT }, g); // the hole for the pin
  // the two sights, each a square plate standing on the face; drawn near one last
  const sight = (s) => {
    const p = node("g", {}, g);
    const face = node("path", { fill: NIGHT, "fill-opacity": 0.85 }, p);
    const holes = HOLES.map(() => node("path", { fill: "#000", stroke: "currentColor", "stroke-width": 0.6 }, p));
    return { s, face, holes };
  };
  const sights = [sight(-AT), sight(AT)];
  // the sunbeam, its spot; the star, the eye, the line of sight
  const beam = node("path", { stroke: SUN, "stroke-width": 2.4, "stroke-linecap": "round", fill: "none", opacity: 0 }, svg);
  const spot = node("circle", { r: 3.2, fill: SUN, opacity: 0 }, svg);
  const sun = node("g", { opacity: 0 }, svg);
  node("circle", { r: 9, fill: SUN }, sun);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: -12, x2: 0, y2: -16, stroke: SUN, "stroke-width": 1.6, "stroke-linecap": "round", transform: `rotate(${45 * i})` }, sun);
  const sight_line = node("path", { stroke: SILVER, "stroke-width": 0.8, "stroke-dasharray": "2 3", fill: "none", opacity: 0 }, svg);
  const star = node("path", { d: "M0 -6L1.4 -1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4 -1.4Z", fill: SILVER, opacity: 0 }, svg);
  const eye = node("g", { opacity: 0 }, svg);
  node("path", { d: "M-7 0Q0 -5 7 0Q0 5 -7 0Z", fill: "none", stroke: SILVER, "stroke-width": 1 }, eye);
  node("circle", { r: 2, fill: SILVER }, eye);
  el.appendChild(svg);
  const s = { sky, sights, beam, spot, sun, sight_line, star, eye, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// where a hole's centre is, on the sight at s raised by r (0..1)
const hole = (s, h, r) => pt(s, SIDE * h * r, 0.5);

function draw(s, t) {
  const out = 1 - span(t, 13.2, 13.9);
  const rise = span(t, 0.4, 1.8) * out + (1 - out) * 0; // the plates stand up
  for (const q of s.sights) {
    const h = SIDE * rise;
    q.face.setAttribute("d", poly([pt(q.s - 1.5, 0, 0), pt(q.s - 1.5, 0, 1), pt(q.s - 1.5, h, 1), pt(q.s - 1.5, h, 0)]));
    // each hole a circle on the plate's face (height along N, breadth along D), as the plate stands
    q.holes.forEach((e, i) => {
      const { h: hh, r } = HOLES[i];
      const ps = [];
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8;
        ps.push(pt(q.s - 1.5, SIDE * rise * (hh + r * Math.sin(a)), 0.5 + r * Math.cos(a) * (SIDE / WIDE)));
      }
      e.setAttribute("d", poly(ps));
    });
  }
  // by day: the sun, up the rule; its beam through both larger holes, the spot beyond
  const day = span(t, 2.2, 2.8) * (1 - span(t, 6.4, 7.0));
  const top = hole(AT - 1.5, HOLES[0].h, 1);
  const low = hole(-AT - 1.5, HOLES[0].h, 1);
  const sunAt = [top[0] + U[0] * 26, top[1] + U[1] * 26];
  s.sun.setAttribute("transform", `translate(${f(sunAt[0])} ${f(sunAt[1])})`);
  s.sun.setAttribute("opacity", f(day));
  const reach = span(t, 2.8, 3.8);
  const end = [low[0] - U[0] * 12, low[1] - U[1] * 12];
  const b = [sunAt[0] + (end[0] - sunAt[0]) * reach, sunAt[1] + (end[1] - sunAt[1]) * reach];
  s.beam.setAttribute("d", `M${f(sunAt[0])} ${f(sunAt[1])}L${f(b[0])} ${f(b[1])}`);
  s.beam.setAttribute("opacity", f(0.85 * day * span(t, 2.7, 2.9)));
  s.spot.setAttribute("cx", f(end[0]));
  s.spot.setAttribute("cy", f(end[1]));
  s.spot.setAttribute("opacity", f(day * span(t, 3.7, 4.0)));
  // by night: the glass darkens; the eye at the lower small hole, a star through the upper one
  const night = span(t, 7.2, 7.8) * out;
  s.sky.setAttribute("opacity", f(0.55 * night));
  const sTop = hole(AT - 1.5, HOLES[1].h, 1);
  const sLow = hole(-AT - 1.5, HOLES[1].h, 1);
  const starAt = [sTop[0] + U[0] * 26, sTop[1] + U[1] * 26];
  const eyeAt = [sLow[0] - U[0] * 14, sLow[1] - U[1] * 14];
  s.star.setAttribute("transform", `translate(${f(starAt[0])} ${f(starAt[1])})`);
  s.star.setAttribute("opacity", f(night));
  s.eye.setAttribute("transform", `translate(${f(eyeAt[0])} ${f(eyeAt[1])}) rotate(${f(-ALT)})`);
  s.eye.setAttribute("opacity", f(span(t, 8.0, 8.5) * out));
  s.sight_line.setAttribute("d", `M${f(eyeAt[0])} ${f(eyeAt[1])}L${f(starAt[0])} ${f(starAt[1])}`);
  s.sight_line.setAttribute("opacity", f(span(t, 8.8, 9.6) * out));
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
