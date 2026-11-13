// A Treatise on the Astrolabe, Part II, 40 (the second example): "the degree, par aventure, of Iuppiter ... was in the
// firste degree of Pisces in longitude, and his latitude was 3 degrees meridional; tho tok I the point of A, and sette it
// in the firste degree of Pisces on the ecliptik, and thanne sette I the point of F dounward in the same signe ... and
// thus have I 3 degrees by-twixe bothe prikkes; thanne sette I the degree of the longitude up-on the orisonte. Tho tok I
// my label, and leide it fix upon the degree of the longitude; tho sette I the point of A on my label, evene over the
// ecliptik lyne ... and sette the point of F endlang in my label the space of 3 degrees of the latitude fro the zodiak,
// this is to seyn, southward fro the ecliptik, toward the bordure; and turned my riet til the prikke of F sat up-on the
// orisonte; thanne saw I wel that the body of Iuppiter ... ascended with 14 degrees of Pisces."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// COLOURED WOODCUT on vellum (jes tg 17847; lib/woodcut.js): cut, washed, lettered in the printer's red.
// zodiac's scale from Pisces 1 (points A and F); Pisces 1 is set on the eastern horizon; the label is laid over it and
// the span set on the label, A over the ecliptic, F outward (south); rete and label are turned together till F is on
// the horizon; the degree of the zodiac then on the horizon rises with Jupiter.  On our plate (52 degrees) that degree
// is Pisces 9 (the exact rising, from the planet's true place, is Pisces 12; Chaucer's figure gives 14): the scene
// rings it and does not name it.  Our own line work, nothing traced or copied.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";
import { node, f, rim, P, almucantar, nightFrom, hourLine } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 24000;
const STILL = 17000; // ms: F on the horizon, the rising degree ringed
const INK2 = "currentColor";
const C = { x: 0, y: -8, k: 0.72 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const norm = (x) => ((x % 360) + 360) % 360;
const raOf = (lam) => norm(Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD);
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
const ecl = (lam) => rim(270 - raOf(lam), rAt(decOf(lam))); // on the unturned rete
const LON = 330; // Pisces 1
const LATD = 3; // degrees south
const A0 = ecl(LON);
const SPAN = Math.hypot(ecl(LON + LATD)[0] - A0[0], ecl(LON + LATD)[1] - A0[1]); // 3 degrees on the zodiac's scale
const BR = Math.atan2(A0[0], -A0[1]) / RAD; // the label's bearing on the unturned rete
const RA_ = Math.hypot(...A0);
const RF = RA_ + SPAN; // south: outward, toward the border
const [HC, HR] = almucantar(0);
const offHorizon = (p) => Math.hypot(p[0], p[1] + HC) - HR;
const turn = (p, rot) => {
  const c = Math.cos(rot * RAD);
  const s = Math.sin(rot * RAD);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
// the setting (searched from `from`, clockwise) that brings point p of the rete onto the eastern horizon
function rising(p, from) {
  for (let r = from; r < from + 360; r += 0.5) {
    const a = turn(p, r);
    const b = turn(p, r + 0.5);
    if (offHorizon(a) > 0 && offHorizon(b) <= 0 && a[0] < 0) {
      let lo = r;
      let hi = r + 0.5;
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2;
        if (offHorizon(turn(p, m)) > 0) lo = m;
        else hi = m;
      }
      return (lo + hi) / 2;
    }
  }
  return from;
}
const ROT_L = rising(A0, 0); // Pisces 1 on the horizon
const F0 = rim(BR, RF);
const ROT_F = rising(F0, ROT_L - 1); // F on the horizon
const ROT_0 = ROT_L - 40;
// the degree of the ecliptic on the eastern horizon at a setting
function ascendant(rot) {
  let best = 0;
  for (let l = 0; l < 360; l += 0.5) {
    const a = turn(ecl(l), rot);
    const b = turn(ecl(l + 0.5), rot);
    if (a[0] < 0 && offHorizon(a) * offHorizon(b) <= 0) best = l + 0.25;
  }
  return best;
}
const ASC = ascendant(ROT_F);
const RE = (P.capricorn + P.cancer) / 2;
const OFF = (P.capricorn - P.cancer) / 2;
const BAND = 11;
const REST = 200;
const LOUPE = { x: 58, y: -60, r: 33, m: 6 }; // the magnifying glass: where, how big, how much // the label's bearing (on the plate) before it is laid
const CAPS = [
  [0.5, 3.6, "Jupiter: Pisces 1°, 3° south"],
  [4.0, 5.8, "Pisces 1° on the horizon"],
  [6.0, 7.4, "the label laid over it"],
  [7.6, 9.4, "A on the ecliptic, F 3° south"],
  [9.6, 12.2, "turned till F is on the horizon"],
  [12.6, 20.6, "the degree rising with Jupiter"],
];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const win = (p) => [C.x + C.k * p[0], C.y + C.k * p[1]];

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
  const g = node("g", { id: "d" + uid, transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const ink = { fill: "none", stroke: "currentColor", "stroke-linejoin": "round" };
  const circW = (r, cy = 0) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy - r)}Z`;
  node("path", wc.wash({ d: circW(100) + circW(86), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), g);
  // the limb
  node("circle", { ...ink, r: 100, "stroke-width": W(1.65) }, g);
  node("circle", { ...ink, r: 86, "stroke-width": W(1.05) }, g);
  let dt = "";
  for (let i = 0; i < 360; i += 5) {
    const a = rim(i, 86);
    const b = rim(i, i % 15 ? 91 : 95);
    dt += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  node("path", { ...ink, d: dt, "stroke-width": W(0.6), stroke: INK2 }, g);
  // the plate: the three circles, the horizon (heavier: the line that matters), quiet hour lines
  for (const r of [P.cancer, P.equator, P.capricorn]) node("circle", { ...ink, r: f(r), "stroke-width": W(r === P.capricorn ? 0.8 : 0.5), stroke: r === P.capricorn ? "currentColor" : INK2 }, g);
  const cp = node("clipPath", { id: "p" + uid }, g);
  node("circle", { r: f(P.capricorn) }, cp);
  const clip = node("g", { "clip-path": `url(#p${uid})` }, g);
  node("path", wc.wash({ d: circW(P.capricorn) + circW(HR, -HC), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.45 }), clip);
  node("circle", { ...ink, cy: f(-HC), r: f(HR), "stroke-width": W(1.95) }, clip);
  for (let k = 1; k < 12; k++) node("path", { ...ink, d: hourLine(k), "stroke-width": W(0.6), stroke: INK2, opacity: 0.5 }, g);
  // rete and label, turned together
  const turned = node("g", {}, g);
  const cy = -OFF;
  const ringD = (r) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 0 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 0 0 ${f(cy - r)}Z`;
  node("path", wc.wash({ d: ringD(RE) + ringD(RE - BAND), "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.75 }), turned);
  node("path", { d: ringD(RE) + ringD(RE - BAND), fill: `url(#h${uid})`, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.2) }, turned);
  let dd = "";
  for (let lam = 0; lam < 360; lam += 10) {
    const p = ecl(lam);
    const u = [p[0] / RE, (p[1] - cy) / RE];
    const len = lam % 30 ? BAND * 0.45 : BAND;
    dd += `M${f(p[0])} ${f(p[1])}L${f(p[0] - u[0] * len)} ${f(p[1] - u[1] * len)}`;
  }
  node("path", { ...ink, d: dd, "stroke-width": W(0.9) }, turned);
  // the compass on the zodiac's scale: A at Pisces 1, F 3 degrees on
  const F1 = ecl(LON + LATD);
  const mid = [(A0[0] + F1[0]) / 2, (A0[1] + F1[1]) / 2];
  const out = [mid[0] / Math.hypot(...mid), (mid[1]) / Math.hypot(...mid)];
  const hinge = [mid[0] + out[0] * 22, mid[1] + out[1] * 22];
  const compass = node("g", { opacity: 0 }, turned);
  node("path", { ...ink, d: `M${f(A0[0])} ${f(A0[1])}L${f(hinge[0])} ${f(hinge[1])}L${f(F1[0])} ${f(F1[1])}`, "stroke-width": W(1.65) }, compass);
  node("circle", { cx: f(hinge[0]), cy: f(hinge[1]), r: 1.8, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, compass);
  for (const p of [A0, F1]) node("circle", { cx: f(p[0]), cy: f(p[1]), r: 1.6, fill: RED }, compass);
  // the label, laid over the degree, fixed to the rete; its wax pricks A and F
  const labelRot = node("g", {}, turned);
  node("path", wc.wash({ d: "M0 -99L2.6 -88V-6H-2.6V-88ZM0 6L2.6 88L0 99L-2.6 88L-2.6 6Z", fill: WASH.ochre, "fill-opacity": 0.8 }), labelRot);
  node("path", { d: "M0 -99L2.6 -88V-6H-2.6V-88Z", fill: `url(#l${uid})`, stroke: "currentColor", "stroke-width": W(1.2), "stroke-linejoin": "round" }, labelRot);
  node("path", { d: "M0 6L2.6 88L0 99L-2.6 88L-2.6 6Z", fill: `url(#l${uid})`, stroke: "currentColor", "stroke-width": W(1.2), "stroke-linejoin": "round" }, labelRot);
  node("path", { d: "M0 -99V99", stroke: "currentColor", "stroke-width": W(0.6), fill: "none" }, labelRot);
  const wax = node("g", { opacity: 0 }, labelRot);
  node("circle", { cy: f(-RA_), r: 1.7, fill: RED, stroke: VELLUM, "stroke-width": W(0.75) }, wax);
  node("circle", { cy: f(-RF), r: 1.7, fill: RED, stroke: VELLUM, "stroke-width": W(0.75) }, wax);
  node("circle", { r: 4, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.35) }, g); // the pin
  // the rising degree, ringed (on the plate: it is on the horizon at the end)
  const ring = node("circle", { r: 4.2, fill: "none", stroke: RED, "stroke-width": W(2.1), opacity: 0 }, turned);
  const pAsc = ecl(ASC);
  ring.setAttribute("cx", f(pAsc[0]));
  ring.setAttribute("cy", f(pAsc[1]));
  // the loupe: the same drawing, magnified about the point being worked, in a ringed glass with a leader to the spot
  const lc = node("clipPath", { id: "c" + uid }, defs);
  node("circle", { cx: LOUPE.x, cy: LOUPE.y, r: LOUPE.r }, lc);
  const lead = node("path", { fill: "none", stroke: "currentColor", "stroke-width": 0.5, opacity: 0.8 }, svg);
  const spot = node("circle", { r: f(LOUPE.r / LOUPE.m), fill: "none", stroke: "currentColor", "stroke-width": 0.5, opacity: 0.8 }, svg);
  node("circle", { cx: LOUPE.x, cy: LOUPE.y, r: LOUPE.r, fill: VELLUM }, svg);
  // the detail, drawn anew at its own scale (lines keep their weight): horizon, the zodiac's band with its single
  // degrees, the label, the pricks, the rising degree
  const lg = node("g", { "clip-path": `url(#c${uid})` }, svg);
  const L = {
    hor: node("circle", { ...ink, "stroke-width": 1.4 }, lg),
    outer: node("circle", { ...ink, "stroke-width": 1 }, lg),
    inner: node("circle", { ...ink, "stroke-width": 0.8 }, lg),
    ticks: node("path", { ...ink, "stroke-width": 0.6 }, lg),
    label: node("path", { ...ink, fill: `url(#l${uid})`, "stroke-width": 0.8, opacity: 0 }, lg),
    edge: node("path", { ...ink, "stroke-width": 0.5, opacity: 0 }, lg),
    pricks: [0, 1].map(() => node("circle", { r: 2.2, fill: RED, stroke: VELLUM, "stroke-width": 0.6, opacity: 0 }, lg)),
    asc: node("circle", { r: 5, fill: "none", stroke: RED, "stroke-width": 1.4, opacity: 0 }, lg),
  };
  node("circle", { cx: LOUPE.x, cy: LOUPE.y, r: LOUPE.r, fill: "none", stroke: "currentColor", "stroke-width": 1.4 }, svg);
  const text = (str, size, fill, italic = true, anchor = "middle") => {
    const t = node("text", { "text-anchor": anchor, "font-size": size, fill, opacity: 0, "font-family": "inherit", "font-weight": 600, stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const tA = text("A", 15, RED, true, "middle");
  const tF = text("F", 15, RED, true, "middle");
  const tDeg = text("Pisces 1°", 13, RED, true, "start");
  const tHor = text("horizon", 13, RED, true, "end");
  const hp = win([-HR * 0.62, -HC - HR * 0.79]);
  tHor.setAttribute("x", f(hp[0] - 2));
  tHor.setAttribute("y", f(hp[1]));
  const cap = text("", 14, "currentColor", false);
  cap.setAttribute("x", 0);
  cap.setAttribute("y", f(C.y + C.k * 100 + 22));
  // the cut: the still drawing wobbles as one; rete and label, which turn, have their own wobble
  const base = node("g", { filter: wc.rough });
  while (g.firstChild && g.firstChild !== turned) base.appendChild(g.firstChild);
  g.insertBefore(base, turned);
  turned.setAttribute("filter", wc.rough);
  el.appendChild(svg);
  const s = { turned, labelRot, compass, wax, ring, tA, tF, tDeg, tHor, cap, L, lead, spot, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const fade = 1 - span(t, 21.0, 21.8);
  let rot = ROT_0 + (ROT_L - ROT_0) * span(t, 4.0, 5.4);
  rot += (ROT_F - ROT_L) * span(t, 9.8, 12.2);
  rot += (ROT_0 - ROT_F) * span(t, 22.0, 23.6);
  s.turned.setAttribute("transform", `rotate(${f(rot)})`);
  // the label: from its rest (on the plate) to the degree's bearing on the rete, then turned with it
  const laid = span(t, 6.0, 7.2) * (1 - span(t, 22.0, 23.6));
  const restOnRete = REST - rot;
  s.labelRot.setAttribute("transform", `rotate(${f(restOnRete + (BR - restOnRete) * laid)})`);
  s.compass.setAttribute("opacity", f(span(t, 0.8, 1.4) * (1 - span(t, 3.6, 4.0))));
  s.wax.setAttribute("opacity", f(span(t, 7.8, 8.3) * fade));
  s.ring.setAttribute("opacity", f(span(t, 12.6, 13.0) * fade));
  // the letters A and F: by the compass's points on the ring, then by the label's pricks
  const onLabel = span(t, 7.8, 8.3);
  const at = (p) => win(turn(p, rot));
  const ringA = at(A0);
  const ringF = at(ecl(LON + LATD));
  const labA = at(turn(rim(0, RA_), BR));
  const labF = at(turn(rim(0, RF), BR));
  const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const pa = lerp(ringA, labA, onLabel);
  const pf = lerp(ringF, labF, onLabel);
  const show = (span(t, 0.8, 1.4) * (1 - span(t, 3.6, 4.0)) + span(t, 7.8, 8.3)) * fade;
  // the loupe follows the middle of A and F; what is written inside it is placed magnified
  const c = [(pa[0] + pf[0]) / 2, (pa[1] + pf[1]) / 2];
  const mag = (q) => [LOUPE.x + LOUPE.m * (q[0] - c[0]), LOUPE.y + LOUPE.m * (q[1] - c[1])];
  const M = (q) => mag(win(q)); // a point of the plate (already turned) into the loupe
  const circ = (el, ctr, r) => {
    const q = M(ctr);
    el.setAttribute("cx", f(q[0]));
    el.setAttribute("cy", f(q[1]));
    el.setAttribute("r", f(r * C.k * LOUPE.m));
  };
  circ(s.L.hor, [0, -HC], HR);
  const rc = turn([0, -OFF], rot);
  circ(s.L.outer, rc, RE);
  circ(s.L.inner, rc, RE - BAND);
  let td = "";
  for (let l = LON - 14; l <= LON + 16; l++) {
    const p = turn(ecl(l), rot);
    const u = [(p[0] - rc[0]) / RE, (p[1] - rc[1]) / RE];
    const len = l % 10 === 0 ? BAND : l % 5 === 0 ? 2.6 : 1.4;
    const a = M(p);
    const b = M([p[0] - u[0] * len, p[1] - u[1] * len]);
    td += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  s.L.ticks.setAttribute("d", td);
  const lb = rot + restOnRete + (BR - restOnRete) * laid; // the label's bearing on the plate
  const e0 = M(rim(lb, 30));
  const e1 = M(rim(lb, 99));
  const nx = rim(lb + 90, 2.6);
  const q0 = M([rim(lb, 30)[0] + nx[0], rim(lb, 30)[1] + nx[1]]);
  const q1 = M([rim(lb, 99)[0] + nx[0], rim(lb, 99)[1] + nx[1]]);
  const q2 = M([rim(lb, 99)[0] - nx[0], rim(lb, 99)[1] - nx[1]]);
  const q3 = M([rim(lb, 30)[0] - nx[0], rim(lb, 30)[1] - nx[1]]);
  s.L.label.setAttribute("d", `M${f(q0[0])} ${f(q0[1])}L${f(q1[0])} ${f(q1[1])}L${f(q2[0])} ${f(q2[1])}L${f(q3[0])} ${f(q3[1])}Z`);
  s.L.edge.setAttribute("d", `M${f(e0[0])} ${f(e0[1])}L${f(e1[0])} ${f(e1[1])}`);
  const lo = span(t, 6.0, 6.6) * (1 - span(t, 22.0, 22.6));
  s.L.label.setAttribute("opacity", f(0.75 * lo));
  s.L.edge.setAttribute("opacity", f(lo));
  [pa, pf].forEach((q, i) => {
    const m = mag(q);
    s.L.pricks[i].setAttribute("cx", f(m[0]));
    s.L.pricks[i].setAttribute("cy", f(m[1]));
    s.L.pricks[i].setAttribute("opacity", f(Math.min(1, show)));
  });
  circ(s.L.asc, turn(ecl(ASC), rot), 0);
  s.L.asc.setAttribute("r", 5);
  s.L.asc.setAttribute("opacity", f(span(t, 12.6, 13.0) * fade));
  s.spot.setAttribute("cx", f(c[0]));
  s.spot.setAttribute("cy", f(c[1]));
  const dl = [LOUPE.x - c[0], LOUPE.y - c[1]];
  const nl = Math.hypot(...dl);
  const rs = LOUPE.r / LOUPE.m;
  s.lead.setAttribute("d", `M${f(c[0] + (dl[0] / nl) * rs)} ${f(c[1] + (dl[1] / nl) * rs)}L${f(LOUPE.x - (dl[0] / nl) * LOUPE.r)} ${f(LOUPE.y - (dl[1] / nl) * LOUPE.r)}`);
  const ma = mag(pa);
  const mf = mag(pf);
  // the letters stand off the line A-F, on its left side as seen going from A to F
  const v = [mf[0] - ma[0], mf[1] - ma[1]];
  const vn = Math.hypot(...v) || 1;
  const side = [(-v[1] / vn) * 9, (v[0] / vn) * 9];
  s.tA.setAttribute("x", f(ma[0] + side[0]));
  s.tA.setAttribute("y", f(ma[1] + side[1] + 4.5));
  s.tF.setAttribute("x", f(mf[0] + side[0]));
  s.tF.setAttribute("y", f(mf[1] + side[1] + 4.5));
  s.tA.setAttribute("opacity", f(Math.min(1, show)));
  s.tF.setAttribute("opacity", f(Math.min(1, show)));
  const pd = at(A0);
  s.tDeg.setAttribute("x", f(pd[0] + 8));
  s.tDeg.setAttribute("y", f(pd[1] - 6));
  s.tDeg.setAttribute("opacity", f(span(t, 4.4, 4.9) * (1 - span(t, 7.4, 7.8)) + span(t, 13.0, 13.4) * fade));
  s.tHor.setAttribute("opacity", f(span(t, 4.4, 4.9) * (1 - span(t, 6.0, 6.4)) + span(t, 12.2, 12.6) * fade));
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
