// A Treatise on the Astrolabe, Part I, 18: "Upon this forseide plate ben compassed certein cercles that highten
// Almicanteras, of which som of hem semen perfit cercles, and somme semen inperfit. The centre that standith a-middes
// the narwest cercle is cleped the Senith; and the netherest cercle, or the firste cercle, is clepid the Orisonte ...
// Thise Almicanteras ben compowned by two and two."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The plate, close.  First the horizon, named; then the circles of altitude rise from it two degrees at a time, the
// low ones cut off by the plate's edge (imperfect), the high ones whole, to the narrowest; at its middle the zenith,
// named.  The plate is computed for the latitude of inv. 47869's plate in our drawing (shared lib/front.js).
// Original line work; nothing is traced.

import { front, node, f, ZENITH, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 7600; // ms: every circle up, horizon and zenith named
const C = { x: 0, y: 6, k: 1.16 };
const W = (px) => f(px / C.k);

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  for (const a of fr.plate.azimuths) a.el.setAttribute("display", "none");
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  for (const a of fr.plate.almucantars) a.el.setAttribute("stroke", "currentColor");
  fr.plate.horizon.setAttribute("stroke-width", W(1.6));
  const zen = node("circle", { cx: 0, cy: f(-ZENITH), r: f(2.4), fill: SILVER, opacity: 0 }, g);
  const word = (x, y, s) => {
    const t = node("text", { x: f(x), y: f(y), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = s;
    return t;
  };
  const [hc, hr] = almucantar(0);
  const words = [word(0, C.y + C.k * (-hc + hr) + 15, "horizon"), word(0, C.y - C.k * ZENITH - 8, "zenith")];
  el.appendChild(svg);
  const s = { horizon: fr.plate.horizon, alm: fr.plate.almucantars, zen, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  s.horizon.setAttribute("opacity", f(span(t, 0.5, 1.2) * out + 0.25 * (1 - out)));
  s.words[0].setAttribute("opacity", f(span(t, 1.1, 1.6) * out));
  // two by two, from the horizon up: the circle of h degrees comes at a time in proportion
  const up = 88 * span(t, 1.8, 6.4);
  for (const a of s.alm) a.el.setAttribute("opacity", f(Math.min(1, Math.max(0, (up - a.h + 2) / 2)) * (a.h % 10 ? 0.6 : 0.95) * out));
  s.zen.setAttribute("opacity", f(span(t, 6.3, 6.7) * out));
  s.words[1].setAttribute("opacity", f(span(t, 6.6, 7.1) * out));
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
