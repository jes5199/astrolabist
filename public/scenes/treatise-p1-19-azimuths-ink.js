// A Treatise on the Astrolabe, Part I, 19: "From this senith, as it semeth, ther come a maner crokede strykes lyke to
// the clawes of a loppe, or elles like to the werk of a womanes calle, in kerving overthwart the Almikanteras. And
// thise same strykes or divisiouns ben cleped Azimuthz. And they devyden the orisonte of thyn Astrolabie in four and
// twenty devisiouns. And thise Azimutz serven to knowe the costes of the firmament."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-19-azimuths.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The plate, close, its circles of altitude quiet.  From the zenith the azimuths come out together like a spider's
// claws, crossing the almucantars, to the horizon, which they divide in twenty-four; the points are marked.  Then
// the one to the east is lit.  Each azimuth is the projection of its vertical circle, computed point by point for
// the latitude of inv. 47869's plate in our drawing (shared lib/front.js).  Original line work; nothing is traced.

import { front, node, f, P, LAT, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 7800; // ms: the claws out, the horizon divided, the east lit
const C = { x: 0, y: 6, k: 1.16 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a point of the sky (altitude h, azimuth az from the south, westward positive) on the plate
function sky(h, az) {
  const [hh, a] = [h * RAD, az * RAD];
  const sd = Math.sin(LAT) * Math.sin(hh) - Math.cos(LAT) * Math.cos(hh) * Math.cos(a);
  const cd = Math.sqrt(Math.max(0, 1 - sd * sd));
  const H = Math.atan2(Math.cos(hh) * Math.sin(a), Math.cos(LAT) * Math.sin(hh) + Math.sin(LAT) * Math.cos(hh) * Math.cos(a));
  const r = (P.equator * cd) / (1 + sd);
  return [r * Math.sin(H), -r * Math.cos(H)];
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  for (const a of fr.plate.azimuths) a.el.setAttribute("display", "none");
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", a.h % 10 ? 0.3 : 0.5);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  // the claws: from the zenith (altitude 90) down to the horizon (0), point by point, inside the plate
  const claws = [];
  const marks = [];
  for (let az = -180; az < 180; az += 15) {
    let d = "";
    for (let h = 90; h >= 0; h -= 2) {
      const p = sky(h, az);
      d += (h === 90 ? "M" : "L") + f(p[0]) + " " + f(p[1]);
    }
    claws.push({ az, el: node("path", { d, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke: "currentColor", "stroke-width": W(az === -90 ? 1.6 : 0.8), "stroke-linecap": "round" }, fr.plate.clip) });
    const p = sky(0, az);
    if (Math.hypot(p[0], p[1]) < P.capricorn) marks.push(node("circle", { cx: f(p[0]), cy: f(p[1]), r: f(1.6), fill: SILVER, opacity: 0 }, g));
  }
  const east = claws.find((c) => c.az === -90).el;
  const ep = sky(0, -90);
  const word = node("text", { x: f(C.x + C.k * ep[0] + 4), y: f(C.y + C.k * ep[1] + 16), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  word.textContent = "east";
  el.appendChild(svg);
  const s = { claws, marks, east, word, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  const grow = span(t, 0.8, 4.2);
  for (const c of s.claws) {
    c.el.setAttribute("stroke-dashoffset", f(1 - grow));
    c.el.setAttribute("opacity", f((c.el === s.east ? 1 : 0.8) * out));
  }
  s.marks.forEach((m, i) => m.setAttribute("opacity", f(span(t, 4.2 + 0.04 * i, 4.5 + 0.04 * i) * out)));
  const lit = span(t, 6.2, 6.8) * out;
  s.east.setAttribute("stroke", lit > 0.5 ? SILVER : "currentColor");
  s.word.setAttribute("opacity", f(lit));
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
