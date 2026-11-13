// A Treatise on the Astrolabe, Part II, 10: "evermo, generaly, the hour in-equal of the day with the houre in-equal
// of the night contenen 30 degrees of the bordure ... wher-for departe the arch of the day artificial in 12, and tak
// ther the quantitee of the houre in-equal by day. And yif thow abate the quantitee of the houre in-equal by daye out
// of 30, than shal the remenant that leveth performe the houre inequal by night."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The border of the front with II 7's midsummer day (the sun at the head of Cancer) and its night.  The day's arc is
// cut in twelve, gold; the night's in twelve, silver; an hour of the day and an hour of the night are lit, and together
// they make 30 degrees.  Computed for the latitude of inv. 47869's plate (shared lib/front.js).  Original line work.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9500; // ms: the two hours lit, the sum shown
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const R = A.frontRadii;
const RB = (R.hollow + R.ladder) / 2;
const LAT = P.latitude * RAD;
// THE DAY (shared by II 7, II 8 and II 10: change all three together): the sun's longitude, 90 = the head of Cancer
// (midsummer); 1 = Chaucer's 12 March
const DAY_SUN_LONGITUDE = 90;
const DEC = Math.asin(Math.sin(EPS) * Math.sin(DAY_SUN_LONGITUDE * RAD));
const DAY = (2 * Math.acos(-Math.tan(LAT) * Math.tan(DEC))) / RAD;
const B_E = 360 - DAY / 2; // sunrise on the border (noon at the top)
const HD = DAY / 12; // an unequal hour of the day
const HN = (360 - DAY) / 12; // and of the night
const LIT_D = 3; // the day hour lit (from sunrise)
const LIT_N = 3; // the night hour lit (from sunset)

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
  const night = node("path", { d: arcD(B_E + DAY, 360 - DAY, RB), fill: "none", stroke: SILVER, "stroke-width": W(4), opacity: 0 }, g);
  let dd = "";
  for (let i = 0; i <= 12; i++) dd += seg(B_E + i * HD, R.hollow - 7, R.hours);
  let dn = "";
  for (let i = 1; i < 12; i++) dn += seg(B_E + DAY + i * HN, R.hollow - 7, R.hours);
  const dayTicks = node("path", { d: dd, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.2), opacity: 0 }, g);
  const nightTicks = node("path", { d: dn, fill: "none", stroke: SILVER, "stroke-width": W(1.2), opacity: 0 }, g);
  const litD = node("path", { d: arcD(B_E + LIT_D * HD, HD, RB), fill: "none", stroke: "#fff3c4", "stroke-width": W(7), opacity: 0 }, g);
  const litN = node("path", { d: arcD(B_E + DAY + LIT_N * HN, HN, RB), fill: "none", stroke: "#ffffff", "stroke-width": W(7), opacity: 0 }, g);
  const lines = [`${HD.toFixed(1)}° + ${HN.toFixed(1)}°`, "= 30°"].map((str, i) => {
    const t = node("text", { x: 0, y: f(C.y - 4 + 20 * i), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  });
  el.appendChild(svg);
  const s = { day, night, dayTicks, nightTicks, litD, litN, lines, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  s.day.setAttribute("opacity", f(0.6 * span(t, 0.5, 1.1) * out));
  s.dayTicks.setAttribute("opacity", f(span(t, 1.4, 2.2) * out));
  s.night.setAttribute("opacity", f(0.4 * span(t, 2.8, 3.4) * out));
  s.nightTicks.setAttribute("opacity", f(span(t, 3.6, 4.4) * out));
  s.litD.setAttribute("opacity", f(0.9 * span(t, 5.4, 6.0) * out));
  s.litN.setAttribute("opacity", f(0.9 * span(t, 6.4, 7.0) * out));
  s.lines[0].setAttribute("opacity", f(span(t, 7.2, 7.8) * out));
  s.lines[1].setAttribute("opacity", f(span(t, 8.2, 8.8) * out));
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
