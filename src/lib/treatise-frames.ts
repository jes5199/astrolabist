// Window frames by scene kind (Jes, tg 17835). THE one place a scene's frame is decided.
//
// Kinds are docs/treatise-scenes.md's "Kind" column:
//   I instrument · F figure (colour miniature) · S sky · — no scene of its own.
// Frame chosen by what the module draws:
//   name ends in "-ink"  → "parchment" (woodcut ink on vellum, square)
//   kind S               → "rim"       (round window, plain thin rim, no ticks or ring text)
//   kind F               → "gilt"      (square gilt frame, dark ground)
//   anything else        → "ring"      (the round graduated ring, as before). Unconverted
//                                        instrument scenes still draw gold on the night glass,
//                                        so they keep it until their -ink version replaces them.
// A new scene is a one-line change here. A name missing from the map warns at build and
// falls back to "ring".

export type SceneKind = "I" | "F" | "S" | "—";
export type Frame = "parchment" | "rim" | "gilt" | "ring";

export const SCENE_KIND: Record<string, SceneKind> = {
  "night-window": "—",
  // Prologue
  "treatise-prologue-gift": "F",
  "treatise-prologue": "F", // "with this swerd"
  // The five small "partie" windows draw the instrument in gold and silver on the night glass
  // (night style, not ink): a parchment square would make them illegible. See RIM_ANYWAY.
  "treatise-prologue-part-1": "I",
  "treatise-prologue-part-2": "I",
  "treatise-prologue-part-3": "I",
  "treatise-prologue-part-4": "I",
  "treatise-prologue-part-5": "I",
  // Part I
  "treatise-p1-1-ring": "I",
  "treatise-p1-2-shackle": "I",
  "treatise-p1-3-mother-rete": "I",
  "treatise-p1-3-mother-rete-ink": "I",
  "treatise-p1-4-meridional": "I",
  "treatise-p1-5-east-west": "I",
  "treatise-p1-6-right-left": "F",
  "treatise-p1-7-border": "I",
  "treatise-p1-8-signs": "I",
  "treatise-p1-9-days": "I",
  "treatise-p1-10-months": "I",
  "treatise-p1-11-holy-days": "I",
  "treatise-p1-12-shadow-square": "I",
  "treatise-p1-13-rule": "I",
  "treatise-p1-14-pin-horse": "I",
  "treatise-p1-14-pin-horse-ink": "I",
  "treatise-p1-15-front-quarters": "I",
  "treatise-p1-16-front-border": "I",
  "treatise-p1-17-three-circles": "I",
  "treatise-p1-18-almucantars": "I",
  "treatise-p1-19-azimuths": "I",
  "treatise-p1-20-unequal-hours": "I",
  "treatise-p1-21-rete": "I",
  "treatise-p1-22-label": "I",
  "treatise-p1-23-almury": "I",
  // Part II
  "treatise-p2-1-sun-degree": "I",
  "treatise-p2-2-altitude": "I",
  "treatise-p2-3-time": "I",
  "treatise-p2-4-ascendant": "I",
  "treatise-p2-5-between": "I",
  "treatise-p2-6-twilight": "S",
  "treatise-p2-7-day-arc": "I",
  "treatise-p2-8-equal-hours": "I",
  "treatise-p2-9-vulgar-day": "S",
  "treatise-p2-10-unequal-sum": "I",
  "treatise-p2-11-from-sunrise": "I",
  "treatise-p2-12-planet-hours": "S",
  "treatise-p2-13-noon": "I",
  "treatise-p2-14-sun-from-noon": "I",
  "treatise-p2-15-equal-days": "I",
  "treatise-p2-17-star-place": "S",
  "treatise-p2-18-mediation": "I",
  "treatise-p2-19-rises-with": "I",
  "treatise-p2-20-declination": "I",
  "treatise-p2-21-plate-latitude": "I",
  "treatise-p2-22-oxford": "S",
  "treatise-p2-23-pole-star": "F", // planned as a figure; the current module is the sky version
  "treatise-p2-24-never-sets": "S",
  "treatise-p2-25-latitude-noon": "S",
  "treatise-p2-26-right-sphere": "S",
  "treatise-p2-27-right-ascension": "I",
  "treatise-p2-28-oblique-ascension": "I",
  "treatise-p2-29-four-quarters": "F", // planned as a figure; the current module is the instrument version
  "treatise-p2-30-planet-latitude": "S",
  "treatise-p2-31-sunrise-azimuth": "S",
  "treatise-p2-32-conjunction": "S",
  "treatise-p2-33-quarter": "I",
  "treatise-p2-34-moon": "I",
  "treatise-p2-35-retrograde": "S",
  "treatise-p2-36-houses-ink": "I",
  "treatise-p2-37-houses-label-ink": "I",
  "treatise-p2-38-meridian-line": "F",
};

// Night-style modules that are not sky scenes but still want the plain round rim.
const RIM_ANYWAY = new Set([
  "treatise-prologue-part-1",
  "treatise-prologue-part-2",
  "treatise-prologue-part-3",
  "treatise-prologue-part-4",
  "treatise-prologue-part-5",
]);

const warned = new Set<string>();
export function frameFor(name: string): Frame {
  if (name.endsWith("-ink")) return "parchment";
  if (RIM_ANYWAY.has(name)) return "rim";
  const kind = SCENE_KIND[name];
  if (kind === undefined) {
    if (!warned.has(name)) {
      warned.add(name);
      console.warn(`[treatise frames] scene "${name}" has no kind in src/lib/treatise-frames.ts; falling back to the ring`);
    }
    return "ring";
  }
  if (kind === "S") return "rim";
  if (kind === "F") return "gilt";
  return "ring";
}
