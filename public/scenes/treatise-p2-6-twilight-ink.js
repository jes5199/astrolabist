// A Treatise on the Astrolabe, Part II, 6: "Set the nadir of thy sonne up-on 18 degrees of heighte among thyn
// almikanteras on the west syde, and ley thy label on the degree of thy sonne, and thanne shal the poynt of thy label
// schewe the spring of day. Also set the nadir of thy sonne up-on 18 degrees of heighte a-mong thyn almikanteras on the
// est side, and ley over thy label up-on the degree of the sonne, and with the point of thy label find in the bordure
// the ende of the evening, that is, verrey night. The nadir of the sonne is thilke degree that is opposit to the degree
// of the sonne, in the seventhe signe."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917): the
// rule on the instrument, Chaucer's steps one at a time beside it (the step being done in red): the nadir, the opposite
// degree; set on the 18-degree circle in the west; the label on the sun's degree; its point in the border: the spring
// of day.  Then the same in the east: very night.  The sun in the first degree of Aries (Chaucer's 12 March: the text
// gives no day here; at midsummer the nadir never climbs to 18 at Oxford, and the rule has no answer).  Replaces
// treatise-p2-6-twilight.js (a cut through the sky in the dark style, showing why the rule works).  Solved from the
// plate's geometry (52 degrees); COLOURED WOODCUT on vellum, lib/front-ink.js; the rete and label are our constructed
// drawing of inv. 47869's.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 44000;
const STILL = 18500; // ms: dawn found
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -80, size: 9.6, lh: 11, gap: 7, indent: 10, width: 142, headSize: 13, headGap: 18, restart: true, number: (i) => (i < 4 ? i + 1 : i - 3) } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272, headSize: 15, headGap: 19, restart: true, number: (i) => (i < 4 ? i + 1 : i - 3) } },
};
let C = LAYOUT.wide.C;
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ZERO = A.rule.contract.zero_deg + 180;
const SUN_LON = 1; // the first degree of Aries
const H = 18;

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
const SUN = ecl(SUN_LON);
const NADIR = ecl(SUN_LON + 180);
const clock = (b) => {
  const m = Math.round(((((12 + b / 15) % 24) * 60) / 5)) * 5;
  const hh = Math.floor(m / 60) % 24;
  return `${hh > 12 ? hh - 12 : hh}:${String(m % 60).padStart(2, "0")}`;
};
const DAWN = { rot: setOn(NADIR, H, true) };
DAWN.label = bearing(turn(SUN, DAWN.rot));
const DUSK = { rot: setOn(NADIR, H, false) };
DUSK.label = bearing(turn(SUN, DUSK.rot));

const STEPS = [
  { t: 0.5, head: "Daybreak", lines: ["the sun's nadir: the opposite degree, Libra 1°"] },
  { t: 4.0, lines: ["set it on the 18° circle, west side"] },
  { t: 8.4, lines: ["lay the label on the sun's degree"] },
  { t: 11.6, lines: [`its point in the border: day springs, about ${clock(DAWN.label)} in the morning`] },
  { t: 22.6, head: "Nightfall", lines: ["set the nadir on the 18° circle, east side"] },
  { t: 27.0, lines: ["lay the label on the sun's degree"] },
  { t: 30.2, lines: [`its point in the border: very night, about ${clock(DUSK.label)} in the evening`] },
];
const END = [21.4, 42.4];

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
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.5);
  fr.rete.g.setAttribute("opacity", 0.85);
  // the 18-degree circle, each side lit in its half
  const side = (west, id) => {
    const cp = node("clipPath", { id }, g);
    node("rect", { x: west ? 0 : -100, y: -100, width: 100, height: 200 }, cp);
    const [c, r] = almucantar(H);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0, "clip-path": `url(#${id})` }, fr.plate.clip.parentNode);
  };
  const westC = side(true, "w" + uid);
  const eastC = side(false, "e" + uid);
  // on the rete: the sun's degree (ochre), its nadir (red), the line between them through the pole
  const axis = node("path", { d: `M${f(SUN[0])} ${f(SUN[1])}L${f(NADIR[0])} ${f(NADIR[1])}`, stroke: SILVER, "stroke-width": W(1.2), "stroke-dasharray": `${W(3)} ${W(2)}`, fill: "none", opacity: 0 }, fr.rete.g);
  const sun = node("circle", { cx: f(SUN[0]), cy: f(SUN[1]), r: 4.4, fill: WASH.ochre, stroke: "currentColor", "stroke-width": W(1.2), opacity: 0 }, fr.rete.g);
  const nadir = node("circle", { cx: f(NADIR[0]), cy: f(NADIR[1]), r: 4.4, fill: SILVER, stroke: VELLUM, "stroke-width": W(1.2), opacity: 0 }, fr.rete.g);
  // the label, its own wobble as it turns; the pin over it
  const label = node("g", { filter: fr.wc.rough, opacity: 0 }, g);
  node("path", fr.wc.wash({ d: A.rule.d, fill: WASH.ochre, "fill-opacity": 0.75 }), label);
  node("path", { d: A.rule.d, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, label);
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g);
  // the count in the border: by morning from midnight, by evening from noon
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.6), "stroke-linecap": "round", opacity: 0 }, g);
  const { rows, heads } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, rete: fr.rete.g, westC, eastC, axis, sun, nadir, label, count, rows, heads });
  draw(s, s.tm / 1000);
}

function arc(b0, b1, r) {
  if (b1 - b0 < 0.5) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}

function draw(s, t) {
  const eve = t >= 22.0;
  // the rete: in to the dawn setting; on (the short way) to the evening's; back to the start at the end
  const d0 = DAWN.rot - 50;
  const e0 = DUSK.rot - 40;
  const fw = (a, b) => ((((b - a + 180) % 360) + 360) % 360) - 180; // the short way
  let r;
  if (!eve) r = d0 + 50 * span(t, 4.4, 7.8) + fw(DAWN.rot, e0) * span(t, 20.6, 22.0);
  else r = e0 + 40 * span(t, 23.0, 26.4) + fw(DUSK.rot, d0) * span(t, 42.4, 44.0);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const allOn = span(t, 0.6, 1.1) * (1 - span(t, 42.4, 43.0));
  s.sun.setAttribute("opacity", f(allOn));
  s.nadir.setAttribute("opacity", f(allOn));
  s.axis.setAttribute("opacity", f(span(t, 0.8, 1.3) * (1 - span(t, 3.8, 4.2))));
  s.westC.setAttribute("opacity", f(span(t, 4.2, 4.8) * (1 - span(t, 20.4, 21.0))));
  s.eastC.setAttribute("opacity", f(span(t, 22.8, 23.4) * (1 - span(t, 41.8, 42.4))));
  // the label: laid over the sun's degree (8.6 / 27.2), lifted at each half's end
  const lb = eve ? DUSK.label : DAWN.label;
  const lay = eve ? span(t, 27.2, 29.0) : span(t, 8.6, 10.4);
  const rest = lb + (eve ? 50 : -50);
  const shown = eve ? span(t, 27.0, 27.4) * (1 - span(t, 41.8, 42.4)) : span(t, 8.4, 8.8) * (1 - span(t, 20.4, 21.0));
  s.label.setAttribute("transform", `rotate(${f(rest + (lb - rest) * lay - ZERO)})`);
  s.label.setAttribute("opacity", f(shown));
  const R = A.frontRadii.outer + 4;
  if (!eve) {
    s.count.setAttribute("d", arc(180, 180 + (DAWN.label - 180) * span(t, 11.8, 14.4), R));
    s.count.setAttribute("opacity", f(span(t, 11.6, 11.9) * (1 - span(t, 20.4, 21.0))));
  } else {
    s.count.setAttribute("d", arc(0, DUSK.label * span(t, 30.4, 33.6), R));
    s.count.setAttribute("opacity", f(span(t, 30.2, 30.5) * (1 - span(t, 41.8, 42.4))));
  }
  STEPS.forEach((st, i) => {
    const half = i < 4 ? 0 : 1;
    const inHalf = half === 0 ? span(t, 0.2, 0.5) * (1 - span(t, 21.4, 22.0)) : span(t, 22.0, 22.4) * (1 - span(t, 42.4, 43.0));
    const next = STEPS[i + 1] && i !== 3 ? STEPS[i + 1].t : END[half];
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
