// A Treatise on the Astrolabe, Part II, 26: "in thilke cuntrey where as the senith of hem that dwellen there is in the
// equinoxial lyne, and her orisonte passing by the poles of this worlde, thilke folke han this right cercle and the
// right orisonte; and evere-mo the arch of the day and the arch of the night is ther y-like long, and the sonne twyes
// every yeer passinge thorow the senith of her heved ... And _nota_, that this forseid righte orisonte ... divydeth the
// equinoxial in-to right angles; and the embelif orisonte, wher-as the pol is enhaused up-on the orisonte, overkerveth
// the equinoxial in embelif angles."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917): the
// text gives no procedure, so its points one at a time, listed beside a plate whose latitude is carried from Oxford's
// (52) to the equator's and back: the horizon a circle; carried down; at the equator a straight line through the pole
// (the right horizon); it halves every day's circle (Cancer's shown: day ochre, night blue); the zenith on the
// equator (the sun overhead twice a year); the right horizon cuts the equator at right angles; at Oxford the oblique
// horizon cuts it slantwise (the angles drawn from the plate's own tangents; the projection keeps angles).  Chaucer
// also says the almucantars of such an astrolabe are "streighte as a lyne": on a plate drawn by this projection only
// the horizon is straight, so the scene does not claim it.  Replaces treatise-p2-26-right-sphere.js (the dark style).
// The horizon and the circles of altitude computed for each latitude by the projection of the plate of inv. 47869;
// COLOURED WOODCUT on vellum (lib/woodcut.js).  Original line work; nothing is traced.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";
import { P, node, f } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 38000;
const STILL = 17000; // ms: at the equator, the day's circle halved
const RAD = Math.PI / 180;
const EQ = P.equator;
const CAP = P.capricorn;
const CAN = P.cancer;
const LAYOUT = {
  wide: { C: { x: -78, y: 8, k: 70 / P.capricorn }, list: { x: 4, y: -82, size: 9.4, lh: 10.5, gap: 5, indent: 10, width: 140 } },
  stack: { C: { x: 0, y: -86, k: 100 / P.capricorn }, list: { x: -136, y: 42, size: 12.5, lh: 13.5, gap: 5, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C;
const W = (px) => f(px / C.k);
const STEPS = [
  { t: 0.5, lines: ["at Oxford the horizon is a circle"] },
  { t: 4.6, lines: ["carry the latitude down to the equator"] },
  { t: 9.6, lines: ["the horizon is now straight, through the poles: the right horizon"] },
  { t: 14.0, lines: ["it halves every day's circle: day equals night"] },
  { t: 19.0, lines: ["the zenith is on the equator: the sun overhead twice a year"] },
  { t: 23.8, lines: ["the right horizon cuts the equator at right angles"] },
  { t: 28.2, lines: ["at Oxford the horizon cuts it slantwise"] },
];
const END = 36.6;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// the circle of altitude h at latitude lat: [centre's distance up (south), radius]; null when it is a line
function alm(h, lat) {
  const den = Math.sin(lat * RAD) + Math.sin(h * RAD);
  if (Math.abs(den) < 1e-4) return null;
  return [(EQ * Math.cos(lat * RAD)) / den, (EQ * Math.cos(h * RAD)) / den];
}
const circ = (cy, r) => `M${f(-r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;
const latAt = (t) => 52 * (1 - span(t, 5.0, 9.0) * (1 - span(t, 28.6, 32.6)));
// the horizon at a latitude: a circle [cy, r] (y down, south up: its centre at -c) or the line y = 0
const horizonOf = (lat) => {
  const a = alm(0, lat);
  return !a || a[1] > 4000 ? null : [-a[0], a[1]];
};
// where the horizon meets the equator on the east (left): the point and the angle between them there (degrees)
function crossing(lat) {
  const hz = horizonOf(lat);
  let p;
  let th; // the horizon's tangent direction at p
  if (!hz) {
    p = [-EQ, 0];
    th = [1, 0];
  } else {
    const [cy, r] = hz;
    // circles x^2 + y^2 = EQ^2 and x^2 + (y - cy)^2 = r^2
    const y = (EQ * EQ - r * r + cy * cy) / (2 * cy);
    p = [-Math.sqrt(Math.max(0, EQ * EQ - y * y)), y];
    th = [-(p[1] - cy), p[0]];
  }
  const te = [-p[1], p[0]]; // the equator's tangent
  const n = (v) => {
    const l = Math.hypot(v[0], v[1]);
    return [v[0] / l, v[1] / l];
  };
  const a = n(th);
  const b = n(te);
  let ang = Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1]))) / RAD;
  return { p, a, b, ang };
}

export function mount(el) {
  if (instances.has(el)) return;
  const s = { raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  build(el, s);
  watch(el, s, () => {
    s.svg.remove();
    build(el, s);
  });
}

function build(el, s) {
  s.mode = layoutOf(el);
  const Lo = LAYOUT[s.mode];
  C = Lo.C;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11 * C.k, wobble: 1.0 / C.k, seed: 29 });
  node("circle", { r: f(CAP) }, node("clipPath", { id: "pl" + uid }, defs));
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${f(C.k)})` }, svg);
  const plate = node("g", { filter: wc.rough }, g);
  node("circle", { r: f(CAP), fill: VELLUM }, plate);
  const inPlate = node("g", { "clip-path": `url(#pl${uid})` }, plate);
  const below = node("path", wc.wash({ d: "", fill: WASH.blue, "fill-opacity": 0.45, "fill-rule": "evenodd" }), inPlate);
  const lines = node("g", { fill: "none", stroke: "currentColor" }, plate);
  node("circle", { r: f(CAP), "stroke-width": W(1.6) }, lines);
  node("circle", { r: f(EQ), "stroke-width": W(1.1) }, lines);
  node("circle", { r: f(CAN), "stroke-width": W(0.8), opacity: 0.8 }, lines);
  const alms = [10, 20, 30, 40, 50, 60, 70, 80].map(() => node("path", { fill: "none", stroke: "currentColor", "stroke-width": W(0.5), opacity: 0.45 }, inPlate));
  // Cancer's circle in two arcs: above the horizon (day, ochre) and below (night, blue)
  const day = node("path", { fill: "none", stroke: "#b9821c", "stroke-width": W(3.2), opacity: 0 }, g);
  const night = node("path", { fill: "none", stroke: WASH.blue, "stroke-width": W(3.2), opacity: 0 }, g);
  const horizon = node("path", { fill: "none", stroke: "currentColor", "stroke-width": W(2) }, node("g", { "clip-path": `url(#pl${uid})` }, g));
  const horizonLit = node("path", { fill: "none", stroke: RED, "stroke-width": W(2.4), opacity: 0 }, node("g", { "clip-path": `url(#pl${uid})` }, g));
  node("circle", { r: 2.4, fill: "currentColor" }, g); // the pole
  const zenith = node("circle", { r: 4, fill: "none", stroke: RED, "stroke-width": W(2), opacity: 0 }, g);
  const angle = node("path", { fill: "none", stroke: RED, "stroke-width": W(1.8), opacity: 0 }, g);
  const text = (size) => node("text", { "text-anchor": "middle", "font-size": f(size), "font-weight": 700, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const latT = text(12);
  latT.setAttribute("x", f(C.x));
  latT.setAttribute("y", f(C.y - C.k * CAP - 5));
  const zenT = text(10);
  zenT.textContent = "zenith";
  const angT = text(10);
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, C, below, alms, day, night, horizon, horizonLit, zenith, angle, latT, zenT, angT, rows });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  const lat = latAt(t);
  s.latT.textContent = `latitude ${Math.round(lat)}°`;
  s.latT.setAttribute("opacity", 1);
  [10, 20, 30, 40, 50, 60, 70, 80].forEach((h, i) => {
    const a = alm(h, lat);
    s.alms[i].setAttribute("d", a ? circ(-a[0], a[1]) : "");
  });
  const hz = horizonOf(lat);
  const hd = hz ? circ(hz[0], hz[1]) : `M${f(-CAP - 5)} 0H${f(CAP + 5)}`;
  s.horizon.setAttribute("d", hd);
  s.horizonLit.setAttribute("d", hd);
  s.horizonLit.setAttribute("opacity", f(span(t, 0.6, 1.1) * (1 - span(t, 4.2, 4.6)) + span(t, 9.8, 10.3) * (1 - span(t, 13.6, 14.0))));
  s.below.setAttribute("d", hz ? circ(0, CAP) + circ(hz[0], hz[1]) : `M${f(-CAP)} 0H${f(CAP)}V${f(CAP)}H${f(-CAP)}Z`);
  // Cancer's circle: the day's arc is the part inside the horizon circle (toward the south)
  let t0 = 90;
  if (hz) t0 = Math.acos(Math.max(-1, Math.min(1, (CAN * CAN + hz[0] * hz[0] - hz[1] * hz[1]) / (2 * CAN * -hz[0])))) / RAD;
  const pt = (b) => [CAN * Math.sin(b * RAD), -CAN * Math.cos(b * RAD)];
  const a = pt(-t0);
  const b = pt(t0);
  s.day.setAttribute("d", `M${f(a[0])} ${f(a[1])}A${f(CAN)} ${f(CAN)} 0 ${t0 > 90 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`);
  s.night.setAttribute("d", `M${f(b[0])} ${f(b[1])}A${f(CAN)} ${f(CAN)} 0 ${t0 > 90 ? 0 : 1} 1 ${f(a[0])} ${f(a[1])}`);
  const dn = span(t, 14.2, 14.8) * (1 - span(t, 18.6, 19.0));
  s.day.setAttribute("opacity", f(dn));
  s.night.setAttribute("opacity", f(0.9 * dn));
  // the zenith: on the equator at the equator's latitude
  const zc = (EQ * Math.cos(lat * RAD)) / (Math.sin(lat * RAD) + 1);
  s.zenith.setAttribute("cy", f(-zc));
  const zo = span(t, 19.2, 19.7) * (1 - span(t, 23.4, 23.8));
  s.zenith.setAttribute("opacity", f(zo));
  s.zenT.setAttribute("x", f(s.C.x + 16));
  s.zenT.setAttribute("y", f(s.C.y - s.C.k * zc - 7));
  s.zenT.setAttribute("opacity", f(zo));
  // the angle where the horizon cuts the equator, on the east side: the two tangents, and a square or an arc
  const cr = crossing(lat);
  const L = 16;
  const [px, py] = cr.p;
  const seg = (v) => `M${f(px - L * v[0])} ${f(py - L * v[1])}L${f(px + L * v[0])} ${f(py + L * v[1])}`;
  let mark;
  const q = 6;
  // the corner between the horizon going up-right and the equator going down
  const ha = cr.a[0] > 0 ? cr.a : [-cr.a[0], -cr.a[1]];
  const eb = cr.b[1] > 0 ? cr.b : [-cr.b[0], -cr.b[1]];
  if (cr.ang > 89) mark = `M${f(px + q * ha[0])} ${f(py + q * ha[1])}L${f(px + q * (ha[0] + eb[0]))} ${f(py + q * (ha[1] + eb[1]))}L${f(px + q * eb[0])} ${f(py + q * eb[1])}`;
  else {
    const r = 9;
    const sweep = ha[0] * eb[1] - ha[1] * eb[0] > 0 ? 1 : 0;
    mark = `M${f(px + r * ha[0])} ${f(py + r * ha[1])}A${r} ${r} 0 0 ${sweep} ${f(px + r * eb[0])} ${f(py + r * eb[1])}`;
  }
  s.angle.setAttribute("d", seg(cr.a) + seg(cr.b) + mark);
  const ao = span(t, 24.0, 24.5) * (1 - span(t, 27.8, 28.2)) + span(t, 32.6, 33.1) * out;
  s.angle.setAttribute("opacity", f(ao));
  s.angT.textContent = cr.ang > 89 ? "a right angle" : `${Math.round(cr.ang)}°`;
  s.angT.setAttribute("x", f(s.C.x + s.C.k * px + 4));
  s.angT.setAttribute("y", f(s.C.y + s.C.k * py + 30));
  s.angT.setAttribute("opacity", f(ao));
  STEPS.forEach((st, i) => {
    const next = STEPS[i + 1] ? STEPS[i + 1].t : END;
    const now = t >= st.t && t < next;
    const done = t >= next;
    const al = (now || done ? 1 : 0.3) * span(t, 0.2, 0.5) * out;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(al));
      e.setAttribute("fill", now ? RED : "currentColor");
    }
  });
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
