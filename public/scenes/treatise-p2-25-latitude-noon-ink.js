// A Treatise on the Astrolabe, Part II, 25: "the latitude of any place in a regioun is verreyly the space by-twixe the
// senith of hem that dwellen there and the equinoxial cerkle ... And thilke space is as moche as the pool artik is hey
// ... tak the altitude of the sonne in the middel of the day, whan the sonne is in the hevedes of Aries or of Libra ...
// and abate the nombre of that same sonnes altitude out of 90 ... I suppose that the sonne is thilke day at noon 38
// degrees and 10 minutes of heyghte. Abate thanne thise degrees and minutes out of 90; so leveth there 51 degrees and 50
// minutes, the latitude ... my sonne is, par aventure, in the firste degre of Leoun, 58 degrees and 10 minutes of
// heyghte at noon and his declinacion is almost 20 degrees northward fro the equinoxial; abate thanne thilke 20 degrees
// of declinacion out of the altitude at noon, than leveth thee 38 degrees and odde minutes; lo ther the heved of Aries
// or Libra, and thyn equinoxial in that regioun."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917):
// Chaucer's two examples one step at a time beside a cut through the sky along the meridian (south on the left), in
// the coloured woodcut: at an equinox the noon sun on the equator, 38 10 high; out of 90, 51 50, the latitude, from the
// equator to the zenith; the pole as high above the north horizon (and the other as low under the south); then the sun
// in Leo 1, 58 10 at noon, less its declination of about 20, gives the equator's 38 10 again, and the same latitude.
// Chaucer's own figures (his "almost 20" taken as 20, as he does).  Replaces treatise-p2-25-latitude-noon.js (the dark
// style).  Our own line work (lib/woodcut.js); nothing traced.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";
import { node, f } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 31000;
const STILL = 12500; // ms: the equinox worked: the sun's height, the latitude, the poles
const LAYOUT = {
  wide: { O: [-58, 24], R: 58, k: 1, list: { x: 24, y: -86, size: 9.2, lh: 10.2, gap: 4, indent: 10, width: 122 } },
  stack: { O: [0, -62], R: 88, k: 1.25, list: { x: -136, y: 36, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272 } },
};
const RAD = Math.PI / 180;
const EQ = 38 + 10 / 60; // the equator's height at noon in the south (Chaucer's supposition)
const LATI = 90 - EQ; // 51 50
const LEO = EQ + 20; // 58 10, the sun in Leo 1 at noon
const dm = (x) => `${Math.floor(x + 1e-6)}°${String(Math.round((x - Math.floor(x + 1e-6)) * 60)).padStart(2, "0")}′`;

const STEPS = [
  { t: 0.5, lines: [`at an equinox the noon sun is on the equator: ${dm(EQ)} high`] },
  { t: 4.8, lines: [`take that out of 90°: ${dm(LATI)}, the latitude, from the equator to the zenith`] },
  { t: 9.2, lines: ["the pole stands as high above the north horizon; the other pole as low under the south"] },
  { t: 14.4, lines: [`another day, the sun in Leo 1°: ${dm(LEO)} at noon`] },
  { t: 18.6, lines: [`take off its declination, about 20° north: ${dm(EQ)}, the equator again`] },
  { t: 23.4, lines: [`out of 90°: ${dm(LATI)} once more`] },
];
const END = 29.4;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const s = { raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  build(el, s);
  watch(el, s, () => {
    s.svg.remove();
    build(el, s);
  });
}

function build(el, s) {
  s.mode = layoutOf(el);
  const Lo = LAYOUT[s.mode];
  const { O, R, k } = Lo;
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 1.0, seed: 25 });
  // by angle from the SOUTH horizon, counter-clockwise over the top (0 south, 90 zenith, 180 north; below: negative)
  const pt = (a, r = R) => [O[0] - r * Math.cos(a * RAD), O[1] - r * Math.sin(a * RAD)];
  const arcD = (a, b, r) => {
    const p = pt(a, r);
    const q = pt(b, r);
    return `M${f(p[0])} ${f(p[1])}A${f(r)} ${f(r)} 0 ${Math.abs(b - a) > 180 ? 1 : 0} ${a < b ? 1 : 0} ${f(q[0])} ${f(q[1])}`;
  };
  const W = (w) => f(w * k);
  // the cut: the ground washed under the horizon, the heavens' circle (above whole, below dotted), the horizon
  const cut = node("g", { filter: wc.rough }, svg);
  const lo = pt(-60);
  node("path", wc.wash({ d: `M${f(O[0] - R - 8)} ${f(O[1])}H${f(O[0] + R + 8)}V${f(O[1] + R * 0.9)}H${f(O[0] - R - 8)}Z`, fill: WASH.ochre, "fill-opacity": 0.45 }), cut);
  node("path", { d: arcD(0, 180, R), fill: "none", stroke: "currentColor", "stroke-width": W(1.4) }, cut);
  node("path", { d: arcD(0, -60, R) + arcD(180, 240, R), fill: "none", stroke: "currentColor", "stroke-width": W(0.9), "stroke-dasharray": `${W(2)} ${W(3)}` }, cut);
  node("path", { d: `M${f(O[0] - R - 8)} ${f(O[1])}H${f(O[0] + R + 8)}`, stroke: "currentColor", "stroke-width": W(1.8) }, cut);
  node("path", { d: `M${f(O[0])} ${f(O[1])}V${f(O[1] - R)}`, stroke: "currentColor", "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(3)}` }, cut);
  node("circle", { cx: f(O[0]), cy: f(O[1]), r: W(2.2), fill: "currentColor" }, cut);
  void lo;
  const word = (x, y, str, size, anchor = "middle", fill = "currentColor") => {
    const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": f(size * k), "font-weight": 700, fill, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  word(O[0] - R - 6, O[1] + 12 * k, "south", 9, "middle");
  word(O[0] + R + 6, O[1] + 12 * k, "north", 9, "middle");
  word(O[0], O[1] - R - 5 * k, "zenith", 9, "middle");
  // the equator's line through the centre (to the south at EQ above, to the north below), and the poles' axis
  const eqA = pt(EQ, R + 4);
  const eqB = pt(EQ + 180, R + 4);
  const equator = node("path", { d: `M${f(eqA[0])} ${f(eqA[1])}L${f(eqB[0])} ${f(eqB[1])}`, stroke: WASH.blue, "stroke-width": W(2), opacity: 0 }, svg);
  const tEq = word(...pt(EQ + 180 - 9, R * 0.6), "equator", 9, "middle", "currentColor");
  tEq.setAttribute("opacity", 0);
  const pN = pt(180 - LATI);
  const pS = pt(-LATI);
  const axis = node("path", { d: `M${f(pN[0])} ${f(pN[1])}L${f(pS[0])} ${f(pS[1])}`, stroke: "currentColor", "stroke-width": W(1), "stroke-dasharray": `${W(3)} ${W(2)}`, opacity: 0 }, svg);
  const poles = [pN, pS].map((p) => node("circle", { cx: f(p[0]), cy: f(p[1]), r: W(3.4), fill: RED, stroke: VELLUM, "stroke-width": W(1), opacity: 0 }, svg));
  // the arcs outside the circle
  const RA = R + 7 * k;
  const height = node("path", { d: arcD(0, EQ, RA), fill: "none", stroke: "#b9821c", "stroke-width": W(3.2), opacity: 0 }, svg);
  const latArc = node("path", { d: arcD(EQ, 90, RA), fill: "none", stroke: RED, "stroke-width": W(3.2), opacity: 0 }, svg);
  const poleArcs = [node("path", { d: arcD(180, 180 - LATI, RA), fill: "none", stroke: RED, "stroke-width": W(3.2), opacity: 0 }, svg), node("path", { d: arcD(0, -LATI, RA), fill: "none", stroke: RED, "stroke-width": W(3.2), "stroke-dasharray": `${W(3)} ${W(2)}`, opacity: 0 }, svg)];
  const heightLeo = node("path", { d: arcD(0, LEO, RA + 6 * k), fill: "none", stroke: "#b9821c", "stroke-width": W(3.2), opacity: 0 }, svg);
  const decl = node("path", { d: arcD(EQ, LEO, R - 7 * k), fill: "none", stroke: WASH.blue, "stroke-width": W(3.6), opacity: 0 }, svg);
  const lab = (a, r, str, fill) => {
    const t = word(...pt(a, r), str, 9.5, "middle", fill);
    t.setAttribute("opacity", 0);
    return t;
  };
  const tH = lab(EQ / 2, RA + 13 * k, dm(EQ), "#8a5a12");
  const tL = lab(78, RA + 13 * k, dm(LATI), RED);
  const tP = lab(180 - LATI / 2, RA + 13 * k, dm(LATI), RED);
  const tLeo = lab(LEO + 6, RA + 18 * k, dm(LEO), "#8a5a12");
  const tD = lab((EQ + LEO) / 2, R - 20 * k, "20°", "#3f5a66");
  // the sun
  const sun = node("g", { opacity: 0 }, svg);
  node("circle", { r: W(5.5), fill: WASH.ochre, stroke: "currentColor", "stroke-width": W(1.2) }, sun);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: W(-8), x2: 0, y2: W(-11), stroke: "currentColor", "stroke-width": W(1.1), "stroke-linecap": "round", transform: `rotate(${45 * i})` }, sun);
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, pt, R, equator, tEq, axis, poles, height, latArc, poleArcs, heightLeo, decl, tH, tL, tP, tLeo, tD, sun, rows });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  // the sun: at the equator's height, to Leo's (14.6), back at the loop's end
  const a = EQ + (LEO - EQ) * span(t, 14.6, 16.4) * (1 - span(t, END + 0.4, END + 1.4));
  const p = s.pt(a);
  s.sun.setAttribute("transform", `translate(${f(p[0])} ${f(p[1])})`);
  s.sun.setAttribute("opacity", f(span(t, 0.4, 0.8)));
  const eqOn = span(t, 0.8, 1.3) * out;
  s.equator.setAttribute("opacity", f(eqOn));
  s.tEq.setAttribute("opacity", f(eqOn));
  const first = 1 - span(t, 14.2, 14.6); // the equinox's marks give way to the second example
  s.height.setAttribute("opacity", f(span(t, 1.4, 1.9) * first));
  s.tH.setAttribute("opacity", f(span(t, 1.6, 2.1) * first));
  const lat = span(t, 5.0, 5.5) * first + span(t, 23.6, 24.1) * out;
  s.latArc.setAttribute("opacity", f(lat));
  s.tL.setAttribute("opacity", f(lat));
  const pol = span(t, 9.4, 9.9) * first;
  s.axis.setAttribute("opacity", f(0.9 * pol));
  s.poles.forEach((e) => e.setAttribute("opacity", f(pol)));
  s.poleArcs.forEach((e) => e.setAttribute("opacity", f(pol)));
  s.tP.setAttribute("opacity", f(pol));
  s.heightLeo.setAttribute("opacity", f(span(t, 16.2, 16.7) * out));
  s.tLeo.setAttribute("opacity", f(span(t, 16.4, 16.9) * (1 - span(t, 23.2, 23.6))));
  s.decl.setAttribute("opacity", f(span(t, 18.8, 19.3) * out));
  s.tD.setAttribute("opacity", f(span(t, 19.0, 19.5) * out));
  STEPS.forEach((st, i) => {
    const next = STEPS[i + 1] ? STEPS[i + 1].t : END;
    const now = t >= st.t && t < next;
    const done = t >= next;
    const al = (now || done ? 1 : 0.3) * span(t, 0.2, 0.5) * out;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(al));
      e.setAttribute("fill", now ? RED : "currentColor");
    }
  });
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
