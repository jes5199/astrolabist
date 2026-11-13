// A Treatise on the Astrolabe, Prologue: "suffyse to thee thise trewe conclusiouns in English, as wel as suffyseth to
// thise noble clerkes Grekes thise same conclusiouns in Greek, and to Arabiens in Arabik, and to Iewes in Ebrew, and to
// the Latin folk in Latin; whiche Latin folk han hem furst out of othre diverse langages, and writen in hir owne tonge,
// that is to sein, in Latin."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A map (jes tg 17891), COLOURED WOODCUT on vellum: the coasts of the Mediterranean, the Near East and England from
// Natural Earth 1:110m land (public domain; lib/map-oldworld-data.js, scripts/web_export_map.py), re-inked with the
// woodcut's line.  The map stands drawn throughout; on it, in red, the tongues as Chaucer names them, each set over its
// people's lands (no cities, no dates): Greek, Arabic, Hebrew, Latin; then his "Latin folk han hem furst out of othre
// diverse langages" as arrows into Latin; then on into English, his own.  Our own drawing over real coasts.

import M from "./lib/map-oldworld-data.js";
import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 16000;
const STILL = 12500; // ms: all the names, the arrows, English
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
// the tongues, over their peoples' lands, in the order the text names them
const TONGUES = [
  { word: "Greek", at: at(22.5, 39.4), t: 0.8 },
  { word: "Arabic", at: at(44, 27.5), t: 1.8 },
  { word: "Hebrew", at: at(35.0, 31.6), t: 2.8 },
  { word: "Latin", at: at(12.8, 42.6), t: 3.8 },
];
const ENGLISH = { word: "English", at: at(-1.5, 52.6), t: 10.4 };

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
  // the arrows: into Latin from the other tongues; from Latin on into English
  const arrow = (a, b, bend) => {
    const m = [(a[0] + b[0]) / 2 + bend[0], (a[1] + b[1]) / 2 + bend[1]];
    const g = node("g", { opacity: 0 }, svg);
    const p = node("path", { d: `M${f(a[0])} ${f(a[1])}Q${f(m[0])} ${f(m[1])} ${f(b[0])} ${f(b[1])}`, fill: "none", stroke: RED, "stroke-width": 1.5, "stroke-dasharray": "3 2" }, g);
    const dx = b[0] - m[0];
    const dy = b[1] - m[1];
    const n = Math.hypot(dx, dy);
    const u = [dx / n, dy / n];
    const h1 = [b[0] - 6 * u[0] + 3 * u[1], b[1] - 6 * u[1] - 3 * u[0]];
    const h2 = [b[0] - 6 * u[0] - 3 * u[1], b[1] - 6 * u[1] + 3 * u[0]];
    node("path", { d: `M${f(b[0])} ${f(b[1])}L${f(h1[0])} ${f(h1[1])}L${f(h2[0])} ${f(h2[1])}Z`, fill: RED }, g);
    return { g, p };
  };
  const L = TONGUES[3].at;
  const off = (p, q, d) => {
    const v = [q[0] - p[0], q[1] - p[1]];
    const n = Math.hypot(...v);
    return [p[0] + (v[0] / n) * d, p[1] + (v[1] / n) * d];
  };
  const into = TONGUES.slice(0, 3).map((T, i) => arrow(off(T.at, L, 12), off(L, T.at, 12), [[0, -14], [6, -18], [0, 14]][i]));
  const onward = arrow(off(L, ENGLISH.at, 12), off(ENGLISH.at, L, 10), [-14, -8]);
  const word = (T) => {
    const t = node("text", { x: f(T.at[0]), y: f(T.at[1] + 4.5), "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = T.word;
    return t;
  };
  const words = TONGUES.map(word);
  const eng = word(ENGLISH);
  const cap = (str) => {
    const t = node("text", { x: 0, y: 84, "text-anchor": "middle", "font-size": 12.5, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const c1 = cap("Latin had them from other tongues");
  const c2 = cap("and now in English");
  el.appendChild(svg);
  const s = { words, eng, into, onward, c1, c2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 15.0, 15.8); // the marks go; the map stays
  TONGUES.forEach((T, i) => s.words[i].setAttribute("opacity", f(span(t, T.t, T.t + 0.5) * out)));
  s.into.forEach((a, i) => {
    a.g.setAttribute("opacity", f(span(t, 5.0 + 0.4 * i, 5.6 + 0.4 * i) * out));
  });
  s.c1.setAttribute("opacity", f(span(t, 5.4, 6.0) * (1 - span(t, 9.0, 9.4))));
  s.onward.g.setAttribute("opacity", f(span(t, 9.6, 10.2) * out));
  s.eng.setAttribute("opacity", f(span(t, ENGLISH.t, ENGLISH.t + 0.5) * out));
  s.c2.setAttribute("opacity", f(span(t, 10.6, 11.2) * out));
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
