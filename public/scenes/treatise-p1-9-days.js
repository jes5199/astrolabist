// A Treatise on the Astrolabe, Part I, 9: "Next this folweth the Cercle of the Dayes, that ben figured in maner of
// degrees, that contienen in noumbre 365; divyded also with longe strykes fro fyve to fyve."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The whole back.  From the first of January the days are struck round the circle one by one, a long stroke at
// every fifth day of the month, a line where each month begins; in the middle the count runs up to 365.  The days
// are spaced as on this instrument's own circle of days, which is eccentric (the sun is slower in summer), fitted
// in our drawing to where each sign begins against the days (shared module; see II 1).
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import A from "./lib/astrolabe-47869.js";
import { back, node, label, f, rim, SILVER, T } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 9000; // ms: the year struck, 365 in the middle
const C = { x: 0, y: 0, k: 0.9 };
const W = (px) => f(px / C.k); // stroke widths in window units
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const RAD = Math.PI / 180;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
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
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const b = back(g, { scale: C.k, faint: 0.4 });
  b.throne.setAttribute("display", "none");
  b.ring.setAttribute("display", "none");
  b.g.lastChild.previousSibling.setAttribute("display", "none");
  // the days, one element each (struck one by one): bearing from the elapsed days at the day's start
  const days = [];
  let doy = 0;
  for (let m = 0; m < 12; m++) {
    for (let i = 0; i < MONTH_DAYS[m]; i++) {
      const l = lon(doy + i);
      const first = i === 0;
      const long = (i + 1) % 5 === 0;
      days.push(node("path", { d: seg(l, first ? T.daynum - 3 : long ? T.daynum : T.ladder, T.spacer), fill: "none", stroke: first ? SILVER : "currentColor", "stroke-width": W(first ? 1.1 : long ? 0.8 : 0.45), opacity: 0 }, g));
    }
    doy += MONTH_DAYS[m];
  }
  const count = label(svg, 0, 7, "", 18);
  const bead = node("circle", { r: 2.2, fill: SILVER, opacity: 0 }, g);
  el.appendChild(svg);
  const s = { days, count, bead, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  const n = 365 * Math.min(1, Math.max(0, (t - 0.8) / 6.5)); // days struck so far
  s.days.forEach((p, i) => p.setAttribute("opacity", f(Math.min(1, Math.max(0, n - i)) * out)));
  s.count.textContent = String(Math.max(1, Math.ceil(n)));
  s.count.setAttribute("opacity", f(span(t, 0.6, 1.0) * out));
  const p = rim(90 - lon(n), (T.ladder + T.spacer) / 2);
  s.bead.setAttribute("cx", f(p[0]));
  s.bead.setAttribute("cy", f(p[1]));
  s.bead.setAttribute("opacity", f(span(t, 0.6, 0.9) * (1 - span(t, 7.3, 7.9))));
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
