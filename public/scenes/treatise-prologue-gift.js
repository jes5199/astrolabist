// A Treatise on the Astrolabe, the Prologue: "Litel Lowis my sone ... therfore have I geven thee a suffisaunt
// Astrolabie as for oure orizonte, compowned after the latitude of Oxenforde."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A painted miniature, the same chamber as the sword scene.  Chaucer at his desk holds the instrument up by its
// ring on his thumb; he turns from the desk and holds it out; Lewis reaches up and takes the ring on his own thumb.
// It swings and comes to rest; he brings it down before his face and turns it on its ring, front and back.  The
// hand-over plays once; then the boy's turning of it goes round.  The figures are jointed (figures-rig.js,
// figures.js); their poses are solved from the film's rig (prologue-gift-data.js); the room is the sword scene's
// (prologue-data.js); the instrument is painted by lib/painted.js (our constructed drawing of Oxford inv. 47869).
// Our own drawing throughout; nothing is traced.

import RIG from "./lib/figures-rig.js";
import D from "./lib/prologue-data.js";
import Q from "./lib/prologue-gift-data.js";
import { build, along } from "./lib/figures.js";
import { instrument } from "./lib/painted.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const INTRO = 9.0; // s: the hand-over, played once
const IDLE = 8.0; // s: the boy turning it, round and round
const STILL = 4200; // ms: both thumbs in the ring
const VIEW = { x: -10, y: 380, s: 1100 }; // the square of the film's picture that fills the window
const INK = "#17100d";
const DIA = 124; // the instrument's diameter, film units

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


export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.overflow = "visible"; // the picture runs on to the edge of the round glass
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
  const inst = instrument(g, DIA);
  el.appendChild(svg);
  const s = { lewis, chaucer, chPlace, inst, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// the time of the story: the hand-over once, then the turning round and round
const story = (t) => (t < INTRO ? t : INTRO + ((t - INTRO) % IDLE));

function draw(s, tt) {
  const t = story(tt);
  const idle = t >= INTRO ? (t - INTRO) / IDLE : 0; // 0..1 round the turning
  const ls = D.lewisScale;

  // ---- Chaucer: holding it up, looking at it; turned to the boy, holding it out; his hand back to the desk
  const give = es(t, 1.4, 3.4);
  const back = es(t, 4.9, 6.6);
  const cp = along([0, 1, 2], Q.chaucer, give + back);
  const ca = { ...cp.a };
  ca.head = (ca.head || 0) + 1.6 * Math.sin((2 * Math.PI * tt) / 3.7) + 6 * back; // then he watches the boy
  ca.torso = (ca.torso || 0) + 0.7 * Math.sin((2 * Math.PI * tt) / 4.9);
  s.chaucer.pose({ ...cp, a: ca }, s.chPlace);

  // ---- Lewis: watching; reaching up, his thumb into the ring; bringing it down before his face
  const reach = es(t, 2.3, 3.9);
  const lower = es(t, 6.4, 8.4);
  const lp = along([0, 1, 2], Q.lewis, reach + lower);
  const la = { ...lp.a };
  la.head = (la.head || 0) + 1.6 * Math.sin((2 * Math.PI * tt) / 3.7 + 2);
  la.torso = (la.torso || 0) + 0.7 * Math.sin((2 * Math.PI * tt) / 4.9 + 2);
  const hop = t < 2.3 ? 0 : 8 * Math.max(0, Math.sin(Math.PI * clamp((t - 4.9) / 0.5))); // a small hop of joy
  s.lewis.pose({ ...lp, a: la }, [-ls, 0, 0, ls, Q.lewisAt[0], Q.lewisAt[1] - hop]);

  // ---- the instrument: on his father's thumb until the ring passes, then on his
  const pass = es(t, 4.4, 4.8);
  const hc = s.chaucer.point("thumb_far", 0, 21);
  const hl = s.lewis.point("thumb_far", 0, 14);
  const hook = [lerp(hc[0], hl[0], pass), lerp(hc[1], hl[1], pass)];
  // the swing: a little while it is carried, freer when it changes hands, dying away
  let sway = 2.5 * Math.sin((2 * Math.PI * t) / 1.9) * (1 - pass);
  if (t > 4.6) {
    const x = t - 4.6;
    sway += 11 * Math.exp(-1.1 * x) * Math.sin(2 * Math.PI * x / 1.25);
  }
  sway += 1.2 * Math.sin((2 * Math.PI * tt) / 2.6) * lower;
  const turn = 2 * Math.PI * ease(idle * 1.15); // once round, then a pause facing us
  s.inst.set(hook, sway, turn);
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = now - s.t0; // story() folds it into the turning once the hand-over is done
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

// for tests and stills: draw one moment without animating
export function seek(el, ms) {
  const s = instances.get(el);
  if (!s) return;
  s.tm = Math.max(0, ms);
  draw(s, s.tm / 1000);
}
