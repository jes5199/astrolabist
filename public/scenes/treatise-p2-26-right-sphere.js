// A Treatise on the Astrolabe, Part II, 26: "in thilke cuntrey where as the senith of hem that dwellen there is in the
// equinoxial lyne, and her orisonte passing by the poles of this worlde, thilke folke han this right cercle and the
// right orisonte; and evere-mo the arch of the day and the arch of the night is ther y-like long ... And the almikanteras
// in her Astrolabies ben streighte as a lyne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A plate whose latitude slides from Oxford's (52) down to the equator's (0) and back.  As it does, the horizon
// straightens into a straight line through the pole (the right horizon, through the poles of the world), and it cuts
// the circle of Cancer exactly in half: the day's arc (above it, gold) as long as the night's.  The horizon and the
// circles of altitude are computed for each latitude by the same projection as the plate of inv. 47869.  Original line
// work; nothing is traced.

import { node, f, span, label, SILVER, FAINT, NIGHT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 7000; // ms: at the equator: the right horizon, day = night
const RAD = Math.PI / 180;
const K = 1.15; // window units per plate unit
const EQ = 49.625; // the equator's radius on the plate (our drawing's)
const OBL = 24.1;
const CAN = (EQ * Math.cos(OBL * RAD)) / (1 + Math.sin(OBL * RAD));
const CAP = (EQ * Math.cos(-OBL * RAD)) / (1 + Math.sin(-OBL * RAD));
const O = [0, 4];

// the circle of altitude h at latitude lat: [centre's distance up (south), radius]; null when it is a line
function alm(h, lat) {
  const den = Math.sin(lat * RAD) + Math.sin(h * RAD);
  if (Math.abs(den) < 1e-4) return null;
  return [(EQ * Math.cos(lat * RAD)) / den, (EQ * Math.cos(h * RAD)) / den];
}
const circ = (c, r) => `M${f(O[0] - K * r)} ${f(O[1] - K * c)}a${f(K * r)} ${f(K * r)} 0 1 0 ${f(2 * K * r)} 0a${f(K * r)} ${f(K * r)} 0 1 0 ${f(-2 * K * r)} 0`;

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  // the plate: its edge (Capricorn), the equator, Cancer; clipped to the plate
  const defs = node("defs", {}, svg);
  node("circle", { cx: O[0], cy: O[1], r: f(K * CAP) }, node("clipPath", { id: "pl" + uid }, defs));
  node("circle", { cx: O[0], cy: O[1], r: f(K * CAP), fill: NIGHT, "fill-opacity": 0.6, stroke: "currentColor", "stroke-width": 1.2 }, svg);
  node("circle", { cx: O[0], cy: O[1], r: f(K * EQ), fill: "none", stroke: "currentColor", "stroke-width": 0.8, opacity: 0.8 }, svg);
  const inPlate = node("g", { "clip-path": `url(#pl${uid})` }, svg);
  const alms = [10, 20, 30, 40, 50, 60, 70, 80].map(() => node("path", { fill: "none", stroke: FAINT, "stroke-width": 0.5, opacity: 0.6 }, inPlate));
  // Cancer's circle in two arcs: above the horizon (day, gold) and below (night, silver)
  const day = node("path", { fill: "none", stroke: SUN, "stroke-width": 2.6 }, svg);
  const night = node("path", { fill: "none", stroke: SILVER, "stroke-width": 2.6, opacity: 0.7 }, svg);
  const horizon = node("path", { fill: "none", stroke: SILVER, "stroke-width": 1.6 }, inPlate);
  node("circle", { cx: O[0], cy: O[1], r: 2, fill: SILVER }, svg); // the pole
  const latT = label(svg, 0, -84, "", 14);
  latT.setAttribute("opacity", 1);
  const right = label(svg, 0, 84, "the right horizon", 13);
  const eq = label(svg, 0, O[1] + K * CAN + 14, "day = night", 13);
  el.appendChild(svg);
  const s = { alms, day, night, horizon, latT, right, eq, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  // the latitude: 52 for a while, down to 0, held, back up
  const lat = 52 * (1 - span(t, 1.2, 5.4) * (1 - span(t, 9.8, 13.6)));
  s.latT.textContent = `latitude ${Math.round(lat)}°`;
  [10, 20, 30, 40, 50, 60, 70, 80].forEach((h, i) => {
    const a = alm(h, lat);
    s.alms[i].setAttribute("d", a ? circ(a[0], a[1]) : "");
  });
  // the horizon: a circle, or (at the equator) the straight line through the pole
  const hz = alm(0, lat);
  if (!hz || hz[1] > 4000) s.horizon.setAttribute("d", `M${f(O[0] - 120)} ${f(O[1])}H${f(O[0] + 120)}`);
  else s.horizon.setAttribute("d", circ(hz[0], hz[1]));
  // where Cancer's circle meets the horizon: the day's arc is the part inside the horizon circle (toward the south)
  let t0 = 90; // bearing from the top (south) to each crossing
  if (hz && hz[1] < 4000) t0 = Math.acos(Math.max(-1, Math.min(1, (CAN * CAN + hz[0] * hz[0] - hz[1] * hz[1]) / (2 * CAN * hz[0])))) / RAD;
  const pt = (b) => [O[0] + K * CAN * Math.sin(b * RAD), O[1] - K * CAN * Math.cos(b * RAD)];
  const a = pt(-t0);
  const b = pt(t0);
  const r = f(K * CAN);
  s.day.setAttribute("d", `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${t0 > 90 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`);
  s.night.setAttribute("d", `M${f(b[0])} ${f(b[1])}A${r} ${r} 0 ${t0 > 90 ? 0 : 1} 1 ${f(a[0])} ${f(a[1])}`);
  const at0 = span(t, 5.2, 5.8) * (1 - span(t, 9.6, 10.0));
  s.right.setAttribute("opacity", f(at0));
  s.eq.setAttribute("opacity", f(at0));
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
