// A Treatise on the Astrolabe, Prologue: "suffyse to thee thise trewe conclusiouns in English, as wel as suffyseth to
// thise noble clerkes Grekes thise same conclusiouns in Greek, and to Arabiens in Arabik, and to Iewes in Ebrew, and to
// the Latin folk in Latin; whiche Latin folk han hem furst out of othre diverse langages, and writen in hir owne tonge,
// that is to sein, in Latin."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A map (jes tg 17891), COLOURED WOODCUT on vellum: the coasts of the Mediterranean, the Near East and England from
// Natural Earth 1:110m land (public domain; lib/map-oldworld-data.js, scripts/web_export_map.py), re-inked with the
// woodcut's line.  v2 (jes tg 18011: "the labels stay present the whole time but something is shown moving between
// them"): the map and all five tongues stand throughout, each over its people's lands (no cities, no dates); what
// moves is "thise same conclusiouns", a little astrolabe carried along a dotted road, its trail left behind.  It goes
// into Latin from Greek, Arabic and Hebrew in turn ("han hem furst out of othre diverse langages"; FLAG, as v1: the
// text does not name which tongues, so the three roads are our reading), then from Latin on into English, his own.
// The two tongues of the road being travelled are in red; the rest in ink.  Our own drawing over real coasts.

import M from "./lib/map-oldworld-data.js";
import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 18000;
const STILL = 13800; // ms: every road travelled, the astrolabe come to English
const O = [0, -10]; // the map's middle in the window

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a place (longitude, latitude) on the map, in the window
const at = (lon, lat) => [O[0] + (lon - M.centre[0]) * M.k * M.scale, O[1] - (lat - M.centre[1]) * M.scale];
// the tongues, over their peoples' lands, in the order the text names them; English last
const TONGUES = [
  { word: "Greek", at: at(23.6, 38.4) },
  { word: "Arabic", at: at(44, 27.5) },
  { word: "Hebrew", at: at(35.0, 31.6) },
  { word: "Latin", at: at(11.8, 43.4) },
  { word: "English", at: at(-1.5, 52.6) },
];
// the roads: from, to, where each leaves and arrives beside the words (window units off the name's middle, so the
// road never runs under a name), the bend of the curve, and when it is travelled (s).  Arabic's along Africa's coast.
const ROADS = [
  { a: 0, b: 3, from: [-18, 2], to: [18, 4], bend: [0, 4], t0: 0.8, t1: 3.0 },
  { a: 1, b: 3, from: [-22, 2], to: [-4, 10], bend: [6, 34], t0: 3.4, t1: 6.2 },
  { a: 2, b: 3, from: [-24, 2], to: [8, 10], bend: [4, 10], t0: 6.6, t1: 8.8 },
  { a: 3, b: 4, from: [-8, -8], to: [8, 10], bend: [-12, -2], t0: 9.6, t1: 12.6 },
];
const END = 16.4; // the trails fade; the map and the names stay
const lerp = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
// the first u of a quadratic curve, as its own quadratic (de Casteljau)
const part = (P0, P1, P2, u) => {
  const q1 = lerp(P0, P1, u);
  const q2 = lerp(lerp(P0, P1, u), lerp(P1, P2, u), u);
  return { d: `M${f(P0[0])} ${f(P0[1])}Q${f(q1[0])} ${f(q1[1])} ${f(q2[0])} ${f(q2[1])}`, end: q2 };
};

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 0.9, seed: 53 });
  const x0 = O[0] - M.width / 2;
  const y0 = O[1] - M.height / 2;
  const cp = node("clipPath", { id: "m" + uid }, defs);
  node("rect", { x: f(x0), y: f(y0), width: f(M.width), height: f(M.height) }, cp);
  const map = node("g", { filter: wc.rough }, svg);
  const inside = node("g", { "clip-path": `url(#m${uid})` }, map);
  node("rect", wc.wash({ x: f(x0 - 4), y: f(y0 - 4), width: f(M.width + 8), height: f(M.height + 8), fill: WASH.blue, "fill-opacity": 0.5 }), inside);
  const land = node("g", { transform: `translate(${O[0]} ${O[1]})` }, inside);
  node("path", { d: M.land, fill: VELLUM }, land);
  node("path", wc.wash({ d: M.land, fill: WASH.ochre, "fill-opacity": 0.55 }), land);
  node("path", { d: M.land, fill: "none", stroke: "currentColor", "stroke-width": 1.2, "stroke-linejoin": "round" }, land);
  // the sea's lines along the shore, as the old maps cut them: a second, fainter coast just offshore
  node("path", { d: M.land, fill: "none", stroke: "currentColor", "stroke-width": 3.4, opacity: 0.18 }, land);
  // the neatline: a double rule
  node("rect", { x: f(x0), y: f(y0), width: f(M.width), height: f(M.height), fill: "none", stroke: "currentColor", "stroke-width": 1.6 }, map);
  node("rect", { x: f(x0 - 2.5), y: f(y0 - 2.5), width: f(M.width + 5), height: f(M.height + 5), fill: "none", stroke: "currentColor", "stroke-width": 0.6 }, map);
  // each road: its whole course faint from the start, its travelled part drawn in red behind the astrolabe
  const roads = ROADS.map((R) => {
    const A = TONGUES[R.a].at;
    const B = TONGUES[R.b].at;
    const P0 = [A[0] + R.from[0], A[1] + R.from[1]];
    const P2 = [B[0] + R.to[0], B[1] + R.to[1]];
    const P1 = [(P0[0] + P2[0]) / 2 + R.bend[0], (P0[1] + P2[1]) / 2 + R.bend[1]];
    const g = node("g", {}, svg);
    node("path", { d: part(P0, P1, P2, 1).d, fill: "none", stroke: "currentColor", "stroke-width": 0.9, "stroke-dasharray": "1 3", "stroke-linecap": "round", opacity: 0.45 }, g);
    const trail = node("path", { fill: "none", stroke: RED, "stroke-width": 1.5, "stroke-dasharray": "3 2" }, g);
    return { ...R, P0, P1, P2, g, trail };
  });
  // the names, always there
  const words = TONGUES.map((T) => {
    const t = node("text", { x: f(T.at[0]), y: f(T.at[1] + 4.5), "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "currentColor", "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = T.word;
    return t;
  });
  // the conclusions: a little astrolabe, its ring, its cross, its shackle
  const astro = node("g", { opacity: 0 }, svg);
  node("circle", { cy: -6.2, r: 1.6, fill: "none", stroke: RED, "stroke-width": 1 }, astro);
  node("circle", { r: 4.6, fill: VELLUM, stroke: RED, "stroke-width": 1.4 }, astro);
  node("path", { d: "M-4.6 0H4.6M0 -4.6V4.6", stroke: RED, "stroke-width": 0.8 }, astro);
  node("circle", { r: 2.4, fill: "none", stroke: RED, "stroke-width": 0.7 }, astro);
  const cap = (str) => {
    const t = node("text", { x: 0, y: 84, "text-anchor": "middle", "font-size": 12.5, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const c1 = cap("Latin had them from other tongues");
  const c2 = cap("and now in English");
  el.appendChild(svg);
  const s = { words, roads, astro, c1, c2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  // the road being travelled, or the last one begun
  let cur = -1;
  s.roads.forEach((R, i) => {
    if (t >= R.t0 - 0.4) cur = i;
    const u = span(t, R.t0, R.t1);
    R.trail.setAttribute("d", u > 0.002 ? part(R.P0, R.P1, R.P2, u).d : "");
    R.trail.setAttribute("opacity", f(out));
  });
  const lit = cur < 0 ? [] : [s.roads[cur].a, s.roads[cur].b];
  s.words.forEach((w, i) => w.setAttribute("fill", lit.includes(i) && t < END ? RED : "currentColor"));
  if (cur < 0) {
    s.astro.setAttribute("opacity", 0);
  } else {
    const R = s.roads[cur];
    const u = span(t, R.t0, R.t1);
    const p = part(R.P0, R.P1, R.P2, u).end;
    // it appears at each road's start and, but for the last, is gone on arrival (into Latin)
    const last = cur === s.roads.length - 1;
    const a = span(t, R.t0 - 0.4, R.t0) * (last ? out : 1 - span(t, R.t1, R.t1 + 0.35));
    const pulse = 1 + 0.25 * Math.sin(Math.PI * span(t, R.t1, R.t1 + 0.5));
    s.astro.setAttribute("transform", `translate(${f(p[0])} ${f(p[1])}) scale(${f(pulse)})`);
    s.astro.setAttribute("opacity", f(a));
  }
  s.c1.setAttribute("opacity", f(span(t, 1.0, 1.6) * (1 - span(t, 8.8, 9.2))));
  s.c2.setAttribute("opacity", f(span(t, 9.6, 10.2) * out));
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
