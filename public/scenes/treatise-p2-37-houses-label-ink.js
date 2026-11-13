// A Treatise on the Astrolabe, Part II, 37: "Tak thyn assendent, and thanne hastow thy 4 angles; for wel thou wost that
// the opposit of thyn assendent, that is to seyn, thy by-ginning of the 7 hous, sit up-on the west orizonte; and the
// byginning of the 10 hous sit up-on the lyne meridional; and his opposit up-on the lyne of midnight. Thanne ley thy
// label over the degree that assendeth, and rekne fro the point of thy label alle the degrees in the bordure, til thou
// come to the meridional lyne; and departe alle thilke degrees in 3 evene parties ... The same wyse wirke thou fro the
// assendent doun to the lyne of midnight ... thanne is the nadir of thise 3 houses the by-ginning of the 3 houses that
// folwen."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// COLOURED WOODCUT on vellum (jes tg 17847; lib/woodcut.js): cut, washed, lettered in the printer's red.
// horizon.  The four angles are marked: 1 on the east horizon, 7 on the west, 10 on the south (meridian) line, 4 on
// the midnight line.  The label is laid over the ascendant; the border's degrees from it to the meridian are counted
// and parted in three, and the label laid on each part reads houses 12 and 11; the same downwards to the midnight line
// gives 2 and 3; the nadirs give the rest.  Computed for 52 degrees: the cusps are the same as II 36's (both trisect
// the ascendant's semi-arcs in time).  Our own line work, nothing traced or copied.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";
import { node, f, rim, P, almucantar, nightFrom, hourLine } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 30000;
const STILL = 26000; // ms: all twelve houses marked
const INK2 = "currentColor"; // the hatching ink
const C = { x: 0, y: -8, k: 0.72 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const norm = (x) => ((x % 360) + 360) % 360;
const raOf = (lam) => norm(Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD);
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
const nameOf = (lam) => `${SIGNS[Math.floor(norm(lam) / 30)]} ${Math.round(norm(lam) % 30)}°`;
const ASC = 80; // Gemini 20
const t0a = nightFrom(rAt(decOf(ASC)));
const ROT = norm(360 - t0a - 270 + raOf(ASC)); // the ascendant on the eastern horizon
const bearingOf = (lam) => 270 - raOf(lam) + ROT; // where a degree stands, clockwise from the south line
const eclAt = (lam) => rim(bearingOf(lam), rAt(decOf(lam)));
// the degree under the label at bearing b
const degreeAt = (b) => {
  const a = norm(270 + ROT - b) * RAD;
  return norm(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(EPS)) / RAD);
};
const BA = norm(bearingOf(ASC)); // the label over the ascendant
const UP = 360 - BA; // the border's degrees from there to the meridional line
const DOWN = BA - 180; // and down to the midnight line
const LB = [BA, BA + UP / 3, BA + (2 * UP) / 3, 360, BA, BA - DOWN / 3, BA - (2 * DOWN) / 3, 180]; // the label's stops
// the houses' beginnings, 1..12
const H = [];
H[1] = ASC;
H[12] = degreeAt(LB[1]);
H[11] = degreeAt(LB[2]);
H[10] = degreeAt(360);
H[2] = degreeAt(LB[5]);
H[3] = degreeAt(LB[6]);
H[4] = degreeAt(180);
for (const k of [1, 2, 3, 4, 10, 11, 12]) H[((k + 5) % 12) + 1] = norm(H[k] + 180);
const RE = (P.capricorn + P.cancer) / 2;
const OFF = (P.capricorn - P.cancer) / 2;
const BAND = 11;
const REST = 315; // the label's bearing between rounds
// the timeline (s): when each house is marked; the label's moves [start, from, to]
const MARK = { 1: 0.6, 7: 1.2, 10: 1.8, 4: 2.4, 12: 8.0, 11: 10.4, 2: 17.6, 3: 20.0, 5: 23.0, 6: 23.4, 8: 23.8, 9: 24.2 };
const MOVES = [[3.0, REST, LB[0]], [6.6, LB[0], LB[1]], [9.0, LB[1], LB[2]], [11.4, LB[2], LB[3]], [13.2, LB[3], LB[4]], [16.2, LB[4], LB[5]], [18.6, LB[5], LB[6]], [21.0, LB[6], LB[7]], [22.6, LB[7], REST]];
const ARC_UP = [4.4, 12.6]; // the upper count shown
const ARC_DOWN = [14.4, 22.2]; // the lower

function spread(ang, min) {
  const n = ang.length;
  const order = ang.map((a, i) => i).sort((i, j) => ang[i] - ang[j]);
  const x = order.map((i) => ang[i]);
  for (let it = 0; it < 60; it++) {
    for (let k = 0; k < n; k++) {
      const k2 = (k + 1) % n;
      const gap = k2 ? x[k2] - x[k] : x[0] + 360 - x[n - 1];
      if (gap < min) {
        x[k] -= (min - gap) / 2;
        x[k2] += (min - gap) / 2;
      }
    }
  }
  const out = [];
  order.forEach((i, k) => (out[i] = x[k]));
  return out;
}
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const win = (p) => [C.x + C.k * p[0], C.y + C.k * p[1]];
const arc = (b0, b1, r) => {
  const a = rim(b0, r);
  const b = rim(b1, r);
  return `M${f(a[0])} ${f(a[1])}A${r} ${r} 0 ${Math.abs(b1 - b0) > 180 ? 1 : 0} ${b1 > b0 ? 1 : 0} ${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11 * C.k, wobble: 1.0 / C.k, seed: 41 });
  const pat = node("pattern", { id: "h" + uid, width: 2.6, height: 2.6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  node("line", { x1: 0, y1: 0, x2: 0, y2: 2.6, stroke: INK2, "stroke-width": 1.1 }, pat);
  const pat2 = node("pattern", { id: "l" + uid, width: 2.2, height: 2.2, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-45)" }, defs);
  node("line", { x1: 0, y1: 0, x2: 0, y2: 2.2, stroke: INK2, "stroke-width": 0.9 }, pat2);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const ink = { fill: "none", stroke: "currentColor", "stroke-linejoin": "round" };
  const circW = (r, cy = 0) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy - r)}Z`;
  node("path", wc.wash({ d: circW(100) + circW(86), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), g);
  // the limb (the border): two circles, a tick every 5 degrees, a longer one every 15
  node("circle", { ...ink, r: 100, "stroke-width": W(1.65) }, g);
  node("circle", { ...ink, r: 86, "stroke-width": W(1.05) }, g);
  let dt = "";
  for (let i = 0; i < 360; i += 5) {
    const a = rim(i, 86);
    const b = rim(i, i % 15 ? 91 : 95);
    dt += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  node("path", { ...ink, d: dt, "stroke-width": W(0.6), stroke: INK2 }, g);
  // the plate: the three circles, the horizon, the hour lines (quiet), the south and midnight lines
  for (const r of [P.cancer, P.equator, P.capricorn]) node("circle", { ...ink, r: f(r), "stroke-width": W(r === P.capricorn ? 0.8 : 0.5), stroke: r === P.capricorn ? "currentColor" : INK2 }, g);
  const cp = node("clipPath", { id: "p" + uid }, g);
  node("circle", { r: f(P.capricorn) }, cp);
  const [hc, hr] = almucantar(0);
  const clip = node("g", { "clip-path": `url(#p${uid})` }, g);
  node("path", wc.wash({ d: circW(P.capricorn) + circW(hr, -hc), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.45 }), clip);
  node("circle", { ...ink, cy: f(-hc), r: f(hr), "stroke-width": W(1.35) }, clip);
  for (let k = 1; k < 12; k++) if (k !== 6) node("path", { ...ink, d: hourLine(k), "stroke-width": W(0.6), stroke: INK2, opacity: 0.6 }, g);
  node("path", { ...ink, d: `M0 ${f(-P.capricorn)}V${f(P.capricorn)}`, "stroke-width": W(1.35) }, g);
  // the rete's zodiac ring, standing at the ascendant's setting
  const rete = node("g", { transform: `rotate(${f(ROT)})` }, g);
  const cy = -OFF;
  const ringD = (r) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 0 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 0 0 ${f(cy - r)}Z`;
  node("path", wc.wash({ d: ringD(RE) + ringD(RE - BAND), "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.75 }), rete);
  node("path", { d: ringD(RE) + ringD(RE - BAND), fill: `url(#h${uid})`, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.2) }, rete);
  let dd = "";
  for (let lam = 0; lam < 360; lam += 10) {
    const p = rim(270 - raOf(lam), rAt(decOf(lam)));
    const u = [p[0] / RE, (p[1] - cy) / RE];
    const len = lam % 30 ? BAND * 0.45 : BAND;
    dd += `M${f(p[0])} ${f(p[1])}L${f(p[0] - u[0] * len)} ${f(p[1] - u[1] * len)}`;
  }
  node("path", { ...ink, d: dd, "stroke-width": W(0.9) }, rete);
  // the counts on the border: the arc, and its thirds
  const tick = (b) => {
    const a = rim(b, 84);
    const c = rim(b, 100);
    return `M${f(a[0])} ${f(a[1])}L${f(c[0])} ${f(c[1])}`;
  };
  const upArc = node("path", { ...ink, d: arc(BA, 360, 93) + tick(LB[1]) + tick(LB[2]) + tick(BA) + tick(360), stroke: RED, "stroke-width": W(2.7), opacity: 0 }, g);
  const downArc = node("path", { ...ink, d: arc(BA, 180, 93) + tick(LB[5]) + tick(LB[6]) + tick(BA) + tick(180), stroke: RED, "stroke-width": W(2.7), opacity: 0 }, g);
  // the houses' beginnings: a red stroke across the band; the nadirs joined through the pin
  const centre = rim(ROT, OFF);
  const marks = [];
  const lines = node("g", {}, g);
  for (let k = 1; k <= 12; k++) {
    const p = eclAt(H[k]);
    const u = [(p[0] - centre[0]) / RE, (p[1] - centre[1]) / RE];
    marks[k] = node("path", { ...ink, d: `M${f(p[0] + u[0] * 2)} ${f(p[1] + u[1] * 2)}L${f(p[0] - u[0] * (BAND + 1))} ${f(p[1] - u[1] * (BAND + 1))}`, stroke: RED, "stroke-width": W(2.4), opacity: 0 }, g);
  }
  const nadir = {};
  for (const k of [5, 6, 8, 9]) {
    const a = eclAt(H[k]);
    const b = eclAt(H[((k + 5) % 12) + 1]);
    nadir[k] = node("path", { ...ink, d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, stroke: RED, "stroke-width": W(0.9), "stroke-dasharray": `${W(4.5)} ${W(3.0)}`, opacity: 0 }, lines);
  }
  // the label: a slender rule through the pin, pointed at both ends, its edge on the line through the centre
  const label = node("g", {}, g);
  node("path", { d: "M0 -99L2.6 -88V88L0 99L-2.6 88V-88Z", fill: `url(#l${uid})`, "fill-opacity": 0.9, stroke: "currentColor", "stroke-width": W(1.2), "stroke-linejoin": "round" }, label);
  node("path", { d: "M0 -99V99", stroke: "currentColor", "stroke-width": W(0.75), fill: "none" }, label);
  node("circle", { r: 4, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.35) }, g); // the pin
  const dot = node("circle", { r: 2.4, fill: RED, stroke: VELLUM, "stroke-width": W(1.2), cx: f(eclAt(ASC)[0]), cy: f(eclAt(ASC)[1]), opacity: 0 }, g);
  // words, in the window's units
  const text = (str, size, fill, italic = true, anchor = "middle") => {
    const t = node("text", { "text-anchor": anchor, "font-size": size, fill, opacity: 0, "font-family": "inherit", "font-weight": 600, stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const ang = [];
  for (let k = 1; k <= 12; k++) {
    const p = eclAt(H[k]);
    ang.push(Math.atan2(p[1] - centre[1], p[0] - centre[0]) / RAD);
  }
  const pos = spread(ang, 14);
  const num = [];
  const lead = [];
  for (let k = 1; k <= 12; k++) {
    const q = win([centre[0] + (RE + 11) * Math.cos(pos[k - 1] * RAD), centre[1] + (RE + 11) * Math.sin(pos[k - 1] * RAD)]);
    num[k] = text(String(k), 13, RED, false);
    num[k].setAttribute("x", f(q[0]));
    num[k].setAttribute("y", f(q[1] + 4.5));
    const p = eclAt(H[k]);
    const a = win([p[0] + 2.5 * Math.cos(ang[k - 1] * RAD), p[1] + 2.5 * Math.sin(ang[k - 1] * RAD)]);
    const b = win([centre[0] + (RE + 6.5) * Math.cos(pos[k - 1] * RAD), centre[1] + (RE + 6.5) * Math.sin(pos[k - 1] * RAD)]);
    lead[k] = node("path", { d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, fill: "none", stroke: RED, "stroke-width": 0.6, opacity: 0 }, svg);
  }
  const cap = text("", 14, "currentColor", false);
  cap.setAttribute("x", 0);
  cap.setAttribute("y", f(C.y + C.k * 100 + 22));
  // the cut: everything that stands still wobbles as one; the label, which turns, has its own wobble
  const base = node("g", { filter: wc.rough });
  while (g.firstChild && g.firstChild !== label) base.appendChild(g.firstChild);
  g.insertBefore(base, label);
  label.setAttribute("filter", wc.rough);
  el.appendChild(svg);
  const s = { label, upArc, downArc, marks, nadir, num, lead, dot, cap, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

const CAPS = [
  [0.6, 2.9, "the four angles: 1, 4, 7, 10"],
  [4.6, 6.6, `to the meridian: ${Math.round(UP)}° ÷ 3`],
  [8.0, 9.0, `house 12: ${nameOf(H[12])}`],
  [10.4, 11.4, `house 11: ${nameOf(H[11])}`],
  [12.6, 14.4, `house 10: ${nameOf(H[10])}`],
  [14.6, 16.2, `to midnight: ${Math.round(DOWN)}° ÷ 3`],
  [17.6, 18.6, `house 2: ${nameOf(H[2])}`],
  [20.0, 21.0, `house 3: ${nameOf(H[3])}`],
  [22.4, 28.0, "the rest: their nadirs"],
];

function draw(s, t) {
  const out = 1 - span(t, 28.0, 28.8);
  let b = REST;
  for (const [a, from, to] of MOVES) if (t >= a) b = from + (to - from) * span(t, a, a + 1.2);
  s.label.setAttribute("transform", `rotate(${f(b)})`);
  s.upArc.setAttribute("opacity", f(span(t, ARC_UP[0], ARC_UP[0] + 0.5) * (1 - span(t, ARC_UP[1], ARC_UP[1] + 0.4))));
  s.downArc.setAttribute("opacity", f(span(t, ARC_DOWN[0], ARC_DOWN[0] + 0.5) * (1 - span(t, ARC_DOWN[1], ARC_DOWN[1] + 0.4))));
  for (let k = 1; k <= 12; k++) {
    const a = span(t, MARK[k], MARK[k] + 0.4) * out;
    s.marks[k].setAttribute("opacity", f(a));
    s.num[k].setAttribute("opacity", f(a));
    s.lead[k].setAttribute("opacity", f(a * 0.8));
    if (s.nadir[k]) s.nadir[k].setAttribute("opacity", f(a * 0.9));
  }
  s.dot.setAttribute("opacity", f(span(t, 0.3, 0.6) * out));
  let str = "";
  let a = 0;
  for (const [t0, t1, txt] of CAPS) if (t >= t0 - 0.01 && t < t1 + 0.3) {
    str = txt;
    a = span(t, t0, t0 + 0.3) * (1 - span(t, t1, t1 + 0.3));
  }
  if (s.cap.textContent !== str) s.cap.textContent = str;
  s.cap.setAttribute("opacity", f(a));
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
