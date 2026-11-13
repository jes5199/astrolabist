// A Treatise on the Astrolabe, Part II, 17: "Tak the altitude of this sterre whan he is on the est side of the lyne
// meridional ... and tak an assendent ... espye diligently whan this same firste sterre ... hath him a-non right in the
// same noumbre of altitude on the west side of this lyne meridional as he was caught on the est side; and tak a newe
// assendent ... rikne wel the middel degree by-twene bothe assendentes, and set thilke middel degree up-on thin est
// orisonte; and waite thanne what degree that sit up-on the lyne meridional, and tak ther the verrey degree of the
// ecliptik in which the sterre stondeth."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW, 3:2 (3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917):
// Chaucer's steps one at a time, listed beside the instrument, the step being done in red.  A star that is not on the
// rete (a red point turning with the sky) at 30 degrees in the east: the first ascendant marked; at 30 in the west: the
// second; the middle between them; that middle set on the eastern horizon; the degree then on the meridian line ringed
// and named: the star's degree.
// PROVISIONAL (jes tg 17917: keep it, flagged): "the middel degree by-twene bothe assendentes" is read as the middle IN
// TIME (in the border), as Chaucer reckons spans elsewhere: the rete's turn half way between the two sightings, which is
// when the star stands on the meridian (equal altitudes east and west).  Reckoned along the zodiac instead, the middle
// would differ by some 26 degrees here (at this latitude the signs rise very unequally).  The middle is shown as the
// half-way point of the star's own path in the border.  Replaces treatise-p2-17-star-place.js (the dark style).
// Solved from the plate's geometry (52 degrees); COLOURED WOODCUT on vellum, shared lib/front-ink.js.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 34000;
const STILL = 29000; // ms: the middle on the horizon, the star's degree on the meridian named
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -78, size: 9.6, lh: 11, gap: 6, indent: 10, width: 142 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 5, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C; // the layout being built (set by build)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const STAR = { ra: 200, dec: 20 }; // a star not on the rete
const ALT = 30;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const norm = (x) => ((x % 360) + 360) % 360;
const nameOf = (lam) => `${SIGNS[Math.floor(norm(lam) / 30)]} ${Math.round(norm(lam) % 30)}°`;
const [HC, HR] = almucantar(0);

const raOf = (lam) => norm(Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD);
const rAt = (dec) => (P.equator * Math.cos(dec * RAD)) / (1 + Math.sin(dec * RAD));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, rAt(Math.asin(Math.sin(EPS) * Math.sin(lam * RAD)) / RAD));
const starBearing = (rot) => 270 - STAR.ra + rot;
const starAt = (rot) => rim(starBearing(rot), rAt(STAR.dec));
function root(g, a, b) {
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}
// the turns at which the star stands at ALT, east (x < 0) and west
const [AC, AR] = almucantar(ALT);
const gStar = (rot) => Math.hypot(starAt(rot)[0], starAt(rot)[1] + AC) - AR;
function starTurn(side) {
  for (let r = 0; r < 360; r += 1)
    if (gStar(r) * gStar(r + 1) <= 0) {
      const x = root(gStar, r, r + 1);
      if (Math.sign(starAt(x)[0]) === side) return x;
    }
  return 0;
}
// the degree on the eastern horizon at a turn
function ascendant(rot) {
  const g = (lam) => Math.hypot(eclAt(lam, rot)[0], eclAt(lam, rot)[1] + HC) - HR;
  for (let l = 0; l < 360; l += 1)
    if (g(l) * g(l + 1) <= 0) {
      const x = root(g, l, l + 1);
      if (eclAt(x, rot)[0] < 0) return x;
    }
  return 0;
}
const R1 = starTurn(-1);
let R2 = starTurn(1);
if (R2 < R1) R2 += 360;
const A1 = ascendant(R1);
const A2 = ascendant(R2);
const RM = (R1 + R2) / 2; // the middle in time (PROVISIONAL, above)
const AM = ascendant(RM);
// the degree on the meridian line then (under the ring: bearing 0): the one whose right ascension is 270 + RM
const MED = (() => {
  const want = norm(270 + RM);
  return root((lam) => norm(raOf(lam) - want + 180) - 180, want - 40, want + 40);
})();

const STEPS = [
  { t: 0.5, lines: ["the star east of the meridian: its altitude, 30°"] },
  { t: 4.4, lines: ["take the ascendant then; remember both"] },
  { t: 8.0, lines: ["wait until it stands as high on the west side"] },
  { t: 12.6, lines: ["take the new ascendant"] },
  { t: 16.0, lines: ["find the middle between the two"] },
  { t: 20.0, lines: ["set that middle degree on the east horizon"] },
  { t: 25.0, lines: ["the degree on the meridian line: the star's degree"] },
];
const END = 31.0;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

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
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.8);
  // the 30-degree circle, each side lit in its step
  const side = (west, id) => {
    const cp = node("clipPath", { id }, g);
    node("rect", { x: west ? 0 : -100, y: -100, width: 100, height: 200 }, cp);
    return node("circle", { cy: f(-AC), r: f(AR), fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0, "clip-path": `url(#${id})` }, fr.plate.clip.parentNode);
  };
  const eastC = side(false, "e" + uid);
  const westC = side(true, "w" + uid);
  // the meridian line
  const meridian = node("path", { d: `M0 ${f(-P.capricorn)}V0`, stroke: SILVER, "stroke-width": W(1.4), "stroke-dasharray": `${W(3)} ${W(2)}`, fill: "none", opacity: 0 }, g);
  // the star's path in the border between the two sightings, and its middle
  const RB = A.frontRadii.outer + 4;
  const path = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(2.6), "stroke-linecap": "round", opacity: 0 }, g);
  const tick = node("circle", { cy: f(-RB), r: 4, fill: VELLUM, stroke: SILVER, "stroke-width": W(2.2), opacity: 0 }, g);
  // the star: a four-pointed star in red on a vellum halo
  const star = node("path", { d: "M0 -6L1.5 -1.5L6 0L1.5 1.5L0 6L-1.5 1.5L-6 0L-1.5 -1.5Z", fill: SILVER, stroke: VELLUM, "stroke-width": W(1), "paint-order": "stroke" }, g);
  // the marks on the zodiac: the two ascendants (ochre), the middle (red), the star's degree (ringed)
  const mark = (fill) => node("circle", { r: 3.6, fill, stroke: "currentColor", "stroke-width": W(1), opacity: 0 }, g);
  const m1 = mark(WASH.ochre);
  const m2 = mark(WASH.ochre);
  const mm = mark(SILVER);
  const med = node("circle", { r: 6, fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0 }, g);
  const medName = node("text", { "font-size": f((12 * C.k) / 0.76), "font-weight": 700, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  medName.textContent = nameOf(MED);
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, C, rete: fr.rete.g, eastC, westC, meridian, path, tick, RB, star, m1, m2, mm, med, medName, rows });
  draw(s, s.tm / 1000);
}

// the turn through the loop: in to the east sighting; on to the west one; back to the middle; at the end back to the start
function turnAt(t) {
  if (t < 8.4) return R1 - 30 + 30 * span(t, 0.6, 2.6);
  if (t < 20.4) return R1 + (R2 - R1) * span(t, 8.4, 11.6);
  if (t < 31.4) return R2 + (RM - R2) * span(t, 20.4, 23.2);
  return RM + (R1 - 30 - RM) * span(t, 31.4, 33.4);
}
const place = (el, p) => {
  el.setAttribute("cx", f(p[0]));
  el.setAttribute("cy", f(p[1]));
};
function arc(b0, b1, r) {
  if (b1 - b0 < 0.5) return "";
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${b1 - b0 > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.6);
  const r = turnAt(t);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = starAt(r);
  s.star.setAttribute("transform", `translate(${f(sp[0])} ${f(sp[1])})`);
  s.eastC.setAttribute("opacity", f(span(t, 0.8, 1.4) * (1 - span(t, 7.6, 8.2))));
  s.westC.setAttribute("opacity", f(span(t, 8.2, 8.8) * (1 - span(t, 15.6, 16.2))));
  // the marks carry with the rete once made: each is a degree of the zodiac
  place(s.m1, eclAt(A1, r));
  s.m1.setAttribute("opacity", f(span(t, 4.6, 5.0) * out));
  place(s.m2, eclAt(A2, r));
  s.m2.setAttribute("opacity", f(span(t, 12.8, 13.2) * out));
  // the middle: the star's path in the border from the first sighting to the second, its half-way point (on the meridian)
  const b1 = norm(starBearing(R1));
  const b2 = b1 + (R2 - R1);
  s.path.setAttribute("d", arc(b1, b1 + (b2 - b1) * span(t, 16.4, 18.0), s.RB));
  s.path.setAttribute("opacity", f(span(t, 16.2, 16.5) * out));
  s.tick.setAttribute("opacity", f(span(t, 18.2, 18.6) * out));
  place(s.mm, eclAt(AM, r));
  s.mm.setAttribute("opacity", f(span(t, 22.8, 23.3) * out));
  // the meridian line and the star's degree on it
  // (the middle of the star's path is on the meridian: the line shows with it)
  s.meridian.setAttribute("opacity", f(0.9 * span(t, 18.4, 18.9) * out));
  const mp = eclAt(MED, r);
  place(s.med, mp);
  s.med.setAttribute("opacity", f(span(t, 25.6, 26.1) * out));
  s.medName.setAttribute("x", f(s.C.x + s.C.k * (mp[0] + 9)));
  s.medName.setAttribute("y", f(s.C.y + s.C.k * mp[1] + 4));
  s.medName.setAttribute("opacity", f(span(t, 26.0, 26.5) * out));
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
