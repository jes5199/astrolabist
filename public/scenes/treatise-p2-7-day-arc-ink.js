// A Treatise on the Astrolabe, Part II, 7: "Set the degree of thy sonne up-on thyn est orisonte, and ley thy label on
// the degree of the sonne, and at the poynt of thy label in the bordure set a prikke. Turn thanne thy riet aboute til
// the degree of the sonne sit up-on the west orisonte, and ley thy label up-on the same degree of the sonne, and at the
// point of thy label set a-nother prikke. Rekne thanne the quantitee of tyme in the bordure by-twixe bothe prikkes,
// and tak ther thyn ark of the day. The remenant of the bordure under the orisonte is the ark of the night."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW, 3:2 (viewBox -150 -100 300 200), as II 3 v2 (jes tg 17917): Chaucer's six steps one at a time,
// listed beside the instrument, the step being done in red.  On a phone (a container taller than wide, or
// data-layout="stack") the window is 3:4, the steps under the instrument (lib/stage.js, astrolabist #47871).  The sun at the head of Cancer (midsummer: the text gives
// no day; the shared DAY_SUN_LONGITUDE of II 7, 8, 10).  Solved from the plate's geometry; COLOURED WOODCUT on vellum,
// shared lib/front-ink.js; the rete and label are our constructed drawing of inv. 47869's.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 31000;
const STILL = 27000; // ms: both pricks, the day and the night measured
const LAYOUT = {
  wide: { C: { x: -66, y: 14, k: 0.8 }, list: { x: 32, y: -74, size: 9.6, lh: 11, gap: 6, indent: 11 } },
  stack: { C: { x: 0, y: -52, k: 1.08 }, list: { x: -136, y: 82, size: 12.5, lh: 14, gap: 8, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C; // the layout being built (set by build)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
// THE DAY (shared by II 7, II 8 and II 10: change all three together): the sun's longitude, 90 = the head of Cancer
// (midsummer); 1 = Chaucer's 12 March
const DAY_SUN_LONGITUDE = 90;
const SUN = DAY_SUN_LONGITUDE;
const [HC, HR] = almucantar(0);
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2; // where the pricks go, on the border's ladder

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
function at(lam, rot) {
  const d = Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - raOf(lam) + rot, r);
}
const bearingOf = (lam, rot) => (((270 - raOf(lam) + rot) % 360) + 360) % 360;
// the rete's turn that sets the sun on the horizon, on the east (-1) or west (+1) side
function onHorizon(side) {
  const g = (rot) => {
    const p = at(SUN, rot);
    return Math.hypot(p[0], p[1] + HC) - HR;
  };
  for (let rot = 0; rot < 360; rot += 1) {
    if (g(rot) * g(rot + 1) > 0) continue;
    let a = rot;
    let b = rot + 1;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (Math.sign(at(SUN, a)[0]) === side) return a;
  }
  return 0;
}
const ROT_E = onHorizon(-1);
const ROT_W0 = onHorizon(1);
const ROT_W = ROT_W0 < ROT_E ? ROT_W0 + 360 : ROT_W0; // turning westward (clockwise) from the east setting
const B_E = bearingOf(SUN, ROT_E);
const DAY = ROT_W - ROT_E; // degrees of the border the sun's label passes: the arc of the day

const ROT_0 = ROT_E - 50; // where the rete rests before the sun is set
const B_W = bearingOf(SUN, ROT_W);
const ZERO = A.rule.contract.zero_deg + 180;
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};
const STEPS = [
  { t: 0.5, lines: ["set the sun's degree", "on the east horizon"] },
  { t: 4.0, lines: ["lay the label on it;", "prick the border"] },
  { t: 8.0, lines: ["turn the rete until", "it sits on the west"] },
  { t: 13.0, lines: ["the label again;", "a second prick"] },
  { t: 17.0, lines: ["between the pricks:", `the day, ${hm(DAY)}`] },
  { t: 21.0, lines: ["the rest of the border:", `the night, ${hm(360 - DAY)}`] },
];
const END = 29.0;

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
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const l of fr.letters) l.setAttribute("opacity", 0.5);
  // the horizon's two halves, each lit when its step comes
  const half = (west, id) => {
    const cp = node("clipPath", { id }, g);
    node("rect", { x: west ? 0 : -100, y: -100, width: 100, height: 200 }, cp);
    return node("circle", { cy: f(-HC), r: f(HR), fill: "none", stroke: SILVER, "stroke-width": W(2.2), opacity: 0, "clip-path": `url(#${id})` }, fr.plate.clip.parentNode);
  };
  const eastH = half(false, "e" + uid);
  const westH = half(true, "w" + uid);
  // the sun's degree on the rete
  const sp = at(SUN, 0);
  const sun = node("circle", { cx: f(sp[0]), cy: f(sp[1]), r: 4.4, fill: WASH.ochre, stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, fr.rete.g);
  // the arcs of the border
  const arc = (b0, sweep, stroke) => {
    const a = rim(b0, RB);
    const b = rim(b0 + sweep, RB);
    return node("path", { d: `M${f(a[0])} ${f(a[1])}A${f(RB)} ${f(RB)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`, fill: "none", stroke, "stroke-width": W(5), opacity: 0 }, g);
  };
  const dayArc = arc(B_E, DAY, "#b9821c");
  const nightArc = arc(B_E + DAY, 360 - DAY, WASH.blue);
  // the label, its own wobble; the pin over it
  const label = node("g", { filter: fr.wc.rough, opacity: 0 }, g);
  node("path", fr.wc.wash({ d: A.rule.d, fill: WASH.ochre, "fill-opacity": 0.75 }), label);
  node("path", { d: A.rule.d, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, label);
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g);
  // the pricks in the border
  const prick = (b) => {
    const p = rim(b, RB);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 3, fill: SILVER, stroke: NIGHT, "stroke-width": W(0.9), opacity: 0 }, g);
  };
  const pricks = [prick(B_E), prick(B_W)];
  // the steps beside the instrument
  const { rows } = stepList(node("g", {}, svg), STEPS, LAYOUT[s.mode].list);
  Object.assign(s, { svg, rete: fr.rete.g, eastH, westH, sun, dayArc, nightArc, label, pricks, rows });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  // the rete: set the sun on the east; turn it on to the west; at the end on round (the short way) to the rest
  const r = ROT_0 + 50 * span(t, 1.0, 3.4) + DAY * span(t, 8.6, 12.4) + (360 - 50 - DAY) * span(t, END + 0.4, END + 1.8);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.sun.setAttribute("opacity", f(span(t, 0.6, 1.0) * out));
  s.eastH.setAttribute("opacity", f(span(t, 0.6, 1.2) * (1 - span(t, 7.6, 8.2))));
  s.westH.setAttribute("opacity", f(span(t, 8.2, 8.8) * (1 - span(t, 16.6, 17.2))));
  // the label: laid on the sun at the east (4.2), lifted (8.0), laid on it at the west (13.2), lifted (17.0)
  const lb = t < 10 ? B_E : B_W;
  const lay = t < 10 ? span(t, 4.2, 5.6) * (1 - span(t, 7.6, 8.2)) : span(t, 13.2, 14.6) * (1 - span(t, 16.6, 17.2));
  s.label.setAttribute("transform", `rotate(${f(lb - 40 * (1 - lay) - ZERO)})`);
  s.label.setAttribute("opacity", f(lay));
  s.pricks[0].setAttribute("opacity", f(span(t, 5.8, 6.2) * out));
  s.pricks[1].setAttribute("opacity", f(span(t, 14.8, 15.2) * out));
  s.dayArc.setAttribute("opacity", f(0.85 * span(t, 17.4, 18.2) * out));
  s.nightArc.setAttribute("opacity", f(0.9 * span(t, 21.2, 22.0) * out));
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
