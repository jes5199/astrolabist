// A Treatise on the Astrolabe, Part II, 17: "Tak the altitude of this sterre whan he is on the est side of the lyne
// meridional ... and tak an assendent ... espye diligently whan this same firste sterre ... hath him a-non right in the
// same noumbre of altitude on the west side of this lyne meridional as he was caught on the est side; and tak a newe
// assendent ... rikne wel the middel degree by-twene bothe assendentes, and set thilke middel degree up-on thin est
// orisonte; and waite thanne what degree that sit up-on the lyne meridional, and tak ther the verrey degree of the
// ecliptik in which the sterre stondeth."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete, and a star that is not on it (a silver point turning with the sky).  At 30 degrees in the
// east: the first ascendant marked; at 30 in the west: the second; the middle between them (reckoned in the border,
// that is in time) set on the eastern horizon; the degree then on the meridian line is ringed and named: the star's degree.  All solved from the plate's
// geometry (52 degrees); shared lib/front.js; the rete is our constructed drawing of inv. 47869's.  Original line work.

import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 13600; // ms: the middle degree on the horizon, the star's degree on the meridian named
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const STAR = { ra: 200, dec: 20 }; // a star not on the rete
const ALT = 30;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const nameOf = (lam) => `${SIGNS[Math.floor((((lam % 360) + 360) % 360) / 30)]} ${Math.round((((lam % 360) + 360) % 360) % 30)}°`;
const [HC, HR] = almucantar(0);

const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const rAt = (dec) => (P.equator * Math.cos(dec * RAD)) / (1 + Math.sin(dec * RAD));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, rAt(Math.asin(Math.sin(EPS) * Math.sin(lam * RAD)) / RAD));
const starAt = (rot) => rim(270 - STAR.ra + rot, rAt(STAR.dec));
// bisection over [a, b] for a sign change of g
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
const gStar = (rot) => Math.hypot(...((p) => [p[0], p[1] + AC])(starAt(rot))) - AR;
function starTurn(side) {
  for (let r = 0; r < 360; r += 1) if (gStar(r) * gStar(r + 1) <= 0) {
    const x = root(gStar, r, r + 1);
    if (Math.sign(starAt(x)[0]) === side) return x;
  }
  return 0;
}
// the degree on the eastern horizon at a turn
function ascendant(rot) {
  const g = (lam) => Math.hypot(...((p) => [p[0], p[1] + HC])(eclAt(lam, rot))) - HR;
  for (let l = 0; l < 360; l += 1) if (g(l) * g(l + 1) <= 0) {
    const x = root(g, l, l + 1);
    if (eclAt(x, rot)[0] < 0) return x;
  }
  return 0;
}
const R1 = starTurn(-1);
let R2 = starTurn(1);
if (R2 < R1) R2 += 360;
const A1 = ascendant(R1);
let A2 = ascendant(R2);
if (A2 < A1) A2 += 360;
// "the middel degree by-twene bothe assendentes", reckoned in the border (in time), as Chaucer reckons spans
// elsewhere: the turn half way between the two, and the degree on the eastern horizon then.  (Reckoned along the zodiac
// instead, the middle would be wrong by some 26 degrees here: at this latitude the signs rise very unequally.)
const RM = (R1 + R2) / 2;
const AM = ascendant(RM);
// the degree on the meridian line then (under the ring: bearing 0)
const MED = (() => {
  const want = (((270 + RM) % 360) + 360) % 360; // its right ascension
  return root((lam) => ((((raOf(lam) - want + 540) % 360) + 360) % 360) - 180, want - 40, want + 40);
})();

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", a.h === ALT ? 0.95 : 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.12);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.35);
  fr.rete.g.setAttribute("opacity", 0.55);
  node("path", { d: `M0 -${f(P.capricorn)}V0`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  const star = node("path", { d: "M0 -5L1.2 -1.2L5 0L1.2 1.2L0 5L-1.2 1.2L-5 0L-1.2 -1.2Z", fill: SILVER }, g);
  const mark = (fill) => node("circle", { r: 3.2, fill, stroke: NIGHT, "stroke-width": W(0.7), opacity: 0 }, g);
  const m1 = mark("#f6d77a");
  const m2 = mark("#f6d77a");
  const mm = mark(SILVER);
  const med = node("circle", { r: 5.5, fill: "none", stroke: SILVER, "stroke-width": W(1.3), opacity: 0 }, g);
  const text = (size, anchor = "middle") => node("text", { "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const cap = text(13);
  cap.setAttribute("x", 0);
  cap.setAttribute("y", f(C.y - 73));
  const medName = text(14, "start");
  el.appendChild(svg);
  const s = { rete: fr.rete.g, star, m1, m2, mm, med, cap, medName, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// the turn through the loop: to the east altitude, pause; to the west, pause; back to the middle setting, pause
function turnAt(t) {
  if (t < 1.4) return R1 - 30 + 30 * span(t, 0, 1.4);
  if (t < 4.0) return R1;
  if (t < 6.4) return R1 + (R2 - R1) * span(t, 4.0, 6.4);
  if (t < 9.0) return R2;
  if (t < 11.4) return R2 + (RM - R2) * span(t, 9.0, 11.4);
  if (t < 16.6) return RM;
  return RM + (R1 - 30 - RM) * span(t, 16.6, 18);
}
const place = (el, p) => {
  el.setAttribute("cx", f(p[0]));
  el.setAttribute("cy", f(p[1]));
};

function draw(s, t) {
  const out = 1 - span(t, 16.6, 17.4);
  const r = turnAt(t);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = starAt(r);
  s.star.setAttribute("transform", `translate(${f(sp[0])} ${f(sp[1])})`);
  // the marks carry with the rete once made: each is a degree of the zodiac
  place(s.m1, eclAt(A1, r));
  s.m1.setAttribute("opacity", f(span(t, 1.8, 2.2) * out));
  place(s.m2, eclAt(A2, r));
  s.m2.setAttribute("opacity", f(span(t, 7.0, 7.4) * out));
  place(s.mm, eclAt(AM, r));
  s.mm.setAttribute("opacity", f(span(t, 9.2, 9.6) * out));
  place(s.med, eclAt(MED, r));
  s.med.setAttribute("opacity", f(span(t, 12.0, 12.5) * out));
  const mp = eclAt(MED, r);
  s.medName.setAttribute("x", f(C.x + C.k * mp[0] + 8));
  s.medName.setAttribute("y", f(C.y + C.k * mp[1] + 5));
  s.medName.textContent = nameOf(MED);
  s.medName.setAttribute("opacity", f(span(t, 12.3, 12.8) * out));
  const step = t < 4.0 ? "30° east: ascendant 1" : t < 9.0 ? "30° west: ascendant 2" : t < 11.6 ? "the middle, rising" : "the star's degree";
  s.cap.textContent = step;
  s.cap.setAttribute("opacity", f(span(t, 1.6, 2.0) * out));
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
