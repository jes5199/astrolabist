// The back of the instrument as a coloured woodcut, for the Treatise's ink-on-vellum scenes (jes tg 17827, 17836,
// 17841, 17847): the same drawing and the same interface as lib/back.js (our constructed drawing of Oxford inv. 47869,
// limb radius 100, centre (0, 0), y down), cut in black with a little irregularity (lib/woodcut.js), its scale bands
// washed in the colourist's three colours, its labels in the printer's red, upright roman.
// The names a scene imports keep their roles: NIGHT is the ground behind a part (here the vellum), SILVER the colour
// a scene lights a thing in (here the red), FAINT a quiet line (here the ink, used at a lower opacity).
// Hand-written (astrolabe-video web/scenes/lib/back-ink.js).

import A from "./astrolabe-47869.js";
import { woodcut, RED, VELLUM, WASH } from "./woodcut.js";

const NS = "http://www.w3.org/2000/svg";
export const NIGHT = VELLUM;
export const SILVER = RED;
export const FAINT = "currentColor";
export const PIVOT = -181; // where the ring bears on a thumb or a peg, above the centre
export const T = A.backTiers;
export const HOLE = A.backHole;
export { RED, VELLUM, WASH };

export function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export const f = (n) => (Math.round(n * 100) / 100).toString();
// a point at a bearing (degrees clockwise from the top: 0 is under the ring) and a radius
export const rim = (deg, r) => [r * Math.sin((deg * Math.PI) / 180), -r * Math.cos((deg * Math.PI) / 180)];
const ring = (r) => `M0 ${f(-r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(-r)}Z`;
const band = (r0, r1) => ring(r1) + ring(r0);

// opts: {scale: k} the scene's scale (window units per instrument unit; stroke widths, the wobble and the hatching
// are given in window units and divided by it); {ticks: true}; {faint: 0.6}.  Returns {g, ring, throne, wc}: the
// whole back (the wobble is laid on it: it moves with any transform of g or its parents), the ring (for a scene to
// light), the suspension, and the woodcut tools in the back's units (for a scene's own parts drawn inside g).
export function back(parent, opts = {}) {
  const k = opts.scale || 1;
  const W = (px) => f(px / k);
  const faint = opts.faint ?? 0.6;
  const g = node("g", {}, parent);
  const defs = node("defs", {}, g);
  const wc = woodcut(defs, { freq: 0.11 * k, wobble: 1.0 / k, seed: 13 });
  g.setAttribute("filter", wc.rough);
  const throne = node("g", {}, g);
  const H = wc.hatch(45, 2.6 / k, 0.9 / k);
  for (const key of ["base", "boss", "stem", "shackle"]) {
    node("path", { d: A.throneBack[key], fill: VELLUM }, throne);
    node("path", wc.wash({ d: A.throneBack[key], fill: WASH.red }), throne);
    node("path", { d: A.throneBack[key], fill: H, stroke: "currentColor", "stroke-width": W(1.1), "stroke-linejoin": "round" }, throne);
  }
  node("circle", { r: 100, fill: VELLUM }, g);
  // the washes: the altitude scale ochre, the zodiac's names blue, the months red, all thin
  node("path", wc.wash({ d: band(T.degrees, T.border), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), g);
  node("path", wc.wash({ d: band(T.signs, T.zodnum), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.5 }), g);
  node("path", wc.wash({ d: band(T.daynum, T.months), "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.35 }), g);
  node("circle", { r: f(HOLE), fill: VELLUM }, g);
  const lines = node("g", { fill: "none", stroke: "currentColor" }, g);
  node("circle", { r: 100, "stroke-width": W(1.8) }, lines);
  for (const key of ["border", "altitude", "degrees", "zodnum", "signs", "spacer", "ladder", "daynum", "months", "saints", "days", "letters"])
    node("circle", { r: f(T[key]), "stroke-width": W(key === "degrees" || key === "ladder" ? 0.9 : 0.6), opacity: Math.min(1, faint + 0.25) }, lines);
  if (opts.ticks !== false) {
    let d = "";
    for (let i = 0; i < 360; i += 5) {
      const a = rim(i, T.degrees);
      const b = rim(i, i % 10 ? T.altitude - 1 : T.altitude);
      d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    node("path", { d, "stroke-width": W(0.6), opacity: Math.min(1, faint + 0.25) }, lines);
  }
  // the shadow square in the lower half
  const s = +A.backSquare.outer;
  const i = +A.backSquare.inner;
  node("path", { d: `M${-s} 0V${s}H${s}V0M${-i} 0V${i}H${i}V0`, "stroke-width": W(0.6), opacity: Math.min(1, faint + 0.25) }, lines);
  node("circle", { r: f(HOLE), "stroke-width": W(1.0) }, lines);
  node("path", { d: A.throneBack.ring, fill: "none", stroke: "currentColor", "stroke-width": W(1.3) }, g);
  const lit = node("path", { d: A.throneBack.ring, fill: "none", stroke: RED, "stroke-width": W(1.8), opacity: 0 }, g);
  return { g, ring: lit, throne, wc };
}

// a label in the printer's red, upright roman, a vellum halo
export function label(parent, x, y, str, size = 14, anchor = "middle") {
  const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": size, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, parent);
  t.textContent = str;
  return t;
}
