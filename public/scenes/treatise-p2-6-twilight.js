// A Treatise on the Astrolabe, Part II, 6: "Set the nadir of thy sonne up-on 18 degrees of heighte among thyn
// almikanteras on the west syde, and ley thy label on the degree of thy sonne, and thanne shal the poynt of thy label
// schewe the spring of day ... The nadir of the sonne is thilke degree that is opposit to the degree of the sonne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Why the rule works, in the sky itself: a cut through the heavens, east on the left.  Before morning the sun climbs
// toward the eastern horizon and its nadir, the opposite point, sinks toward the western; when the sun is 18 degrees
// below the horizon its nadir stands 18 degrees above it, and the day springs (the eastern sky begins to glow).  In
// the evening the same, mirrored: when the sun has sunk 18 degrees in the west, its nadir stands 18 degrees up in the
// east, and it is very night.  Shared lib/sky.js.  Original line work.

import { cut, sun, node, f, span, arcFromHorizon, label, SILVER, FAINT } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 4000; // ms: dawn: the sun 18 below in the east, its nadir 18 up in the west

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const sky = cut(svg, { O: [0, 22], R: 70 });
  const { O, R } = sky;
  // the heavens' circle: whole above, dotted below
  node("path", { d: `M${f(O[0] - R)} ${f(O[1])}A${R} ${R} 0 0 1 ${f(O[0] + R)} ${f(O[1])}`, fill: "none", stroke: FAINT, "stroke-width": 0.8, opacity: 0.8 }, svg);
  node("path", { d: `M${f(O[0] - R)} ${f(O[1])}A${R} ${R} 0 0 0 ${f(O[0] + R)} ${f(O[1])}`, fill: "none", stroke: FAINT, "stroke-width": 0.7, "stroke-dasharray": "2 3", opacity: 0.6 }, svg);
  // the line from the sun through the centre to its nadir
  const axis = node("line", { stroke: FAINT, "stroke-width": 0.7, "stroke-dasharray": "3 3" }, svg);
  const arcs = [node("path", { fill: "none", stroke: SILVER, "stroke-width": 1.1, opacity: 0 }, svg), node("path", { fill: "none", stroke: SILVER, "stroke-width": 1.1, opacity: 0 }, svg)];
  const s1 = sun(svg, 5);
  const nadir = node("circle", { r: 3.6, fill: "none", stroke: SILVER, "stroke-width": 1.2 }, svg);
  const words = {
    up: label(svg, 0, 0, "18°", 13),
    down: label(svg, 0, 0, "18°", 13),
    nadir: label(svg, 0, 0, "nadir", 13),
    when: label(svg, 0, 0, "", 15),
  };
  el.appendChild(svg);
  const s = { sky, axis, arcs, s1, nadir, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// the sun's altitude through the loop: morning in the east (side -1), evening in the west (side +1), each with a
// pause at 18 below, the moment the rule is about
function course(t) {
  const morning = t < 8;
  const u = morning ? t : t - 8;
  const k = (a, b) => Math.min(1, Math.max(0, (u - a) / (b - a)));
  const alt = morning ? -40 + 22 * k(0.3, 2.4) + 22 * k(5.4, 7.6) : 4 - 22 * k(0.3, 2.4) - 22 * k(5.4, 7.6);
  const hold = span(u, 2.2, 2.6) * (1 - span(u, 5.2, 5.6));
  return { morning, u, alt, hold, side: morning ? -1 : 1 };
}

function draw(s, t) {
  const { O, at, glows } = s.sky;
  const { morning, u, alt: a, hold, side } = course(t);
  const sp = at(a, side);
  const np = at(-a, -side); // the nadir: opposite through the centre
  s.s1.set(sp[0], sp[1]);
  s.nadir.setAttribute("cx", f(np[0]));
  s.nadir.setAttribute("cy", f(np[1]));
  for (const [k, v] of [["x1", sp[0]], ["y1", sp[1]], ["x2", np[0]], ["y2", np[1]]]) s.axis.setAttribute(k, f(v));
  // the glow on the sun's side: none while it is more than 18 below, full at the horizon
  const light = Math.min(1, Math.max(0, (a + 18) / 18)) * 0.8 + 0.25 * hold;
  glows.east.setAttribute("opacity", f(morning ? light : 0));
  glows.west.setAttribute("opacity", f(morning ? 0 : light));
  // during the pause: the two angles of 18, the words
  s.arcs[0].setAttribute("d", arcFromHorizon(O, side, a, 26));
  s.arcs[1].setAttribute("d", arcFromHorizon(O, -side, -a, 26));
  for (const p of s.arcs) p.setAttribute("opacity", f(hold));
  const lab = (w, side2, alt2) => {
    const r = 37;
    const q = [O[0] + side2 * r * Math.cos(((alt2 / 2) * Math.PI) / 180), O[1] - r * Math.sin(((alt2 / 2) * Math.PI) / 180) + 4.5];
    w.setAttribute("x", f(q[0]));
    w.setAttribute("y", f(q[1]));
    w.setAttribute("opacity", f(hold));
  };
  lab(s.words.down, side, a);
  lab(s.words.up, -side, -a);
  s.words.nadir.setAttribute("x", f(np[0]));
  s.words.nadir.setAttribute("y", f(np[1] - 8));
  s.words.nadir.setAttribute("opacity", f(span(u, 0.4, 0.9) * (1 - span(u, 7.3, 7.8))));
  s.words.when.textContent = morning ? "dawn" : "night";
  s.words.when.setAttribute("x", f(side * 52));
  s.words.when.setAttribute("y", f(O[1] - 9));
  s.words.when.setAttribute("opacity", f(hold));
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
