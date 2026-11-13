// A Treatise on the Astrolabe, Part II, 18: "Set the centre of the sterre up-on the lyne meridional, and tak keep of
// thy zodiak, and loke what degree of any signe that sit on the same lyne meridional at that same tyme, and tak the
// degree in which the sterre standeth; and with that same degree comth that same sterre un-to that same lyne fro the
// orisonte."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-18-mediation.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete.  The point of Alabor (Sirius, as engraved on inv. 47869) is ringed; the rete turns until
// it sits on the meridian line; the degree of the zodiac on the line with it is ringed and named: the star's degree,
// the one it comes to the meridian with.  The point is placed from the mediation and declination recorded for the
// pointer in our notes (4 Cancer, -13.8), so the degree found is that mediation by construction; what was checked
// independently is that the recorded points lie on the drawn rete's pointer tips (I 21: within 1.53 of 100).
// Shared lib/front.js; the rete is our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 8200; // ms: Alabor on the meridian, its degree named
const C = { x: 0, y: 18, k: 0.62 }; // the hanging ring inside the window (its top 183 units up, at -95; astrolabist #47901)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const rAt = (dec) => (P.equator * Math.cos(dec * RAD)) / (1 + Math.sin(dec * RAD));
// Alabor's point as read (the degree it culminates with, its declination): ox47869.md
const ALABOR = { lam: 94.2, dec: -13.8 };
const RA_S = raOf(ALABOR.lam);
const ON = RA_S - 270; // the turn that puts the point under the ring
// the degree of the ecliptic on the meridian at that turn: the one whose right ascension is the star's
function degreeOnMeridian() {
  let a = 0;
  let b = 180;
  const g = (lam) => ((((raOf(lam) - RA_S + 540) % 360) + 360) % 360) - 180;
  a = RA_S - 40;
  b = RA_S + 40;
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return a;
}
const MED = degreeOnMeridian();
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.75);
  node("path", { d: `M0 -${f(P.capricorn)}V${f(P.capricorn)}`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  // carried on the rete: the star's ring, and the ring for its degree
  const sp = rim(270 - RA_S, rAt(ALABOR.dec));
  const starRing = node("circle", { cx: f(sp[0]), cy: f(sp[1]), r: 4, fill: "none", stroke: SILVER, "stroke-width": W(1.2) }, fr.rete.g);
  const mp = rim(270 - RA_S, rAt(Math.asin(Math.sin(EPS) * Math.sin(MED * RAD)) / RAD));
  const degRing = node("circle", { cx: f(mp[0]), cy: f(mp[1]), r: 4.5, fill: "none", stroke: "#b9821c", "stroke-width": W(1.3), opacity: 0 }, fr.rete.g);
  const text = (anchor) => node("text", { "text-anchor": anchor, "font-size": 14, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const starName = text("end");
  starName.textContent = "Alabor";
  const degName = text("start");
  degName.textContent = nameOf(MED);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, starRing, degRing, starName, degName, sp, mp, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  const r = ON - 80 * (1 - span(t, 1.2, 5.6)) * out - 80 * (1 - out);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const rot = (p) => {
    const a = r * RAD;
    return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  };
  const a = rot(s.sp);
  const b = rot(s.mp);
  s.starName.setAttribute("x", f(C.x + C.k * a[0] - 8));
  s.starName.setAttribute("y", f(C.y + C.k * a[1] + 5));
  s.starName.setAttribute("opacity", f(span(t, 0.4, 0.9) * out));
  s.degRing.setAttribute("opacity", f(span(t, 6.0, 6.5) * out));
  s.degName.setAttribute("x", f(C.x + C.k * b[0] + 8));
  s.degName.setAttribute("y", f(C.y + C.k * b[1] + 5));
  s.degName.setAttribute("opacity", f(span(t, 6.4, 6.9) * out));
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
