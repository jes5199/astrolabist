// A Treatise on the Astrolabe, Part II, 35: "Tak the altitude of any sterre that is cleped a planete ... And tak eek anon
// the altitude of any sterre fix ... Come thanne agayn the thridde or the ferthe night next folwing ... Awaite wel thanne
// whan that thy sterre fix is in the same altitude that she was whan thou toke hir firste altitude; and tak than
// eftsones the altitude of the forseide planete ... yif so be that this planete be up-on the est syde whan his altitude
// is taken, so that his secounde altitude be more than his firste altitude, thanne is he retrograde."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Facing east, the stars climbing along their slanting paths (38 degrees to the horizon at Oxford).  A fixed star and a
// planet, their altitudes taken; on the fourth night, when the star stands at the same altitude again, the planet's
// altitude taken anew.  First a planet moving forward among the stars: lower, direct; then one going back: higher,
// retrograde.  The altitudes are illustrative.  Shared lib/sky.js.  Original line work.

import { node, f, span, seeded, label, SILVER, FAINT, NIGHT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 5600; // ms: the direct planet, both altitudes, named
const H0 = 66; // the horizon's height in the window
const K = 3.2; // window units per degree of altitude
const yOf = (alt) => H0 - K * alt;
const RAD = Math.PI / 180;
const U = [Math.cos(38 * RAD), -Math.sin(38 * RAD)]; // up a star's path: rightward (toward the south) and up
const STAR = [-34, yOf(26)];
const P1 = [18, yOf(18)];
const SHIFT = 15; // how far the planet moves among the stars in three nights, along the path (window units)
const ACTS = [
  { sign: -1, word: "lower: direct" }, // moved forward (eastward): back down its path
  { sign: 1, word: "higher: retrograde" },
];

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const rnd = seeded(35);
  for (let i = 0; i < 46; i++) node("circle", { cx: f(-100 + rnd() * 200), cy: f(-100 + rnd() * (H0 + 90)), r: f(0.5 + rnd() * 0.7), fill: SILVER, opacity: f(0.2 + rnd() * 0.4) }, svg);
  // the slanting paths of the rising stars
  for (let i = -6; i <= 6; i++) {
    const x0 = -140 + i * 26;
    node("line", { x1: f(x0), y1: f(H0), x2: f(x0 + U[0] * 220), y2: f(H0 + U[1] * 220), stroke: FAINT, "stroke-width": 0.5, opacity: 0.35 }, svg);
  }
  node("rect", { x: -120, y: H0, width: 240, height: 80, fill: "#050816" }, svg);
  node("line", { x1: -110, y1: H0, x2: 110, y2: H0, stroke: "currentColor", "stroke-width": 1.2 }, svg);
  label(svg, 0, H0 + 17, "east", 13).setAttribute("opacity", 0.9);
  // the fixed star, the same altitude both nights
  node("path", { d: "M0 -5L1.3 -1.3L5 0L1.3 1.3L0 5L-1.3 1.3L-5 0L-1.3 -1.3Z", transform: `translate(${STAR[0]} ${f(STAR[1])})`, fill: SILVER }, svg);
  node("line", { x1: STAR[0], y1: H0, x2: STAR[0], y2: f(STAR[1] + 6), stroke: SILVER, "stroke-width": 1, "stroke-dasharray": "2 2", opacity: 0.6 }, svg);
  label(svg, STAR[0] - 8, STAR[1] + 4, "star", 13, "end").setAttribute("opacity", 0.9);
  // the planet: night 1, night 4; their altitudes
  const p1 = node("circle", { cx: P1[0], cy: f(P1[1]), r: 3.4, fill: SUN, opacity: 0 }, svg);
  const p4 = node("circle", { r: 3.4, fill: "none", stroke: SUN, "stroke-width": 1.4, opacity: 0 }, svg);
  const bar1 = node("line", { x1: P1[0] - 22, x2: P1[0] - 22, y1: H0, y2: f(P1[1]), stroke: SUN, "stroke-width": 2, opacity: 0 }, svg);
  const bar4 = node("line", { y1: H0, stroke: SUN, "stroke-width": 2, "stroke-dasharray": "3 2", opacity: 0 }, svg);
  const t1 = label(svg, P1[0] + 8, P1[1] + 4, "night 1", 12.5, "start");
  const t4 = label(svg, 0, 0, "night 4", 12.5, "start");
  const verdict = label(svg, 0, -76, "", 15);
  el.appendChild(svg);
  const s = { p1, p4, bar1, bar4, t1, t4, verdict, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const i = t < 8 ? 0 : 1;
  const u = t - 8 * i;
  const a = ACTS[i];
  const out = 1 - span(u, 7.2, 7.8);
  s.p1.setAttribute("opacity", f(span(u, 0.4, 0.9) * out));
  s.t1.setAttribute("opacity", f(span(u, 0.6, 1.1) * out));
  s.bar1.setAttribute("opacity", f(span(u, 1.0, 1.5) * out));
  const p4 = [P1[0] + a.sign * SHIFT * U[0], P1[1] + a.sign * SHIFT * U[1]];
  s.p4.setAttribute("cx", f(p4[0]));
  s.p4.setAttribute("cy", f(p4[1]));
  s.p4.setAttribute("opacity", f(span(u, 2.6, 3.1) * out));
  s.t4.setAttribute("x", f(p4[0] + 8));
  s.t4.setAttribute("y", f(p4[1] + (a.sign > 0 ? -6 : 14)));
  s.t4.setAttribute("opacity", f(span(u, 2.8, 3.3) * out));
  for (const [k, v] of [["x1", P1[0] - 16], ["x2", P1[0] - 16], ["y2", p4[1]]]) s.bar4.setAttribute(k, f(v));
  s.bar4.setAttribute("opacity", f(span(u, 3.3, 3.8) * out));
  s.verdict.textContent = a.word;
  s.verdict.setAttribute("opacity", f(span(u, 4.2, 4.8) * out));
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
