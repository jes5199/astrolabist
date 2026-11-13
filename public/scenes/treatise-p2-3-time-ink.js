// A Treatise on the Astrolabe, Part II, 3: "Tak the altitude of the sonne whan thee list ... set the degree of the
// sonne ... among thyn almikanteras on the est side ... ley over thy label, up-on the degree of the sonne; and thanne
// wol the point of thy label sitten in the bordure, up-on the verrey tyd of the day."  Chaucer's examples: 12 March
// 1391, the sun 25 1/2 degrees high, the label on X, 9 o'clock, Gemini 20 rising; that night Alhabor 18 degrees high
// in the west, the label past 8 o'clock, the ascendant rising.
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW, 3:2 (viewBox -150 -100 300 200), after II 4 v2 (jes tg 17908, 17914, 17917): Chaucer's steps one
// at a time, each held, listed beside the instrument (the step being done in red).  By day, then by night.  On a phone
// (a container taller than wide, or data-layout="stack") the window is 3:4, the steps under the instrument
// (lib/stage.js, astrolabist #47871).
// The night star's altitude is the text's 18 degrees (the earlier scene used 12, from the film's song: wrong).  On our
// constructed rete the night reading comes out past 8 o'clock as Chaucer says, but some forty minutes past rather than
// his "2 degrees", and the rising degree near Libra 28 against his 23: so the night ascendant is ringed, not named.
// By day the plate's geometry gives his figures exactly (9 o'clock; Gemini 20).  COLOURED WOODCUT on vellum: shared
// lib/front-ink.js.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, almucantar, SILVER, NIGHT, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 48000;
const STILL = 19500; // ms: by day, everything found
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -78, size: 10, lh: 12, gap: 9, width: 142, indent: 11, headSize: 13, headGap: 20, restart: true, number: (i) => (i % 5) + 1 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 8, indent: 15, width: 272, headSize: 15, headGap: 20, restart: true, number: (i) => (i % 5) + 1 } },
};
let C = LAYOUT.wide.C; // the layout being built (set by build)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ZERO = A.rule.contract.zero_deg + 180;

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
// the turn of the rete that sets point p (on the rete) on the circle of altitude h, on the given side
function setOn(p, h, west) {
  let best = 0;
  for (let r = 0; r < 360; r += 0.25) {
    const a = turn(p, r);
    const b = turn(p, r + 0.25);
    if (off(a, h) * off(b, h) <= 0 && a[0] > 0 === west) {
      let lo = r;
      let hi = r + 0.25;
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2;
        if (off(turn(p, lo), h) * off(turn(p, m), h) <= 0) hi = m;
        else lo = m;
      }
      best = lo;
    }
  }
  return best;
}
const bearing = (p) => ((Math.atan2(p[0], -p[1]) / RAD) + 360) % 360;
function rising(rot) {
  let best = 0;
  for (let l = 0; l < 360; l += 0.25) {
    const a = turn(ecl(l), rot);
    const b = turn(ecl(l + 0.25), rot);
    if (a[0] < 0 && off(a, 0) * off(b, 0) <= 0) best = l + 0.125;
  }
  return best;
}
const SUN = ecl(A.morning.sunLongitude); // the first degree of Aries, on the rete
const TIP = A.night.tip; // Alhabor's pointer, on the rete
const DAY = { alt: A.morning.sunAlt, rot: setOn(SUN, A.morning.sunAlt, false) };
DAY.label = bearing(turn(SUN, DAY.rot));
DAY.asc = rising(DAY.rot);
const NIGHT_ALT = 18;
const NGT = { rot: setOn(TIP, NIGHT_ALT, true) };
NGT.label = bearing(turn(SUN, NGT.rot));
NGT.asc = rising(NGT.rot);
const X_AT = 15 * (1 + A.hourLetters.indexOf("X")); // 315

// the steps, with when each begins (s); the lines shown beside the instrument
const STEPS = [
  { t: 0.5, head: "By day", lines: ["the sun is 25½° high"] },
  { t: 3.6, lines: ["set its degree on the", "25½° circle, east side"] },
  { t: 8.2, lines: ["lay the label over it"] },
  { t: 11.2, lines: ["it falls on X: from", "midnight, 9 o'clock"] },
  { t: 16.0, lines: ["Gemini 20° is rising:", "the ascendant"] },
  { t: 24.4, head: "By night", lines: ["Alhabor is 18° high,", "in the west"] },
  { t: 27.4, lines: ["set it on the 18°", "circle, west side"] },
  { t: 31.6, lines: ["lay the label over", "the sun's degree"] },
  { t: 34.6, lines: ["from noon:", "past 8 o'clock"] },
  { t: 39.4, lines: ["the degree rising:", "the ascendant"] },
];
const END = [24.0, 47.0]; // each half's end

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
  C = LAYOUT[s.mode].C;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.25);
  const letters = fr.letters;
  for (const l of letters) l.setAttribute("opacity", 0.55);
  // the two circles of altitude, each on its own side
  const side = (west, id) => {
    const cp = node("clipPath", { id }, g);
    node("rect", { x: west ? 0 : -100, y: -100, width: 100, height: 200 }, cp);
    return `url(#${id})`;
  };
  const circ = (h, west, id) => {
    const [c, r] = almucantar(h);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0, "clip-path": side(west, id) }, fr.plate.clip.parentNode);
  };
  const dayCircle = circ(DAY.alt, false, "e" + uid);
  const nightCircle = circ(NIGHT_ALT, true, "w" + uid);
  // on the rete: the sun's degree (ochre, ringed red), Alhabor's tip (ringed red)
  const sun = node("circle", { cx: f(SUN[0]), cy: f(SUN[1]), r: 4.4, fill: WASH.ochre, stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, fr.rete.g);
  const star = node("circle", { cx: f(TIP[0]), cy: f(TIP[1]), r: 4.6, fill: "none", stroke: SILVER, "stroke-width": W(1.8), opacity: 0 }, fr.rete.g);
  // the label, its own wobble as it turns; the pin over it
  const label = node("g", { filter: fr.wc.rough, opacity: 0 }, g);
  node("path", fr.wc.wash({ d: A.rule.d, fill: WASH.ochre, "fill-opacity": 0.75 }), label);
  node("path", { d: A.rule.d, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, label);
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g);
  // the count along the rim (from midnight by day, from noon by night)
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.6), "stroke-linecap": "round", opacity: 0 }, g);
  // the rising degree on the eastern horizon
  const ascDay = node("circle", { r: 4, fill: SILVER, stroke: NIGHT, "stroke-width": W(1), opacity: 0 }, g);
  const ascNight = node("circle", { r: 5, fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0 }, g);
  // the list of steps, beside the instrument (or under it)
  const { rows, heads } = stepList(node("g", {}, svg), STEPS, LAYOUT[s.mode].list);
  Object.assign(s, { svg, rete: fr.rete.g, letters, dayCircle, nightCircle, sun, star, label, count, ascDay, ascNight, rows, heads });
  draw(s, s.tm / 1000);
}

// the rim's arc between two bearings (clockwise), as path data in the plate's units
function arc(b0, b1, r) {
  if (b1 - b0 < 0.5) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}

function draw(s, t) {
  const night = t >= END[0];
  // the rete: by day turned into the sun's setting; between, on round toward the night's; by night onto Alhabor's;
  // at the end, on round to where the day began
  const d0 = DAY.rot - 60;
  const n0 = NGT.rot - 40;
  let r;
  if (t < END[0]) r = d0 + 60 * span(t, 3.8, 7.6) + (n0 - DAY.rot) * span(t, 22.4, 24.0);
  else r = n0 + 40 * span(t, 27.6, 31.2) + (((d0 + 360 - NGT.rot) % 360) * span(t, 46.6, 48.0));
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  // the circles
  s.dayCircle.setAttribute("opacity", f(span(t, 0.6, 1.2) * (1 - span(t, 21.6, 22.4))));
  s.nightCircle.setAttribute("opacity", f(span(t, 24.6, 25.2) * (1 - span(t, 44.6, 45.4))));
  s.sun.setAttribute("opacity", f(span(t, 1.0, 1.5) * (1 - span(t, 21.6, 22.4)) + span(t, 31.6, 32.0) * (1 - span(t, 44.6, 45.4))));
  s.star.setAttribute("opacity", f(span(t, 25.0, 25.5) * (1 - span(t, 44.6, 45.4))));
  // the label: laid over the sun's degree (by day at 8.2, by night at 31.6), taken away between
  const lb = night ? NGT.label : DAY.label;
  const lay = night ? span(t, 31.6, 33.4) : span(t, 8.2, 10.0);
  const rest = lb + (night ? -50 : 50);
  const shown = night ? span(t, 31.4, 31.8) * (1 - span(t, 44.6, 45.4)) : span(t, 8.0, 8.4) * (1 - span(t, 21.6, 22.4));
  s.label.setAttribute("transform", `rotate(${f(rest + (lb - rest) * lay - ZERO)})`);
  s.label.setAttribute("opacity", f(shown));
  // the count: by day from midnight (180) to the label; by night from noon (0)
  const R = A.frontRadii.outer + 4;
  if (!night) {
    const u = span(t, 11.6, 14.4);
    s.count.setAttribute("d", arc(180, 180 + (DAY.label - 180) * u, R));
    s.count.setAttribute("opacity", f(span(t, 11.4, 11.7) * (1 - span(t, 21.6, 22.4))));
  } else {
    const u = span(t, 34.8, 37.6);
    s.count.setAttribute("d", arc(0, NGT.label * u, R));
    s.count.setAttribute("opacity", f(span(t, 34.6, 34.9) * (1 - span(t, 44.6, 45.4))));
  }
  // the letter X lit by day
  const xi = Math.round(X_AT / 15);
  s.letters.forEach((l, i) => {
    const lit = i === xi ? span(t, 11.2, 11.6) * (1 - span(t, 21.6, 22.4)) : 0;
    l.setAttribute("fill", lit > 0.5 ? SILVER : "currentColor");
    l.setAttribute("opacity", f(0.55 + 0.45 * lit));
  });
  // the rising degrees
  const pd = turn(ecl(DAY.asc), r);
  s.ascDay.setAttribute("cx", f(pd[0]));
  s.ascDay.setAttribute("cy", f(pd[1]));
  s.ascDay.setAttribute("opacity", f(span(t, 16.0, 16.5) * (1 - span(t, 21.6, 22.4))));
  const pn = turn(ecl(NGT.asc), r);
  s.ascNight.setAttribute("cx", f(pn[0]));
  s.ascNight.setAttribute("cy", f(pn[1]));
  s.ascNight.setAttribute("opacity", f(span(t, 39.4, 39.9) * (1 - span(t, 44.6, 45.4))));
  // the list: the step being done in red, those done in ink, those to come faint; each half shows only its own
  STEPS.forEach((st, i) => {
    const half = i < 5 ? 0 : 1;
    const inHalf = half === 0 ? span(t, 0.2, 0.5) * (1 - span(t, 22.4, 23.0)) : span(t, 24.0, 24.4) * (1 - span(t, 46.4, 47.0));
    const next = STEPS[i + 1] && (i + 1) % 5 ? STEPS[i + 1].t : END[half];
    const now = t >= st.t && t < next;
    const done = t >= next;
    const a = (now || done ? 1 : 0.3) * inHalf;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(a));
      e.setAttribute("fill", now ? SILVER : "currentColor");
    }
    if (s.heads[i]) s.heads[i].setAttribute("opacity", f(inHalf));
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
