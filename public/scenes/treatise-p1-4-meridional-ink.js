// A Treatise on the Astrolabe, Part I, 4: "This moder is devyded on the bak-half with a lyne, that cometh
// dessendinge fro the ring down to the nethereste bordure. The whiche lyne, fro the for-seide ring un-to the centre
// of the large hole amidde, is cleped the south lyne, or elles the lyne meridional. And the remenant of this lyne
// downe to the bordure is cleped the north lyne, or elles the lyne of midnight."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The back, hanging plumb from its ring as in I 1.  A line comes down from the ring to the hole in the middle: the
// south line, in black; the hole is marked; the line goes on down to the lowest border: the north line, in red.
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-4-meridional.js: shared lib/back-ink.js (our
// constructed drawing of Oxford inv. 47869, cut and washed by lib/woodcut.js).  Original line work.

import { back, node, label, f, NIGHT, SILVER, HOLE, T } from "./lib/back-ink.js";

const instances = new WeakMap();
const LOOP = 11000;
const STILL = 8000; // ms: both lines drawn and named
const C = { x: 0, y: 26, k: 0.64 }; // as I 1: the instrument hung plumb in the glass
const W = (px) => f(px / C.k); // stroke widths in window units
const TOP = -143; // where the line leaves the ring (instrument units)

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const b = back(g, { scale: C.k });
  // the two halves of the one line, each drawn from the top down (pathLength 1: the dash shows how much is drawn)
  const line = (y0, y1, stroke, w) =>
    node("path", { d: `M0 ${y0}V${y1}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke, "stroke-width": W(w), "stroke-linecap": "round" }, b.g);
  const south = line(TOP, -HOLE, "currentColor", 2.2);
  const north = line(HOLE, T.border, SILVER, 2.2);
  const hole = node("circle", { r: f(HOLE + 2.5), fill: "none", stroke: SILVER, "stroke-width": W(1.4), opacity: 0 }, b.g);
  const ys = (y) => C.y + C.k * y;
  const labels = [label(svg, 7, ys(-58), "south", 15, "start"), label(svg, 7, ys(58), "north", 15, "start")];
  labels[0].setAttribute("fill", "currentColor");
  el.appendChild(svg);
  const s = { ring: b.ring, south, north, hole, labels, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 10.0, 10.8); // fade away before the loop begins again
  s.ring.setAttribute("opacity", f((0.25 + 0.75 * span(t, 0.4, 1.0) * (1 - span(t, 2.0, 3.0)) + 0.25 * span(t, 2.0, 3.0)) * out));
  s.south.setAttribute("stroke-dashoffset", f(1 - span(t, 1.2, 3.4)));
  s.south.setAttribute("opacity", f(out));
  const at = span(t, 3.4, 3.8) * (1 - 0.6 * span(t, 4.2, 4.8));
  s.hole.setAttribute("opacity", f(at * out));
  s.hole.setAttribute("r", f(HOLE + 2.5 + 3 * (1 - span(t, 3.4, 4.0))));
  s.north.setAttribute("stroke-dashoffset", f(1 - span(t, 4.6, 6.6)));
  s.north.setAttribute("opacity", f(out));
  s.labels[0].setAttribute("opacity", f(span(t, 2.6, 3.4) * out));
  s.labels[1].setAttribute("opacity", f(span(t, 6.0, 6.8) * out));
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
