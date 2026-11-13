// A Treatise on the Astrolabe, Part II, 12: "fro the arysing of the sonne til it go to reste, the nadir of the sonne
// shal shewe the houre of the planete ... The 13 day of March fil up-on a Saterday per aventure, and, at the arising of
// the sonne, I fond the secounde degree of Aries sitting up-on myn est orisonte ... than fond I the 2 degree of Libra,
// nadir of my sonne, dessending on my west orisonte ... The first houre inequal of every Satterday is to Saturne; and
// the secounde, to Iupiter; the 3, to Mars; the 4, to the Sonne; the 5, to Venus; the 6, to Mercurius; the 7, to the
// Mone; and thanne agayn, the 8 is to Saturne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete, on Chaucer's Saturday, 13 March: from sunrise (the sun in the second degree of Aries on the
// eastern horizon) the rete turns through the day to sunset; the sun's nadir, the second degree of Libra, goes down
// under the western horizon across the twelve lines of the planets' hours; the space it is in is lit, and the hour's
// number and its planet are shown, Saturn first.  Settings solved from the plate's geometry; shared lib/front.js; the
// rete is our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import { front, node, f, rim, P, almucantar, nightFrom, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 1110; // ms: the middle of the first hour, Saturn's
const C = { x: 0, y: 6, k: 0.94 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = 1.5; // the second degree of Aries
const NADIR = SUN + 180;
const [HC, HR] = almucantar(0);
const PLANETS = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
function at(lam, rot) {
  const d = Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - raOf(lam) + rot, r);
}
// the turn that sets the sun on the horizon on the given side (-1 east, +1 west)
function onHorizon(side) {
  const g = (rot) => {
    const p = at(SUN, rot);
    return Math.hypot(p[0], p[1] + HC) - HR;
  };
  for (let rot = 0; rot < 360; rot += 1) {
    if (g(rot) * g(rot + 1) > 0) continue;
    let a = rot;
    let b = rot + 1;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (Math.sign(at(SUN, a)[0]) === side) return a;
  }
  return 0;
}
const RISE = onHorizon(-1);
const SET0 = onHorizon(1);
const SET = SET0 < RISE ? SET0 + 360 : SET0;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.15);
  for (const h of fr.plate.hours) {
    h.setAttribute("stroke", "currentColor");
    h.setAttribute("opacity", 0.9);
  }
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.45);
  // the twelve spaces under the horizon, from the west
  const cells = [];
  for (let j = 0; j < 12; j++) {
    const pt = (rd, k) => {
      const t0 = nightFrom(rd);
      return rim(t0 + (k * (360 - 2 * t0)) / 12, rd);
    };
    const a = [pt(P.cancer, j), pt(P.equator, j), pt(P.capricorn, j)];
    const b = [pt(P.cancer, j + 1), pt(P.equator, j + 1), pt(P.capricorn, j + 1)];
    cells.push(node("path", { d: "M" + [...a, ...b.reverse()].map((p) => f(p[0]) + " " + f(p[1])).join("L") + "Z", fill: SILVER, opacity: 0 }, g));
  }
  const sun = node("circle", { r: 3.4, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const nadir = node("circle", { r: 3.4, fill: NIGHT, stroke: SILVER, "stroke-width": W(1.2) }, g);
  const text = (y, size) => node("text", { x: 0, y: f(y), "text-anchor": "middle", "font-size": size, fill: SILVER, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const day = text(C.y - 50, 14);
  day.textContent = "Saturday";
  const hour = text(C.y - 30, 16);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, cells, sun, nadir, day, hour, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 15.0, 15.8);
  // through the day: twelve hours in 12 s, then back to sunrise for the next loop
  const u = Math.min(1, Math.max(0, (t - 0.6) / 12.2));
  const r = RISE + (SET - RISE) * u * out;
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = at(SUN, r);
  const np = at(NADIR, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  s.nadir.setAttribute("cx", f(np[0]));
  s.nadir.setAttribute("cy", f(np[1]));
  const h = Math.min(11, Math.floor(12 * u * out)); // the unequal hour of the day, 0..11
  s.cells.forEach((c, j) => c.setAttribute("opacity", f(j === h ? 0.22 * out : 0)));
  s.hour.textContent = `${h + 1} ${PLANETS[h % 7]}`;
  s.hour.setAttribute("opacity", f(out));
  s.day.setAttribute("opacity", f(out));
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
