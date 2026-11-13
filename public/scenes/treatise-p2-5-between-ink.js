// A Treatise on the Astrolabe, Part II, 5: "whan that the degree of thy sonne falleth by-twixe two almikanteras ...
// Set the degree of thy sonne up-on the heyer almikanteras of bothe, and waite wel wher as thin almury toucheth the
// bordure, and set ther a prikke of inke. Set doun agayn the degree of thy sonne up-on the nethere almikanteras of
// bothe, and set ther another prikke. Remewe thanne thyn almury in the bordure evene amiddes bothe prikkes, and this wol
// lede iustly the degree of thy sonne to sitte by-twixe bothe almikanteras in his right place. Ley thanne thy label over
// the degree of thy sonne; and find in the bordure the verrey tyde of the day or of the night. And as verreyly shaltow
// finde up-on thyn est orisonte thyn assendent."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917):
// Chaucer's steps one at a time beside the instrument (the step being done in red).  Chaucer's sun (Aries 1) at 25 1/2
// degrees falls between the almucantars of 24 and 26 (ours go two by two): set on the 26th, a prick at the almury; on
// the 24th, another; the almury brought midway; the label laid over the sun, the time read in the border; the ascendant
// on the eastern horizon.  Replaces the woodcut v1 of the same name.  Solved from the plate's geometry (52 degrees);
// COLOURED WOODCUT on vellum, lib/front-ink.js; the rete, almury and label are our constructed drawing of inv. 47869's.
// Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 30000;
const STILL = 24500; // ms: midway, the time read, the ascendant ringed
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -80, size: 9.6, lh: 11, gap: 7, indent: 10, width: 142 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 5, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C;
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ZERO = A.rule.contract.zero_deg + 180;
const SUN_LON = A.morning.sunLongitude;
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const turn = (p, r) => [p[0] * Math.cos(r * RAD) - p[1] * Math.sin(r * RAD), p[0] * Math.sin(r * RAD) + p[1] * Math.cos(r * RAD)];
const raOf = (l) => (Math.atan2(Math.cos(EPS) * Math.sin(l * RAD), Math.cos(l * RAD)) / RAD + 360) % 360;
const decOf = (l) => Math.asin(Math.sin(EPS) * Math.sin(l * RAD));
const ecl = (l) => rim(270 - raOf(l), (P.equator * Math.cos(decOf(l))) / (1 + Math.sin(decOf(l))));
const off = (p, h) => {
  const [c, r] = almucantar(h);
  return Math.hypot(p[0], p[1] + c) - r;
};
const SUN = ecl(SUN_LON);
// the turn that sets the sun on the almucantar of h, on the east (morning) side, near Chaucer's setting
function setOn(h) {
  const g = (rot) => off(turn(SUN, rot), h);
  let a = A.morning.rot - 25;
  let b = A.morning.rot + 25;
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return a;
}
const HI = setOn(26);
const LO = setOn(24);
const MID = (HI + LO) / 2;
const REST = HI - 35;
const bearing = (p) => ((Math.atan2(p[0], -p[1]) / RAD) + 360) % 360;
const LABEL = bearing(turn(SUN, MID));
const HOUR = (12 + LABEL / 15) % 24;
function rising(rot) {
  let best = 0;
  for (let l = 0; l < 360; l += 0.25) {
    const a = turn(ecl(l), rot);
    const b = turn(ecl(l + 0.25), rot);
    if (a[0] < 0 && off(a, 0) * off(b, 0) <= 0) best = l + 0.125;
  }
  return best;
}
const ASC = rising(MID);
const clock = (h) => {
  const m = Math.round((h * 60) / 5) * 5;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

const STEPS = [
  { t: 0.5, lines: ["the sun is 25½° high: between the 24° and 26° circles"] },
  { t: 4.0, lines: ["set it on the higher; prick the border at the almury"] },
  { t: 8.6, lines: ["set it on the lower; prick again"] },
  { t: 12.4, lines: ["move the almury midway between: the sun sits in its right place"] },
  { t: 16.6, lines: [`the label over the sun: about ${clock(HOUR)} in the morning`] },
  { t: 22.0, lines: [`the ascendant on the east horizon: ${nameOf(ASC)}`] },
];
const END = 28.4;

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
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.5);
  fr.rete.g.setAttribute("opacity", 0.85);
  // the two almucantars, lit
  const two = [26, 24].map((h) => {
    const [c, r] = almucantar(h);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, fr.plate.clip.parentNode);
  });
  // the sun's degree and the almury on the rete
  const sun = node("circle", { cx: f(SUN[0]), cy: f(SUN[1]), r: 3.6, fill: WASH.ochre, stroke: "currentColor", "stroke-width": W(1), opacity: 0 }, fr.rete.g);
  const almury = node("path", { d: "M-2.2 -83H2.2V-74.2H-2.2Z", fill: SILVER, stroke: "currentColor", "stroke-width": W(0.8), opacity: 0 }, fr.rete.g);
  // the pricks of ink in the border, and the middle between them
  const prick = (b, fill) => {
    const p = rim(b, RB);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.6, fill, stroke: VELLUM, "stroke-width": W(0.9), opacity: 0 }, g);
  };
  const pricks = [prick(HI, "currentColor"), prick(LO, "currentColor")];
  const between = node("path", { d: (() => {
    const a = rim(LO, RB);
    const b = rim(HI, RB);
    return `M${f(a[0])} ${f(a[1])}A${f(RB)} ${f(RB)} 0 0 1 ${f(b[0])} ${f(b[1])}`;
  })(), fill: "none", stroke: "#b9821c", "stroke-width": W(3.5), opacity: 0 }, g);
  const midTick = prick(MID, SILVER);
  // the label, its own wobble; the pin over it
  const label = node("g", { filter: fr.wc.rough, opacity: 0 }, g);
  node("path", fr.wc.wash({ d: A.rule.d, fill: WASH.ochre, "fill-opacity": 0.75 }), label);
  node("path", { d: A.rule.d, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, label);
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g);
  // the count from midnight; the ascendant
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.6), "stroke-linecap": "round", opacity: 0 }, g);
  const asc = node("circle", { r: 4.6, fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0 }, g);
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, rete: fr.rete.g, two, sun, almury, pricks, between, midTick, label, count, asc, rows });
  draw(s, s.tm / 1000);
}

function arc(b0, b1, r) {
  if (b1 - b0 < 0.5) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.6);
  const r = REST + (HI - REST) * span(t, 4.3, 6.6) + (LO - HI) * span(t, 9.0, 10.6) + (MID - LO) * span(t, 12.8, 14.4) + (REST - MID) * span(t, END + 0.2, LOOP / 1000 - 0.2);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.two.forEach((c) => c.setAttribute("opacity", f(span(t, 0.6, 1.1) * out)));
  s.sun.setAttribute("opacity", f(span(t, 0.6, 1.1) * out));
  s.almury.setAttribute("opacity", f(span(t, 4.0, 4.4) * out));
  s.pricks[0].setAttribute("opacity", f(span(t, 7.0, 7.4) * out));
  s.pricks[1].setAttribute("opacity", f(span(t, 11.0, 11.4) * out));
  s.between.setAttribute("opacity", f(0.8 * span(t, 12.4, 12.8) * (1 - span(t, 16.0, 16.6))));
  s.midTick.setAttribute("opacity", f(span(t, 14.4, 14.8) * out));
  const lay = span(t, 16.8, 18.4);
  s.label.setAttribute("transform", `rotate(${f(LABEL - 50 * (1 - lay) - ZERO)})`);
  s.label.setAttribute("opacity", f(span(t, 16.6, 17.0) * out));
  const R = A.frontRadii.outer + 4;
  s.count.setAttribute("d", arc(180, 180 + (LABEL - 180) * span(t, 18.8, 21.0), R));
  s.count.setAttribute("opacity", f(span(t, 18.6, 18.9) * out));
  const pa = turn(ecl(ASC), r);
  s.asc.setAttribute("cx", f(pa[0]));
  s.asc.setAttribute("cy", f(pa[1]));
  s.asc.setAttribute("opacity", f(span(t, 22.2, 22.7) * out));
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
