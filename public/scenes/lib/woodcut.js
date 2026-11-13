// Woodcut character for the Treatise's ink-on-vellum scenes (jes tg 17827: "more wood-cut"): the cut line's
// irregularity, and hatching cut in the same ink as the line, bold and close; letters in the printer's red.  Our own treatment, in the spirit of
// the early printed astrolabe books; nothing is copied from any print.
// Hand-coloured (jes tg 17836, "stoefler's colors"): a wash of flat, translucent colour laid inside the lines, a
// little uneven and a touch out of register, in three colours as the hand-coloured copies of the early books use them
// (vermilion, slate blue, ochre); the palette is our own choice of tints, nothing is sampled from any one copy.
// woodcut(defs, {freq, wobble, seed, washFreq, washWander}) -> {rough, hatch(angle, gap, width, cross), wash(attrs)}:
//   rough: a filter url; put it on the element that carries a part's own transform, so the wobble moves with the
//          part (the noise is laid in that element's own units: freq and wobble are in those units)
//   hatch: a pattern url of parallel cuts (crossed if cross), in currentColor, in the user units where it is used
//   wash:  attributes for a coloured fill laid under the lines: wash({fill: WASH.red, d: ...}) gives the fill, its
//          unevenness (a filter) and its slip out of register (a small offset); the same units rule as rough
// Hand-written (astrolabe-video web/scenes/lib/woodcut.js).

const NS = "http://www.w3.org/2000/svg";
export const RED = "#c63a22"; // the printer's red (jes tg 17841): the part letters and labels, upright roman
export const VELLUM = "#efe3c6"; // the leaf, where a part must hide what lies behind it
export const WASH = { red: "#d4573f", blue: "#7f9aa6", ochre: "#e2bb57" }; // the colourist's three

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

export function woodcut(defs, opts = {}) {
  const uid = "wc" + Math.random().toString(36).slice(2, 8);
  const flt = node("filter", { id: uid + "r", filterUnits: "userSpaceOnUse", x: -400, y: -400, width: 800, height: 800, "color-interpolation-filters": "sRGB" }, defs);
  node("feTurbulence", { type: "fractalNoise", baseFrequency: opts.freq ?? 0.06, numOctaves: 2, seed: opts.seed ?? 7, result: "n" }, flt);
  node("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: opts.wobble ?? 2.4, xChannelSelector: "R", yChannelSelector: "G" }, flt);
  // the wash: its edge wanders off the line a little, its density varies as a brush leaves it
  const wf = opts.washFreq ?? (opts.freq ?? 0.06) * 0.6;
  const wsh = node("filter", { id: uid + "w", filterUnits: "userSpaceOnUse", x: -400, y: -400, width: 800, height: 800, "color-interpolation-filters": "sRGB" }, defs);
  node("feTurbulence", { type: "fractalNoise", baseFrequency: wf, numOctaves: 2, seed: (opts.seed ?? 7) + 3, result: "n" }, wsh);
  node("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: opts.washWander ?? (opts.wobble ?? 2.4) * 1.6, xChannelSelector: "G", yChannelSelector: "B", result: "d" }, wsh);
  node("feTurbulence", { type: "fractalNoise", baseFrequency: wf * 3, numOctaves: 3, seed: (opts.seed ?? 7) + 9, result: "m" }, wsh);
  node("feColorMatrix", { in: "m", type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.05", result: "a" }, wsh);
  node("feComposite", { in: "d", in2: "a", operator: "arithmetic", k1: 1, k2: 0, k3: 0, k4: 0 }, wsh);
  const slip = opts.slip ?? (opts.wobble ?? 2.4) * 0.5;
  const wash = (attrs) => ({ ...attrs, "fill-opacity": attrs["fill-opacity"] ?? 0.78, stroke: "none", filter: `url(#${uid}w)`, transform: `${attrs.transform ? attrs.transform + " " : ""}translate(${slip} ${-slip * 0.6})` });
  let n = 0;
  const hatch = (angle, gap, width, cross = false) => {
    const id = `${uid}h${n++}`;
    const p = node("pattern", { id, width: gap, height: gap, patternUnits: "userSpaceOnUse", patternTransform: `rotate(${angle})` }, defs);
    node("line", { x1: gap / 2, y1: -1, x2: gap / 2, y2: gap + 1, stroke: "currentColor", "stroke-width": width }, p);
    if (cross) node("line", { x1: -1, y1: gap / 2, x2: gap + 1, y2: gap / 2, stroke: "currentColor", "stroke-width": width * 0.8 }, p);
    return `url(#${id})`;
  };
  return { rough: `url(#${uid}r)`, hatch, wash };
}
