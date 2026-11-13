// A Treatise on the Astrolabe, Part I, 1: "Thyn Astrolabie hath a ring to putten on the thoumbe of thy right
// hand in taking the heighte of thinges."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The instrument hangs by its ring from a peg (the thumb's place), swings as a thing hung does, and comes to rest
// plumb; the ring shows red.  COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-1-ring.js: shared
// lib/front-ink.js (our constructed drawing of Oxford inv. 47869, the plate computed; cut and washed by
// lib/woodcut.js).  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, SILVER } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const C = { x: 0, y: 26, k: 0.64 };
const W = (px) => f(px / C.k);
const PIVOT = -181; // where the ring bears on the thumb, instrument units above the centre
const SWING = 13; // degrees

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (u, a, b) => ease((u - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const hang = node("g", {}, g);
  const fr = front(hang, { scale: C.k, letters: false });
  // as light as a first look should be: the circles of altitude every ten degrees; no azimuths, no hour lines
  for (const a of fr.plate.almucantars) if (a.h % 10) a.el.setAttribute("display", "none");
  for (const z of fr.plate.azimuths) z.el.setAttribute("display", "none");
  for (const h of fr.plate.hours) h.setAttribute("display", "none");
  fr.rete.g.setAttribute("transform", `rotate(${A.morning.rot})`);
  const ring = node("path", { d: A.throneFront.ring, fill: "none", stroke: SILVER, "stroke-width": W(1.8), filter: fr.wc.rough }, hang);
  // the peg it hangs on
  node("line", { x1: -9, y1: PIVOT + 2.2, x2: 9, y2: PIVOT + 2.2, stroke: "currentColor", "stroke-width": W(2.6), "stroke-linecap": "round" }, g);
  el.appendChild(svg);
  const s = { hang, ring, raf: 0, t0: 0, tm: LOOP * 0.8 };
  instances.set(el, s);
  draw(s, 0.8); // the still: at rest, plumb, the ring shown
}

function draw(s, u) {
  // let go from one side, the swing dying away; at rest for the last third
  const x = Math.min(1, u / 0.62);
  const a = SWING * Math.exp(-3.6 * x) * Math.cos(x * Math.PI * 7) * (1 - span(x, 0.85, 1)) * (1 - span(u, 0.95, 1)) + SWING * span(u, 0.95, 1);
  s.hang.setAttribute("transform", `rotate(${f(a)} 0 ${PIVOT})`);
  s.ring.setAttribute("opacity", f(0.25 + 0.75 * span(u, 0.62, 0.7) * (1 - span(u, 0.92, 0.97))));
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, s.tm / LOOP);
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
  draw(s, s.tm / LOOP);
}
