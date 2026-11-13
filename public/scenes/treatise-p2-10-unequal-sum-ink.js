// A Treatise on the Astrolabe, Part II, 10: "evermo, generaly, the hour in-equal of the day with the houre in-equal
// of the night contenen 30 degrees of the bordure, whiche bordure is ever-mo answering to the degrees of the
// equinoxial; wher-for departe the arch of the day artificial in 12, and tak ther the quantitee of the houre in-equal
// by day. And yif thow abate the quantitee of the houre in-equal by daye out of 30, than shal the remenant that leveth
// performe the houre inequal by night."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917): the
// rule one step at a time beside the front's border (the step being done in red): II 7's day arc (the sun at the head
// of Cancer, the shared DAY_SUN_LONGITUDE of II 7, 8, 10); parted in twelve: an hour of the day; taken from 30: what
// is left; that is an hour of the night (the night's arc parted in twelve); the day's last hour and the night's first
// together, 30 degrees.  Replaces the woodcut v1 of the same name.  Computed for the plate's latitude (52 degrees);
// COLOURED WOODCUT on vellum, lib/front-ink.js.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 27000;
const STILL = 21000; // ms: the two hours together, 30 degrees
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -76, size: 9.6, lh: 11, gap: 7, indent: 10, width: 142 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C;
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
const DAY = (2 * Math.acos(-Math.tan(LAT) * Math.tan(DEC))) / RAD; // degrees of the border
const HD = DAY / 12;
const HN = 30 - HD;
const B_RISE = 360 - DAY / 2; // noon is at the top (bearing 0), the day's arc centred on it
const B_SET = DAY / 2;
const deg = (x) => `${x.toFixed(1)}°`;

const STEPS = [
  { t: 0.5, lines: [`the arc of the day (II 7): ${deg(DAY)} of the border`] },
  { t: 4.6, lines: [`part it in twelve: an hour of the day, ${deg(HD)}`] },
  { t: 9.4, lines: [`take that out of 30°: ${deg(HN)} is left`] },
  { t: 13.8, lines: ["that is an hour of the night (its arc, too, parted in twelve)"] },
  { t: 18.6, lines: ["an hour of the day and an hour of the night: always 30°"] },
];
const END = 25.4;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
function arc(b0, b1, r) {
  if (b1 - b0 < 0.2) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}
const tick = (b, r0, r1) => {
  const a = rim(b, r0);
  const c = rim(b, r1);
  return `M${f(a[0])} ${f(a[1])}L${f(c[0])} ${f(c[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const s = { raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  build(el, s);
  watch(el, s, () => {
    s.svg.remove();
    build(el, s);
  });
}

function build(el, s) {
  s.mode = layoutOf(el);
  const Lo = LAYOUT[s.mode];
  C = Lo.C;
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4, rete: false });
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.55);
  // the day's arc (ochre) and the night's (blue) on the border's ladder; their twelfths
  const dayArc = node("path", { fill: "none", stroke: "#b9821c", "stroke-width": W(5), opacity: 0 }, g);
  const nightArc = node("path", { fill: "none", stroke: WASH.blue, "stroke-width": W(5), opacity: 0 }, g);
  let dt = "";
  for (let i = 1; i < 12; i++) dt += tick(B_RISE + i * HD, RB - 5, RB + 5);
  const dayTicks = node("path", { d: dt, stroke: "currentColor", "stroke-width": W(1.4), fill: "none", opacity: 0 }, g);
  let nt = "";
  for (let i = 1; i < 12; i++) nt += tick(B_SET + i * HN, RB - 5, RB + 5);
  const nightTicks = node("path", { d: nt, stroke: "currentColor", "stroke-width": W(1.4), fill: "none", opacity: 0 }, g);
  for (const b of [B_RISE, B_SET]) node("path", { d: tick(b, RB - 7, RB + 7), stroke: "currentColor", "stroke-width": W(2), fill: "none" }, g);
  // the day's last hour and the night's first, lit; the 30 degrees outside the border
  const dayHour = node("path", { d: arc(B_SET - HD, B_SET, RB), fill: "none", stroke: SILVER, "stroke-width": W(6), opacity: 0 }, g);
  const nightHour = node("path", { d: arc(B_SET, B_SET + HN, RB), fill: "none", stroke: SILVER, "stroke-width": W(6), opacity: 0 }, g);
  const RO = R.outer + 6;
  const thirty = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.2), opacity: 0 }, g);
  const ends = node("path", { d: tick(B_SET - HD, RO - 4, RO + 4) + tick(B_SET - HD + 30, RO - 4, RO + 4), stroke: SILVER, "stroke-width": W(2.2), fill: "none", opacity: 0 }, g);
  const text = (str) => {
    const t = node("text", { "text-anchor": "middle", "font-size": f((10.5 * C.k) / 0.78), "font-weight": 700, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const at = (t, b, r) => {
    const p = rim(b, r);
    t.setAttribute("x", f(C.x + C.k * p[0]));
    t.setAttribute("y", f(C.y + C.k * p[1] + 4));
    return t;
  };
  const tHD = at(text(deg(HD)), B_SET - HD / 2 - 4, R.hollow - 13);
  const tHN = at(text(deg(HN)), B_SET + HN / 2 + 6, R.hollow - 13);
  const t30 = at(text("30°"), B_SET - HD + 15, R.outer + 16);
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, dayArc, nightArc, dayTicks, nightTicks, dayHour, nightHour, thirty, ends, tHD, tHN, t30, RO, rows });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  s.dayArc.setAttribute("d", arc(B_RISE, B_RISE + DAY * span(t, 0.8, 3.4), RB));
  s.dayArc.setAttribute("opacity", f(0.85 * span(t, 0.6, 0.9) * out));
  s.dayTicks.setAttribute("opacity", f(span(t, 4.8, 5.6) * out));
  s.dayHour.setAttribute("opacity", f(span(t, 6.0, 6.5) * out));
  s.tHD.setAttribute("opacity", f(span(t, 6.4, 6.9) * out));
  // 30 degrees laid out from the hour's start; what is left past the day's hour
  s.thirty.setAttribute("d", arc(B_SET - HD, B_SET - HD + 30 * span(t, 9.6, 11.2), s.RO));
  s.thirty.setAttribute("opacity", f(span(t, 9.5, 9.8) * out));
  s.ends.setAttribute("opacity", f(span(t, 11.0, 11.4) * out));
  s.t30.setAttribute("opacity", f(span(t, 11.2, 11.6) * out));
  s.nightHour.setAttribute("opacity", f(span(t, 11.8, 12.3) * out));
  s.tHN.setAttribute("opacity", f(span(t, 12.2, 12.7) * out));
  s.nightArc.setAttribute("d", arc(B_SET, B_SET + (360 - DAY) * span(t, 14.0, 15.6), RB));
  s.nightArc.setAttribute("opacity", f(0.85 * span(t, 13.9, 14.2) * out));
  s.nightTicks.setAttribute("opacity", f(span(t, 15.6, 16.4) * out));
  STEPS.forEach((st, i) => {
    const next = STEPS[i + 1] ? STEPS[i + 1].t : END;
    const now = t >= st.t && t < next;
    const done = t >= next;
    const a = (now || done ? 1 : 0.3) * span(t, 0.2, 0.5) * out;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(a));
      e.setAttribute("fill", now ? SILVER : "currentColor");
    }
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
