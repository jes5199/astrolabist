// A Treatise on the Astrolabe, Part II, 21: "Rikne how manye degrees of almikanteras, in the meridional lyne, be fro the
// cercle equinoxial un-to the senith; or elles fro the pool artik un-to the north orisonte; and for so gret a latitude
// or for so smal a latitude is the table compouned."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-21-plate-latitude.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The plate, without its rete.  Along the meridian line, first from where the equinoctial crosses it (toward the south)
// up to the zenith, the almucantars lit and counted; then from the north point of the horizon up to the pole: both
// counts come to the same number, the latitude the plate was made for.  Our constructed plate of inv. 47869, computed
// for 52 degrees (shared lib/front.js).  Original line work; nothing is traced.

import { front, node, f, P, almucantar, ZENITH, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 10200; // ms: both counts done, the latitude named
const C = { x: 0, y: 6, k: 1.12 };
const W = (px) => f(px / C.k);
const LAT = P.latitude;
const S0 = 90 - LAT; // the equinoctial on the meridian, toward the south: this altitude

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const south = (h) => {
  const [c, r] = almucantar(h);
  return -(c + r);
};
const north = (h) => {
  const [c, r] = almucantar(h);
  return -c + r;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.12);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.35);
  fr.plate.horizon.setAttribute("opacity", 1);
  node("path", { d: `M0 ${f(-P.capricorn)}V${f(north(0))}`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  // the two runs along the meridian, drawn as they are counted
  const run = (y0, y1) => node("path", { d: `M0 ${f(y0)}V${f(y1)}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, stroke: "#b9821c", "stroke-width": W(3), fill: "none" }, g);
  const r1 = run(south(S0), -ZENITH);
  const r2 = run(north(0), 0);
  const dot = (y, fill) => node("circle", { cy: f(y), r: 2.4, fill, stroke: NIGHT, "stroke-width": W(0.6), opacity: 0 }, g);
  const marks = [dot(south(S0), SILVER), dot(-ZENITH, SILVER), dot(north(0), SILVER), dot(0, SILVER)];
  const text = (x, y, anchor, size = 13) => node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const c1 = text(C.x + 8, C.y + C.k * ((south(S0) - ZENITH) / 2) + 4.5, "start");
  const c2 = text(C.x + 8, C.y + C.k * (north(0) / 2) + 4.5, "start");
  const name = text(0, C.y + C.k * north(0) + 20, "middle", 15);
  name.textContent = `latitude ${LAT}°`;
  const words = [text(C.x - 8, C.y + C.k * south(S0) + 4.5, "end"), text(C.x - 8, C.y - C.k * ZENITH + 4.5, "end"), text(C.x - 8, C.y + C.k * north(0) + 4.5, "end"), text(C.x - 8, C.y + 4.5, "end")];
  ["equator", "zenith", "north", "pole"].forEach((w, i) => (words[i].textContent = w));
  el.appendChild(svg);
  const s = { r1, r2, marks, c1, c2, name, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  const a = span(t, 1.4, 4.6);
  const b = span(t, 6.0, 9.2);
  s.r1.setAttribute("stroke-dashoffset", f(1 - a));
  s.r2.setAttribute("stroke-dashoffset", f(1 - b));
  for (const r of [s.r1, s.r2]) r.setAttribute("opacity", f(out));
  const on = [0.6, 0.9, 5.2, 5.5];
  s.marks.forEach((m, i) => m.setAttribute("opacity", f(span(t, on[i], on[i] + 0.3) * out)));
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, on[i], on[i] + 0.4) * out)));
  s.c1.textContent = `${Math.round(LAT * a)}°`;
  s.c1.setAttribute("opacity", f(span(t, 1.3, 1.6) * out));
  s.c2.textContent = `${Math.round(LAT * b)}°`;
  s.c2.setAttribute("opacity", f(span(t, 5.9, 6.2) * out));
  s.name.setAttribute("opacity", f(span(t, 9.6, 10.1) * out));
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
