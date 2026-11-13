// A Treatise on the Astrolabe, Part II, 20: "Set the degree of any signe up-on the lyne meridional, and rikne his
// altitude in almikanteras fro the est orizonte up to the same degree set in the forseide lyne, and set ther a prikke.
// Turne up thanne thy riet, and set the heved of Aries or Libra in the same meridional lyne, and set ther a-nother
// prikke ... the difference of thilke altitudes is the declinacion of thilke degree fro the equinoxial."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-20-declination.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete.  The head of Cancer is turned onto the meridian line and its altitude pricked; then the head
// of Aries, and another prick; the space between the pricks is lit and read: the declination of the head of Cancer,
// north (the obliquity of our plate, 24.1; Chaucer gives Ptolemy's 23 50 in I 17).  Solved from the plate's geometry
// (52 degrees); shared lib/front.js; the rete is our constructed drawing of inv. 47869's.  Original line work.

import { front, node, f, P, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9600; // ms: both pricks, the declination read
const C = { x: 0, y: 18, k: 0.62 }; // the hanging ring inside the window (its top 183 units up, at -95; astrolabist #47901)
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD)) / RAD;
const DEG = 90; // the head of Cancer
const H1 = 90 - P.latitude + decOf(DEG); // its altitude on the meridian
const H0 = 90 - P.latitude; // the head of Aries'
const meridianY = (h) => {
  const [c, r] = almucantar(h);
  return -(c + r); // where that almucantar crosses the meridian, toward the south
};
const Y1 = meridianY(H1);
const Y0 = meridianY(H0);

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
  fr.rete.g.setAttribute("opacity", 0.7);
  node("path", { d: `M0 -${f(P.capricorn)}V0`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  const prick = (y) => node("circle", { cy: f(y), r: 2.4, fill: "currentColor", stroke: SILVER, "stroke-width": W(0.9), opacity: 0 }, g);
  const p1 = prick(Y1);
  const p0 = prick(Y0);
  const span1 = node("path", { d: `M0 ${f(Y1)}V${f(Y0)}`, stroke: "#b9821c", "stroke-width": W(3.5), opacity: 0 }, g);
  const text = (y, str, size = 13) => {
    const t = node("text", { x: f(C.x + 9), y: f(y), "text-anchor": "start", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const t1 = text(C.y + C.k * Y1 + 4.5, `${H1.toFixed(1)}°`);
  const t0 = text(C.y + C.k * Y0 + 4.5, `${H0.toFixed(1)}°`);
  const tr = node("text", { x: 0, y: f(C.y + 46), "text-anchor": "middle", "font-size": 14, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  tr.textContent = `declination ${(H1 - H0).toFixed(1)}° north`;
  el.appendChild(svg);
  const s = { rete: fr.rete.g, p1, p0, span1, t1, t0, tr, raf: 0, t0_: 0, raf2: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  const rCancer = raOf(DEG) - 270;
  const rAries = raOf(0) - 270;
  const r = t < 4.4 ? rCancer - 40 * (1 - span(t, 0.4, 2.4)) : rCancer + (rAries + 360 * (rAries < rCancer ? 1 : 0) - rCancer) * span(t, 4.4, 6.8);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.p1.setAttribute("opacity", f(span(t, 2.8, 3.2) * out));
  s.t1.setAttribute("opacity", f(span(t, 3.0, 3.4) * out));
  s.p0.setAttribute("opacity", f(span(t, 7.2, 7.6) * out));
  s.t0.setAttribute("opacity", f(span(t, 7.4, 7.8) * out));
  s.span1.setAttribute("opacity", f(0.85 * span(t, 8.2, 8.7) * out));
  s.tr.setAttribute("opacity", f(span(t, 8.6, 9.2) * out));
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0_ = 0;
  const step = (now) => {
    if (!s.t0_) s.t0_ = now - s.tm;
    s.tm = (now - s.t0_) % LOOP;
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
