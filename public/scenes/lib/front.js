// The front of the instrument in line work, for the Part I scenes about the front (I 15 onwards): our constructed
// drawing of Oxford inv. 47869 (astrolabe-47869.js) for the suspension, the limb, the rete and the label; the plate
// computed for its latitude by stereographic projection (horizon and altitude circles, azimuths, unequal hours).
// Units: limb radius 100, centre (0, 0), y down, south (under the ring) at the top, east on the LEFT of the front.
// Stroke widths are given in window units and divided by opts.scale (no vector-effect: see lib/back.js).
// Hand-written (astrolabe-video web/scenes/lib/front.js).

import A from "./astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
export const NIGHT = "#0a1030";
export const SILVER = "#e4e7f3";
export const FAINT = "#a7b0d4";
const RAD = Math.PI / 180;
export const P = A.plate; // equator, cancer, capricorn radii; latitude
export const LAT = P.latitude * RAD;

export function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
export const f = (n) => (Math.round(n * 100) / 100).toString();
// a point at a bearing (degrees clockwise from the top: 0 is south, under the ring; 90 is WEST on the front, which
// is on the right) and a radius
export const rim = (deg, r) => [r * Math.sin(deg * RAD), -r * Math.cos(deg * RAD)];

// the circle of altitude h (degrees) on the plate: [its centre's distance up (south) from the pole, its radius]
export function almucantar(h) {
  const den = Math.sin(LAT) + Math.sin(h * RAD);
  return [(P.equator * Math.cos(LAT)) / den, (P.equator * Math.cos(h * RAD)) / den];
}
export const ZENITH = almucantar(90)[0]; // the zenith's distance up from the pole
export const NADIR = (P.equator * Math.cos(LAT)) / (1 - Math.sin(LAT)); // the nadir's, down
// the vertical circle of azimuth az (degrees from the south): [centre x, centre y, radius] (through zenith, nadir)
export function azimuth(az) {
  const a = -ZENITH;
  const b = NADIR;
  const xc = ((b - a) / 2) / Math.tan(az * RAD);
  return [xc, (a + b) / 2, Math.hypot(xc, (b - a) / 2)];
}
// on the circle of declination of radius rd, the bearings where it meets the horizon (the night lies between them,
// through the north)
export function nightFrom(rd) {
  const [c, r] = almucantar(0);
  return Math.acos((rd * rd + c * c - r * r) / (2 * rd * c)) / RAD;
}
// the unequal hour line k (1..11) below the horizon: the arc through the k-th twelfths of the night on the three
// circles (Cancer, equator, Capricorn), as path data
export function hourLine(k) {
  const pts = [P.cancer, P.equator, P.capricorn].map((rd) => {
    const t0 = nightFrom(rd);
    return rim(t0 + (k * (360 - 2 * t0)) / 12, rd);
  });
  const [p, q, s] = pts;
  // the circle through three points
  const d = 2 * (p[0] * (q[1] - s[1]) + q[0] * (s[1] - p[1]) + s[0] * (p[1] - q[1]));
  const ux = ((p[0] ** 2 + p[1] ** 2) * (q[1] - s[1]) + (q[0] ** 2 + q[1] ** 2) * (s[1] - p[1]) + (s[0] ** 2 + s[1] ** 2) * (p[1] - q[1])) / d;
  const uy = ((p[0] ** 2 + p[1] ** 2) * (s[0] - q[0]) + (q[0] ** 2 + q[1] ** 2) * (p[0] - s[0]) + (s[0] ** 2 + s[1] ** 2) * (q[0] - p[0])) / d;
  const r = Math.hypot(p[0] - ux, p[1] - uy);
  if (!isFinite(r) || r > 1e4) return `M${f(p[0])} ${f(p[1])}L${f(s[0])} ${f(s[1])}`; // the middle line: straight
  const cross = (q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0]);
  return `M${f(p[0])} ${f(p[1])}A${f(r)} ${f(r)} 0 0 ${cross > 0 ? 1 : 0} ${f(s[0])} ${f(s[1])}`;
}

// opts: {scale} the scene's scale; {faint} the opacity of the quiet lines; parts to leave out: {plate: false},
// {rete: false}, {letters: false}.  Returns the groups a scene animates:
// {g, throne, limb, letters: [24 <text> or the cross], plate: {g, clip, tropics: [cancer, equator, capricorn],
//  horizon, almucantars: [{h, el}], azimuths: [{az, el}], hours: [el x 11]}, rete, label}
export function front(parent, opts = {}) {
  const W = (px) => f(px / (opts.scale || 1));
  const faint = opts.faint ?? 0.6;
  const uid = "fr" + Math.random().toString(36).slice(2, 8);
  const g = node("g", {}, parent);
  const throne = node("g", {}, g);
  for (const k of ["base", "boss", "stem", "shackle"]) {
    node("path", { d: A.throneFront[k], fill: NIGHT, "fill-opacity": 0.72 }, throne);
    node("path", { d: A.throneFront[k], fill: "none", stroke: "currentColor", "stroke-width": W(0.8), "stroke-linejoin": "round" }, throne);
  }
  node("path", { d: A.throneFront.ring, fill: "none", stroke: "currentColor", "stroke-width": W(0.8) }, throne);
  // the limb: its circles, the 24 hour marks, the hour letters with the cross above the south line
  const R = A.frontRadii;
  node("circle", { r: 100, fill: NIGHT, "fill-opacity": 0.72 }, g);
  const limb = node("g", { fill: "none", stroke: "currentColor" }, g);
  node("circle", { r: 100, "stroke-width": W(1.2) }, limb);
  node("circle", { r: R.blocks, "stroke-width": W(0.4), opacity: faint }, limb);
  node("circle", { r: R.hollow, "stroke-width": W(0.7) }, limb);
  // as on inv. 47869: a ladder of 1-degree cells, a line every 5 degrees across the blocks, the 24 hours' lines
  // through the letters' band ({ticks: false} leaves them to the scene)
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
    node("path", { d: d1, "stroke-width": W(0.25), opacity: faint }, limb);
    node("path", { d: d5, "stroke-width": W(0.45), opacity: faint }, limb);
    let d = "";
    for (let i = 0; i < 24; i++) {
      const a = rim(15 * i + 7.5, R.blocks);
      const b = rim(15 * i + 7.5, R.hours);
      d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    node("path", { d, "stroke-width": W(0.45), opacity: faint }, limb);
  }
  node("circle", { r: R.ladder, "stroke-width": W(0.35), opacity: faint }, limb);
  node("circle", { r: R.hours, "stroke-width": W(0.35), opacity: faint }, limb);
  const letters = [];
  if (opts.letters !== false) {
    const rl = (R.blocks + R.hours) / 2; // the letters' band
    for (let i = 0; i < 24; i++) {
      const p = rim(15 * i, rl);
      const t = node("text", { transform: `translate(${f(p[0])} ${f(p[1])}) rotate(${f(15 * i)})`, y: f(2.6), "text-anchor": "middle", "font-size": f(7.2), fill: "currentColor", "font-family": "inherit" }, g);
      t.textContent = i ? A.hourLetters[i - 1] : "+";
      letters.push(t);
    }
  }
  // the plate
  const plate = { g: node("g", {}, g) };
  if (opts.plate !== false) {
    const pg = plate.g;
    node("circle", { r: P.capricorn, fill: NIGHT, "fill-opacity": 0.5 }, pg);
    const lines = node("g", { fill: "none", stroke: FAINT }, pg);
    plate.tropics = [P.cancer, P.equator, P.capricorn].map((r) => node("circle", { r: f(r), "stroke-width": W(0.7), stroke: "currentColor" }, lines));
    // the sky above the horizon, inside the plate: the clip for the azimuths
    const [hc, hr] = almucantar(0);
    const cp = node("clipPath", { id: uid + "sky" }, pg);
    node("circle", { cy: f(-hc), r: f(hr) }, cp);
    const cp2 = node("clipPath", { id: uid + "plate" }, pg);
    node("circle", { r: f(P.capricorn) }, cp2);
    plate.clip = node("g", { "clip-path": `url(#${uid}plate)` }, lines);
    plate.horizon = node("circle", { cy: f(-hc), r: f(hr), "stroke-width": W(0.9), stroke: SILVER }, plate.clip);
    plate.almucantars = [];
    for (let h = 2; h < 90; h += 2) {
      const [c, r] = almucantar(h);
      plate.almucantars.push({ h, el: node("circle", { cy: f(-c), r: f(r), "stroke-width": W(h % 10 ? 0.25 : 0.45), opacity: h % 10 ? 0.55 : 0.85 }, plate.clip) });
    }
    const sky = node("g", { "clip-path": `url(#${uid}sky)` }, plate.clip);
    plate.azimuths = [];
    for (let az = 15; az < 180; az += 15) {
      if (az === 90) {
        const [, cy, r] = azimuth(90);
        plate.azimuths.push({ az, el: node("circle", { cy: f(cy), r: f(r), "stroke-width": W(0.35), opacity: 0.7 }, sky) });
        continue;
      }
      for (const sx of [-1, 1]) {
        const [xc, cy, r] = azimuth(az);
        plate.azimuths.push({ az: sx * az, el: node("circle", { cx: f(sx * xc), cy: f(cy), r: f(r), "stroke-width": W(0.35), opacity: 0.7 }, sky) });
      }
    }
    // the meridian above the horizon (azimuth 0 and 180): straight
    plate.azimuths.push({ az: 0, el: node("path", { d: `M0 ${f(-P.capricorn)}V${f(-hc + hr)}`, "stroke-width": W(0.35), opacity: 0.7 }, sky) });
    plate.hours = [];
    for (let k = 1; k < 12; k++) plate.hours.push(node("path", { d: hourLine(k), "stroke-width": W(0.4), opacity: 0.75 }, lines));
    plate.zenith = [0, -ZENITH];
  }
  // the rete, turned by a scene: rotate(angle) on rete.g
  const rete = { g: node("g", {}, g) };
  if (opts.rete !== false) {
    node("path", { d: A.rete, fill: "currentColor", "fill-opacity": 0.2, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(0.75), "stroke-linejoin": "round" }, rete.g);
  }
  node("circle", { r: 4.2, fill: NIGHT, stroke: "currentColor", "stroke-width": W(0.8) }, g); // the pin
  return { g, throne, limb, letters, plate, rete };
}
