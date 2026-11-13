// A Treatise on the Astrolabe, Part II, 11: "The quantitee of houres equales, that is to seyn, the houres of the
// clokke, ben departed by 15 degrees al-redy in the bordure of thyn Astrolabie ... knowe the degree of thy sonne, and
// ley thy label on it; turne thy riet aboute ioyntly with thy label, and with the point of it rekne in the bordure fro
// the sonne aryse un-to the same place ther thou desirest, by day as by nighte."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917):
// Chaucer's steps one at a time beside the instrument (the step being done in red), on his morning (12 March 1391, the
// sun in the first degree of Aries): the border already parted in hours of fifteen degrees; the sun set at its rising;
// the label laid on it; rete and label turned together to the setting of his reading in II 3; the border the label's
// point has passed counted from sunrise, in hours of the clock.  Replaces the woodcut v1 of the same name.  Solved from
// the plate's geometry (52 degrees); COLOURED WOODCUT on vellum, lib/front-ink.js; the rete and label are our
// constructed drawing of inv. 47869's.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 24600;
const STILL = 19000; // ms: turned, the hours since sunrise counted
const LAYOUT = {
  wide: { C: { x: -73, y: 27, k: 0.67 }, list: { x: 7, y: -78, size: 9.6, lh: 11, gap: 7, indent: 10, width: 142 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C;
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ZERO = A.rule.contract.zero_deg + 180;
const R = A.frontRadii;
const RC = R.outer + 4; // the count, just outside the border

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const turn = (p, r) => [p[0] * Math.cos(r * RAD) - p[1] * Math.sin(r * RAD), p[0] * Math.sin(r * RAD) + p[1] * Math.cos(r * RAD)];
const raOf = (l) => (Math.atan2(Math.cos(EPS) * Math.sin(l * RAD), Math.cos(l * RAD)) / RAD + 360) % 360;
const decOf = (l) => Math.asin(Math.sin(EPS) * Math.sin(l * RAD));
const ecl = (l) => rim(270 - raOf(l), (P.equator * Math.cos(decOf(l))) / (1 + Math.sin(decOf(l))));
const [HC, HR] = almucantar(0);
const SUN = ecl(A.morning.sunLongitude);
const bearing = (p) => ((Math.atan2(p[0], -p[1]) / RAD) + 360) % 360;
// the turn that sets the sun on the eastern horizon
const RISE = (() => {
  const g = (rot) => Math.hypot(turn(SUN, rot)[0], turn(SUN, rot)[1] + HC) - HR;
  let a = A.morning.rot - 60;
  let b = A.morning.rot;
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return a;
})();
const SET = A.morning.rot; // Chaucer's reading in II 3
const B0 = bearing(turn(SUN, RISE));
const B1 = bearing(turn(SUN, SET));
const SPAN = B1 - B0;
const hm = (d) => {
  const m = Math.round((d / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};
const REST = RISE - 40;

const STEPS = [
  { t: 0.5, lines: ["the hours of the clock are in the border already: 15° to the hour"] },
  { t: 4.4, lines: ["set the sun's degree at its rising, on the east horizon"] },
  { t: 8.2, lines: ["lay the label on it"] },
  { t: 11.0, lines: ["turn the rete and the label together, to the time you want"] },
  { t: 15.6, lines: [`count in the border from sunrise: ${hm(SPAN)}`] },
];
const END = 23.0;

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
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.5);
  fr.rete.g.setAttribute("opacity", 0.85);
  // the border's hour lines, lit in red for the first step
  let hd = "";
  for (let i = 0; i < 24; i++) {
    const a = rim(15 * i + 7.5, R.blocks);
    const b = rim(15 * i + 7.5, R.hours);
    hd += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  const hours = node("path", { d: hd, stroke: SILVER, "stroke-width": W(1.6), fill: "none", opacity: 0 }, g);
  // the east horizon
  const cp = node("clipPath", { id: "e" + uid }, g);
  node("rect", { x: -100, y: -100, width: 100, height: 200 }, cp);
  const east = node("circle", { cy: f(-HC), r: f(HR), fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0, "clip-path": `url(#e${uid})` }, fr.plate.clip.parentNode);
  const sun = node("circle", { cx: f(SUN[0]), cy: f(SUN[1]), r: 4.4, fill: WASH.ochre, stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, fr.rete.g);
  // the label, its own wobble; the pin
  const label = node("g", { filter: fr.wc.rough, opacity: 0 }, g);
  node("path", fr.wc.wash({ d: A.rule.d, fill: WASH.ochre, "fill-opacity": 0.75 }), label);
  node("path", { d: A.rule.d, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, label);
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g);
  // the count from sunrise, with its whole hours ticked
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.6), "stroke-linecap": "round", opacity: 0 }, g);
  let td = "";
  for (let h = 15; h < SPAN; h += 15) {
    const a = rim(B0 + h, RC - 4);
    const b = rim(B0 + h, RC + 4);
    td += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  const ticks = node("path", { d: td, stroke: SILVER, "stroke-width": W(2), fill: "none", opacity: 0 }, g);
  const start = (() => {
    const a = rim(B0, RC - 6);
    const b = rim(B0, RC + 6);
    return node("path", { d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, stroke: SILVER, "stroke-width": W(2.4), fill: "none", opacity: 0 }, g);
  })();
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, rete: fr.rete.g, hours, east, sun, label, count, ticks, start, rows });
  draw(s, s.tm / 1000);
}

function arc(b0, b1, r) {
  if (b1 - b0 < 0.3) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.6);
  const u = span(t, 11.4, 14.8); // the joint turn
  const r = REST + 40 * span(t, 4.7, 7.0) + (SET - RISE) * u + (REST - SET) * span(t, END + 0.2, LOOP / 1000 - 0.2);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.hours.setAttribute("opacity", f(span(t, 0.6, 1.1) * (1 - span(t, 4.0, 4.4))));
  s.east.setAttribute("opacity", f(span(t, 4.6, 5.1) * (1 - span(t, 10.6, 11.0))));
  s.sun.setAttribute("opacity", f(span(t, 4.6, 5.0) * out));
  // the label: laid on the sun at its rising, then turned with the rete
  const lay = span(t, 8.4, 9.8);
  const lb = B0 + SPAN * u;
  s.label.setAttribute("transform", `rotate(${f(lb + 50 * (1 - lay) - ZERO)})`);
  s.label.setAttribute("opacity", f(span(t, 8.2, 8.6) * out));
  s.start.setAttribute("opacity", f(span(t, 10.0, 10.4) * out));
  s.count.setAttribute("d", arc(B0, lb, RC));
  s.count.setAttribute("opacity", f(span(t, 11.2, 11.5) * out));
  s.ticks.setAttribute("opacity", f(span(t, 15.8, 16.4) * out));
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
