// A Treatise on the Astrolabe, Part II, 11: "The quantitee of houres equales, that is to seyn, the houres of the
// clokke, ben departed by 15 degrees al-redy in the bordure of thyn Astrolabie ... knowe the degree of thy sonne, and
// ley thy label on it; turne thy riet aboute ioyntly with thy label, and with the point of it rekne in the bordure fro
// the sonne aryse un-to the same place ther thou desirest."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete, on Chaucer's morning (12 March 1391, the sun in the first degree of Aries).  The sun set on
// the eastern horizon, the label laid on it; the rete and the label turned together to the setting of his reading in
// II 3; the border the label's point has passed is lit, and the hours of the clock counted on it, fifteen degrees to
// the hour.  Settings solved from the plate's geometry; shared lib/front.js; the rete and label are our constructed
// drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9400; // ms: turned to Chaucer's reading, the hours since sunrise counted
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = A.morning.sunLongitude;
const [HC, HR] = almucantar(0);
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
function at(lam, rot) {
  const d = Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - raOf(lam) + rot, r);
}
const bearingOf = (lam, rot) => (((270 - raOf(lam) + rot) % 360) + 360) % 360;
// the turn that sets the sun on the eastern horizon, below Chaucer's morning setting
function sunrise() {
  const g = (rot) => {
    const p = at(SUN, rot);
    return Math.hypot(p[0], p[1] + HC) - HR;
  };
  let a = A.morning.rot - 90;
  let b = A.morning.rot;
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return a;
}
const RISE = sunrise();
const SET = A.morning.rot;
const SWEEP = SET - RISE; // degrees of the border passed: hours x 15
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};
const arcD = (b0, sweep, r) => {
  const a = rim(b0, r);
  const b = rim(b0 + Math.max(0.01, sweep), r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.6);
  const swept = node("path", { fill: "none", stroke: "#f6d77a", "stroke-width": W(4), opacity: 0.8 }, g);
  const hourTicks = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(1.4) }, g);
  const label = node("path", { d: A.rule.d, fill: NIGHT, "fill-opacity": 0.55, stroke: SILVER, "stroke-width": W(0.9), "stroke-linejoin": "round", opacity: 0 }, g);
  const sun = node("circle", { r: 3.4, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const count = node("text", { x: 0, y: f(C.y + 52), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, swept, hourTicks, label, sun, count, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  const turned = SWEEP * span(t, 2.0, 7.6) * out;
  const r = RISE + turned;
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const b = bearingOf(SUN, r);
  const sp = at(SUN, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  s.label.setAttribute("transform", `rotate(${f(b - (A.rule.contract.zero_deg + 180))})`);
  s.label.setAttribute("opacity", f(span(t, 0.8, 1.4) * out));
  const b0 = bearingOf(SUN, RISE);
  s.swept.setAttribute("d", arcD(b0, turned, RB));
  // a tick at each full hour passed
  let d = "";
  for (let h = 15; h <= turned + 0.01; h += 15) {
    const p = rim(b0 + h, A.frontRadii.hollow - 6);
    const q = rim(b0 + h, A.frontRadii.blocks);
    d += `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
  }
  s.hourTicks.setAttribute("d", d);
  s.count.textContent = hm(turned);
  s.count.setAttribute("opacity", f(span(t, 1.8, 2.2) * out));
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
