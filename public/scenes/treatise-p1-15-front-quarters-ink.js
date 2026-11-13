// A Treatise on the Astrolabe, Part I, 15: "The wombe-side of thyn Astrolabie is also devyded with a longe croys in
// foure quarters from est to west, fro south to north, fro right syde to left syde, as is the bak-syde."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-15-front-quarters.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front, hung plumb, its plate quiet.  The long cross is drawn: from the ring down to the north, then from the
// east (on the left of the front: the instrument's right side, as I 6 has it) across to the west; the four quarters
// light in turn.  Shared drawing of the front (lib/front.js, from our constructed drawing of Oxford inv. 47869; the
// plate computed for its latitude).  Original line work; nothing is traced.

import { front, node, f, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 8200; // ms: the cross drawn and named
const C = { x: 0, y: 22, k: 0.68 }; // hung plumb, as I 1
const W = (px) => f(px / C.k);

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.5 });
  fr.plate.g.setAttribute("opacity", 0.45);
  for (const l of fr.letters) l.setAttribute("opacity", 0.55);
  // the four quarters, each lit in turn
  const quarters = [0, 1, 2, 3].map((q) => {
    const a = (q * Math.PI) / 2;
    const b = a + Math.PI / 2;
    const p = (ang) => `${f(100 * Math.sin(ang))} ${f(-100 * Math.cos(ang))}`;
    return node("path", { d: `M0 0L${p(a)}A100 100 0 0 1 ${p(b)}Z`, fill: "currentColor", opacity: 0 }, g);
  });
  const line = (d, stroke) => node("path", { d, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke, "stroke-width": W(2), "stroke-linecap": "round" }, g);
  const ns = line("M0 -143V100", "currentColor"); // from the ring down: south, then north
  const ew = line("M-100 0H100", SILVER); // from the east (left) across to the west
  const word = (x, y, s, anchor) => {
    const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = s;
    return t;
  };
  const ys = (y) => C.y + C.k * y;
  const words = [word(5, ys(-40), "south", "start"), word(5, ys(62), "north", "start"), word(-62, ys(0) - 6, "east", "middle"), word(62, ys(0) - 6, "west", "middle")];
  el.appendChild(svg);
  const s = { quarters, ns, ew, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  s.ns.setAttribute("stroke-dashoffset", f(1 - span(t, 0.8, 2.8)));
  s.ew.setAttribute("stroke-dashoffset", f(1 - span(t, 3.4, 5.2)));
  for (const p of [s.ns, s.ew]) p.setAttribute("opacity", f(out));
  const at = [1.6, 2.6, 4.0, 5.0];
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, at[i], at[i] + 0.5) * out)));
  s.quarters.forEach((q, i) => {
    const a = 6.2 + 0.7 * i;
    const one = span(t, a, a + 0.3) * (1 - span(t, a + 0.7, a + 1.0));
    q.setAttribute("opacity", f(0.14 * one * out));
  });
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
