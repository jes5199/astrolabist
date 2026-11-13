// A Treatise on the Astrolabe, Part II, 13: "Set the degree of the sonne up-on the lyne meridional, and rikene how many
// degrees of almikanteras ben by-twixe thyn est orisonte and the degree of the sonne. And tak ther thyn altitude
// meridian; this is to seyne, the heyest of the sonne as for that day."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-13-noon.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete, on Chaucer's 12 March (the sun in the first degree of Aries).  The rete turns until the
// sun's degree sits on the meridian line under the ring; then the almucantars are counted up the line from the horizon
// to the sun, each lit as it is passed, and the count gives the sun's height at noon.  Solved from the plate's geometry
// (52 degrees); shared lib/front.js; the rete is our constructed drawing of inv. 47869's.  Original line work.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9400; // ms: the sun on the meridian, its height counted
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = A.morning.sunLongitude;
const RA = Math.atan2(Math.cos(EPS) * Math.sin(SUN * RAD), Math.cos(SUN * RAD)) / RAD;
const DEC = Math.asin(Math.sin(EPS) * Math.sin(SUN * RAD)) / RAD;
const NOON = RA - 270; // the turn that puts the sun's degree under the ring (bearing 0)
const HEIGHT = 90 - P.latitude + DEC; // the sun's height at noon

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
function at(rot) {
  const r = (P.equator * Math.cos(DEC * RAD)) / (1 + Math.sin(DEC * RAD));
  return rim(270 - RA + rot, r);
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.12);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.5);
  const alm = fr.plate.almucantars.map((a) => {
    a.el.setAttribute("stroke", "currentColor");
    a.el.setAttribute("opacity", 0.18);
    return a;
  });
  // the meridian line, from the horizon's south point up toward the ring
  const [hc, hr] = almucantar(0);
  node("path", { d: `M0 ${f(-hc - hr)}V${f(-hc + hr)}`, stroke: SILVER, "stroke-width": W(0.9), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.7, fill: "none" }, fr.plate.clip);
  const sun = node("circle", { r: 3.4, fill: "#b9821c", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const count = node("text", { x: f(C.x + 10), y: f(C.y + C.k * (-hc + hr) - 6), "text-anchor": "start", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, alm, sun, count, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  const r = NOON - 70 * (1 - span(t, 0.6, 4.2)) * out - 70 * (1 - out);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const p = at(r);
  s.sun.setAttribute("cx", f(p[0]));
  s.sun.setAttribute("cy", f(p[1]));
  // counting up the meridian: almucantars lit one by one up to the sun's height
  const up = HEIGHT * span(t, 4.8, 8.4) * out;
  for (const a of s.alm) a.el.setAttribute("opacity", f(a.h <= up ? (a.h % 10 ? 0.6 : 0.95) : 0.18));
  s.count.textContent = `${Math.floor(up)}°`;
  s.count.setAttribute("opacity", f(span(t, 4.6, 5.0) * out));
  if (t > 8.4 && out > 0.5) s.count.textContent = `${HEIGHT.toFixed(1).replace(".5", "½").replace(/\.\d$/, (m) => (m === ".0" ? "" : m))}°`;
  s.count.setAttribute("y", f(C.y + C.k * (at(r)[1] + 22)));
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
