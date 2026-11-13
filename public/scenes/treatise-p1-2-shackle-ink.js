// A Treatise on the Astrolabe, Part I, 2: "This ring renneth in a maner turet, fast to the moder of thyn
// Astrolabie, in so rowm a space that hit desturbeth nat the instrument to hangen after his righte centre."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Close on the suspension.  The ring runs loosely in the shackle (the "turet"): the hand above tips it this way and
// that, and the body below does not follow; it hangs after its right centre, on the plumb line.  COLOURED WOODCUT on
// vellum (jes tg 17847), replacing treatise-p1-2-shackle.js: shared lib/front-ink.js and lib/woodcut.js (our
// constructed drawing of Oxford inv. 47869).  Original line work; nothing traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, SILVER, VELLUM, WASH } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 12000;
const K = 1.5;
const C = { x: 0, y: 215 }; // the instrument's centre, far below the window: we look at its top
const EYE = -146; // where the ring passes through the shackle, instrument units above the centre
const W = (px) => f(px / K);

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${K})` }, svg);
  // the plumb line through the ring's eye and the centre
  const plumb = node("line", { x1: 0, y1: EYE - 62, x2: 0, y2: 0, stroke: SILVER, "stroke-width": W(1), "stroke-dasharray": `${W(4)} ${W(4)}` }, g);
  const fr = front(g, { scale: K, plate: false, rete: false, letters: false });
  fr.throne.setAttribute("display", "none"); // drawn here piece by piece: the shackle moves on its own
  const wc = fr.wc;
  const H = wc.hatch(45, 2.6 / K, 0.9 / K);
  const piece = (parent, key) => {
    node("path", { d: A.throneFront[key], fill: VELLUM }, parent);
    node("path", wc.wash({ d: A.throneFront[key], fill: WASH.red }), parent);
    node("path", { d: A.throneFront[key], fill: H, stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, parent);
  };
  const body = node("g", { filter: wc.rough }, g);
  for (const key of ["base", "boss", "stem"]) piece(body, key);
  const ring = node("g", { filter: wc.rough }, g);
  node("path", { d: A.throneFront.ring, fill: "none", stroke: SILVER, "stroke-width": W(2.2) }, ring);
  // the thumb's place in the ring: a peg under its top
  node("line", { x1: -8, y1: EYE - 35, x2: 8, y2: EYE - 35, stroke: "currentColor", "stroke-width": W(3.4), "stroke-linecap": "round" }, ring);
  const shackle = node("g", { filter: wc.rough }, g);
  piece(shackle, "shackle");
  el.appendChild(svg);
  const s = { ring, shackle, plumb, raf: 0, t0: 0, tm: LOOP * 0.25 };
  instances.set(el, s);
  draw(s, 0.25); // the still: the ring tipped to one side, the body plumb
}

function draw(s, u) {
  const a = 38 * Math.sin(u * 2 * Math.PI) + 6 * Math.sin(u * 6 * Math.PI);
  s.ring.setAttribute("transform", `rotate(${f(a)} 0 ${EYE})`);
  s.shackle.setAttribute("transform", `rotate(${f(a * 0.12)} 0 ${EYE + 6})`);
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
