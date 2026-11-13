// The instrument as the miniatures paint it: brass, an ink contour, two faces (front: plate under the rete; back:
// the scales and the rule) and the ring they share.  Our constructed drawing of Oxford inv. 47869
// (astrolabe-47869.js), in its own units (limb radius 100, y down).  Hand-written (astrolabe-video
// web/scenes/lib/painted.js); used by the figure scenes.

import A from "./astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const INK = "#17100d";
export const BRASS = "#d9b04c";
export const BRASS_DK = "#a87c2a";
export const BRASS_LT = "#efd98f";
export const PIVOT = -181; // where the ring bears on a thumb, instrument units above the centre

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const r1 = (v) => +v.toFixed(1);
const r3 = (v) => +v.toFixed(3);

// dia: its diameter in the scene's units (stroke weights are kept in those units).
// Returns {g, front, back, set(hook, sway, turn)}: front and back are groups a scene may draw on, in instrument units.
export function instrument(parent, dia) {
  const K = dia / 200;
  const w = (px) => r3(px / K); // a film-unit stroke in instrument units
  const g = node("g", {}, parent);
  const ink = { stroke: INK, "stroke-width": w(2.6), "stroke-linejoin": "round" };
  node("path", { d: A.throneFront.ring, fill: BRASS, ...ink, "stroke-width": w(1.6) }, g);
  const face = (name) => node("g", { "data-face": name }, g);
  // the front
  const fr = face("front");
  for (const k of ["base", "boss", "stem", "shackle"]) node("path", { d: A.throneFront[k], fill: BRASS, ...ink }, fr);
  node("circle", { r: 100, fill: BRASS, ...ink }, fr);
  node("circle", { r: A.frontRadii.hollow, fill: BRASS_LT, stroke: BRASS_DK, "stroke-width": w(1.2) }, fr);
  let d = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI) / 12;
    d += `M${r1(89 * Math.sin(a))} ${r1(-89 * Math.cos(a))}L${r1(97 * Math.sin(a))} ${r1(-97 * Math.cos(a))}`;
  }
  node("path", { d, stroke: BRASS_DK, "stroke-width": w(0.9), fill: "none" }, fr);
  for (const alt of [0, 30, 60]) {
    const L = (A.plate.latitude * Math.PI) / 180;
    const h = (alt * Math.PI) / 180;
    const den = Math.sin(L) + Math.sin(h);
    node("circle", { cy: r1((-A.plate.equator * Math.cos(L)) / den), r: r1((A.plate.equator * Math.cos(h)) / den), fill: "none", stroke: BRASS_DK, "stroke-width": w(alt ? 0.6 : 1) }, fr);
  }
  node("path", { d: A.rete, fill: BRASS, "fill-rule": "evenodd", stroke: INK, "stroke-width": w(0.9), transform: `rotate(${A.morning.rot})` }, fr);
  node("circle", { r: 6, fill: BRASS_DK, ...ink, "stroke-width": w(1) }, fr);
  // the back
  const bk = face("back");
  for (const k of ["base", "boss", "stem", "shackle"]) node("path", { d: A.throneBack[k], fill: BRASS, ...ink }, bk);
  node("circle", { r: 100, fill: BRASS_LT, ...ink }, bk);
  for (const k of ["altitude", "degrees", "signs", "months", "days"]) node("circle", { r: A.backTiers[k], fill: "none", stroke: BRASS_DK, "stroke-width": w(0.8) }, bk);
  const sq = +A.backSquare.outer;
  node("path", { d: `M${-sq} 0V${sq}H${sq}V0`, fill: "none", stroke: BRASS_DK, "stroke-width": w(0.8) }, bk);
  node("path", { d: A.alidade.body, fill: BRASS, stroke: INK, "stroke-width": w(1), transform: "rotate(-35)" }, bk);
  node("circle", { r: 5, fill: BRASS_DK, ...ink, "stroke-width": w(1) }, bk);
  // its hanging: hook (film units), sway (degrees), turn (0: the front to us; pi: the back)
  return {
    g,
    front: fr,
    back: bk,
    set(hook, sway, turn) {
      const c = Math.cos(turn);
      const sq = Math.max(0.04, Math.abs(c));
      g.setAttribute("transform", `translate(${r1(hook[0])} ${r1(hook[1])}) rotate(${r1(sway)}) scale(${r3(K * sq)} ${r3(K)}) translate(0 ${-PIVOT})`);
      fr.setAttribute("display", c >= 0 ? "inline" : "none");
      bk.setAttribute("display", c >= 0 ? "none" : "inline");
    },
  };
}
