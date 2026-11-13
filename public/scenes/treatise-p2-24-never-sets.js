// A Treatise on the Astrolabe, Part II, 24: "Tak any sterre fixe that nevere dissendeth under the orisonte in thilke
// regioun, and considere his heyest altitude and his lowest altitude fro the orisonte; and make a nombre of bothe thise
// altitudes. Tak thanne and abate half that nombre, and tak ther the elevacioun of the pol artik in that same regioun."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The night of II 23, facing north: a star that never sets (30 degrees from the pole) at its highest, its altitude
// taken; at its lowest, again; the two made one number and halved: the pole's height, Chaucer's 51 50 for Oxford.
// Altitudes drawn to a straight vertical scale.  Shared lib/sky.js.  Original line work.

import { node, f, span, seeded, label, SILVER, FAINT, NIGHT } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 14200; // ms: both altitudes taken, the pole's height found
const LAT = 51 + 50 / 60;
const PD = 30; // A's distance from the pole, degrees
const H0 = 62; // the horizon's height in the window
const K = 1.62; // window units per degree of altitude
const yOf = (alt) => H0 - K * alt;
const POLE = [0, yOf(LAT)];
const dm = (deg) => `${Math.floor(deg + 1e-9)}°${String(Math.round((deg % 1) * 60)).padStart(2, "0")}′`;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  // the wheeling stars: a group turned about the pole
  const wheel = node("g", {}, svg);
  const rnd = seeded(23);
  for (let i = 0; i < 70; i++) {
    const a = rnd() * 2 * Math.PI;
    const r = 12 + rnd() * 110;
    node("circle", { cx: f(POLE[0] + r * Math.cos(a)), cy: f(POLE[1] + r * Math.sin(a)), r: f(0.5 + rnd() * 0.8), fill: SILVER, opacity: f(0.3 + rnd() * 0.5) }, wheel);
  }
  // A's circle about the pole
  node("circle", { cx: f(POLE[0]), cy: f(POLE[1]), r: f(K * PD), fill: "none", stroke: FAINT, "stroke-width": 0.6, "stroke-dasharray": "2 3", opacity: 0.6 }, svg);
  const A = node("g", {}, svg);
  node("path", { d: "M0 -5L1.3 -1.3L5 0L1.3 1.3L0 5L-1.3 1.3L-5 0L-1.3 -1.3Z", fill: "#f6d77a" }, A);

  // the pole, the ground, the horizon
  node("circle", { cx: f(POLE[0]), cy: f(POLE[1]), r: 2.2, fill: "none", stroke: SILVER, "stroke-width": 1 }, svg);
  node("rect", { x: -120, y: H0, width: 240, height: 80, fill: "#050816" }, svg);
  node("line", { x1: -110, y1: H0, x2: 110, y2: H0, stroke: "currentColor", "stroke-width": 1.2 }, svg);
  label(svg, 0, H0 + 16, "north", 13).setAttribute("opacity", 0.9);
  // the two measures: vertical spans from the horizon, and their numbers
  const measure = (x) => ({ line: node("line", { x1: x, x2: x, y1: H0, stroke: "#f6d77a", "stroke-width": 2, opacity: 0 }, svg), t: label(svg, x + 5, 0, "", 13, "start") });
  const m1 = measure(-62);
  const m2 = measure(-38);
  const sum = label(svg, 0, -84, `${dm(LAT + PD)} + ${dm(LAT - PD)} = ${dm(2 * LAT)}`, 13);
  const poleT = label(svg, 8, POLE[1] + 4.5, `half: pole ${dm(LAT)}`, 14, "start");
  el.appendChild(svg);
  const s = { wheel, A, m1, m2, sum, poleT, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// the turn of the sky (degrees, counter-clockwise facing north): A over the pole at 0, under it at 180
function turnAt(t) {
  if (t < 1.0) return -40 + 40 * span(t, 0, 1.0);
  if (t < 4.6) return 0;
  if (t < 8.6) return 180 * span(t, 4.6, 8.6);
  if (t < 17.0) return 180;
  return 180 + 140 * span(t, 17.0, 18.0); // on round toward the start
}

function draw(s, t) {
  const out = 1 - span(t, 16.8, 17.6);
  const a = turnAt(t);
  s.wheel.setAttribute("transform", `rotate(${f(-a)} ${f(POLE[0])} ${f(POLE[1])})`);
  const ar = (-a + -90) * (Math.PI / 180);
  const pa = [POLE[0] + K * PD * Math.cos(ar), POLE[1] + K * PD * Math.sin(ar)];
  s.A.setAttribute("transform", `translate(${f(pa[0])} ${f(pa[1])})`);
  // first measure: A over the pole
  const hi = LAT + PD;
  const lo = LAT - PD;
  s.m1.line.setAttribute("y2", f(yOf(hi)));
  s.m1.line.setAttribute("opacity", f(span(t, 1.6, 2.1) * out));
  s.m1.t.setAttribute("y", f(yOf(hi) + 4.5));
  s.m1.t.textContent = dm(hi);
  s.m1.t.setAttribute("opacity", f(span(t, 2.0, 2.5) * out));
  s.m2.line.setAttribute("y2", f(yOf(lo)));
  s.m2.line.setAttribute("opacity", f(span(t, 9.0, 9.5) * out));
  s.m2.t.setAttribute("y", f(yOf(lo) + 4.5));
  s.m2.t.textContent = dm(lo);
  s.m2.t.setAttribute("opacity", f(span(t, 9.4, 9.9) * out));
  s.sum.setAttribute("opacity", f(span(t, 10.6, 11.2) * out));
  s.poleT.setAttribute("opacity", f(span(t, 11.8, 12.6) * out));
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
