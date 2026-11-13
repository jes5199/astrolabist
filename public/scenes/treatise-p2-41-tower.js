// A Treatise on the Astrolabe, Part II, 41: "Yif it so be that thou wilt werke by umbra recta, and thou may come to the
// bas of the toure, in this maner thou schalt werke. Tak the altitude of the tour by bothe holes, so that thy rewle
// ligge even in a poynt. Ensample as thus: I see him thorw at the poynt of 4; than mete I the space be-tween me and the
// tour, and I finde it 20 feet; than be-holde I how 4 is to 12, right so is the space betwixe thee and the tour to the
// altitude of the tour. For 4 is the thridde part of 12, so is the space be-tween thee and the tour the thridde part of
// the altitude of the tour; than thryes 20 feet is the heyghte of the tour, with adding of thyn owne persone to thyn
// eye."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// From the side: level ground, a tower, Lewis 20 feet from its foot sighting its top through the rule (the film's
// figure, lib/figures-rig.js, posed here).  Drawn to scale (the tower 3 x 20 feet above his eye, plus his eye's
// height; the instrument drawn larger than true, or it would be a speck).  Inset: the back, its shadow square, the
// rule crossing the base (umbra recta) at 4 of 12.  Then the measures: 20 feet; 3 x 20 = 60 feet above the eye;
// plus the eye's height.  The tower is our own drawing.  Shared lib/back.js.

import A from "./lib/astrolabe-47869.js";
import RIG from "./lib/figures-rig.js";
import GIFT from "./lib/prologue-gift-data.js";
import { build } from "./lib/figures.js";
import { back, node, label, f, SILVER, NIGHT } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 12500; // ms: the reading and all the measures shown
const RAD = Math.PI / 180;
const U = 1.85; // window units to a foot
const G = 58; // the ground's level
const TX = 12; // the tower's face (toward us, its left side)
const TW = 17; // its width
const SO = +A.backSquare.outer;
const SL = +A.backSquare.ladder;
const SI = +A.backSquare.inner;
const ALT = Math.atan(12 / 4) / RAD; // the rule's altitude when it reads 4 on the umbra recta
const INSET = { x: -55, y: -38, r: 31, k: 1.0, cx: -7, cy: 13 }; // where, how big, scale, the back's point at its middle
const DIA = 3; // the instrument's drawn diameter (true: half a foot, under a unit)
const LEWIS_FT = 4.4; // his height in feet
// his pose: reaching up with the instrument on his thumb (the Prologue's pose, his head tipped back to sight)
const POSE = { ...GIFT.lewis[1], a: { ...GIFT.lewis[1].a, head: -48, torso: -6 } };

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  // Lewis, posed, then moved so that the instrument stands 20 feet from the tower
  const S = (LEWIS_FT * U) / RIG.lewis.height;
  const boy = build(RIG.lewis, { contour: RIG.contour, contourWidth: RIG.contourWidth }, 1);
  boy.pose(POSE, [S, 0, 0, S, 0, G]);
  const hook = boy.point("thumb_far", 0, 14);
  const drop = (DIA / 2) * 1.81; // the ring's hook to the centre, as the instrument hangs (lib/painted.js proportion)
  const inst = [TX - 20 * U, hook[1] + drop];
  const x0 = inst[0] - hook[0];
  boy.pose(POSE, [S, 0, 0, S, x0, G]);
  const top = inst[1] - 3 * 20 * U; // the tower's top: 3 x 20 feet above the eye
  // the ground
  node("rect", { x: -120, y: G, width: 240, height: 80, fill: "#050816", opacity: 0.85 }, svg);
  node("line", { x1: -110, y1: G, x2: 110, y2: G, stroke: "currentColor", "stroke-width": 1.1 }, svg);
  // the tower: stone, battlements, a door, slits; coursing faint
  const tw = node("g", {}, svg);
  const merl = 3.2;
  let d = `M${TX} ${G}V${f(top)}`;
  for (let i = 0; i < 3; i++) {
    const x = TX + (i * TW) / 2.5;
    d += `H${f(x)}V${f(top - merl)}H${f(x + TW / 5)}V${f(top)}`;
  }
  d += `H${TX + TW}V${G}Z`;
  node("path", { d, fill: NIGHT, "fill-opacity": 0.8, stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round" }, tw);
  let c = "";
  for (let y = G - 6; y > top + 3; y -= 6) c += `M${TX} ${f(y)}H${TX + TW}`;
  node("path", { d: c, stroke: "currentColor", "stroke-width": 0.35, opacity: 0.35, fill: "none" }, tw);
  node("path", { d: `M${TX + TW / 2 - 3.5} ${G}V${G - 7}A3.5 3.5 0 0 1 ${TX + TW / 2 + 3.5} ${G - 7}V${G}`, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.8 }, tw);
  for (const y of [top + 18, top + 52, top + 86]) node("rect", { x: TX + TW / 2 - 0.9, y: f(y), width: 1.8, height: 6, fill: "#050816", stroke: "currentColor", "stroke-width": 0.5 }, tw);
  for (const L of boy.layers) svg.appendChild(L);
  // the instrument on his thumb: a small disc, its ring, its rule along the sight
  const ig = node("g", { transform: `translate(${f(inst[0])} ${f(inst[1])})` }, svg);
  node("line", { x1: 0, y1: f(-drop), x2: 0, y2: f(-DIA / 2), stroke: "currentColor", "stroke-width": 0.5 }, ig);
  node("circle", { r: DIA / 2, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.6 }, ig);
  node("line", { x1: f(-DIA * 0.6), y1: 0, x2: f(DIA * 0.6), y2: 0, stroke: SILVER, "stroke-width": 0.6, transform: `rotate(${f(-ALT)})` }, ig);
  // the sight, from the instrument to the top of the tower
  const sight = node("line", { x1: f(inst[0]), y1: f(inst[1]), x2: TX, y2: f(top), stroke: "#fff3c4", "stroke-width": 0.8, "stroke-dasharray": "2 2" }, svg);
  const sightLen = Math.hypot(TX - inst[0], top - inst[1]);
  // the measures: 20 feet along the ground; 60 feet up the tower above the eye; the eye's height
  const dim = (x1, y1, x2, y2) => {
    const g = node("g", { opacity: 0 }, svg);
    const n = [y2 - y1, x1 - x2];
    const k = 2.2 / Math.hypot(...n);
    node("path", { d: `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}M${f(x1 + n[0] * k)} ${f(y1 + n[1] * k)}L${f(x1 - n[0] * k)} ${f(y1 - n[1] * k)}M${f(x2 + n[0] * k)} ${f(y2 + n[1] * k)}L${f(x2 - n[0] * k)} ${f(y2 - n[1] * k)}`, stroke: SILVER, "stroke-width": 0.7, fill: "none" }, g);
    return g;
  };
  const dGround = dim(inst[0], G + 6, TX, G + 6);
  const tGround = label(svg, (inst[0] + TX) / 2, G + 19, "20 feet", 13);
  const DX = TX + TW + 6;
  const dUp = dim(DX, inst[1], DX, top);
  const tUp = label(svg, 0, 0, "3 × 20 = 60 feet", 13);
  tUp.setAttribute("transform", `translate(${DX + 5} ${f((inst[1] + top) / 2)}) rotate(-90)`);
  tUp.setAttribute("y", 4.5);
  tUp.removeAttribute("x");
  const dEye = dim(DX, G, DX, inst[1]);
  const tEye = label(svg, DX + 4, f((G + inst[1]) / 2 + 4.5), "+ eye", 13, "start");
  const eyeLine = node("line", { x1: f(inst[0]), y1: f(inst[1]), x2: DX, y2: f(inst[1]), stroke: SILVER, "stroke-width": 0.4, "stroke-dasharray": "1 2", opacity: 0 }, svg);
  // the inset: the back, close on the shadow square, the rule and its reading
  const cp = node("clipPath", { id: "i" + uid }, svg);
  node("circle", { cx: INSET.x, cy: INSET.y, r: INSET.r }, cp);
  const ins = node("g", { opacity: 0 }, svg);
  node("circle", { cx: INSET.x, cy: INSET.y, r: INSET.r, fill: NIGHT }, ins);
  const ic = node("g", { "clip-path": `url(#i${uid})` }, ins);
  const k = INSET.k;
  const W = (px) => f(px / k);
  const bg = node("g", { transform: `translate(${INSET.x} ${INSET.y}) scale(${k}) translate(${-INSET.cx} ${-INSET.cy})` }, ic);
  back(bg, { scale: k, ticks: false, faint: 0.35 });
  const P = (x, y) => `${f(x)} ${f(y)}`;
  let baseT = "";
  for (let i = 1; i <= 12; i++) {
    const r1 = i % 3 === 0 ? SI : SL;
    for (const sx of [-1, 1]) baseT += `M${P((sx * SO * i) / 12, SO)}L${P((sx * r1 * i) / 12, r1)}`;
  }
  node("path", { d: [SO, SL, SI].map((s) => `M${P(-s, s)}H${f(s)}`).join("") + `M${-SO} 0V${SO}M${SO} 0V${SO}`, fill: "none", stroke: "currentColor", "stroke-width": W(0.9) }, bg);
  node("path", { d: baseT, fill: "none", stroke: "currentColor", "stroke-width": W(0.6) }, bg);
  const rule = node("g", {}, bg);
  node("path", { d: A.alidade.body, fill: NIGHT, "fill-opacity": 0.25, stroke: SILVER, "stroke-width": W(0.5), opacity: 0.5 }, rule);
  node("line", { x1: -100, y1: 0, x2: 100, y2: 0, stroke: SILVER, "stroke-width": W(1.1) }, rule); // its edge: the line read
  const mark = node("circle", { cx: f(-SO / 3), cy: f(SO), r: 2.6, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.4), opacity: 0 }, bg);
  node("circle", { cx: INSET.x, cy: INSET.y, r: INSET.r, fill: "none", stroke: "currentColor", "stroke-width": 1.1 }, ins);
  const lead = node("line", { x1: f(INSET.x + INSET.r * 0.62), y1: f(INSET.y + INSET.r * 0.78), x2: f(inst[0] - 1), y2: f(inst[1] - 2), stroke: "currentColor", "stroke-width": 0.5, opacity: 0 }, svg);
  const mk = [INSET.x + k * (-SO / 3 - INSET.cx), INSET.y + k * (SO - INSET.cy)];
  const tRead = label(svg, mk[0], mk[1] + 13, "4 of 12", 13);
  el.appendChild(svg);
  const s = { sight, sightLen, ins, rule, mark, lead, dGround, tGround, dUp, tUp, dEye, tEye, eyeLine, tRead, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 14.8, 15.6);
  const g = span(t, 1.0, 2.4) * out;
  s.sight.setAttribute("stroke-dasharray", `${f(s.sightLen * g)} 400`);
  s.sight.setAttribute("opacity", f(g > 0 ? 1 : 0));
  const i = span(t, 2.6, 3.4) * out;
  s.ins.setAttribute("opacity", f(i));
  s.lead.setAttribute("opacity", f(0.7 * i));
  // the rule swings up to the tower's top: its lower end comes down the side and onto the base, at 4
  const a = 30 + (ALT - 30) * span(t, 3.4, 5.0);
  s.rule.setAttribute("transform", `rotate(${f(-a)})`);
  s.mark.setAttribute("opacity", f(span(t, 5.0, 5.4) * out));
  s.tRead.setAttribute("opacity", f(span(t, 5.2, 5.6) * out));
  s.dGround.setAttribute("opacity", f(span(t, 5.8, 6.4) * out));
  s.tGround.setAttribute("opacity", f(span(t, 6.0, 6.6) * out));
  s.dUp.setAttribute("opacity", f(span(t, 7.2, 7.8) * out));
  s.eyeLine.setAttribute("opacity", f(0.7 * span(t, 7.2, 7.8) * out));
  s.tUp.setAttribute("opacity", f(span(t, 7.4, 8.0) * out));
  s.dEye.setAttribute("opacity", f(span(t, 8.6, 9.2) * out));
  s.tEye.setAttribute("opacity", f(span(t, 8.8, 9.4) * out));
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
