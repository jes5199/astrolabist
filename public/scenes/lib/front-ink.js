// The front of the instrument as a coloured woodcut, for the Treatise's ink-on-vellum scenes (jes tg 17827, 17836,
// 17841, 17847): the same drawing, geometry and interface as lib/front.js (our constructed drawing of Oxford
// inv. 47869 for the suspension, limb, rete and label; the plate computed for its latitude), cut in black with a
// little irregularity (lib/woodcut.js) and washed: the suspension red, the limb ochre, the plate below the horizon
// slate blue, the rete's metal blue and its zodiac red.  Hour letters in black; a scene's own words in the printer's
// red (label in lib/back-ink.js).  NIGHT / SILVER / FAINT keep their roles: the ground behind a part (vellum), the
// colour a scene lights a thing in (red), a quiet line (ink).
// The wobble is laid on the static parts and, separately, on the rete (scenes turn rete.g), so nothing swims.
// Units: limb radius 100, centre (0, 0), y down, south at the top, east on the LEFT of the front.
// Hand-written (astrolabe-video web/scenes/lib/front-ink.js).

import A from "./astrolabe-47869.js";
import { woodcut, RED, VELLUM, WASH } from "./woodcut.js";
import { almucantar, azimuth, nightFrom, hourLine, ZENITH, NADIR, P, LAT, rim, f, node } from "./front.js";

export { almucantar, azimuth, nightFrom, hourLine, ZENITH, NADIR, P, LAT, rim, f, node, RED, VELLUM, WASH };
export const NIGHT = VELLUM;
export const SILVER = RED;
export const FAINT = "currentColor";
const circ = (r, cy = 0) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy - r)}Z`;

// opts as lib/front.js: {scale}, {faint}, {plate: false}, {rete: false}, {letters: false}, {ticks: false}.
// Returns the same groups: {g, throne, limb, letters, plate: {g, clip, tropics, horizon, almucantars, azimuths,
// hours, zenith}, rete, wc}; wc: the woodcut tools in instrument units, for a scene's own parts.
export function front(parent, opts = {}) {
  const k = opts.scale || 1;
  const W = (px) => f(px / k);
  const faint = Math.min(1, (opts.faint ?? 0.6) + 0.25);
  const uid = "fi" + Math.random().toString(36).slice(2, 8);
  const g = node("g", {}, parent);
  const defs = node("defs", {}, g);
  const wc = woodcut(defs, { freq: 0.11 * k, wobble: 1.0 / k, seed: 17 });
  const H = wc.hatch(45, 2.6 / k, 0.9 / k);
  const throne = node("g", { filter: wc.rough }, g);
  for (const key of ["base", "boss", "stem", "shackle"]) {
    node("path", { d: A.throneFront[key], fill: VELLUM }, throne);
    node("path", wc.wash({ d: A.throneFront[key], fill: WASH.red }), throne);
    node("path", { d: A.throneFront[key], fill: H, stroke: "currentColor", "stroke-width": W(1.1), "stroke-linejoin": "round" }, throne);
  }
  node("path", { d: A.throneFront.ring, fill: "none", stroke: "currentColor", "stroke-width": W(1.3) }, throne);
  // the limb: its circles, the ladder of degrees, the 24 hour lines, the hour letters with the cross above south
  const R = A.frontRadii;
  const limb = node("g", { fill: "none", stroke: "currentColor", filter: wc.rough }, g);
  node("circle", { r: 100, fill: VELLUM, stroke: "none" }, limb);
  node("path", wc.wash({ d: circ(100) + circ(R.hollow), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), limb);
  node("circle", { r: 100, "stroke-width": W(1.8) }, limb);
  node("circle", { r: R.blocks, "stroke-width": W(0.6), opacity: faint }, limb);
  node("circle", { r: R.hollow, "stroke-width": W(1.1) }, limb);
  if (opts.ticks !== false) {
    let d1 = "";
    let d5 = "";
    for (let i = 0; i < 360; i++) {
      const a = rim(i, R.hollow);
      const b = rim(i, i % 5 ? R.ladder : R.blocks);
      const s = `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
      if (i % 5) d1 += s;
      else d5 += s;
    }
    node("path", { d: d1, "stroke-width": W(0.4), opacity: faint }, limb);
    node("path", { d: d5, "stroke-width": W(0.7), opacity: faint }, limb);
    let d = "";
    for (let i = 0; i < 24; i++) {
      const a = rim(15 * i + 7.5, R.blocks);
      const b = rim(15 * i + 7.5, R.hours);
      d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    node("path", { d, "stroke-width": W(0.7), opacity: faint }, limb);
  }
  node("circle", { r: R.ladder, "stroke-width": W(0.55), opacity: faint }, limb);
  node("circle", { r: R.hours, "stroke-width": W(0.55), opacity: faint }, limb);
  const letters = [];
  if (opts.letters !== false) {
    const rl = (R.blocks + R.hours) / 2;
    for (let i = 0; i < 24; i++) {
      const p = rim(15 * i, rl);
      const t = node("text", { transform: `translate(${f(p[0])} ${f(p[1])}) rotate(${f(15 * i)})`, y: f(2.6), "text-anchor": "middle", "font-size": f(7.2), "font-weight": 600, fill: "currentColor", "font-family": "inherit" }, g);
      t.textContent = i ? A.hourLetters[i - 1] : "+";
      letters.push(t);
    }
  }
  // the plate
  const plate = { g: node("g", { filter: wc.rough }, g) };
  if (opts.plate !== false) {
    const pg = plate.g;
    node("circle", { r: P.capricorn, fill: VELLUM }, pg);
    const [hc, hr] = almucantar(0);
    const cp2 = node("clipPath", { id: uid + "plate" }, pg);
    node("circle", { r: f(P.capricorn) }, cp2);
    // below the horizon, slate blue
    node("path", wc.wash({ d: circ(P.capricorn) + circ(hr, -hc), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.45, "clip-path": `url(#${uid}plate)` }), pg);
    const lines = node("g", { fill: "none", stroke: "currentColor" }, pg);
    plate.tropics = [P.cancer, P.equator, P.capricorn].map((r) => node("circle", { r: f(r), "stroke-width": W(r === P.capricorn ? 1.2 : 0.9) }, lines));
    const cp = node("clipPath", { id: uid + "sky" }, pg);
    node("circle", { cy: f(-hc), r: f(hr) }, cp);
    plate.clip = node("g", { "clip-path": `url(#${uid}plate)` }, lines);
    plate.horizon = node("circle", { cy: f(-hc), r: f(hr), "stroke-width": W(1.3), stroke: "currentColor" }, plate.clip);
    plate.almucantars = [];
    for (let h = 2; h < 90; h += 2) {
      const [c, r] = almucantar(h);
      plate.almucantars.push({ h, el: node("circle", { cy: f(-c), r: f(r), "stroke-width": W(h % 10 ? 0.35 : 0.65), opacity: h % 10 ? 0.5 : 0.85 }, plate.clip) });
    }
    const sky = node("g", { "clip-path": `url(#${uid}sky)` }, plate.clip);
    plate.azimuths = [];
    for (let az = 15; az < 180; az += 15) {
      if (az === 90) {
        const [, cy, r] = azimuth(90);
        plate.azimuths.push({ az, el: node("circle", { cy: f(cy), r: f(r), "stroke-width": W(0.5), opacity: 0.7 }, sky) });
        continue;
      }
      for (const sx of [-1, 1]) {
        const [xc, cy, r] = azimuth(az);
        plate.azimuths.push({ az: sx * az, el: node("circle", { cx: f(sx * xc), cy: f(cy), r: f(r), "stroke-width": W(0.5), opacity: 0.7 }, sky) });
      }
    }
    plate.azimuths.push({ az: 0, el: node("path", { d: `M0 ${f(-P.capricorn)}V${f(-hc + hr)}`, "stroke-width": W(0.5), opacity: 0.7 }, sky) });
    plate.hours = [];
    for (let i = 1; i < 12; i++) plate.hours.push(node("path", { d: hourLine(i), "stroke-width": W(0.6), opacity: 0.8 }, lines));
    plate.zenith = [0, -ZENITH];
  }
  // the rete, turned by a scene: rotate(angle) on rete.g; its own wobble inside, so it turns with it
  const rete = { g: node("g", {}, g) };
  if (opts.rete !== false) {
    const rg = node("g", { filter: wc.rough }, rete.g);
    node("path", wc.wash({ d: A.rete, "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.7 }), rg);
    // the zodiac's band: between the ecliptic and the ring's inner edge (centre and radii of the drawn ring)
    node("path", wc.wash({ d: circ(53.6, -22.3) + circ(42.6, -22.3), "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.75 }), rg);
    node("path", { d: A.rete, fill: "none", "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.1), "stroke-linejoin": "round" }, rg);
  }
  node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g); // the pin
  return { g, throne, limb, letters, plate, rete, wc };
}
