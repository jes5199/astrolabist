// A Treatise on the Astrolabe, Prologue: "I seye a certein of conclusiouns, for three causes. The furste cause is
// this: truste wel that alle the conclusiouns that han ben founde, or elles possibly mighten be founde in so noble an
// instrument as an Astrolabie, ben un-knowe perfitly to any mortal man in this regioun, as I suppose."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The first cause (jes tg 17876).  COLOURED WOODCUT on vellum.  The instrument, small; out of it the conclusions,
// numbered, spiral away, fainter as they go, on past the edge of the leaf: more than anyone knows.  Then "a certein"
// of them, the forty-six that Part II teaches, come up in the printer's red.  Shared lib/front-ink.js; our own
// drawing.

import { front, node, f, RED, VELLUM } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 10500; // ms: all the numbers out, the taught ones red
const C = { x: 0, y: -6, k: 0.3 }; // the instrument, small, in the middle
const N = 300; // numbers drawn; beyond the leaf they go on unseen
const TAUGHT = 46; // Part II's conclusions
const GOLDEN = 137.508;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// where number n stands: a spiral out from the instrument's rim
const place = (n) => {
  const r = 34 + 5.3 * Math.sqrt(n);
  const a = (n * GOLDEN * Math.PI) / 180;
  return [C.x + r * Math.cos(a), C.y + r * Math.sin(a) * 0.92];
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const nums = [];
  for (let n = 1; n <= N; n++) {
    const [x, y] = place(n);
    const t = node("text", { x: f(x), y: f(y + 3), "text-anchor": "middle", "font-size": f(Math.max(4.2, 8.6 - n * 0.016)), "font-weight": 600, fill: "currentColor", opacity: 0, "font-family": "inherit" }, svg);
    t.textContent = n;
    nums.push(t);
  }
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k });
  for (const a of fr.plate.almucantars) if (a.h % 10) a.el.setAttribute("display", "none");
  for (const z of fr.plate.azimuths) z.el.setAttribute("display", "none");
  fr.rete.g.setAttribute("transform", "rotate(44.6)");
  const word = (y, str) => {
    const t = node("text", { x: 0, y, "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const w1 = word(90, "more than anyone knows");
  const w2 = word(90, "a certain number, taught here");
  el.appendChild(svg);
  const s = { nums, w1, w2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  const red = span(t, 7.0, 8.0);
  s.nums.forEach((e, i) => {
    const n = i + 1;
    const at = 0.4 + 6 * Math.sqrt(n / N); // they come out one after another, faster and faster
    const fade = Math.max(0.15, 1 - n / 340); // fainter as they go
    const taught = n <= TAUGHT;
    const a = span(t, at, at + 0.4) * out * (taught ? 1 : fade * (1 - 0.5 * red));
    e.setAttribute("opacity", f(a));
    if (taught) e.setAttribute("fill", red > 0.5 ? RED : "currentColor");
  });
  s.w1.setAttribute("opacity", f(span(t, 4.8, 5.4) * (1 - span(t, 6.6, 7.0))));
  s.w2.setAttribute("opacity", f(span(t, 7.6, 8.2) * out));
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
