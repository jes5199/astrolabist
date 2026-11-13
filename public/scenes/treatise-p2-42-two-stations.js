// A Treatise on the Astrolabe, Part II, 42: "Another maner of werkinge, by vmbra versa. Yif so be that thou may nat
// come to the bas of the tour, I see him thorw the nombre of 1; I sette ther a prikke at my fote; than go I neer to the
// tour, and I see him thorw at the poynt of 2, and there I sette a-nother prikke; and I beholde how 1 hath him to 12,
// and ther finde I that it hath him twelfe sythes; than beholde I how 2 hath him to 12, and thou shalt finde it sexe
// sythes; than thou shalt finde that as 12 above 6 is the numbre of 6, right so is the space between thy two prikkes
// the space of 6 tymes thyn altitude ... than thou findest between two prikkys 60 feet; than thou shalt finde that 10 is
// the 6-party of 60. And then is 10 feet the altitude of the tour."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// From the side, to scale (so the tower is low and far: 10 feet above the eye, sighted from 120 and 60 feet).  Lewis
// sights the top at 1 on the umbra versa (inset, left) and pricks the ground at his foot; walks nearer; sights it at 2
// (inset, right) and pricks again.  The measures: 12 heights from the first prick, 6 from the second, so the 60 feet
// between the pricks are 6 heights: 60 / 6 = 10 feet, above his eye.  The film's figure (lib/figures-rig.js) posed
// here; the tower is our own drawing; shared lib/back.js for the insets.

import A from "./lib/astrolabe-47869.js";
import RIG from "./lib/figures-rig.js";
import GIFT from "./lib/prologue-gift-data.js";
import { build, blend } from "./lib/figures.js";
import { back, node, label, f, SILVER, NIGHT } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 20000;
const STILL = 16500; // ms: both pricks, the measures and the sum (the readings shown before it)
const U = 1.15; // window units to a foot
const G = 18; // the ground's level
const TX = 48; // the tower's face
const TW = 9;
const H = 10; // the tower's height above the eye, feet
const SO = +A.backSquare.outer;
const SL = +A.backSquare.ladder;
const SI = +A.backSquare.inner;
const DIA = 2.4; // the instrument's drawn diameter (larger than true)
const LEWIS_FT = 4.4;
const SIGHT = { ...GIFT.lewis[1], a: { ...GIFT.lewis[1].a, head: -10, torso: -3 } }; // sighting, nearly level
const WALK = GIFT.lewis[0]; // standing, the instrument at his side
const INSETS = [
  { x: -62, y: -50, r: 27, k: 1.0, cx: -15, cy: 8, read: 1 },
  { x: 6, y: -50, r: 27, k: 1.0, cx: -15, cy: 8, read: 2 },
];
const T_WALK = [5.6, 8.4]; // he walks between these times (s)

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const S = (LEWIS_FT * U) / RIG.lewis.height;
  const boy = build(RIG.lewis, { contour: RIG.contour, contourWidth: RIG.contourWidth }, 1);
  boy.pose(SIGHT, [S, 0, 0, S, 0, G]);
  const hook = boy.point("thumb_far", 0, 14);
  const drop = (DIA / 2) * 1.81;
  const eyeY = hook[1] + drop;
  const instX = [TX - 12 * H * U, TX - 6 * H * U]; // 12 heights, then 6 heights, from the tower
  const feet = instX.map((x) => x - hook[0]); // where he stands (his origin) at each station
  const top = eyeY - H * U;
  // the ground
  node("rect", { x: -120, y: G, width: 240, height: 100, fill: "#050816", opacity: 0.85 }, svg);
  node("line", { x1: -110, y1: G, x2: 110, y2: G, stroke: "currentColor", "stroke-width": 1.1 }, svg);
  // the tower, low and far
  let d = `M${TX} ${G}V${f(top)}`;
  for (let i = 0; i < 3; i++) {
    const x = TX + (i * TW) / 2.5;
    d += `H${f(x)}V${f(top - 2.2)}H${f(x + TW / 5)}V${f(top)}`;
  }
  d += `H${TX + TW}V${G}Z`;
  node("path", { d, fill: NIGHT, "fill-opacity": 0.8, stroke: "currentColor", "stroke-width": 1, "stroke-linejoin": "round" }, svg);
  node("path", { d: `M${TX + TW / 2 - 2} ${G}V${G - 4}A2 2 0 0 1 ${TX + TW / 2 + 2} ${G - 4}V${G}`, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.6 }, svg);
  for (const L of boy.layers) svg.appendChild(L);
  const ig = node("g", {}, svg);
  node("line", { x1: 0, y1: f(-drop), x2: 0, y2: f(-DIA / 2), stroke: "currentColor", "stroke-width": 0.5 }, ig);
  node("circle", { r: DIA / 2, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.6 }, ig);
  // the two sights and the two pricks
  const sights = instX.map((x) => node("line", { x1: f(x), y1: f(eyeY), x2: TX, y2: f(top), stroke: "#fff3c4", "stroke-width": 0.8, "stroke-dasharray": "2 2", opacity: 0 }, svg));
  const pricks = instX.map((x) => node("circle", { cx: f(x), cy: G, r: 1.8, fill: "#f6d77a", stroke: NIGHT, "stroke-width": 0.6, opacity: 0 }, svg));
  // the measures
  const dim = (x1, x2, y) => {
    const g = node("g", { opacity: 0 }, svg);
    node("path", { d: `M${f(x1)} ${f(y)}H${f(x2)}M${f(x1)} ${f(y - 2.2)}V${f(y + 2.2)}M${f(x2)} ${f(y - 2.2)}V${f(y + 2.2)}`, stroke: SILVER, "stroke-width": 0.7, fill: "none" }, g);
    return g;
  };
  const m60 = dim(instX[0], instX[1], G + 7);
  const t60 = label(svg, (instX[0] + instX[1]) / 2, G + 19, "60 feet", 13);
  const m12 = dim(instX[0], TX, G + 27);
  const t12 = label(svg, (instX[0] + TX) / 2, G + 39, "12 heights", 13);
  const m6 = dim(instX[1], TX, G + 47);
  const t6 = label(svg, (instX[1] + TX) / 2, G + 59, "6 heights", 13);
  // the sum, by the tower: 12 - 6 = 6 heights are the 60 feet
  const tSum = label(svg, 0, -52, "6 heights = 60 feet", 15);
  const tSum2 = label(svg, 0, -32, "1 height = 10 feet, + eye", 15);
  // the insets: the back, close on the umbra versa (the square's side), the rule's edge on 1, then on 2
  const insets = INSETS.map((I, n) => {
    const cp = node("clipPath", { id: `i${n}${uid}` }, svg);
    node("circle", { cx: I.x, cy: I.y, r: I.r }, cp);
    const g = node("g", { opacity: 0 }, svg);
    node("circle", { cx: I.x, cy: I.y, r: I.r, fill: NIGHT }, g);
    const ic = node("g", { "clip-path": `url(#i${n}${uid})` }, g);
    const W = (px) => f(px / I.k);
    const bg = node("g", { transform: `translate(${I.x} ${I.y}) scale(${I.k}) translate(${-I.cx} ${-I.cy})` }, ic);
    back(bg, { scale: I.k, ticks: false, faint: 0.35 });
    const P = (x, y) => `${f(x)} ${f(y)}`;
    let sideT = "";
    for (let i = 1; i <= 12; i++) {
      const r1 = i % 3 === 0 ? SI : SL;
      sideT += `M${P(-SO, (SO * i) / 12)}L${P(-r1, (r1 * i) / 12)}`;
    }
    node("path", { d: [SO, SL, SI].map((s) => `M${P(-s, 0)}V${f(s)}H${f(s)}`).join(""), fill: "none", stroke: "currentColor", "stroke-width": W(0.9) }, bg);
    node("path", { d: sideT, fill: "none", stroke: "currentColor", "stroke-width": W(0.6) }, bg);
    const rule = node("g", { transform: `rotate(${f(-(Math.atan(I.read / 12) * 180) / Math.PI)})` }, bg);
    node("path", { d: A.alidade.body, fill: NIGHT, "fill-opacity": 0.25, stroke: SILVER, "stroke-width": W(0.5), opacity: 0.5 }, rule);
    node("line", { x1: -100, y1: 0, x2: 100, y2: 0, stroke: SILVER, "stroke-width": W(1.1) }, rule);
    node("circle", { cx: f(-SO), cy: f((SO * I.read) / 12), r: 2.4, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.4) }, bg);
    node("circle", { cx: I.x, cy: I.y, r: I.r, fill: "none", stroke: "currentColor", "stroke-width": 1.1 }, g);
    const lead = node("line", { x1: f(I.x + I.r * 0.55), y1: f(I.y + I.r * 0.84), x2: f(instX[n]), y2: f(eyeY - 2), stroke: "currentColor", "stroke-width": 0.5, opacity: 0.7 }, g);
    const tr = label(g, I.x, I.y + I.r + 12, `${I.read} of 12`, 13);
    tr.setAttribute("opacity", 1);
    return g;
  });
  el.appendChild(svg);
  const s = { boy, S, feet, ig, eyeY, hook, sights, pricks, insets, m12, t12, m6, t6, m60, t60, tSum, tSum2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 18.6, 19.4);
  // where he stands, and how: sighting, then walking (instrument down), sighting again; back at the loop's end
  const w = span(t, T_WALK[0] + 0.4, T_WALK[1] - 0.4);
  const back = span(t, 19.2, 19.9);
  const x = s.feet[0] + (s.feet[1] - s.feet[0]) * w * (1 - back);
  const down = span(t, T_WALK[0], T_WALK[0] + 0.4) * (1 - span(t, T_WALK[1] - 0.4, T_WALK[1]));
  const bob = -Math.abs(Math.sin(((t - T_WALK[0]) * Math.PI) / 0.45)) * 0.5 * (w > 0 && w < 1 ? 1 : 0);
  const pose = blend(SIGHT, WALK, Math.max(down, span(t, 19.0, 19.3) * (1 - back)));
  s.boy.pose(pose, [s.S, 0, 0, s.S, x, G + bob]);
  const hk = s.boy.point("thumb_far", 0, 14);
  s.ig.setAttribute("transform", `translate(${f(hk[0])} ${f(hk[1] + (2.4 / 2) * 1.81)})`);
  s.ig.setAttribute("opacity", f(1 - down));
  // first station: the sight, the reading, the prick
  s.sights[0].setAttribute("opacity", f(span(t, 0.8, 1.4) * (1 - span(t, T_WALK[0], T_WALK[0] + 0.4)) + span(t, 13.0, 13.4) * out * 0.6));
  const done = 1 - span(t, 13.6, 14.0); // the readings give way to the sum
  s.insets[0].setAttribute("opacity", f(span(t, 1.6, 2.2) * done));
  s.pricks[0].setAttribute("opacity", f(span(t, 3.4, 3.7) * out));
  // second station
  s.sights[1].setAttribute("opacity", f(span(t, 8.8, 9.4) * out));
  s.insets[1].setAttribute("opacity", f(span(t, 9.6, 10.2) * done));
  s.pricks[1].setAttribute("opacity", f(span(t, 11.0, 11.3) * out));
  // the measures and the sum
  s.m12.setAttribute("opacity", f(span(t, 4.0, 4.5) * out));
  s.t12.setAttribute("opacity", f(span(t, 4.2, 4.7) * out));
  s.m6.setAttribute("opacity", f(span(t, 11.6, 12.1) * out));
  s.t6.setAttribute("opacity", f(span(t, 11.8, 12.3) * out));
  s.m60.setAttribute("opacity", f(span(t, 12.8, 13.3) * out));
  s.t60.setAttribute("opacity", f(span(t, 13.0, 13.5) * out));
  s.tSum.setAttribute("opacity", f(span(t, 14.0, 14.6) * out));
  s.tSum2.setAttribute("opacity", f(span(t, 14.8, 15.4) * out));
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
