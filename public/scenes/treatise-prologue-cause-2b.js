// A Treatise on the Astrolabe, Prologue: "and some of hem ben to harde to thy tendre age of ten yeer to conseyve.
// This tretis ... wole I shewe thee under ful lighte rewles and naked wordes in English; for Latin ne canstow yit
// but smal, my lyte sone."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The second cause, its second limb (jes tg 17876/17880).  A painted miniature, the chamber of the sword scene and
// the opener.  Lewis stands with a thick Latin treatise open in his hands and shakes his head over it; Chaucer at his
// desk looks round.  Then the great book is gone: the instrument hangs from the boy's thumb, and a small book lies
// at the desk's end: his father's own, in English.  Figures jointed (figures-rig.js, figures.js), poses solved from
// the film's rig (prologue-gift-data.js), the room the sword scene's (prologue-data.js), the instrument painted by
// lib/painted.js.  Our own drawing throughout; nothing is traced.

import RIG from "./lib/figures-rig.js";
import D from "./lib/prologue-data.js";
import Q from "./lib/prologue-gift-data.js";
import { build } from "./lib/figures.js";
import { instrument } from "./lib/painted.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 14000;
const STILL = 3600; // ms: the great Latin book, the head shaken over it
const VIEW = { x: -10, y: 380, s: 1100 };
const INK = "#17100d";
const DIA = 124;

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const clamp = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => ((u = clamp(u)), u * u * (3 - 2 * u));
const es = (t, a, b) => ease((t - a) / (b - a));

// recorded drawing calls of the film's prop code: {c, o, w, cap, d} or {c, dot: [x, y, r]}
function replay(items, parent) {
  for (const it of items) {
    if (it.dot) node("circle", { cx: it.dot[0], cy: it.dot[1], r: it.dot[2], fill: "#" + it.c }, parent);
    else if (it.w) node("path", { d: it.d, fill: "none", stroke: "#" + it.c, "stroke-width": it.w, "stroke-linejoin": "round", "stroke-linecap": it.cap ? "round" : "butt", "stroke-opacity": it.o || 1 }, parent);
    else node("path", { d: it.d, fill: "#" + it.c, "fill-opacity": it.o || 1 }, parent);
  }
}

// the chamber, as in the sword scene: diapered wall, tiled floor, the arched window with its March branch
function room(g, uid) {
  const [x0, y0, x1, y1] = [VIEW.x - 80, VIEW.y - 80, VIEW.x + VIEW.s + 80, VIEW.y + VIEW.s + 80];
  const wallY = D.wall[3];
  const defs = node("defs", {}, g);
  const lat = node("pattern", { id: "lat" + uid, width: 58, height: 72.5, patternUnits: "userSpaceOnUse", x: D.wall[0], y: D.wall[1] }, defs);
  node("path", { d: "M0 0L58 72.5M-29 36.25L29 108.75M29 -36.25L87 36.25M24.4 72.5L82.4 0M-33.6 72.5L24.4 0M-4.6 108.75L53.4 36.25M-4.6 36.25L53.4 -36.25", stroke: "#dcb44c", "stroke-width": 1.8, fill: "none" }, lat);
  const flo = node("pattern", { id: "flo" + uid, width: 58, height: 116, patternUnits: "userSpaceOnUse", x: D.wall[0], y: D.wall[1] - 12 }, defs);
  for (const [fx, fy] of [[29, 12], [0, 70], [58, 70]]) {
    node("circle", { cx: fx, cy: fy, r: 3.2, fill: "#dcb44c" }, flo);
    for (const [dx, dy] of [[7, 0], [-7, 0], [0, 8], [0, -8]]) node("circle", { cx: fx + dx, cy: fy + dy, r: 1.5, fill: "#f4efe2", "fill-opacity": 0.75 }, flo);
  }
  const sky = node("linearGradient", { id: "sky" + uid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  node("stop", { offset: 0, "stop-color": "#a9c3d6" }, sky);
  node("stop", { offset: 1, "stop-color": "#efe3bd" }, sky);
  for (const fill of ["#7d2622", `url(#lat${uid})`, `url(#flo${uid})`]) node("rect", { x: x0, y: y0, width: x1 - x0, height: wallY - y0, fill }, g);
  node("rect", { x: x0, y: wallY, width: x1 - x0, height: y1 - wallY, fill: "#cdbb8c" }, g);
  let d = "";
  for (let i = -4; i < 14; i++)
    for (let j = 0; j < 3; j++) {
      if ((((i + j) % 2) + 2) % 2) continue;
      const tx = D.panel[0] + i * 90;
      const ta = wallY + j * 47;
      d += `M${tx + 26 * j} ${ta}h90l26 47h-90Z`;
    }
  node("path", { d, fill: "#5f7a4a" }, g);
  node("line", { x1: x0, y1: wallY, x2: x1, y2: wallY, stroke: INK, "stroke-width": 3 }, g);
  const [wx, wy, ww, wh] = D.window;
  const arch = `M${wx} ${wy + wh}V${wy + ww / 2}A${ww / 2} ${ww / 2} 0 0 1 ${wx + ww} ${wy + ww / 2}V${wy + wh}Z`;
  node("path", { d: arch, fill: "none", stroke: INK, "stroke-width": 16 }, g);
  node("path", { d: arch, fill: "none", stroke: "#b9a47c", "stroke-width": 10 }, g);
  node("path", { d: arch }, node("clipPath", { id: "win" + uid }, defs));
  const pane = node("g", { "clip-path": `url(#win${uid})` }, g);
  node("rect", { x: wx, y: wy, width: ww, height: wh, fill: `url(#sky${uid})` }, pane);
  replay(D.branch, pane);
  node("line", { x1: wx + ww / 2, y1: wy, x2: wx + ww / 2, y2: wy + wh, stroke: INK, "stroke-width": 5 }, g);
  node("path", { d: arch, fill: "none", stroke: INK, "stroke-width": 3 }, g);
}


// a book, open, seen a little from above: two leaves of writing, the block of pages under them, a cover
function book(parent, w, h, thick, red) {
  const g = node("g", {}, parent);
  node("path", { d: `M${-w / 2 - 6} ${-h / 2 + 4}H${w / 2 + 6}V${h / 2 + thick + 6}H${-w / 2 - 6}Z`, fill: "#6f4a22", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, g);
  node("path", { d: `M${-w / 2} ${h / 2}H${w / 2}V${h / 2 + thick}H${-w / 2}Z`, fill: "#e6d8b4", stroke: INK, "stroke-width": 3 }, g);
  let lines = "";
  for (let i = 0; i < thick / 4; i++) lines += `M${-w / 2 + 3} ${h / 2 + 3 + i * 4}H${w / 2 - 3}`;
  node("path", { d: lines, stroke: "#a8946a", "stroke-width": 1.2 }, g);
  node("path", { d: `M${-w / 2} ${-h / 2}Q${-w / 4} ${-h / 2 - 8} 0 ${-h / 2}Q${w / 4} ${-h / 2 - 8} ${w / 2} ${-h / 2}V${h / 2}Q${w / 4} ${h / 2 - 8} 0 ${h / 2}Q${-w / 4} ${h / 2 - 8} ${-w / 2} ${h / 2}Z`, fill: "#f4efe2", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
  node("line", { x1: 0, y1: -h / 2, x2: 0, y2: h / 2, stroke: INK, "stroke-width": 2.5 }, g);
  let t = "";
  const n = Math.floor((h - 14) / 7);
  for (let i = 0; i < n; i++) {
    const y = -h / 2 + 10 + i * 7;
    t += `M${-w / 2 + 7} ${y}H${-7}M${7} ${y}H${w / 2 - 7}`;
  }
  node("path", { d: t, stroke: "#5a4636", "stroke-width": 2, opacity: 0.8 }, g);
  node("rect", { x: -w / 2 + 7, y: -h / 2 + 7, width: 9, height: 11, fill: red }, g); // a red initial
  return g;
}

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const k = 200 / VIEW.s;
  const g = node("g", { transform: `translate(-100 -100) scale(${+k.toFixed(5)}) translate(${-VIEW.x} ${-VIEW.y})` }, svg);
  room(g, uid);
  const style = { contour: RIG.contour, contourWidth: RIG.contourWidth };
  const chPlace = [1, 0, 0, 1, D.chaucerAt[0], D.chaucerAt[1]];
  replay(D.bench, node("g", { transform: `translate(${chPlace[4]} ${chPlace[5]})` }, g));
  const lewis = build(RIG.lewis, style, D.lewisScale);
  for (const l of lewis.layers) g.appendChild(l);
  const chaucer = build(RIG.chaucer, style, 1, [57]);
  g.appendChild(chaucer.layers[0]);
  replay(D.desk, node("g", { transform: `translate(${chPlace[4]} ${chPlace[5]})` }, g));
  g.appendChild(chaucer.layers[1]);
  // the small English book at the desk's end (it comes when the great one goes)
  const little = node("g", { transform: "translate(612 1030) rotate(-8)", opacity: 0 }, g);
  book(little, 64, 40, 6, "#b23a2a");
  const big = node("g", { opacity: 1 }, g);
  const great = book(big, 150, 96, 26, "#2e5a8a");
  const inst = instrument(g, DIA);
  inst.g.setAttribute("opacity", 0);
  const words = (str) => {
    const t = node("text", { x: 0, y: 92, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: "#f4efe2", opacity: 0, "font-family": "inherit", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const w1 = words("too hard at ten years old");
  const w2 = words("plain words, in English");
  el.appendChild(svg);
  const s = { lewis, chaucer, chPlace, inst, big, great, little, w1, w2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const ls = D.lewisScale;
  const swap = es(t, 6.0, 7.0) * (1 - es(t, 13.2, 13.9)); // the great book gone, the instrument and the little book come
  // Chaucer at rest at his desk; he looks round at the boy while he puzzles
  const cp = Q.chaucer[2];
  const ca = { ...cp.a };
  ca.head = (ca.head || 0) + 1.6 * Math.sin((2 * Math.PI * t) / 3.7) + 6 * (1 - swap) - 4;
  s.chaucer.pose({ ...cp, a: ca }, s.chPlace);
  // Lewis holding before him: the book, then the instrument; over the book he shakes his head
  const lp = Q.lewis[2];
  const la = { ...lp.a };
  la.head = (la.head || 0) + 7 * Math.sin((2 * Math.PI * t) / 1.6) * (1 - swap) * es(t, 1.0, 1.6) - 6 * swap;
  la.torso = (la.torso || 0) + 0.7 * Math.sin((2 * Math.PI * t) / 4.9 + 2);
  s.lewis.pose({ ...lp, a: la, hide: swap < 0.5 ? ["thumb_far"] : [] }, [-ls, 0, 0, ls, Q.lewisAt[0], Q.lewisAt[1]]);
  const hl = s.lewis.point("thumb_far", 0, 14);
  s.big.setAttribute("transform", `translate(${(hl[0] - 6).toFixed(1)} ${(hl[1] + 96 + 30 * swap).toFixed(1)}) rotate(-6)`);
  s.big.setAttribute("opacity", (1 - swap).toFixed(3));
  s.inst.set(hl, 1.2 * Math.sin((2 * Math.PI * t) / 2.6), 0);
  s.inst.g.setAttribute("opacity", swap.toFixed(3));
  s.little.setAttribute("opacity", swap.toFixed(3));
  s.w1.setAttribute("opacity", (es(t, 1.2, 1.8) * (1 - es(t, 5.6, 6.0))).toFixed(3));
  s.w2.setAttribute("opacity", (es(t, 7.2, 7.8) * (1 - es(t, 13.0, 13.4))).toFixed(3));
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
