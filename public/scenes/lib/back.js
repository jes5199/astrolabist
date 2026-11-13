// The back of the instrument in line work, for the Part I scenes about the back (I 4 onwards): our constructed
// drawing of Oxford inv. 47869 (astrolabe-47869.js), in its own units (limb radius 100, centre (0, 0), y down).
// The lines a scene is about (the meridional line, the east-west line, a scale) are left to the scene to draw.
// Hand-written (astrolabe-video web/scenes/lib/back.js).

import A from "./astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
export const NIGHT = "#0a1030";
export const SILVER = "#e4e7f3";
export const FAINT = "#a7b0d4";
export const PIVOT = -181; // where the ring bears on a thumb or a peg, above the centre
export const T = A.backTiers;
export const HOLE = A.backHole;

export function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export const f = (n) => (Math.round(n * 100) / 100).toString();
// a point at a bearing (degrees clockwise from the top: 0 is under the ring) and a radius
export const rim = (deg, r) => [r * Math.sin((deg * Math.PI) / 180), -r * Math.cos((deg * Math.PI) / 180)];

// opts: {scale: k} the scene's scale (window units per instrument unit): stroke widths are given in window units
// and divided by it (vector-effect: non-scaling-stroke is not used: Chromium mis-paints scaled shapes with it —
// stray tiles and a glow at scale 1.6, 2026-11-13); {ticks: true} the degree scale's ticks; {faint: 0.6} the
// opacity of the tier circles.
// Returns {g, ring, throne}: the whole back, the ring (for a scene to light), the suspension.
export function back(parent, opts = {}) {
  const W = (px) => f(px / (opts.scale || 1));
  const g = node("g", {}, parent);
  const throne = node("g", {}, g);
  for (const k of ["base", "boss", "stem", "shackle"]) {
    node("path", { d: A.throneBack[k], fill: NIGHT, "fill-opacity": 0.72 }, throne);
    node("path", { d: A.throneBack[k], fill: "none", stroke: "currentColor", "stroke-width": W(0.8), "stroke-linejoin": "round" }, throne);
  }
  node("circle", { r: 100, fill: NIGHT, "fill-opacity": 0.72 }, g);
  node("circle", { r: f(HOLE), fill: NIGHT }, g); // the hole, dark (its outline is with the lines)
  const lines = node("g", { fill: "none", stroke: "currentColor" }, g);
  node("circle", { r: 100, "stroke-width": W(1.2) }, lines);
  const faint = opts.faint ?? 0.6;
  for (const k of ["border", "altitude", "degrees", "zodnum", "signs", "spacer", "ladder", "daynum", "months", "saints", "days", "letters"])
    node("circle", { r: f(T[k]), "stroke-width": W(k === "degrees" || k === "ladder" ? 0.6 : 0.35), opacity: faint }, lines);
  if (opts.ticks !== false) {
    let d = "";
    for (let i = 0; i < 360; i += 5) {
      const a = rim(i, T.degrees);
      const b = rim(i, i % 10 ? T.altitude - 1 : T.altitude);
      d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    node("path", { d, "stroke-width": W(0.4), opacity: faint }, lines);
  }
  // the shadow square in the lower half, its sides on the cross lines' level and the meridian's
  const s = +A.backSquare.outer;
  const i = +A.backSquare.inner;
  node("path", { d: `M${-s} 0V${s}H${s}V0M${-i} 0V${i}H${i}V0`, "stroke-width": W(0.4), opacity: faint }, lines);
  node("circle", { r: f(HOLE), "stroke-width": W(0.7) }, lines);
  node("path", { d: A.throneBack.ring, fill: "none", stroke: "currentColor", "stroke-width": W(0.8) }, g);
  const ring = node("path", { d: A.throneBack.ring, fill: "none", stroke: SILVER, "stroke-width": W(1.4), opacity: 0 }, g);
  return { g, ring, throne };
}

// a label in the house style: a single word, silver, a dark halo
export function label(parent, x, y, str, size = 14, anchor = "middle") {
  const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, parent);
  t.textContent = str;
  return t;
}
