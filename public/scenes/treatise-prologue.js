// A Treatise on the Astrolabe, the Prologue: "I nam but a lewd compilatour of the labour of olde
// Astrologiens ... And with this swerd shal I sleen envye."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A painted miniature, in its own colours: Chaucer at his desk, Lewis at its far end.  He lifts the pen; on the
// wall its shadow is a sword; Envy, a small green beast, bolts.  The figures are jointed (shared modules
// figures-rig.js and figures.js); the poses, desk, bench and branch are the film's own (prologue-data.js).
// Our own drawing throughout; nothing is traced.

import RIG from "./lib/figures-rig.js";
import D from "./lib/prologue-data.js";
import { build, along, spline } from "./lib/figures.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 12000;
const STILL = 4300; // ms: the pen up, the sword on the wall, Envy in flight
const VIEW = { x: -10, y: 380, s: 1100 }; // the square of the film's picture that fills the window
const INK = "#17100d";
const G = D.ground;
const SX = D.sword[6][0]; // the blade's axis: its point

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const clamp = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => ((u = clamp(u)), u * u * (3 - 2 * u));
const es = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const r1 = (v) => +v.toFixed(1);

// recorded drawing calls of the film's prop code: {c, o, w, cap, d} or {c, dot: [x, y, r]}
function replay(items, parent) {
  for (const it of items) {
    if (it.dot) node("circle", { cx: it.dot[0], cy: it.dot[1], r: it.dot[2], fill: "#" + it.c }, parent);
    else if (it.w) node("path", { d: it.d, fill: "none", stroke: "#" + it.c, "stroke-width": it.w, "stroke-linejoin": "round", "stroke-linecap": it.cap ? "round" : "butt", "stroke-opacity": it.o || 1 }, parent);
    else node("path", { d: it.d, fill: "#" + it.c, "fill-opacity": it.o || 1 }, parent);
  }
}

function room(g, uid) {
  const [x0, y0, x1, y1] = [VIEW.x - 80, VIEW.y - 80, VIEW.x + VIEW.s + 80, VIEW.y + VIEW.s + 80];
  const wallY = D.wall[3];
  const defs = node("defs", {}, g);
  // the diapered wall: a gold lattice of lozenges, a small flower in every cell
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
  // the tiled floor
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
  // the window: an arch, the March sky, a bare branch with its buds
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

// Envy: the film's small green wyvern (video/song/scenes.py), wing and body as splines
const BODY = [[-60, 10], [-30, -8], [0, -12], [26, -22], [40, -40], [58, -44], [70, -34, 1], [56, -28], [48, -10], [30, 8], [0, 14], [-30, 16], [-62, 30], [-92, 22, 1]];
const WING = [[-6, -10, 1], [-30, -62, 1], [-8, -46], [6, -66, 1], [14, -40], [30, -52, 1], [26, -18, 1]];
function envy(parent) {
  const g = node("g", {}, parent);
  const part = (fill) => {
    node("path", { fill: "none", stroke: INK, "stroke-width": 4.6, "stroke-linejoin": "round" }, g);
    return node("path", { fill }, g);
  };
  const wing = part("#7fae5a");
  const body = part("#4f8a3c");
  const bd = spline(BODY);
  body.setAttribute("d", bd);
  body.previousSibling.setAttribute("d", bd);
  node("circle", { cx: 58, cy: -38, r: 2.5, fill: INK }, g);
  node("path", { d: "M-10 12l6 18M16 12l6 18", stroke: INK, "stroke-width": 2.5, fill: "none" }, g);
  return {
    g,
    // flap: -1..1, the wing's beat
    set(x, y, s, flip, flap) {
      g.setAttribute("transform", `translate(${r1(x)} ${r1(y)}) scale(${flip ? -s : s} ${s})`);
      const k = 1 + 0.35 * flap;
      const d = spline(WING.map((p) => [p[0], -10 + (p[1] + 10) * k, p[2]]));
      wing.setAttribute("d", d);
      wing.previousSibling.setAttribute("d", d);
    },
  };
}

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.overflow = "visible"; // the picture runs on to the edge of the round glass
  const k = 200 / VIEW.s;
  const g = node("g", { transform: `translate(-100 -100) scale(${+k.toFixed(5)}) translate(${-VIEW.x} ${-VIEW.y})` }, svg);
  room(g, uid);
  const shadow = node("path", { fill: INK, "fill-opacity": 0 }, g);
  const gleam = node("line", { stroke: "#fff3c4", "stroke-width": 3, "stroke-opacity": 0 }, g);
  const style = { contour: RIG.contour, contourWidth: RIG.contourWidth };
  const chPlace = [1, 0, 0, 1, D.chaucerAt[0], D.chaucerAt[1]];
  replay(D.bench, node("g", { transform: `translate(${chPlace[4]} ${chPlace[5]})` }, g));
  const lewis = build(RIG.lewis, style, D.lewisScale);
  for (const l of lewis.layers) g.appendChild(l);
  const chaucer = build(RIG.chaucer, style, 1, [57]);
  g.appendChild(chaucer.layers[0]);
  replay(D.desk, node("g", { transform: `translate(${chPlace[4]} ${chPlace[5]})` }, g));
  g.appendChild(chaucer.layers[1]);
  const quill = node("g", {}, g);
  const feather = [node("path", { fill: "none", stroke: INK, "stroke-width": 4.62, "stroke-linejoin": "round" }, quill), node("path", { fill: "#f4efe2" }, quill)];
  const shaft = node("line", { stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round" }, quill);
  const beast = envy(g);
  el.appendChild(svg);
  const s = { shadow, gleam, beast, lewis, chaucer, chPlace, feather, shaft, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const T = LOOP / 1000;
  const up = es(t, 2.2, 3.6) * (1 - es(t, 8.2, 9.2)); // the pen lifted like a sword
  const cheer = es(t, 2.9, 3.9) * (1 - es(t, 8.0, 9.0)); // the boy's arm thrown up

  // ---- the shadow on the wall: the pen's small shadow grows into a sword
  const m = ease(up);
  const pts = D.sword.map(([x, y]) => [lerp(SX + (x - SX) * 0.3, x, m), lerp(1012 - (1012 - y) * 0.42, y, m)]);
  s.shadow.setAttribute("d", "M" + pts.map((p) => r1(p[0]) + " " + r1(p[1])).join("L") + "Z");
  s.shadow.setAttribute("fill-opacity", +(0.12 + 0.4 * up).toFixed(3));
  const gl = (t * 0.55) % 1;
  const gy = lerp(760, 450, gl);
  for (const [k, v] of [["x1", SX], ["x2", SX], ["y1", gy], ["y2", gy - 46]]) s.gleam.setAttribute(k, r1(v));
  s.gleam.setAttribute("stroke-opacity", +(0.8 * (up > 0.98 ? 1 : 0) * Math.sin(Math.PI * gl)).toFixed(3));

  // ---- Chaucer: from writing to the pen held up; he breathes; while he writes the hand moves
  const po = along(D.keys, D.chaucer, up);
  const a = { ...po.a };
  a.head = (a.head || 0) + 0.96 * Math.sin((2 * Math.PI * t) / 4);
  a.torso = (a.torso || 0) + 0.42 * Math.sin((2 * Math.PI * t) / 6);
  a.farm_near = (a.farm_near || 0) + (1 - up) * 1.6 * Math.sin((2 * Math.PI * t) / 0.75) + up * 1.2 * Math.sin((2 * Math.PI * t) / 3);
  s.chaucer.pose({ ...po, a }, s.chPlace);

  // ---- the quill in his hand
  const grip = s.chaucer.point("hand_near", 0, 34);
  const qa = (lerp(-28, 4, up) * Math.PI) / 180;
  const dx = Math.sin(qa);
  const dy = -Math.cos(qa);
  const at = (f, n) => [grip[0] + dx * f - dy * n, grip[1] + dy * f + dx * n];
  const L = 118;
  const fd = spline([[...at(L * 0.2, 0), 1], at(L * 0.55, 13), at(L, 4), [...at(L, 0), 1], at(L * 0.55, -9)]);
  for (const e of s.feather) e.setAttribute("d", fd);
  const tip = at(-34, 0);
  const end = at(L, 0);
  for (const [k, v] of [["x1", tip[0]], ["y1", tip[1]], ["x2", end[0]], ["y2", end[1]]]) s.shaft.setAttribute(k, r1(v));

  // ---- Lewis at the far end of the desk: looks up, throws up an arm, hops
  const lp = along([0, 0.5, 1], D.lewis, cheer);
  const la = { ...lp.a };
  la.head = (la.head || 0) + 2 * Math.sin((2 * Math.PI * t) / 4 + 1);
  const hop = 10 * Math.abs(Math.sin((2 * Math.PI * t) / 1.2)) * cheer;
  const ls = D.lewisScale;
  s.lewis.pose({ ...lp, a: la }, [-ls, 0, 0, ls, D.lewisAt[0], D.lewisAt[1] - hop]);

  // ---- Envy: squatting on the leaf he writes, bolts when the sword appears, steals back before the loop ends
  const perch = [604, 938];
  const away = [1010, 330];
  const flee = es(t, 3.0, 6.2);
  const back = es(t, 9.6, 11.7);
  const p = t < 9.4 ? flee : 1 - back;
  const flying = t < 9.4 ? flee > 0 && flee < 1 : back > 0 && back < 1;
  const bob = flying ? 9 * Math.abs(Math.sin(t * 13)) : 1.5 * Math.sin((2 * Math.PI * t) / 2);
  s.beast.set(lerp(perch[0], away[0], p), lerp(perch[1], away[1], p) - bob, 0.72, t >= 9.4 || flee === 0, flying ? Math.sin(t * 26) : 0.15 * Math.sin((2 * Math.PI * t) / 2));
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
