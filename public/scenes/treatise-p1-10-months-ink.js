// A Treatise on the Astrolabe, Part I, 10: "Next the Cercle of the Dayes, folweth the Cercle of the names of the
// Monthes ... Thanne hath Ianuare 31 dayes, Februare 28, March 31, Aprille 30, May 31, Iunius 30, Iulius 31,
// Augustus 31, September 30, Octobre 31, Novembre 30, December 31."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-10-months.js: lib/back-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The back, close on its lower edge, turned in the hand at an even pace through the year: each month comes round
// to the foot, its name is written in its place (in the instrument's Latin, as in II 1), and below the instrument
// the count of its days is shown.  The day strokes run round beside the names; a line where each month begins.
// The circle of days is the instrument's own, eccentric (shared module; see I 9 and II 1).
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import A from "./lib/astrolabe-47869.js";
import { back, node, label, f, rim, NIGHT, SILVER, T } from "./lib/back-ink.js";

const instances = new WeakMap();
const NAMES = ["Ianuarius", "Februarius", "Marcius", "Aprilis", "Maius", "Iunius", "Iulius", "Augustus", "September", "October", "November", "December"];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const LOOP = 16000; // ms: once round the year (the loop joins without a seam)
const STILL = (LOOP * (59 + 15.5)) / 365; // ms: the middle of March at the foot
const C = { x: 0, y: -112, k: 1.9 }; // the centre (above the glass) and scale: the lower edge fills it
const W = (px) => f(px / C.k); // stroke widths in window units
const RAD = Math.PI / 180;
const R_NAME = (T.months + T.daynum) / 2 - 2.1; // the names' baseline
const START = DAYS.map((_, m) => DAYS.slice(0, m).reduce((a, b) => a + b, 0)); // days elapsed when each begins

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
// the longitude (anticlockwise from the right-hand point) at which d days of the year have elapsed
function lon(d) {
  const c = A.calendar;
  const a = c.apogee * RAD;
  const m0 = -Math.asin(c.e * Math.sin(a));
  const m = m0 + ((d - c.ariesDoy) * 2 * Math.PI) / c.days;
  return Math.atan2(Math.sin(m) + c.e * Math.sin(a), Math.cos(m) + c.e * Math.cos(a)) / RAD;
}
const seg = (l, r0, r1) => {
  const p = rim(90 - l, r0);
  const q = rim(90 - l, r1);
  return `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const turn = node("g", {}, node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg));
  const b = back(turn, { scale: C.k, ticks: false, faint: 0.4 });
  b.throne.setAttribute("display", "none"); // the suspension would swing through the picture as it turns
  b.ring.setAttribute("display", "none");
  b.g.lastChild.previousSibling.setAttribute("display", "none");
  // the days: a stroke each, long every fifth of the month; a line where each month begins
  let d = "";
  let e = "";
  for (let m = 0; m < 12; m++)
    for (let i = 0; i < DAYS[m]; i++) {
      const l = lon(START[m] + i);
      if (i === 0) e += seg(l, T.months, T.spacer);
      else d += seg(l, (i + 1) % 5 ? T.ladder : T.daynum + 1.5, T.spacer);
    }
  node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": W(0.5), opacity: 0.85 }, turn);
  node("path", { d: e, fill: "none", stroke: SILVER, "stroke-width": W(1), opacity: 0.8 }, turn);
  // the names: each on an arc of its own month, drawn counter-clockwise (so the letters' tops are inwards)
  const defs = node("defs", {}, turn);
  const names = NAMES.map((name, m) => {
    const a = rim(90 - lon(START[m]), R_NAME);
    const z = rim(90 - lon(START[m] + DAYS[m]), R_NAME);
    const id = `mo${uid}-${m}`;
    node("path", { id, d: `M${f(a[0])} ${f(a[1])}A${f(R_NAME)} ${f(R_NAME)} 0 0 0 ${f(z[0])} ${f(z[1])}` }, defs);
    const t = node("text", { "font-size": f(13 / C.k), fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": f(3 / C.k), "stroke-linejoin": "round", "paint-order": "stroke" }, turn);
    const tp = node("textPath", { href: `#${id}`, startOffset: "50%", "text-anchor": "middle" }, t);
    tp.textContent = name;
    return t;
  });
  const count = label(svg, 0, 91, "", 16);
  el.appendChild(svg);
  const s = { turn, names, count, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL);
}

function draw(s, ms) {
  const day = (365 * ms) / LOOP; // the day of the year standing at the foot
  s.turn.setAttribute("transform", `rotate(${f((90 + lon(day) + 360) % 360)})`);
  // a name is blank until the middle of its month comes near the foot; written there; carried off
  s.names.forEach((n, m) => {
    const p = ((((day - START[m] - DAYS[m] / 2 + 182.5) % 365) + 365) % 365) - 182.5; // days past the foot
    n.setAttribute("opacity", f(ease((p + 12) / 12)));
  });
  let m = 11;
  while (m > 0 && START[m] > day) m--;
  const into = day - START[m];
  s.count.textContent = String(DAYS[m]);
  s.count.setAttribute("opacity", f(ease(into / 4) * ease((DAYS[m] - into) / 4)));
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, s.tm);
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
  draw(s, s.tm);
}
