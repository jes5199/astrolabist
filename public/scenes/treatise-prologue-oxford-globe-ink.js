// A Treatise on the Astrolabe, Prologue: "ther-for have I geven thee a suffisaunt Astrolabie as for oure orizonte,
// compowned after the latitude of Oxenford".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The earth as a globe (jes tg 17885), COLOURED WOODCUT on vellum: a graticule cut in ink, the sea washed slate blue
// (no coasts are drawn: nothing invented).  The globe turns until Oxford comes round; Oxford is pricked in red; its
// latitude is measured up its meridian from the equator: 51 degrees 50 minutes, Chaucer's own figure for Oxford
// (II 22; the instrument's plates are drawn for 52); then its zenith, straight up, and its horizon, the plane the
// plate is made for.  Orthographic projection; lib/woodcut.js; our own drawing.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 14000;
const STILL = 10000; // ms: the latitude, the zenith and the horizon shown
const RAD = Math.PI / 180;
const G = { x: 6, y: 10, r: 62 };
const TILT = 10 * RAD; // the north pole toward us
const LAT = 51 + 50 / 60; // Chaucer's latitude of Oxford
const AT = -52; // where Oxford's meridian comes to rest, degrees from the globe's middle (west on the left)
const TURN0 = -120;

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a direction on the globe (x east, y north, z toward us before the tilt) to the window, with its depth
function vec(lat, lon) {
  return [Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD), Math.cos(lat * RAD) * Math.cos(lon * RAD)];
}
function tilt([x, y0, z0]) {
  return [x, y0 * Math.cos(TILT) - z0 * Math.sin(TILT), y0 * Math.sin(TILT) + z0 * Math.cos(TILT)];
}
const scr = ([x, y, z], r = G.r) => [G.x + r * x, G.y - r * y, z];
const proj = (lat, lon, r) => scr(tilt(vec(lat, lon)), r);
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
  const p = [];
  for (let la = a; la <= b + 0.01; la += 2) p.push([la, lon]);
  return front(p);
};
const parallel = (lat) => {
  const p = [];
  for (let lo = -180; lo <= 180; lo += 3) p.push([lat, lo]);
  return front(p);
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 1.0, seed: 47 });
  const globe = node("g", { filter: wc.rough }, svg);
  node("circle", { cx: G.x, cy: G.y, r: G.r, fill: VELLUM }, globe);
  node("circle", wc.wash({ cx: G.x, cy: G.y, r: G.r, fill: WASH.blue, "fill-opacity": 0.55 }), globe);
  // the shade of the far side: hatching on the lower right limb
  const sh = node("clipPath", { id: "sh" + Math.random().toString(36).slice(2, 8) }, defs);
  node("circle", { cx: G.x, cy: G.y, r: G.r }, sh);
  node("path", { d: `M${G.x + G.r * 0.2} ${G.y + G.r}A${G.r} ${G.r} 0 0 0 ${G.x + G.r} ${G.y + G.r * 0.1}L${G.x + G.r * 1.2} ${G.y + G.r * 1.2}Z`, fill: wc.hatch(-40, 2.6, 0.9), "clip-path": `url(#${sh.id})` }, globe);
  const grid = node("path", { fill: "none", stroke: "currentColor", "stroke-width": 0.7, opacity: 0.8 }, globe);
  const eq = node("path", { fill: "none", stroke: "currentColor", "stroke-width": 1.5 }, globe);
  node("circle", { cx: G.x, cy: G.y, r: G.r, fill: "none", stroke: "currentColor", "stroke-width": 2.2 }, globe);
  const np = proj(90, 0);
  node("circle", { cx: f(np[0]), cy: f(np[1]), r: 1.8, fill: "currentColor" }, globe);
  // Oxford's latitude: its meridian from the equator up to the town, in red; the town pricked
  const arc = node("path", { fill: "none", stroke: RED, "stroke-width": 2.8, "stroke-linecap": "round" }, svg);
  const town = node("circle", { r: 3, fill: RED, stroke: VELLUM, "stroke-width": 1 }, svg);
  const zen = node("line", { stroke: RED, "stroke-width": 1.4, "stroke-dasharray": "3 2" }, svg);
  const hor = node("path", { fill: WASH.ochre, "fill-opacity": 0.55, stroke: "currentColor", "stroke-width": 1.1 }, svg);
  const text = (str, size = 13, anchor = "start") => {
    const t = node("text", { "text-anchor": anchor, "font-size": size, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const tTown = text("Oxford", 13, "start");
  const tLat = text("51° 50′", 13, "end");
  const tZen = text("zenith", 12, "start");
  const tHor = text("our horizon", 12, "start");
  const tEq = text("equator", 12, "middle");
  el.appendChild(svg);
  const s = { globe, grid, eq, arc, town, zen, hor, tTown, tLat, tZen, tHor, tEq, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const vis = span(t, 0, 0.5) * (1 - span(t, 13.2, 13.9));
  s.globe.setAttribute("opacity", f(vis));
  const lon = TURN0 + (AT - TURN0) * span(t, 0.3, 3.0); // Oxford's meridian, coming round
  let d = "";
  for (let m = -180; m < 180; m += 30) d += meridian(m + lon);
  for (const la of [-60, -30, 30, 60]) d += parallel(la);
  s.grid.setAttribute("d", d);
  s.eq.setAttribute("d", parallel(0));
  const P = proj(LAT, lon);
  const on = span(t, 3.1, 3.5) * vis;
  s.town.setAttribute("cx", f(P[0]));
  s.town.setAttribute("cy", f(P[1]));
  s.town.setAttribute("opacity", f(on));
  s.tTown.setAttribute("x", f(P[0] + 10));
  s.tTown.setAttribute("y", f(P[1] + 9));
  s.tTown.setAttribute("opacity", f(on));
  // the latitude: up the meridian from the equator
  const up = LAT * span(t, 4.0, 5.6);
  s.arc.setAttribute("d", up > 0.5 ? meridian(lon, 0, up) : "");
  s.arc.setAttribute("opacity", f(span(t, 3.9, 4.1) * vis));
  const E = proj(0, lon);
  s.tEq.setAttribute("x", f(E[0]));
  s.tEq.setAttribute("y", f(E[1] + 15));
  s.tEq.setAttribute("opacity", f(span(t, 4.0, 4.4) * vis));
  const M = proj(LAT / 2, lon);
  s.tLat.setAttribute("x", f(M[0] - 6));
  s.tLat.setAttribute("y", f(M[1] + 4));
  s.tLat.setAttribute("opacity", f(span(t, 5.4, 5.9) * vis));
  // the zenith, straight up from the town; the horizon, the plane that touches the globe there
  const n = tilt(vec(LAT, lon));
  const Z = scr(n, G.r + 30);
  s.zen.setAttribute("x1", f(P[0]));
  s.zen.setAttribute("y1", f(P[1]));
  s.zen.setAttribute("x2", f(Z[0]));
  s.zen.setAttribute("y2", f(Z[1]));
  const zo = span(t, 6.6, 7.2) * vis;
  s.zen.setAttribute("opacity", f(zo));
  s.tZen.setAttribute("x", f(Z[0] - 2));
  s.tZen.setAttribute("y", f(Z[1] - 5));
  s.tZen.setAttribute("text-anchor", "middle");
  s.tZen.setAttribute("opacity", f(zo));
  const e = tilt(vec(0, lon + 90)); // east, along the parallel
  const no = tilt(vec(90 - LAT, lon + 180)); // north, along the meridian (toward the pole)
  let hd = "";
  for (let a = 0; a <= 360; a += 15) {
    const c = Math.cos(a * RAD) * 18;
    const sn = Math.sin(a * RAD) * 18;
    const q = [P[0] + c * e[0] + sn * no[0], P[1] - (c * e[1] + sn * no[1])];
    hd += `${a ? "L" : "M"}${f(q[0])} ${f(q[1])}`;
  }
  s.hor.setAttribute("d", hd + "Z");
  const ho = span(t, 7.6, 8.2) * vis;
  s.hor.setAttribute("opacity", f(ho));
  s.tHor.setAttribute("x", f(P[0] + 14));
  s.tHor.setAttribute("y", f(P[1] - 13));
  s.tHor.setAttribute("opacity", f(ho));
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
