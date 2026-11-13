// A Treatise on the Astrolabe, Part II, 29: "set the point of thy gret rewle, ther thou takest thyne altitudes, up-on as
// many degrees in his bordure fro his meridional as was the point of thy label fro the lyne meridional on the
// wombe-syde. Tak thanne thyn Astrolabie with bothe handes sadly and slely, and lat the sonne shyne thorow bothe holes of
// thy rewle; and sleyly, in thilke shyninge, lat thyn Astrolabie couch adoun evene up-on a smothe grond, and thanne wol
// the verrey lyne meridional of thyn Astrolabie lye evene south, and the est lyne wole lye est, and the west lyne west,
// and north lyne north ... and thus hastow the 4 quarters of the firmament."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Seen from above: smooth ground, north at the top, the morning sun low in the south-east (Chaucer's 12 March,
// 9 o'clock), its light falling across the ground.  The instrument lies flat, its rule set off its meridional line by
// the sun's bearing; it is turned until the sun shines through both holes of the rule (the light along the rule);
// laid so, its meridional line lies along the meridian, its ring toward the south, and its cross gives the four
// quarters, which are named on the ground.  The sun's bearing is computed for
// that morning at 52 degrees.  Shared lib/back.js.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { back, node, f, SILVER, NIGHT, T } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9200; // ms: laid true, the four quarters named
const RAD = Math.PI / 180;
const K = 0.5; // the instrument's scale
// the sun's bearing that morning: altitude 25.5 (II 2), declination of 1 Aries, latitude 52: azimuth from the south,
// eastward positive
const LAT = A.plate.latitude * RAD;
const DEC = Math.asin(Math.sin(A.plate.obliquity * RAD) * Math.sin(A.morning.sunLongitude * RAD));
const ALT = A.morning.sunAlt * RAD;
const AZ = Math.acos((Math.sin(ALT) * Math.sin(LAT) - Math.sin(DEC)) / (Math.cos(ALT) * Math.cos(LAT))) / RAD; // from the south, toward the east
// on the ground seen from above, north at the top of the window: south is down, east to the right

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  // the ground and the sunlight across it (from the sun's side), as parallel faint rays
  node("rect", { x: -120, y: -120, width: 240, height: 240, fill: "#12182e" }, svg);
  const rays = node("g", { stroke: "#f6d77a", "stroke-width": 0.6, opacity: 0.35 }, svg);
  for (let i = -8; i <= 8; i++) node("line", { x1: -140, y1: i * 14, x2: 140, y2: i * 14 }, rays);
  // the light comes from the azimuth AZ east of south: on the ground (north up, east right), from below-right
  const lightDir = 90 - AZ; // degrees, screen angle of the rays (0 = along +x)
  rays.setAttribute("transform", `rotate(${f(lightDir)})`); // along the line from the sun
  const sunMark = node("g", {}, svg);
  const sp = [96 * Math.sin(AZ * RAD), 96 * Math.cos(AZ * RAD)];
  node("circle", { cx: f(sp[0]), cy: f(sp[1]), r: 7, fill: "#f6d77a" }, sunMark);
  // the instrument on its back, its rule turned off the meridional line by the sun's bearing
  const inst = node("g", {}, svg);
  const g = node("g", { transform: `scale(${K})` }, inst);
  const b = back(g, { scale: K, faint: 0.5 });
  // its cross: the meridional line (through the ring) and the east-west line
  node("path", { d: `M0 -143V100M-100 0H100`, stroke: "currentColor", "stroke-width": f(1.2 / K), opacity: 0.85 }, g);
  const rule = node("g", { transform: `rotate(${f(-AZ)})` }, g); // set off the meridional line by the sun's bearing
  node("path", { d: A.alidade.body, fill: NIGHT, "fill-opacity": 0.6, stroke: SILVER, "stroke-width": f(1 / K), transform: "rotate(90)" }, rule);
  const beam = node("line", { x1: 0, y1: -100, x2: 0, y2: 100, stroke: "#fff3c4", "stroke-width": f(1.6 / K), opacity: 0, transform: "rotate(0)" }, rule);
  // the four quarters, named at the edge of the window when laid true
  const words = ["south", "north", "east", "west"].map((w, i) => {
    const pos = [
      [36, 90],
      [0, -84],
      [86, 5],
      [-86, 5],
    ][i];
    const t = node("text", { x: pos[0], y: pos[1], "text-anchor": "middle", "font-size": 14, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = w;
    return t;
  });
  el.appendChild(svg);
  const s = { inst, beam, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  // the instrument: lying askew, turned till the beam runs along the rule (then its south line lies south)
  // laid true it lies with its ring toward the south (rotated half round from ring-up); before that, askew
  const askew = 70 * (1 - span(t, 1.4, 5.6)) + 70 * span(t, 12.8, 13.8);
  s.inst.setAttribute("transform", `rotate(${f(180 + askew)})`);
  const through = span(t, 5.4, 5.9) * (1 - span(t, 12.4, 12.8));
  s.beam.setAttribute("opacity", f(0.9 * through));
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, 6.4 + 0.3 * i, 6.9 + 0.3 * i) * (1 - span(t, 12.4, 12.8)))));
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
