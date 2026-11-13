// A Treatise on the Astrolabe, Part I, 23: "Thyn Almury is cleped the Denticle of Capricorne, or elles the Calculer.
// This same Almury sit fix in the bed of Capricorne, and it serveth of many a necessarie conclusioun in equaciouns of
// thinges."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-23-almury.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front with its rete.  The almury, the little tooth that stands out from the rete at the head of Capricorn, is
// lit and named; the rete turns, and the almury's point runs round the border's degrees; it comes to rest and the
// degree under its point is lit.  The tooth is our constructed drawing of inv. 47869's rete, where it stands on the
// head of Capricorn and reaches to the limb's ladder of degrees (shared lib/front.js and astrolabe-47869.js).
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 9000; // ms: at rest, the degree under its point lit
const C = { x: 0, y: 18, k: 0.62 }; // the hanging ring inside the window (its top 183 units up, at -95; astrolabist #47901)
const W = (px) => f(px / C.k);
const R = A.frontRadii;
const TOOTH = "M-1.7 -82.6H1.7V-74.6H-1.7Z"; // as in the rete's outline: at the head of Capricorn (the top, as drawn)
const REST = 63; // the rete's turn at rest, degrees clockwise

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  if (!A.rete.includes("M-1.7 -82.6 1.7 -82.6 1.7 -74.6 -1.7 -74.6Z")) throw new Error("the rete's outline has no almury where expected");
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  // the tooth, lit, on the rete; a ring about its point
  const tooth = node("path", { d: TOOTH, fill: SILVER, stroke: SILVER, "stroke-width": W(0.8), opacity: 0 }, fr.rete.g);
  const ring = node("circle", { cy: -82.6, r: 4.5, fill: "none", stroke: SILVER, "stroke-width": W(1), opacity: 0 }, fr.rete.g);
  // the degree under its point, on the limb's ladder
  const deg = node("path", { fill: SILVER, opacity: 0 }, g);
  const word = node("text", { "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  word.textContent = "almury";
  el.appendChild(svg);
  const s = { rete: fr.rete.g, tooth, ring, deg, word, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  const turn = REST * span(t, 3.2, 7.4) * (1 - span(t, 12.0, 12.8));
  s.rete.setAttribute("transform", `rotate(${f(turn)})`);
  const lit = span(t, 0.8, 1.4) * out;
  s.tooth.setAttribute("opacity", f(lit));
  s.ring.setAttribute("opacity", f(lit));
  // the name, beside the point, moving with it
  const p = rim(turn, 60); // inside the tooth, on its line to the pin
  s.word.setAttribute("x", f(C.x + C.k * p[0]));
  s.word.setAttribute("y", f(C.y + C.k * p[1] + 5));
  s.word.setAttribute("opacity", f(span(t, 1.3, 1.9) * out));
  // the degree under the point: one cell of the ladder, lit at rest
  const b0 = Math.floor(turn);
  const a = rim(b0, R.hollow);
  const b = rim(b0 + 1, R.hollow);
  const c = rim(b0 + 1, R.ladder);
  const d = rim(b0, R.ladder);
  s.deg.setAttribute("d", `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}L${f(c[0])} ${f(c[1])}L${f(d[0])} ${f(d[1])}Z`);
  s.deg.setAttribute("opacity", f(span(t, 7.5, 8.0) * out));
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
