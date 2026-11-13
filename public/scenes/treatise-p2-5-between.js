// A Treatise on the Astrolabe, Part II, 5: "whan that the degree of thy sonne falleth by-twixe two almikanteras ...
// Set the degree of thy sonne up-on the heyer almikanteras of bothe, and waite wel wher as thin almury toucheth the
// bordure, and set ther a prikke of inke. Set doun agayn the degree of thy sonne up-on the nethere almikanteras of
// bothe, and set ther another prikke. Remewe thanne thyn almury in the bordure evene amiddes bothe prikkes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete.  Chaucer's sun (1 Aries) at 25 1/2 degrees falls between the almucantars of 24 and 26
// (they go two by two).  The sun is set on the 26th: a prick of ink where the almury touches the border; set on the
// 24th: another prick; then the almury is brought to the middle between them, and the sun sits between the two
// circles.  The rete's settings are solved from the plate's geometry; shared lib/front.js; the rete and its almury are
// our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9600; // ms: the almury between the pricks, the sun between the circles
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = A.morning.sunLongitude;
const R = A.frontRadii;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
function at(lam, rot) {
  const l = lam * RAD;
  const ra = Math.atan2(Math.cos(EPS) * Math.sin(l), Math.cos(l)) / RAD;
  const d = Math.asin(Math.sin(EPS) * Math.sin(l));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - ra + rot, r);
}
// the rete's turn that sets the sun on the almucantar of h degrees, on the east (morning) side, near Chaucer's
function setOn(h) {
  const [c, r] = almucantar(h);
  const g = (rot) => {
    const p = at(SUN, rot);
    return Math.hypot(p[0], p[1] + c) - r;
  };
  let a = A.morning.rot - 25;
  let b = A.morning.rot + 25;
  for (let k = 0; k < 50; k++) {
    const m = (a + b) / 2;
    if (g(a) * g(m) <= 0) b = m;
    else a = m;
  }
  return a;
}
const HI = setOn(26);
const LO = setOn(24);
const MID = (HI + LO) / 2;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", a.h === 24 || a.h === 26 ? 0 : 0.25);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.15);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.7);
  // the two almucantars, bright
  const two = [26, 24].map((h) => {
    const [c, r] = almucantar(h);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke: SILVER, "stroke-width": W(1.1) }, fr.plate.clip);
  });
  // the almury, lit, on the rete; the pricks of ink on the border
  node("path", { d: "M-1.7 -82.6H1.7V-74.6H-1.7Z", fill: SILVER }, fr.rete.g);
  const prick = (rot) => {
    const p = rim(rot, (R.hollow + R.ladder) / 2);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.4, fill: "#000", stroke: SILVER, "stroke-width": W(0.8), opacity: 0 }, g);
  };
  const pricks = [prick(HI), prick(LO)];
  const sun = node("circle", { r: 3.2, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const nums = [26, 24].map((h) => {
    const t = node("text", { "font-size": 13, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", "text-anchor": "end" }, svg);
    t.textContent = h + "°";
    return t;
  });
  el.appendChild(svg);
  const s = { rete: fr.rete.g, two, pricks, sun, nums, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  // the rete: to the higher circle, then the lower, then the middle; back to the higher for the next loop
  const r = HI + (LO - HI) * span(t, 3.8, 5.0) + (MID - LO) * span(t, 7.2, 8.4) + (HI - MID) * span(t, 13.0, 13.8);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = at(SUN, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  s.pricks[0].setAttribute("opacity", f(span(t, 2.4, 2.8) * out));
  s.pricks[1].setAttribute("opacity", f(span(t, 5.6, 6.0) * out));
  // the circles' numbers by the sun, each while it is set on it
  const by = [span(t, 0.6, 1.0) * (1 - span(t, 3.6, 3.9)), span(t, 5.0, 5.4) * (1 - span(t, 7.0, 7.3))];
  s.nums.forEach((n, i) => {
    n.setAttribute("x", f(C.x + C.k * sp[0] - 6));
    n.setAttribute("y", f(C.y + C.k * sp[1] + 4));
    n.setAttribute("opacity", f(by[i]));
  });
  s.two.forEach((c) => c.setAttribute("opacity", f(0.9)));
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
