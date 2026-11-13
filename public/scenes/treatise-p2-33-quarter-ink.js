// A Treatise on the Astrolabe, Part II, 33: "any tyme of the day tak the altitude of the sonne; and by the azimut in
// which he stondeth, maystou seen in which partie of the firmament he is. And in the same wyse maystou seen, by the
// night, of any sterre, whether the sterre sitte est or west or north, or any partie by-twene, after the name of the
// azimut in which is the sterre."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-33-quarter.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete, at the two settings of Chaucer's own examples (II 3): by day, his morning sun at 25 1/2
// degrees: the azimuth it stands in lit and its quarter named; by night, Alabor at its altitude: the same.  The
// azimuths are computed from the hour angles at 52 degrees; shared lib/front.js; the rete and its settings are our
// constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 3800; // ms: the sun's quarter named
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
// a body (right ascension ra, declination dec in radians) on the rete turned by rot: its point, and its azimuth
// (degrees from the south, westward positive)
function body(ra, dec, rot) {
  const b = 270 - ra + rot;
  const HA = ((((b + 180) % 360) + 360) % 360) - 180; // its hour angle: its bearing from the meridian
  const az = Math.atan2(Math.sin(HA * RAD), Math.cos(HA * RAD) * Math.sin(LAT) - Math.tan(dec) * Math.cos(LAT)) / RAD;
  return { p: rim(b, rAt(dec)), az };
}
function sky(h, az) {
  const [hh, a] = [h * RAD, az * RAD];
  const sd = Math.sin(LAT) * Math.sin(hh) - Math.cos(LAT) * Math.cos(hh) * Math.cos(a);
  const cd = Math.sqrt(Math.max(0, 1 - sd * sd));
  const H = Math.atan2(Math.cos(hh) * Math.sin(a), Math.cos(LAT) * Math.sin(hh) + Math.sin(LAT) * Math.cos(hh) * Math.cos(a));
  const r = (P.equator * cd) / (1 + sd);
  return [r * Math.sin(H), -r * Math.cos(H)];
}
const quarter = (az) => {
  const a = Math.round(Math.abs(az));
  if (a < 1) return "due south";
  if (a > 179) return "due north";
  return a <= 90 ? `${a}° ${az < 0 ? "east" : "west"} of south` : `${180 - a}° ${az < 0 ? "east" : "west"} of north`;
};
const SUN = A.morning.sunLongitude;
const ACTS = [
  { rot: A.morning.rot, ra: raOf(SUN), dec: Math.asin(Math.sin(EPS) * Math.sin(SUN * RAD)), name: "the sun", sun: true },
  { rot: A.night.rot, ra: raOf(94.2), dec: -13.8 * RAD, name: "Alabor", sun: false },
].map((a) => ({ ...a, ...body(a.ra, a.dec, a.rot) }));

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.12);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.32);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.12);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.55);
  const acts = ACTS.map((a) => {
    let d = "";
    for (let h = 90; h >= 0; h -= 2) {
      const p = sky(h, a.az);
      d += (h === 90 ? "M" : "L") + f(p[0]) + " " + f(p[1]);
    }
    const line = node("path", { d, fill: "none", stroke: a.sun ? "#b9821c" : SILVER, "stroke-width": W(1.6), opacity: 0 }, fr.plate.clip);
    const mark = node("circle", { cx: f(a.p[0]), cy: f(a.p[1]), r: 3.6, fill: a.sun ? "#b9821c" : NIGHT, stroke: a.sun ? NIGHT : SILVER, "stroke-width": W(1), opacity: 0 }, g);
    return { line, mark };
  });
  const text = (y, size) => node("text", { x: 0, y: f(y), "text-anchor": "middle", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const t1 = text(C.y + 52, 14);
  const t2 = text(C.y + 70, 14);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, acts, t1, t2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const i = t < 7 ? 0 : 1;
  const u = t - 7 * i;
  const a = ACTS[i];
  const out = 1 - span(u, 6.2, 6.9);
  const from = ACTS[1 - i].rot;
  const r = from + (((a.rot - from + 540) % 360) - 180) * span(u, 0, 1.2);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.acts.forEach((x, j) => {
    const on = j === i ? out : 0;
    x.mark.setAttribute("opacity", f(span(u, 1.2, 1.6) * on));
    x.line.setAttribute("opacity", f(span(u, 1.8, 2.4) * on));
  });
  s.t1.textContent = a.name;
  s.t2.textContent = quarter(a.az);
  s.t1.setAttribute("opacity", f(span(u, 1.4, 1.8) * out));
  s.t2.setAttribute("opacity", f(span(u, 2.4, 2.9) * out));
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
