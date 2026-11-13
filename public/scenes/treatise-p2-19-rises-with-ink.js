// A Treatise on the Astrolabe, Part II, 19: "Set the centre of the sterre up-on the est orisonte, and loke what degree
// of any signe that sit up-on the same orisonte at that same tyme. And understond wel, that with that same degree
// aryseth that same sterre; and this merveyllous arysing with a strange degree in another signe is by-cause that the
// latitude of the sterre fix is either north or south fro the equinoxial."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-19-rises-with.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete.  Alabor (Sirius, as engraved on inv. 47869), whose own degree is Cancer 4 (it comes to the
// meridian with it, II 18), is turned onto the eastern horizon; the degree of the zodiac on the horizon with it is
// ringed and named: it rises with a strange degree in another sign, because it stands far south.  Solved from the
// plate's geometry; the star's point as recorded in our notes; shared lib/front.js; the rete is our constructed drawing
// of inv. 47869's.  Original line work; nothing is traced.

import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 8200; // ms: Alabor on the eastern horizon, the degree rising with it named
const C = { x: 0, y: 18, k: 0.62 }; // the hanging ring inside the window (its top 183 units up, at -95; astrolabist #47901)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const nameOf = (lam) => `${SIGNS[Math.floor((((lam % 360) + 360) % 360) / 30)]} ${Math.round((((lam % 360) + 360) % 360) % 30)}°`;
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const rAt = (dec) => (P.equator * Math.cos(dec * RAD)) / (1 + Math.sin(dec * RAD));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, rAt(Math.asin(Math.sin(EPS) * Math.sin(lam * RAD)) / RAD));
const ALABOR = { lam: 94.2, dec: -13.8 };
const RA_S = raOf(ALABOR.lam);
const starAt = (rot) => rim(270 - RA_S + rot, rAt(ALABOR.dec));
const [HC, HR] = almucantar(0);
const onH = (p) => Math.hypot(p[0], p[1] + HC) - HR;
function root(g, a, b) {
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return (a + b) / 2;
}
// the turn that sets the star on the eastern horizon
let RISE = 0;
for (let r = 0; r < 360; r += 1) {
  const g = (x) => onH(starAt(x));
  if (g(r) * g(r + 1) <= 0) {
    const x = root(g, r, r + 1);
    if (starAt(x)[0] < 0) RISE = x;
  }
}
// the degree on the eastern horizon then
let WITH = 0;
for (let l = 0; l < 360; l += 1) {
  const g = (x) => onH(eclAt(x, RISE));
  if (g(l) * g(l + 1) <= 0) {
    const x = root(g, l, l + 1);
    if (eclAt(x, RISE)[0] < 0) WITH = x;
  }
}

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.25);
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.75);
  const starRing = node("circle", { r: 4, fill: "none", stroke: SILVER, "stroke-width": W(1.2) }, g);
  const degRing = node("circle", { r: 4.5, fill: "none", stroke: "#b9821c", "stroke-width": W(1.3), opacity: 0 }, g);
  const text = (anchor, size = 14) => node("text", { "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const starName = text("start");
  starName.textContent = "Alabor";
  const degName = text("start");
  degName.textContent = `rises with ${nameOf(WITH)}`;
  el.appendChild(svg);
  const s = { rete: fr.rete.g, starRing, degRing, starName, degName, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  const r = RISE - 70 * (1 - span(t, 1.2, 5.6)) * out - 70 * (1 - out);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const a = starAt(r);
  const b = eclAt(WITH, r);
  s.starRing.setAttribute("cx", f(a[0]));
  s.starRing.setAttribute("cy", f(a[1]));
  s.starName.setAttribute("x", f(C.x + C.k * a[0] + 8));
  s.starName.setAttribute("y", f(C.y + C.k * a[1] + 5));
  s.starName.setAttribute("opacity", f(span(t, 0.4, 0.9) * out));
  s.degRing.setAttribute("cx", f(b[0]));
  s.degRing.setAttribute("cy", f(b[1]));
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
