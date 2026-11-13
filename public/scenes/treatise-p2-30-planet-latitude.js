// A Treatise on the Astrolabe, Part II, 30: "Lok whan that a planete is in the lyne meridional, yif that hir altitude be
// of the same heyghte that is the degree of the sonne for that day, and than is the planete in the verrey wey of the
// sonne, and hath no latitude. And yif the altitude of the planete be heyere than the degree of the sonne, than is the
// planete north fro the wey of the sonne ... And yif the altitude of the planete be lasse ... thanne is the planete
// south ... This is to seyn, fro the wey wher-as the sonne wente thilke day."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A piece of the meridian, enlarged, with its degrees of altitude.  The sun's height on the meridian that day (12 March:
// 38.4) is marked as its way; a planet on the meridian stands higher: north of the sun's way by the difference; then
// another, lower: south of it.  Shared lib/sky.js.  Original line work.

import { node, f, span, seeded, label, SILVER, FAINT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 4600; // ms: the planet north of the sun's way, measured
const WAY = 38.4; // the sun's height on the meridian that day
const ACTS = [
  { alt: WAY + 3, word: "3° north" },
  { alt: WAY - 2, word: "2° south" },
];
// a piece of the meridian, enlarged: altitudes 30 to 47 up the window
const X = -24;
const yOf = (alt) => 78 - (alt - 30) * 9.2;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const rnd = seeded(30);
  for (let i = 0; i < 40; i++) node("circle", { cx: f(-100 + rnd() * 200), cy: f(-100 + rnd() * 200), r: f(0.5 + rnd() * 0.7), fill: SILVER, opacity: f(0.25 + rnd() * 0.4) }, svg);
  // the meridian, its degrees of altitude (a long mark every five)
  node("line", { x1: X, y1: f(yOf(30)), x2: X, y2: f(yOf(47)), stroke: FAINT, "stroke-width": 1 }, svg);
  let d = "";
  for (let a = 30; a <= 47; a++) d += `M${X - (a % 5 ? 3 : 6)} ${f(yOf(a))}H${X}`;
  node("path", { d, stroke: FAINT, "stroke-width": 0.9 }, svg);
  for (const a of [30, 35, 40, 45]) label(svg, X - 9, yOf(a) + 4.5, `${a}°`, 12, "end").setAttribute("opacity", 0.75);
  label(svg, X, yOf(47) - 8, "on the meridian", 13).setAttribute("opacity", 0.85);
  // the sun's way that day
  node("line", { x1: X - 10, y1: f(yOf(WAY)), x2: X + 12, y2: f(yOf(WAY)), stroke: SUN, "stroke-width": 2.2 }, svg);
  node("circle", { cx: X, cy: f(yOf(WAY)), r: 3.6, fill: SUN }, svg);
  label(svg, X + 16, yOf(WAY) + 4.5, "the sun's way", 13, "start").setAttribute("opacity", 1);
  const planet = node("circle", { cx: X, r: 3.8, fill: SILVER, opacity: 0 }, svg);
  const span1 = node("line", { x1: X + 8, x2: X + 8, y1: f(yOf(WAY)), stroke: SILVER, "stroke-width": 2.4, opacity: 0 }, svg);
  const word = label(svg, X + 16, 0, "", 14, "start");
  el.appendChild(svg);
  const s = { planet, span1, word, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const act = t < 7 ? 0 : 1;
  const u = t - 7 * act;
  const a = ACTS[act];
  const out = 1 - span(u, 6.2, 6.9);
  s.planet.setAttribute("cy", f(yOf(a.alt)));
  s.planet.setAttribute("opacity", f(span(u, 0.5, 1.2) * out));
  s.span1.setAttribute("y2", f(yOf(a.alt)));
  s.span1.setAttribute("opacity", f(span(u, 1.8, 2.3) * out));
  s.word.textContent = `planet ${a.word}`;
  s.word.setAttribute("y", f(yOf(a.alt) + 4.5));
  s.word.setAttribute("opacity", f(span(u, 2.4, 2.9) * out));
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
