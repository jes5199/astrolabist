// A Treatise on the Astrolabe, Part II, 34: "Tak the altitude of the mone, and rikne thyn altitude up among thyne
// almikanteras on which syde that the mone stande; and set there a prikke. Tak thenne anon-right, up-on the mones syde,
// the altitude of any sterre fix which that thou knowest, and set his centre up-on his altitude among thyn almikanteras
// ther the sterre is founde. Waite thanne which degree of the zodiak toucheth the prikke of the altitude of the mone,
// and tak ther the degree in which the mone standeth."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete, by night.  The moon's altitude (41, in the east) is marked among the almucantars; Alabor is
// set on its own altitude (12, as in Chaucer's night example, II 3); the degree of the zodiac that then touches the
// moon's altitude on its side is ringed and named: the moon's degree.  The moon is taken on the ecliptic (the text
// makes no exception for its latitude).  Solved from the plate's geometry (52 degrees); shared lib/front.js; the rete
// and its setting are our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9800; // ms: the star set, the moon's degree named
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ROT = A.night.rot; // Alabor on its altitude
const MOON = 165; // the moon's degree (Virgo 15): the scene finds it again from the altitudes
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, rAt(decOf(lam)));
const altOf = (ra, dec, rot) => {
  const HA = (((((270 - ra + rot) + 180) % 360) + 360) % 360) - 180;
  return Math.asin(Math.sin(LAT) * Math.sin(dec) + Math.cos(LAT) * Math.cos(dec) * Math.cos(HA * RAD)) / RAD;
};
const H_MOON = altOf(raOf(MOON), decOf(MOON), ROT);
const H_STAR = A.night.starAlt;
const STAR = { ra: raOf(94.2), dec: -13.8 * RAD };
// find the moon's degree again as the text does: the degree on the moon's side (east) at the moon's altitude
function degreeAt(h, rot) {
  const [c, r] = almucantar(h);
  const g = (lam) => Math.hypot(...((p) => [p[0], p[1] + c])(eclAt(lam, rot))) - r;
  let best = null;
  for (let l = 0; l < 360; l += 1) {
    if (g(l) * g(l + 1) > 0) continue;
    let a = l;
    let b = l + 1;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (eclAt(a, rot)[0] < 0) best = a; // the moon's side: the east
  }
  return best;
}
const FOUND = degreeAt(H_MOON, ROT);
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.12);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.12);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.12);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.65);
  // the two altitude circles, each only on its own side (clipped to the plate and the side)
  const side = (x0, x1, id) => {
    const cp = node("clipPath", { id }, g);
    node("rect", { x: x0, y: -100, width: x1 - x0, height: 200 }, cp);
    return `url(#${id})`;
  };
  const eastClip = side(-100, 0, "e" + uid);
  const westClip = side(0, 100, "w" + uid);
  const circle = (h, stroke, clip) => {
    const [c, r] = almucantar(h);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke, "stroke-width": W(1.4), opacity: 0, "clip-path": clip }, fr.plate.clip);
  };
  const moonAlm = circle(H_MOON, SILVER, eastClip);
  const starAlm = circle(H_STAR, "#f6d77a", westClip);
  const starRing = node("circle", { r: 4, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.2), opacity: 0 }, g);
  const moonRing = node("circle", { r: 4.5, fill: "none", stroke: SILVER, "stroke-width": W(1.4), opacity: 0 }, g);
  const text = (anchor, size = 13) => node("text", { "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const tMoonAlt = text("end");
  tMoonAlt.textContent = `moon ${Math.round(H_MOON)}°`;
  const tStar = text("start");
  tStar.textContent = `Alabor ${H_STAR}°`;
  const tMoon = text("middle", 15);
  tMoon.textContent = `the moon: ${nameOf(FOUND)}`;
  el.appendChild(svg);
  const s = { rete: fr.rete.g, moonAlm, starAlm, starRing, moonRing, tMoonAlt, tStar, tMoon, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  // 1: the moon's altitude marked; 2: the rete turned till Alabor sits on its own; 3: the degree on the moon's mark
  s.moonAlm.setAttribute("opacity", f(span(t, 0.6, 1.2) * out));
  const [mc, mr] = almucantar(H_MOON);
  s.tMoonAlt.setAttribute("x", f(C.x + C.k * -mr * 0.72 - 4));
  s.tMoonAlt.setAttribute("y", f(C.y + C.k * (-mc - mr * 0.69) + 4));
  s.tMoonAlt.setAttribute("opacity", f(span(t, 1.0, 1.5) * out));
  s.starAlm.setAttribute("opacity", f(span(t, 2.0, 2.6) * out));
  const r = ROT - 50 * (1 - span(t, 2.6, 6.4)) * out - 50 * (1 - out);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = rim(270 - STAR.ra + r, rAt(STAR.dec));
  s.starRing.setAttribute("cx", f(sp[0]));
  s.starRing.setAttribute("cy", f(sp[1]));
  s.starRing.setAttribute("opacity", f(span(t, 2.2, 2.6) * out));
  s.tStar.setAttribute("x", f(C.x + C.k * sp[0] + 7));
  s.tStar.setAttribute("y", f(C.y + C.k * sp[1] - 5));
  s.tStar.setAttribute("opacity", f(span(t, 2.4, 2.8) * out));
  const mp = eclAt(FOUND, r);
  s.moonRing.setAttribute("cx", f(mp[0]));
  s.moonRing.setAttribute("cy", f(mp[1]));
  s.moonRing.setAttribute("opacity", f(span(t, 7.0, 7.5) * out));
  s.tMoon.setAttribute("x", 0);
  s.tMoon.setAttribute("y", f(C.y + 62));
  s.tMoon.setAttribute("opacity", f(span(t, 7.4, 8.0) * out));
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
