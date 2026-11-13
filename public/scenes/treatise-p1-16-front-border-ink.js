// A Treatise on the Astrolabe, Part I, 16: "The bordure of which wombe-side is devyded fro the poynt of the est lyne
// un-to the poynt of the south lyne under the ring, in 90 degres ... This same bordure is devyded also with 23
// lettres capitals and a smal croys + above the south lyne, that sheweth the 24 houres equals of the clokke; and, as
// I have said, 5 of thise degrees maken a mile-wey, and 3 mile-wey maken an houre. And every degree of this bordure
// conteneth 4 minutes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-16-front-border.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front, close on its upper left quarter: from the east point (on the left of the front) up to the south line
// under the ring.  The degrees are struck one by one, a longer line every five (a mile-wey); the hour letters come in
// as their hours fill, the little cross over the south line last.  Then one hour is lit: its three mile-weys in turn,
// then its fifteen degrees, four minutes each.  As the limb of inv. 47869 in our drawing (shared lib/front.js).
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, SILVER } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 7000; // ms: the quarter struck, its letters in
const C = { x: 62, y: 62, k: 1.32 }; // the centre down and to the right: the upper left quarter fills the glass
const W = (px) => f(px / C.k);
const R = A.frontRadii;
const HOUR = 300; // the hour lit: from bearing 300 to 315 (the cell before X)

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const seg = (b, r0, r1) => {
  const p = rim(b, r0);
  const q = rim(b, r1);
  return `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
};
const sector = (b0, b1, r0, r1) => {
  const a = rim(b0, r1);
  const b = rim(b1, r1);
  const c = rim(b1, r0);
  const d = rim(b0, r0);
  return `M${f(a[0])} ${f(a[1])}A${r1} ${r1} 0 0 1 ${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}A${r0} ${r0} 0 0 0 ${f(d[0])} ${f(d[1])}Z`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, ticks: false, faint: 0.45 });
  fr.plate.g.setAttribute("opacity", 0.35);
  // the east-west line and the south line, quiet
  node("path", { d: `M${-R.hollow} 0H0V-143`, fill: "none", stroke: "currentColor", "stroke-width": W(0.9), opacity: 0.5 }, g);
  // the quarter's degrees, one element each, from the east point (bearing 270) round to the south (360)
  const deg = [];
  for (let i = 1; i <= 90; i++) {
    const b = 270 + i;
    const five = i % 5 === 0;
    deg.push(node("path", { d: seg(b, R.hollow, five ? R.blocks : R.ladder), fill: "none", stroke: "currentColor", "stroke-width": W(five ? 1 : 0.5), opacity: 0 }, g));
  }
  // the letters of this quarter and the cross; the rest of the border's letters stay quiet
  const mine = [];
  fr.letters.forEach((t, i) => {
    t.setAttribute("font-size", f(13 / C.k));
    t.setAttribute("y", f(4.6 / C.k));
    const b = 15 * i;
    if (b === 0 || b > 270) mine.push({ t, b: b || 360 });
    else t.setAttribute("opacity", 0.35);
  });
  // the hour lit: the cell, its three mile-weys, its fifteen degrees
  const cell = node("path", { d: sector(HOUR, HOUR + 15, R.hollow, R.hours), fill: "currentColor", opacity: 0 }, g);
  const miles = [0, 1, 2].map((m) => node("path", { d: sector(HOUR + 5 * m, HOUR + 5 * m + 5, R.ladder, R.blocks), fill: SILVER, opacity: 0 }, g));
  const ones = [];
  for (let j = 0; j < 15; j++) ones.push(node("path", { d: sector(HOUR + j, HOUR + j + 1, R.hollow, R.ladder), fill: SILVER, opacity: 0 }, g));
  el.appendChild(svg);
  const s = { deg, mine, cell, miles, ones, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  const n = 90 * Math.min(1, Math.max(0, (t - 0.8) / 5)); // degrees struck so far
  s.deg.forEach((p, i) => p.setAttribute("opacity", f(Math.min(1, Math.max(0, n - i)) * out)));
  for (const m of s.mine) m.t.setAttribute("opacity", f((0.3 + 0.7 * Math.min(1, Math.max(0, (n - (m.b - 270) + 3) / 3))) * out + 0.3 * (1 - out)));
  const lit = span(t, 6.6, 7.0) * (1 - span(t, 11.2, 11.8));
  s.cell.setAttribute("opacity", f(0.12 * lit));
  s.miles.forEach((m, i) => m.setAttribute("opacity", f(0.45 * span(t, 7.4 + 0.6 * i, 7.6 + 0.6 * i) * (1 - span(t, 9.2, 9.5)))));
  s.ones.forEach((o, j) => o.setAttribute("opacity", f(0.55 * span(t, 9.4 + 0.1 * j, 9.5 + 0.1 * j) * (1 - span(t, 11.2, 11.8)))));
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
