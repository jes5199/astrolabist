// A Treatise on the Astrolabe, Part II, 12: "fro the arysing of the sonne til it go to reste, the nadir of the sonne
// shal shewe the houre of the planete, and fro that tyme forward al the night til the sonne aryse; than shal the verrey
// degree of the sonne shewe the houre of the planete. Ensample as thus. The 13 day of March fil up-on a Saterday per
// aventure, and, at the arising of the sonne, I fond the secounde degree of Aries sitting up-on myn est orisonte ...
// than fond I the 2 degree of Libra, nadir of my sonne, dessending on my west orisonte, up-on which west orisonte every
// day generally, at the sonne ariste, entreth the houre of any planete, after which planete the day bereth his name;
// and endeth in the nexte stryk of the plate under the forseide west orisonte ... The first houre inequal of every
// Satterday is to Saturne ... Thanne sheweth the verrey degree of the sonne the houre of Mercurie entring under my west
// orisonte at eve ... Now ryseth the sonne that Sonday by the morwe; and the nadir of the sonne, up-on the west
// orizonte, sheweth me the entring of the houre of the forseide sonne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW, 3:2 (viewBox -150 -100 300 200), after II 4 v2 (jes tg 17908, 17914, 17917): Chaucer's steps one
// at a time, each held, listed beside the instrument (the step being done in red), with the planets' order below the
// list and the hour being shown lit in it.  Saturday 13 March: the sun in Aries 2 on the east horizon; its nadir, Libra
// 2, on the west, where Saturn's hour begins; the hour ends at the next line under the west horizon; through the day
// the nadir goes down across the twelve spaces; at sunset the sun's own degree takes over (Mercury's hour) and goes
// across them through the night; at Sunday's sunrise the nadir is on the west again: the Sun's hour.  Replaces the
// earlier treatise-p2-12-planet-hours.js (the front in the dark style).  The hours are counted as equal twelfths of
// the rete's turn between rising and setting (as the plate's lines divide each day-circle).  COLOURED WOODCUT on
// vellum: shared lib/front-ink.js.  On a phone (a container taller than wide, or data-layout="stack") the window is
// 3:4, the steps under the instrument (lib/stage.js).  Original line work; nothing is traced.

import { front, node, f, rim, P, almucantar, nightFrom, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 52000;
const STILL = 19700; // ms: through the day, the nadir in Venus's hour
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -84, size: 9, lh: 10, gap: 4.5, indent: 10, width: 142 }, order: 14 },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 4, indent: 15, width: 272 }, order: 19 },
};
let C = LAYOUT.wide.C; // the layout being built (set by build)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = 1.5; // the second degree of Aries
const NADIR = SUN + 180;
const [HC, HR] = almucantar(0);
const PLANETS = ["Saturn", "Jupiter", "Mars", "the Sun", "Venus", "Mercury", "the Moon"];
const SHORT = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const lin = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
function at(lam, rot) {
  const d = Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - raOf(lam) + rot, r);
}
// the turn that sets the sun on the horizon on the given side (-1 east, +1 west)
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
const RISE = onHorizon(-1);
const SET0 = onHorizon(1);
const SET = SET0 < RISE ? SET0 + 360 : SET0;
const RISE2 = RISE + 360;

// the steps, with when each begins (s)
const STEPS = [
  { t: 0.5, lines: ["sunrise, Saturday 13 March: the sun in Aries 2°"] },
  { t: 4.6, lines: ["its nadir, Libra 2°, on the west: Saturn's hour"] },
  { t: 9.2, lines: ["the hour ends at the next line under the horizon"] },
  { t: 13.4, lines: ["the sun climbs, the nadir sinks, hour by hour"] },
  { t: 27.4, lines: ["at sunset the sun's own degree shows the hour"] },
  { t: 32.0, lines: ["so all night, planet after planet"] },
  { t: 45.6, lines: ["Sunday's sunrise: the nadir shows the Sun's hour"] },
];
const END = 50.4;
const DAY = [14.0, 27.0]; // the rete's turn through the day (s)
const NGT = [32.6, 45.2]; // and through the night

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
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.9);
  fr.plate.horizon.setAttribute("stroke-width", W(1.6));
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  // the twelve spaces under the horizon, from the west; the one being shown washed red, under the rete
  const cells = [];
  const under = node("g", {}, fr.plate.g);
  for (let j = 0; j < 12; j++) {
    const pt = (rd, k) => {
      const t0 = nightFrom(rd);
      return rim(t0 + (k * (360 - 2 * t0)) / 12, rd);
    };
    const a = [pt(P.cancer, j), pt(P.equator, j), pt(P.capricorn, j)];
    const b = [pt(P.cancer, j + 1), pt(P.equator, j + 1), pt(P.capricorn, j + 1)];
    cells.push(node("path", { d: "M" + [...a, ...b.reverse()].map((p) => f(p[0]) + " " + f(p[1])).join("L") + "Z", fill: WASH.red, opacity: 0 }, under));
  }
  fr.plate.g.insertBefore(under, fr.plate.g.lastChild);
  // the first line under the west horizon, lit for step 3
  const line1 = node("path", { d: fr.plate.hours[0].getAttribute("d"), fill: "none", stroke: SILVER, "stroke-width": W(2.4), opacity: 0 }, g);
  // the sun's degree (ochre, ringed red) and its nadir (ringed red), turned with the rete
  fr.rete.g.setAttribute("opacity", 0.8);
  const sun = node("circle", { r: 4.4, fill: WASH.ochre, stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, g);
  const nadir = node("circle", { r: 4.4, fill: VELLUM, stroke: SILVER, "stroke-width": W(2), opacity: 0 }, g);
  // the hour being shown, on the plate above the horizon
  const say = (y, size, weight) => node("text", { x: f(C.x), y: f(C.y + y * C.k), "text-anchor": "middle", "font-size": f((size * C.k) / 0.76), "font-weight": weight, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const dayName = say(-52, 12, 700);
  const hourName = say(-36, 11, 600);
  // the list of steps, beside the instrument (or under it)
  const list = node("g", {}, svg);
  const { rows } = stepList(list, STEPS, Lo.list);
  // the planets' order under it, the one whose hour it is lit; laid out by measure, wrapped to the list's width
  const last = rows[rows.length - 1];
  let y = +last[last.length - 1].getAttribute("y") + Lo.order;
  let x = Lo.list.x;
  const order = SHORT.map((n) => {
    const t = node("text", { x: f(x), y: f(y), "font-size": Lo.list.size, "font-weight": 600, fill: "currentColor", opacity: 0, "font-family": "inherit" }, list);
    t.textContent = n;
    const w = t.getComputedTextLength() || n.length * Lo.list.size * 0.5;
    if (x > Lo.list.x && x + w > Lo.list.x + Lo.list.width) {
      x = Lo.list.x;
      y += Lo.list.lh;
      t.setAttribute("x", f(x));
      t.setAttribute("y", f(y));
    }
    x += w + Lo.list.size * 0.6;
    return t;
  });
  Object.assign(s, { svg, rete: fr.rete.g, cells, line1, sun, nadir, dayName, hourName, rows, order });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 50.4, 51.2);
  // the rete: at sunrise; through the day to sunset; through the night to the next sunrise (the same setting)
  const ud = lin(t, DAY[0], DAY[1]);
  const un = lin(t, NGT[0], NGT[1]);
  const r = RISE + (SET - RISE) * ud + (RISE2 - SET) * un;
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = at(SUN, r);
  const np = at(NADIR, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  s.nadir.setAttribute("cx", f(np[0]));
  s.nadir.setAttribute("cy", f(np[1]));
  // which marker shows the hour: the nadir by day, the sun's own degree by night, the nadir again on Sunday
  const nightOn = span(t, 27.4, 28.2) * (1 - span(t, 45.6, 46.4));
  s.sun.setAttribute("opacity", f(span(t, 0.6, 1.1) * out));
  s.nadir.setAttribute("opacity", f(span(t, 4.8, 5.3) * (1 - nightOn) * out));
  s.sun.setAttribute("r", f(4.4 + 1.2 * nightOn));
  // the hour of the day, counted from Saturday's sunrise (0..23, then 24 = Sunday's first)
  let h = -1;
  if (t >= 4.8 && t < DAY[1]) h = Math.min(11, Math.floor(12 * ud));
  else if (t >= DAY[1] && t < 27.4) h = 11;
  else if (t >= 27.4 && t < NGT[1]) h = 12 + Math.min(11, Math.floor(12 * un));
  else if (t >= NGT[1] && t < 45.6) h = 23;
  else if (t >= 45.6) h = 24;
  const cell = h < 0 ? -1 : h % 12;
  s.cells.forEach((c, j) => c.setAttribute("opacity", f(j === cell ? 0.55 * out : 0)));
  s.line1.setAttribute("opacity", f(span(t, 9.2, 9.7) * (1 - span(t, 13.0, 13.6))));
  // the words on the plate
  s.dayName.textContent = h >= 24 ? "Sunday" : "Saturday";
  s.dayName.setAttribute("opacity", f(span(t, 0.6, 1.1) * out));
  if (h >= 0) s.hourName.textContent = `${h >= 24 ? "day" : h < 12 ? "day" : "night"} hour ${(h % 12) + 1}: ${PLANETS[h % 7]}`;
  s.hourName.setAttribute("opacity", f(h >= 0 ? out : 0));
  // the list
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
  const shown = span(t, 0.2, 0.5) * out;
  s.order.forEach((e, i) => {
    const lit = h >= 0 && h % 7 === i;
    e.setAttribute("opacity", f(shown * (lit ? 1 : 0.55)));
    e.setAttribute("fill", lit ? SILVER : "currentColor");
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
