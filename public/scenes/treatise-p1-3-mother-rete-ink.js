// A Treatise on the Astrolabe, Part I, 3: "The Moder of thyn Astrolabie is the thikkeste plate, perced with a large
// hole, that resseyveth in hir wombe the thinne plates compowned for diverse clymatz, and thy riet shapen in manere of a
// net or of a webbe of a loppe."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// STYLE SAMPLE (jes tg 17811; rougher, "more wood-cut", tg 17827): ink on vellum, in the spirit of the woodcut
// diagrams of the early printed astrolabe books: bold cut lines, a little irregular; close hatching cut in the same
// ink; solid black for the shadowed thickness; the parts drawn flat and apart and lettered; hand-coloured washes in
// vermilion, slate blue and ochre (jes tg 17836; lib/woodcut.js).  The parts named in words (jes tg 17871): mother,
// climate (Chaucer's "plates compowned for diverse clymatz"), rete; and the spider of the film's web shot (our own
// drawing, video/song/scenes.py spider()) lets itself down on its thread onto the rete, "a webbe of a loppe".  Our own
// drawing; nothing is copied from any printed plate.  The mother (a) with her hollow, a plate (b) with its circles,
// the rete (c): fanned apart, they slide together into one and part again.  Geometry from our constructed drawing of
// Oxford inv. 47869 (shared module).  Drawn in currentColor (the frame's ink), a second ink for hatching, the
// rubricator's red for the letters.  Transparent: the vellum shows through.

import A from "./lib/astrolabe-47869.js";
import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const RAD = Math.PI / 180;
const LOOP = 12000;
const STILL = 1200; // ms: apart and lettered
const K = 0.44; // instrument units to the window
// where each part's centre stands, apart and together
const APART = [
  [-36, -8],
  [8, 20],
  [42, 46],
];
const TOGETHER = [-8, 8];

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const W = (px) => f(px / K);
const circ = (r, cx = 0, cy = 0) => `M${f(cx)} ${f(cy - r)}A${f(r)} ${f(r)} 0 1 1 ${f(cx)} ${f(cy + r)}A${f(r)} ${f(r)} 0 1 1 ${f(cx)} ${f(cy - r)}Z`;
// a disc's thickness: the crescent of its edge showing below and to the right (the disc offset, less the disc)
const edge = (r, dx, dy) => circ(r, dx, dy) + circ(r);
function almucantar(h) {
  const den = Math.sin(A.plate.latitude * RAD) + Math.sin(h * RAD);
  return [(A.plate.equator * Math.cos(A.plate.latitude * RAD)) / den, (A.plate.equator * Math.cos(h * RAD)) / den];
}

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  // the cut: wobble and hatching in instrument units (the parts are drawn at scale K)
  const wc = woodcut(defs, { freq: 0.045, wobble: 3.2, seed: 11 });
  const H1 = wc.hatch(45, 5, 2.8); // the limb and the suspension
  const H2 = wc.hatch(-45, 3.8, 1.9); // the rete's metal
  const H3 = "currentColor"; // a part's thickness, its shadowed edge: solid black
  const ink = { stroke: "currentColor", "stroke-linejoin": "round" }; // no fill here: a part says its own
  const parts = [];
  // a part is a group placed by its centre; each has its edge, offset down-right, as its thickness
  const part = (draw) => {
    const g = node("g", {}, svg);
    const s = node("g", { transform: `scale(${K})`, filter: wc.rough }, g);
    draw(s);
    parts.push(g);
    return g;
  };
  // a: the mother: suspension, limb (hatched), the hollow, and her thickness
  part((s) => {
    node("path", { d: edge(100, 5, 6), fill: H3, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.14) }, s);
    for (const k of ["base", "boss", "stem", "shackle"]) node("path", wc.wash({ d: A.throneFront[k], fill: WASH.red }), s);
    node("path", wc.wash({ d: circ(100) + circ(A.frontRadii.hollow), "fill-rule": "evenodd", fill: WASH.ochre }), s);
    for (const k of ["base", "boss", "stem", "shackle"]) node("path", { d: A.throneFront[k], fill: H1, ...ink, "stroke-width": W(1.71) }, s);
    node("path", { d: A.throneFront.ring, fill: "none", ...ink, "stroke-width": W(2.09) }, s);
    node("path", { d: circ(100) + circ(A.frontRadii.hollow), fill: H1, "fill-rule": "evenodd", ...ink, "stroke-width": W(2.28) }, s);
    node("path", { d: circ(A.frontRadii.hollow), fill: "none", ...ink, "stroke-width": W(1.52) }, s);
    let d = "";
    for (let i = 0; i < 24; i++) {
      const a = i * 15 * RAD;
      d += `M${f(91 * Math.sin(a))} ${f(-91 * Math.cos(a))}L${f(99 * Math.sin(a))} ${f(-99 * Math.cos(a))}`;
    }
    node("path", { d, stroke: "currentColor", "stroke-width": W(1.14) }, s);
  });
  // b: a plate: its edge, thickness, the three circles, horizon and a few almucantars, the cross
  part((s) => {
    const r0 = A.plate.capricorn;
    node("path", { d: edge(r0, 4, 5), fill: H3, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.14) }, s);
    node("path", { d: circ(r0), fill: VELLUM, ...ink, "stroke-width": W(2.09) }, s);
    const cp = node("clipPath", { id: "pl" + uid }, s);
    node("path", { d: circ(r0) }, cp);
    const c = node("g", { "clip-path": `url(#pl${uid})` }, s);
    const [up0, rh] = almucantar(0);
    node("path", wc.wash({ d: circ(r0) + circ(rh, 0, -up0), "fill-rule": "evenodd", fill: WASH.blue }), c);
    node("path", wc.wash({ d: circ(A.plate.equator) + circ(A.plate.cancer), "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.55 }), c);
    for (const r of [A.plate.cancer, A.plate.equator]) node("path", { d: circ(r), fill: "none", ...ink, "stroke-width": W(0.95) }, c);
    for (const h of [0, 20, 40, 60, 80]) {
      const [up, r] = almucantar(h);
      node("path", { d: circ(r), transform: `translate(0 ${f(-up)})`, fill: "none", ...ink, "stroke-width": W(h ? 0.85 : 1.5) }, c);
    }
    node("path", { d: `M0 ${-r0}V${r0}M${-r0} 0H${r0}`, fill: "none", ...ink, "stroke-width": W(0.85) }, c);
  });
  // c: the rete: its metal hatched, its outline inked
  part((s) => {
    node("path", wc.wash({ d: A.rete, "fill-rule": "evenodd", fill: WASH.blue, transform: `rotate(${A.morning.rot})` }), s);
    node("path", wc.wash({ d: circ(53.6, 0, -22.3) + circ(42.6, 0, -22.3), "fill-rule": "evenodd", fill: WASH.red, transform: `rotate(${A.morning.rot})` }), s);
    node("path", { d: A.rete, transform: `rotate(${A.morning.rot})`, fill: H2, "fill-rule": "evenodd", ...ink, "stroke-width": W(1.52) }, s);
  });
  // the letters, in red
  const letters = ["mother", "climate", "rete"].map((ch, i) => {
    const t = node("text", { "text-anchor": ["middle", "start", "start"][i], "font-size": 18, "font-weight": 600, "letter-spacing": 0.5, fill: RED, "font-family": "inherit" }, svg);
    t.textContent = ch;
    return t;
  });
  // the spider: the film's (eight legs of two joints, a round head, an oval body), cut in ink, its body washed red;
  // it hangs on a thread from above the leaf
  const spider = node("g", {}, svg);
  const ws = woodcut(defs, { freq: 0.25, wobble: 0.45, seed: 37 }); // in window units: fine, for a small beast
  const thread = node("line", { x1: 0, y1: -260, x2: 0, y2: -2, stroke: "currentColor", "stroke-width": 0.6 }, spider);
  const bug = node("g", { filter: ws.rough }, spider);
  const SS = 0.46;
  let legs = "";
  for (const side of [-1, 1])
    for (let k = 0; k < 4; k++) {
      const a = ((-50 + k * 34) * Math.PI) / 180;
      legs += `M0 0L${f(side * 16 * SS * Math.cos(a))} ${f(16 * SS * Math.sin(a) - 6 * SS)}L${f(side * 26 * SS * Math.cos(a))} ${f(26 * SS * Math.sin(a) + 6 * SS)}`;
    }
  node("path", { d: legs, fill: "none", stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round", "stroke-linecap": "round" }, bug);
  node("ellipse", { cx: 0, cy: f(8 * SS), rx: f(8 * SS), ry: f(10 * SS), fill: "currentColor" }, bug);
  node("ellipse", ws.wash({ cx: 0, cy: f(8 * SS), rx: f(5.5 * SS), ry: f(7 * SS), fill: WASH.red, "fill-opacity": 0.9 }), bug);
  node("circle", { cy: f(-4 * SS), r: f(6 * SS), fill: "currentColor" }, bug);
  thread.setAttribute("filter", ws.rough);
  el.appendChild(svg);
  const s = { parts, letters, spider, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// where they stand: apart, together, apart again
function draw(s, t) {
  const u = span(t, 2.6, 5.4) * (1 - span(t, 8.6, 11.4));
  s.parts.forEach((g, i) => {
    const x = APART[i][0] + (TOGETHER[0] - APART[i][0]) * u;
    const y = APART[i][1] + (TOGETHER[1] - APART[i][1]) * u;
    g.setAttribute("transform", `translate(${f(x)} ${f(y)})`);
  });
  // the letters stand by their parts while they are apart
  const at = [
    [-1, -1],
    [1, -1],
    [1, 1],
  ];
  s.letters.forEach((l, i) => {
    // the words by their parts: mother under her ring, climate and rete to the right
    const off = [[-16, 72], [28, -22], [28, 34]][i];
    const x = APART[i][0] + (TOGETHER[0] - APART[i][0]) * u + off[0];
    const y = APART[i][1] + (TOGETHER[1] - APART[i][1]) * u + off[1];
    l.setAttribute("x", f(x));
    l.setAttribute("y", f(y));
    l.setAttribute("opacity", f(1 - u));
  });
  // the spider: down on its thread onto the rete (a little bounce), rides it while the parts close and open, and
  // climbs away before the round begins again
  const rx = APART[2][0] + (TOGETHER[0] - APART[2][0]) * u;
  const ry = APART[2][1] + (TOGETHER[1] - APART[2][1]) * u;
  const down = span(t, 0.1, 1.0) * (1 - span(t, 11.2, 11.9));
  const bob = 2.2 * Math.sin(Math.PI * span(t, 0.95, 1.35)) * (1 - span(t, 11.2, 11.9));
  s.spider.setAttribute("transform", `translate(${f(rx + 4)} ${f(ry - 16 - 150 * (1 - down) + bob)})`);
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
