// The sky itself, in line work, for the Treatise's sky scenes (II 6 onwards): a cut through the heavens with the
// horizon, the ground below it, the sun, stars, a glow of twilight at either end of the horizon.  Window units
// (viewBox -100..100), east on the LEFT as on the front of the instrument.  Hand-written (astrolabe-video
// web/scenes/lib/sky.js).

const NS = "http://www.w3.org/2000/svg";
export const NIGHT = "#0a1030";
export const SILVER = "#e4e7f3";
export const FAINT = "#a7b0d4";
export const SUN = "#f6d77a";
const RAD = Math.PI / 180;

export function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export const f = (n) => (Math.round(n * 100) / 100).toString();
export const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
export const span = (t, a, b) => ease((t - a) / (b - a));

// a little random, the same every time (stars must not move between frames or loads)
export function seeded(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// The cut: an observer at O on a horizon line, the heavens a circle of radius R about O.
// Returns {g, at(alt, side) -> point (side -1 east/left, +1 west/right), glows: {east, west}, stars, ground}.
export function cut(svg, opts = {}) {
  const uid = "sk" + Math.random().toString(36).slice(2, 8);
  const O = opts.O || [0, 30];
  const R = opts.R || 72;
  const g = node("g", {}, svg);
  const defs = node("defs", {}, g);
  // the twilight glows: a soft light standing on each end of the horizon
  const glow = (side) => {
    const id = `${uid}${side < 0 ? "e" : "w"}`;
    const rg = node("radialGradient", { id, cx: f(O[0] + side * R * 0.95), cy: f(O[1]), r: f(R * 0.9), gradientUnits: "userSpaceOnUse" }, defs);
    node("stop", { offset: 0, "stop-color": "#e9b86a", "stop-opacity": 0.55 }, rg);
    node("stop", { offset: 0.5, "stop-color": "#7a6aa8", "stop-opacity": 0.22 }, rg);
    node("stop", { offset: 1, "stop-color": NIGHT, "stop-opacity": 0 }, rg);
    return node("rect", { x: -120, y: -120, width: 240, height: f(O[1] + 120), fill: `url(#${id})`, opacity: 0 }, g);
  };
  const glows = { east: glow(-1), west: glow(1) };
  // stars, faint, above the horizon
  const rnd = seeded(opts.seed || 7);
  const stars = node("g", { fill: SILVER }, g);
  for (let i = 0; i < (opts.stars ?? 34); i++) {
    const a = rnd() * Math.PI;
    const r = Math.sqrt(rnd()) * R * 1.25;
    const x = O[0] + r * Math.cos(a);
    const y = O[1] - r * Math.sin(a);
    if (y < O[1] - 4) node("circle", { cx: f(x), cy: f(y), r: f(0.5 + rnd() * 0.8), opacity: f(0.35 + rnd() * 0.5) }, stars);
  }
  // the ground below the horizon, and the horizon
  const ground = node("rect", { x: -120, y: f(O[1]), width: 240, height: 120, fill: "#050816", opacity: 0.85 }, g);
  node("line", { x1: -110, y1: f(O[1]), x2: 110, y2: f(O[1]), stroke: "currentColor", "stroke-width": 1.2 }, g);
  const at = (alt, side) => [O[0] + side * R * Math.cos(alt * RAD), O[1] - R * Math.sin(alt * RAD)];
  return { g, O, R, at, glows, stars, ground };
}

// the sun: a disc with short rays; set(x, y, a) places it
export function sun(parent, r = 6) {
  const g = node("g", {}, parent);
  node("circle", { r, fill: SUN }, g);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: -r - 2.5, x2: 0, y2: -r - 5.5, stroke: SUN, "stroke-width": 1.3, "stroke-linecap": "round", transform: `rotate(${45 * i})` }, g);
  return {
    g,
    set(x, y, a = 1) {
      g.setAttribute("transform", `translate(${f(x)} ${f(y)})`);
      g.setAttribute("opacity", f(a));
    },
  };
}

// an angle's arc at O from the horizon (side) to altitude alt, radius r, as path data
export function arcFromHorizon(O, side, alt, r) {
  const a = [O[0] + side * r, O[1]];
  const b = [O[0] + side * r * Math.cos(alt * RAD), O[1] - r * Math.sin(alt * RAD)];
  const sweep = (side > 0) === (alt > 0) ? 0 : 1;
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 0 ${sweep} ${f(b[0])} ${f(b[1])}`;
}

// a label in the house style
export function label(parent, x, y, str, size = 14, anchor = "middle") {
  const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, parent);
  t.textContent = str;
  return t;
}
