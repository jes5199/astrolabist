// A Treatise on the Astrolabe, Part I, 21: "The Riet of thyn Astrolabie with thy zodiak, shapen in maner of a net or
// of a loppe-webbe after the olde descripcioun, which thow mayst tornen up and doun as thy-self lyketh, conteneth
// certein nombre of sterres fixes ... The names of the sterres ben writen in the margin of the riet ther as they
// sitte; of whiche sterres the smale poynt is cleped the Centre."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-21-rete.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front, the rete over the plate, turning westward as the sky turns.  As each named star's point crosses the
// south line it is marked and its name written beside it, the name engraved for it on inv. 47869; so they come in
// the order of their mediations.  The rete is our constructed drawing of inv. 47869; the sixteen names and the
// points their pointers mark are as read in our drawing notes (docs/video2/drawings/ox47869.md: each tip checked to
// lie on the drawn rete within 1.6 units of 100).  Shared lib/front.js.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 26000; // ms: once round
const C = { x: 0, y: 8, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const SIGN = { Ari: 0, Tau: 30, Gem: 60, Cnc: 90, Leo: 120, Vir: 150, Lib: 180, Sco: 210, Sgr: 240, Cap: 270, Aqr: 300, Psc: 330 };
// the named pointers: the engraved name; where the tip points (the degree of the ecliptic that culminates with it,
// and its declination), as read
const STARS = [
  ["Denebalgedi", 14.2, "Aqr", -21.0],
  ["Delfin", 11.3, "Aqr", 5.7],
  ["Altair", 15.0, "Cap", 7.9],
  ["Wega", 3.0, "Cap", 37.4],
  ["Algoh", 11.1, "Tau", 40.4],
  ["Bacncaycos", 18.1, "Ari", -13.2],
  ["Mencar", 6.0, "Tau", 1.8],
  ["Aldebora", 1.7, "Gem", 14.4],
  ["Rigil", 12.4, "Gem", -7.7],
  ["Alabor", 4.2, "Cnc", -13.8],
  ["Algomeysa", 15.5, "Cnc", 6.6],
  ["Alfard", 9.3, "Leo", -5.7],
  ["Coruus", 2.1, "Vir", -11.3],
  ["Elfeca", 18.1, "Sco", 30.2],
  ["Alacrab", 29.7, "Sco", -23.6],
  ["Alauue", 17.8, "Sgr", 14.0],
].map(([name, deg, sign, dec]) => {
  const lam = (SIGN[sign] + deg) * RAD;
  const eps = P.obliquity * RAD;
  const ra = (((Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / RAD) % 360) + 360) % 360;
  const r = (P.equator * Math.cos(dec * RAD)) / (1 + Math.sin(dec * RAD));
  return { name, ra, r, b0: 270 - ra }; // b0: its bearing on the rete as drawn (Capricorn's head at the top)
});
const turnAt = (ms) => (360 * ms) / LOOP; // the rete's turn, clockwise (westward), degrees
const STILL = ((((STARS.find((s) => s.name === "Alabor").ra - 270 + 2) % 360) + 360) % 360) * (LOOP / 360); // Alabor just past the south line

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  // the south line: where each star is named
  node("path", { d: `M0 0V${-A.frontRadii.hollow}`, stroke: SILVER, "stroke-width": W(0.6), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  // a ring for each star's point, carried with the rete; names in the window, placed each frame
  const marks = STARS.map((s) => {
    const p = rim(s.b0, s.r);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: f(3), fill: "none", stroke: SILVER, "stroke-width": W(1), opacity: 0 }, fr.rete.g);
  });
  const names = STARS.map((s) => {
    const t = node("text", { "font-size": 13, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = s.name;
    return t;
  });
  el.appendChild(svg);
  const s = { rete: fr.rete.g, marks, names, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL);
}

function draw(s, ms) {
  const turn = turnAt(ms);
  s.rete.setAttribute("transform", `rotate(${f(turn)})`);
  STARS.forEach((st, i) => {
    const past = ((((st.b0 + turn + 180) % 360) + 360) % 360) - 180; // degrees past the south line
    const on = ease((past + 5) / 5) * ease((24 - past) / 9); // named as it crosses, gone soon after
    s.marks[i].setAttribute("opacity", f(on));
    const p = rim(st.b0 + turn, st.r);
    const x = C.x + C.k * p[0];
    const y = C.y + C.k * p[1];
    const n = s.names[i];
    n.setAttribute("x", f(x + 6));
    n.setAttribute("y", f(y + 4));
    n.setAttribute("opacity", f(on));
  });
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, s.tm);
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
  draw(s, s.tm);
}
