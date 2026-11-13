// A Treatise on the Astrolabe, Part II, 8: "Knowe the nombre of the degrees in the houres in-equales, and departe hem
// by 15, and tak ther thyn houres equales."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The border of the front, the midsummer day of II 7 lit on it (the sun at the head of Cancer).  The day's arc is cut
// into its twelve unequal hours, each of the same number of degrees; inside it the border's own hours of 15 degrees are
// ticked.  One unequal hour is lit: its degrees, divided by 15, give it in equal hours.  The day's arc is solved from
// the plate's geometry as in II 7; shared lib/front.js.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9500; // ms: one unequal hour lit and reckoned
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const R = A.frontRadii;
const RB = (R.hollow + R.ladder) / 2;
// the midsummer day's arc, as in II 7: the sun (the head of Cancer) from the east horizon to the west
const LAT = P.latitude * RAD;
const DEC = Math.asin(Math.sin(EPS)); // the sun's declination at the head of Cancer
const DAY = (2 * Math.acos(-Math.tan(LAT) * Math.tan(DEC))) / RAD; // degrees of the equator (and of the border)
// where it begins on the border: the label's bearing at sunrise (east): symmetric about the top (noon)
const B_E = 360 - DAY / 2;
const HOUR = DAY / 12; // an unequal hour of this day, in degrees
const LIT = 3; // the unequal hour lit (the fourth of the day)
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const seg = (b, r0, r1) => {
  const p = rim(b, r0);
  const q = rim(b, r1);
  return `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
};
const arcD = (b0, sweep, r) => {
  const a = rim(b0, r);
  const b = rim(b0 + sweep, r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  fr.plate.g.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  const day = node("path", { d: arcD(B_E, DAY, RB), fill: "none", stroke: "#f6d77a", "stroke-width": W(4), opacity: 0 }, g);
  // the twelve unequal hours: long ticks outward across the border
  let d12 = "";
  for (let i = 0; i <= 12; i++) d12 += seg(B_E + i * HOUR, R.hollow - 7, R.hours);
  const unequal = node("path", { d: d12, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.2), opacity: 0 }, g);
  // the equal hours of 15 degrees inside it
  let d15 = "";
  for (let b = 0; b < 360; b += 15) d15 += seg(b, R.hollow - 12, R.hollow - 3);
  const equal = node("path", { d: d15, fill: "none", stroke: SILVER, "stroke-width": W(1), opacity: 0 }, g);
  // the hour lit
  const lit = node("path", { d: arcD(B_E + LIT * HOUR, HOUR, RB), fill: "none", stroke: SILVER, "stroke-width": W(6), opacity: 0 }, g);
  const lines = [`${HOUR.toFixed(1)}° ÷ 15`, `= ${hm(HOUR)}`].map((str, i) => {
    const t = node("text", { x: 0, y: f(C.y - 4 + 20 * i), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  });
  el.appendChild(svg);
  const s = { day, unequal, equal, lit, lines, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  s.day.setAttribute("opacity", f(0.7 * span(t, 0.5, 1.2) * out));
  s.unequal.setAttribute("opacity", f(span(t, 1.8, 2.8) * out));
  s.equal.setAttribute("opacity", f(0.9 * span(t, 3.6, 4.6) * out));
  s.lit.setAttribute("opacity", f(0.85 * span(t, 5.8, 6.4) * out));
  s.lines[0].setAttribute("opacity", f(span(t, 6.6, 7.2) * out));
  s.lines[1].setAttribute("opacity", f(span(t, 7.8, 8.4) * out));
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
