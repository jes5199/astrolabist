// A Treatise on the Astrolabe, Part II, 22: "I prove it thus by the latitude of Oxenford. Understond wel, that the
// heyghte of oure pool artik fro oure north orisonte is 51 degrees and 50 minutes; than is the senith from oure pool
// artik 38 degrees and 10 minutes; than is the equinoxial from oure senith 51 degrees and 50 minutes; than is oure south
// orisonte from oure equinoxial 38 degrees and 10 minutes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The sky cut through the meridian at Oxford, south on the left, north on the right: the horizon, the zenith overhead,
// the pole raised in the north, the equator square to it.  Chaucer's four arcs are drawn in his order, each with its
// measure: north horizon to the pole, the pole to the zenith, the zenith to the equator, the equator to the south
// horizon.  His figures (51 50 for Oxford).  Shared lib/sky.js.  Original line work.

import { cut, node, f, span, label, SILVER, FAINT, NIGHT } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 15000;
const STILL = 10400; // ms: all four arcs with their measures
const LAT = 51 + 50 / 60;
const RAD = Math.PI / 180;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const sky = cut(svg, { O: [0, 26], R: 66, stars: 22 });
  const { O, R } = sky;
  // a point of the meridian circle by its angle from the SOUTH horizon, counter-clockwise over the top (0 south,
  // 90 zenith, 180 north)
  const pt = (a, r = R) => [O[0] - r * Math.cos(a * RAD), O[1] - r * Math.sin(a * RAD)];
  node("path", { d: `M${f(O[0] - R)} ${f(O[1])}A${R} ${R} 0 0 1 ${f(O[0] + R)} ${f(O[1])}`, fill: "none", stroke: FAINT, "stroke-width": 0.8 }, svg);
  const POLE = 180 - LAT; // the pole: LAT above the north horizon
  const EQ = 90 - LAT; // the equator: LAT from the zenith toward the south
  const axis = node("line", { x1: f(pt(POLE)[0]), y1: f(pt(POLE)[1]), x2: f(pt(POLE + 180, R * 0.55)[0]), y2: f(pt(POLE + 180, R * 0.55)[1]), stroke: SILVER, "stroke-width": 0.9, "stroke-dasharray": "3 3", opacity: 0 }, svg);
  const eqLine = node("line", { x1: f(pt(EQ)[0]), y1: f(pt(EQ)[1]), x2: f(O[0]), y2: f(O[1]), stroke: SILVER, "stroke-width": 0.9, "stroke-dasharray": "3 3", opacity: 0 }, svg);
  node("line", { x1: f(O[0]), y1: f(O[1]), x2: f(O[0]), y2: f(O[1] - R), stroke: FAINT, "stroke-width": 0.7, "stroke-dasharray": "2 3" }, svg);
  const dots = [180, POLE, 90, EQ, 0].map((a) => node("circle", { cx: f(pt(a)[0]), cy: f(pt(a)[1]), r: 2.4, fill: SILVER }, svg));
  // the four arcs, in Chaucer's order, and their measures
  const arcs = [
    [180, POLE, `${51}°50′`],
    [POLE, 90, `${38}°10′`],
    [90, EQ, `${51}°50′`],
    [EQ, 0, `${38}°10′`],
  ].map(([a, b, str]) => {
    const p = pt(a, R + 5);
    const q = pt(b, R + 5);
    const path = node("path", { d: `M${f(p[0])} ${f(p[1])}A${R + 5} ${R + 5} 0 0 0 ${f(q[0])} ${f(q[1])}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke: "#f6d77a", "stroke-width": 2.6 }, svg);
    const m = pt((a + b) / 2, R - 13);
    const t = label(svg, m[0], m[1] + 4, str, 12.5);
    return { path, t };
  });
  const names = [
    [pt(180)[0] - 2, pt(180)[1] + 14, "N", "middle"],
    [pt(POLE)[0] + 6, pt(POLE)[1] - 4, "pole", "start"],
    [pt(90)[0], pt(90)[1] - 9, "zenith", "middle"],
    [pt(EQ)[0] - 6, pt(EQ)[1] - 4, "equator", "end"],
    [pt(0)[0] + 2, pt(0)[1] + 14, "S", "middle"],
  ].map(([x, y, s, a]) => label(svg, x, y, s, 13, a));
  el.appendChild(svg);
  const s = { axis, eqLine, dots, arcs, names, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 14.0, 14.8);
  s.names.forEach((n, i) => n.setAttribute("opacity", f(span(t, 0.4 + 0.2 * i, 0.8 + 0.2 * i) * out)));
  s.axis.setAttribute("opacity", f(0.7 * span(t, 1.2, 1.8) * out));
  s.eqLine.setAttribute("opacity", f(0.7 * span(t, 1.6, 2.2) * out));
  s.arcs.forEach((a, i) => {
    const t0 = 2.6 + 1.9 * i;
    a.path.setAttribute("stroke-dashoffset", f(1 - span(t, t0, t0 + 1.2)));
    a.path.setAttribute("opacity", f(out));
    a.t.setAttribute("opacity", f(span(t, t0 + 0.9, t0 + 1.4) * out));
  });
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
