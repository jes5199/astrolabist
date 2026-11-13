// A Treatise on the Astrolabe, Part II, 9: "Know the quantitee of thy crepusculis, as I have taught in the chapitre
// bi-forn, and adde hem to the arch of thy day artificial; and tak ther the space of alle the hole day vulgar, un-to
// verrey night."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A dial of the twenty-four hours, noon at the top as on the border of the front, midnight at the foot.  On it
// Chaucer's day (12 March 1391, the sun in the first degree of Aries, at Oxford): the artificial day, sunrise to
// sunset, lit gold; then the two twilights (the sun less than 18 degrees below the horizon) added at either end;
// together, dawn to dusk, the whole vulgar day; what is left is the night.  The hours are computed for the latitude
// of inv. 47869's plate (52 degrees) and the sun's declination that day.  Shared lib/sky.js.  Original line work.

import A from "./lib/astrolabe-47869.js";
import { node, f, span, label, sun as sunIcon, SILVER, NIGHT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9200; // ms: the whole vulgar day and the night, measured
const RAD = Math.PI / 180;
const LAT = A.plate.latitude * RAD;
const DEC = Math.asin(Math.sin(A.plate.obliquity * RAD) * Math.sin(A.morning.sunLongitude * RAD));
// the sun's hour angle (degrees from noon) when it stands at altitude h
const hourAngle = (h) => Math.acos((Math.sin(h * RAD) - Math.sin(LAT) * Math.sin(DEC)) / (Math.cos(LAT) * Math.cos(DEC))) / RAD;
const RISE = hourAngle(-0.0); // sunrise and sunset: altitude 0 (the plate's horizon)
const DARK = hourAngle(-18); // the end of twilight
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return m % 60 ? `${Math.floor(m / 60)} h ${m % 60} m` : `${m / 60} h`;
};
const R0 = 72; // the dial's radius
const O = [0, 2];

// an arc of the dial from hour angle a to b (degrees; 0 at noon, at the top, westward clockwise)
function arc(a, b, r) {
  const p = [O[0] + r * Math.sin(a * RAD), O[1] - r * Math.cos(a * RAD)];
  const q = [O[0] + r * Math.sin(b * RAD), O[1] - r * Math.cos(b * RAD)];
  return `M${f(p[0])} ${f(p[1])}A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${f(q[0])} ${f(q[1])}`;
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  // the dial: its circle, an hour mark each 15 degrees, noon and midnight longer
  node("circle", { cx: O[0], cy: O[1], r: R0 + 8, fill: NIGHT, "fill-opacity": 0.5, stroke: "currentColor", "stroke-width": 0.8 }, svg);
  let d = "";
  for (let i = 0; i < 24; i++) {
    const a = i * 15 * RAD;
    const r1 = i % 12 ? R0 + 3 : R0 + 8;
    d += `M${f(O[0] + (R0 - 3) * Math.sin(a))} ${f(O[1] - (R0 - 3) * Math.cos(a))}L${f(O[0] + r1 * Math.sin(a))} ${f(O[1] - r1 * Math.cos(a))}`;
  }
  node("path", { d, stroke: "currentColor", "stroke-width": 0.8, fill: "none", opacity: 0.8 }, svg);
  const band = (a, b, stroke) => node("path", { d: arc(a, b, R0), fill: "none", stroke, "stroke-width": 9, opacity: 0 }, svg);
  const night = band(DARK, 360 - DARK, SILVER);
  const day = band(-RISE, RISE, SUN);
  const dawn = band(-DARK, -RISE, "#9c86d6");
  const dusk = band(RISE, DARK, "#9c86d6");
  // the sun going round with the hours
  const s1 = sunIcon(svg, 4);
  const at = (a, r) => [O[0] + r * Math.sin(a * RAD), O[1] - r * Math.cos(a * RAD)];
  const word = (str, a, r, size = 13) => {
    const p = at(a, r);
    return label(svg, p[0], p[1] + 4.5, str, size);
  };
  const words = {
    day: word(hm(2 * RISE), 0, R0 - 21),
    dawn: word(hm(DARK - RISE), -(RISE + DARK) / 2, R0 - 23),
    dusk: word(hm(DARK - RISE), (RISE + DARK) / 2, R0 - 23),
    night: word(hm(360 - 2 * DARK), 180, R0 - 21),
    all1: label(svg, O[0], O[1] - 16, "dawn to dusk", 15),
    all2: label(svg, O[0], O[1] + 2, hm(2 * DARK), 15),
  };
  el.appendChild(svg);
  const s = { night, day, dawn, dusk, s1, at, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  // the sun's hour angle: once round from midnight in the first part of the loop
  const ha = 180 + 360 * span(t, 0.2, 4.8);
  const p = s.at(ha, R0);
  s.s1.set(p[0], p[1], span(t, 0.2, 0.5) * (1 - span(t, 4.8, 5.2)));
  s.day.setAttribute("opacity", f(0.85 * span(t, 1.8, 2.4) * out));
  s.dawn.setAttribute("opacity", f(0.85 * span(t, 5.4, 6.0) * out));
  s.dusk.setAttribute("opacity", f(0.85 * span(t, 6.0, 6.6) * out));
  s.night.setAttribute("opacity", f(0.35 * span(t, 8.2, 8.8) * out));
  const w = s.words;
  w.day.setAttribute("opacity", f(span(t, 2.4, 2.9) * (1 - span(t, 7.0, 7.4))));
  w.dawn.setAttribute("opacity", f(span(t, 5.8, 6.3) * out));
  w.dusk.setAttribute("opacity", f(span(t, 6.4, 6.9) * out));
  w.all1.setAttribute("opacity", f(span(t, 7.2, 7.8) * out));
  w.all2.setAttribute("opacity", f(span(t, 7.6, 8.2) * out));
  w.night.setAttribute("opacity", f(span(t, 8.6, 9.0) * out));
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
