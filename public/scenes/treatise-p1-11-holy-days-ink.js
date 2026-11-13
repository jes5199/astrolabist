// A Treatise on the Astrolabe, Part I, 11: "Than folwen the names of the Halidayes in the Kalender, and next hem the
// lettres of the Abc. on which they fallen."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-11-holy-days.js: lib/back-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The back, close on its inner calendar rings at the foot, turned evenly through the year.  This instrument's own
// calendar carries three holy days a month: the saint's name (abbreviated, as engraved), the day of the month under
// it, and under that the letter of the ABC on which it falls (1 January = A).  As each comes round to the foot its
// name, day and letter are written in turn; the month names ring outside them.  The 36 saints, days and letters are
// as read on inv. 47869 in our drawing (docs/video2/drawings/back47869.md), each letter checked against its day;
// set evenly across their month, as the drawing sets them.
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import A from "./lib/astrolabe-47869.js";
import { back, node, f, rim, NIGHT, SILVER, T } from "./lib/back-ink.js";

const instances = new WeakMap();
// [saints, days] a month, as read
const CAL = [
  [["circ", "epi", "vicen"], [1, 6, 22]],
  [["puri", "scola", "cath"], [2, 10, 22]],
  [["cedde", "greg'", "anu"], [2, 12, 25]],
  [["ambr", "elfe", "marc"], [4, 19, 25]],
  [["philip", "dunsta", "aldel"], [1, 19, 25]],
  [["barna", "alba", "pe.p"], [11, 22, 29]],
  [["tho", "marga", "iac"], [7, 20, 25]],
  [["laur", "assu", "bart"], [10, 15, 24]],
  [["mari", "mathe", "mich"], [8, 21, 29]],
  [["dion", "luce", "simon"], [9, 18, 28]],
  [["mart", "hugo", "kate"], [11, 17, 25]],
  [["concep", "thom", "nati"], [8, 21, 25]],
];
const MONTHS = ["Ianuarius", "Februarius", "Marcius", "Aprilis", "Maius", "Iunius", "Iulius", "Augustus", "September", "October", "November", "December"];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const START = DAYS.map((_, m) => DAYS.slice(0, m).reduce((a, b) => a + b, 0));
const LOOP = 24000; // ms: once round the year (the loop joins without a seam)
const STILL = (LOOP * (59 + 15.5)) / 365; // ms: mid March at the foot: greg' with its day and letter written
const C = { x: 0, y: -188, k: 4 }; // the centre above the glass: the inner calendar rings at the foot
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const RING = { saint: (T.saints + T.months) / 2, day: (T.days + T.saints) / 2, letter: (T.letters + T.days) / 2, month: (T.months + T.daynum) / 2 };

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
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
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const turn = node("g", {}, node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg));
  const b = back(turn, { scale: C.k, ticks: false, faint: 0.5 });
  b.throne.setAttribute("display", "none");
  b.ring.setAttribute("display", "none");
  b.g.lastChild.previousSibling.setAttribute("display", "none");
  // a word set tangentially at day d on ring r, tops inwards (upright at the foot)
  const word = (str, d, r, size, fill) => {
    const l = lon(d);
    const p = rim(90 - l, r);
    const t = node("text", { transform: `translate(${f(p[0])} ${f(p[1])}) rotate(${f(90 - l - 180)})`, y: f(size / C.k / 2.8), "text-anchor": "middle", "font-size": f(size / C.k), fill, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": f(3 / C.k), "stroke-linejoin": "round", "paint-order": "stroke" }, turn);
    t.textContent = str;
    return t;
  };
  // the month lines across the calendar rings, and the month names (quiet, for the place in the year)
  let d = "";
  for (let m = 0; m < 12; m++) d += seg(lon(START[m]), T.letters, T.daynum);
  node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": W(0.8), opacity: 0.7 }, turn);
  MONTHS.forEach((name, m) => word(name, START[m] + DAYS[m] / 2, RING.month, 12, "currentColor").setAttribute("opacity", 0.75));
  // the 36: set evenly across their month, the day and the letter under the saint
  const items = [];
  CAL.forEach(([saints, days], m) =>
    saints.forEach((saint, k) => {
      const pos = START[m] + (DAYS[m] * (k + 0.5)) / 3;
      const letter = "ABCDEFG"[(START[m] + days[k] - 1) % 7]; // the day's letter, 1 January = A
      items.push({ pos, els: [word(saint, pos, RING.saint, 13, SILVER), word(String(days[k]), pos, RING.day, 13, SILVER), word(letter, pos, RING.letter, 14, "currentColor")] });
    }),
  );
  el.appendChild(svg);
  const s = { turn, items, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL);
}

function draw(s, ms) {
  const day = (365 * ms) / LOOP; // the day of the year at the foot
  s.turn.setAttribute("transform", `rotate(${f((90 + lon(day) + 360) % 360)})`);
  // each item blank until it comes near the foot; then its name, its day, its letter, one after another
  for (const it of s.items) {
    const p = ((((day - it.pos + 182.5) % 365) + 365) % 365) - 182.5; // days past the foot
    it.els.forEach((e, j) => e.setAttribute("opacity", f(ease((p + 6 - 1.6 * j) / 2))));
  }
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
