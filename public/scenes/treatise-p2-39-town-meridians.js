// A Treatise on the Astrolabe, Part II, 39: "for in what place that any maner man is at any tyme of the yeer, whan that
// the sonne by moeving of the firmament cometh to his verrey meridian place, than is hit verrey midday ... And nota,
// for evermo, of 2 citees or of 2 tounes, of whiche that o toun aprocheth more toward the est than doth that other
// toun, truste wel that thilke tounes han diverse meridians. Nota also, that the arch of the equinoxial, that is
// conteyned or bounded by-twixe the 2 meridians, is cleped the longitude of the toun. And yif so be that two tounes
// have y-lyke meridian, or oon meridian, than is the distance of hem bothe y-lyke fer fro the est ... And in this
// manere they chaunge nat her meridian, but sothly they chaungen her almikanteras."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The earth as a globe, its north pole tipped a little toward us, turning from west to east.  The sun stands off to
// the left; the meridian under it (gold, fixed) is where it is noon.  Two towns on one parallel, one further east, and
// a third on the first one's meridian further south (unnamed: the text names none here; its Oxford and Lynn are too
// close to see apart on a globe; here 60 degrees apart).  The eastern town comes to noon first; then the other two together.  The globe
// stops; the towns' meridians are drawn pole to pole, and the arc of the equator between them is marked: the
// longitude.  Orthographic projection; our own line work.

import { node, f, SILVER, NIGHT, SUN, FAINT } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 17000;
const STILL = 13000; // ms: stopped, the meridians and the longitude drawn
const RAD = Math.PI / 180;
const G = { x: 8, y: 2, r: 70 }; // the globe in the window
const TILT = 22 * RAD; // the north pole toward us
const NOON = -40; // the sun's meridian, degrees from the globe's middle (west negative, on the left)
const TOWNS = [
  { lat: 52, lon: 0, word: "a town", dx: -6, dy: 4.5, anchor: "end" },
  { lat: 52, lon: 60, word: "further east", dx: 0, dy: -8, anchor: "middle" },
  { lat: 18, lon: 0, word: "same meridian", dx: -6, dy: 4.5, anchor: "end" },
];
// the first town's longitude from the globe's middle, by time: turning eastward, then stopped
const ROT0 = -140;
const ROT1 = -5;
const R0 = 0.5;
const R1 = 8.0;
const relAt = (t) => ROT0 + (ROT1 - ROT0) * Math.min(1, Math.max(0, (t - R0) / (R1 - R0)));
const tWhen = (rel) => R0 + ((rel - ROT0) / (ROT1 - ROT0)) * (R1 - R0);
const T_B = tWhen(NOON - TOWNS[1].lon); // the eastern town at noon
const T_A = tWhen(NOON); // the other two

// a point (lat, lon from the middle) to the window, and whether it faces us
function proj(lat, lon) {
  const x = Math.cos(lat * RAD) * Math.sin(lon * RAD);
  const y0 = Math.sin(lat * RAD);
  const z0 = Math.cos(lat * RAD) * Math.cos(lon * RAD);
  const y = y0 * Math.cos(TILT) - z0 * Math.sin(TILT);
  const z = y0 * Math.sin(TILT) + z0 * Math.cos(TILT);
  return [G.x + G.r * x, G.y - G.r * y, z];
}
// path data for a run of (lat, lon) points, the hidden side left out
function front(pts) {
  let d = "";
  let on = false;
  for (const [la, lo] of pts) {
    const [x, y, z] = proj(la, lo);
    if (z < 0) {
      on = false;
      continue;
    }
    d += `${on ? "L" : "M"}${f(x)} ${f(y)}`;
    on = true;
  }
  return d;
}
const meridian = (lon, a = -90, b = 90) => {
  const pts = [];
  for (let la = a; la <= b + 0.01; la += 3) pts.push([la, lon]);
  return front(pts);
};
const parallel = (lat, a = -180, b = 180) => {
  const pts = [];
  const n = Math.max(2, Math.ceil(Math.abs(b - a) / 3));
  for (let i = 0; i <= n; i++) pts.push([lat, a + ((b - a) * i) / n]);
  return front(pts);
};

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  // the sun, off to the left, in the direction of the noon meridian's equator point
  const sp = proj(0, NOON);
  const dir = [sp[0] - G.x, sp[1] - G.y];
  const dn = Math.hypot(...dir);
  const sunG = node("g", { transform: `translate(${f(G.x + (dir[0] / dn) * 98)} ${f(G.y + (dir[1] / dn) * 98)})` }, svg);
  node("circle", { r: 7, fill: SUN }, sunG);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: -9.5, x2: 0, y2: -12.5, stroke: SUN, "stroke-width": 1.3, "stroke-linecap": "round", transform: `rotate(${45 * i})` }, sunG);
  node("circle", { cx: G.x, cy: G.y, r: G.r, fill: "#141c3c", stroke: "currentColor", "stroke-width": 1.3 }, svg);
  const grid = node("path", { fill: "none", stroke: FAINT, "stroke-width": 0.45, opacity: 0.5 }, svg);
  const equator = node("path", { fill: "none", stroke: FAINT, "stroke-width": 0.9, opacity: 0.85 }, svg);
  // the sun's meridian, fixed: noon there
  node("path", { d: meridian(NOON), fill: "none", stroke: SUN, "stroke-width": 1.6, opacity: 0.85 }, svg);
  const np = proj(90, 0);
  node("circle", { cx: f(np[0]), cy: f(np[1]), r: 1.6, fill: SILVER }, svg); // the north pole
  const arc = node("path", { fill: "none", stroke: SUN, "stroke-width": 3, "stroke-linecap": "round", opacity: 0 }, svg);
  const mers = [0, 1].map(() => node("path", { fill: "none", stroke: SILVER, "stroke-width": 1.4, opacity: 0 }, svg));
  const towns = TOWNS.map(() => node("circle", { r: 3, fill: SILVER, stroke: NIGHT, "stroke-width": 1 }, svg));
  const text = (str, size = 13, anchor = "start") => {
    const t = node("text", { "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const words = TOWNS.map((tw) => text(tw.word, 13, tw.anchor));
  const noonWords = TOWNS.map((tw) => text("noon", 13, tw.anchor));
  const tLong = text("longitude", 14, "middle");
  el.appendChild(svg);
  const s = { grid, equator, arc, mers, towns, words, noonWords, tLong, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 15.6, 16.4);
  const into = span(t, 0, 0.5);
  const rel = relAt(t);
  const off = rel - TOWNS[0].lon; // the globe's turn
  let d = "";
  for (let lon = -180; lon < 180; lon += 30) d += meridian(lon + off);
  for (const la of [-60, -30, 30, 60]) d += parallel(la);
  s.grid.setAttribute("d", d);
  s.equator.setAttribute("d", parallel(0));
  // the towns, carried round; at noon they glow and say so
  TOWNS.forEach((tw, i) => {
    const [x, y, z] = proj(tw.lat, tw.lon + off);
    const vis = (z > 0.05 ? 1 : 0) * into * out;
    s.towns[i].setAttribute("cx", f(x));
    s.towns[i].setAttribute("cy", f(y));
    s.towns[i].setAttribute("opacity", f(vis));
    const tn = i === 1 ? T_B : T_A;
    const glow = span(t, tn - 0.15, tn) * (1 - span(t, tn + 1.0, tn + 1.4));
    s.towns[i].setAttribute("fill", glow > 0.5 ? SUN : SILVER);
    s.towns[i].setAttribute("r", f(3 + 1.5 * glow));
    s.noonWords[i].setAttribute("x", f(x + tw.dx));
    s.noonWords[i].setAttribute("y", f(y + tw.dy));
    s.noonWords[i].setAttribute("opacity", f(glow * vis));
    s.words[i].setAttribute("x", f(x + tw.dx));
    s.words[i].setAttribute("y", f(y + tw.dy));
    s.words[i].setAttribute("opacity", f(span(t, R1 + 0.2 + 0.3 * i, R1 + 0.6 + 0.3 * i) * vis));
  });
  // stopped: the towns' meridians, pole to pole, and the arc of the equator between them
  const m = span(t, R1 + 1.4, R1 + 2.2) * out;
  s.mers[0].setAttribute("d", meridian(TOWNS[0].lon + off));
  s.mers[1].setAttribute("d", meridian(TOWNS[1].lon + off));
  s.mers.forEach((e) => e.setAttribute("opacity", f(m)));
  const a = span(t, R1 + 2.4, R1 + 3.0) * out;
  s.arc.setAttribute("d", parallel(0, TOWNS[0].lon + off, TOWNS[1].lon + off));
  s.arc.setAttribute("opacity", f(a));
  const mid = proj(0, (TOWNS[0].lon + TOWNS[1].lon) / 2 + off);
  s.tLong.setAttribute("x", f(mid[0]));
  s.tLong.setAttribute("y", f(mid[1] + 15));
  s.tLong.setAttribute("opacity", f(span(t, R1 + 2.8, R1 + 3.3) * out));
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
