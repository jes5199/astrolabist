// A Treatise on the Astrolabe, Part I, 5: "Over-thwart this for-seide longe lyne, ther crosseth him another lyne of
// the same lengthe from est to west. Of the whiche lyne, from a litel croys + in the bordure un-to the centre of the
// large hole, is cleped the Est lyne ... and the remenant of this lyne fro the forseide + un-to the bordure, is
// cleped the West lyne ... Now hastow here the foure quarters of thin Astrolabie."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-5-east-west.js: lib/back-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The back hung plumb, as in I 4, its south and north lines already there.  A little cross is marked in the border
// at the right hand (where the zodiac on the back begins, as in II 1); from it a gold line comes in to the hole:
// the east line; it goes on in silver to the left border: the west line.  Then the four quarters show in turn.
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import { back, node, label, f, SILVER, HOLE, T } from "./lib/back-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 8200; // ms: the cross and both lines drawn and named
const C = { x: 0, y: 26, k: 0.64 }; // as I 1 and I 4: the instrument hung plumb in the glass
const W = (px) => f(px / C.k); // stroke widths in window units
const TOP = -143; // where the meridional line leaves the ring (instrument units)
const CROSS = (T.altitude + T.border) / 2; // the little cross, in the border at the east end

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  back(g, { scale: C.k });
  // what I 4 drew: the south line (gold) and the north line (silver), quieter now
  node("path", { d: `M0 ${TOP}V${-HOLE}`, fill: "none", stroke: "currentColor", "stroke-width": W(1.4), opacity: 0.55 }, g);
  node("path", { d: `M0 ${HOLE}V${T.border}`, fill: "none", stroke: SILVER, "stroke-width": W(1.4), opacity: 0.45 }, g);
  // the four quarters, each lit in turn
  const quarters = [0, 1, 2, 3].map((q) => {
    const a = (q * Math.PI) / 2;
    const b = a + Math.PI / 2;
    const p = (ang, r) => `${f(r * Math.sin(ang))} ${f(-r * Math.cos(ang))}`;
    return node("path", { d: `M${p(a, HOLE)}L${p(a, 100)}A100 100 0 0 1 ${p(b, 100)}L${p(b, HOLE)}A${HOLE} ${HOLE} 0 0 0 ${p(a, HOLE)}Z`, fill: "currentColor", opacity: 0 }, g);
  });
  const line = (x0, x1, stroke) =>
    node("path", { d: `M${x0} 0H${x1}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke, "stroke-width": W(2.2), "stroke-linecap": "round" }, g);
  const east = line(CROSS - 4, HOLE, "currentColor");
  const west = line(-HOLE, -T.border, SILVER);
  const cross = node("path", { d: `M${f(CROSS)} -5V5M${f(CROSS - 5)} 0H${f(CROSS + 5)}`, fill: "none", stroke: SILVER, "stroke-width": W(2), "stroke-linecap": "round", opacity: 0 }, g);
  const glow = node("circle", { cx: f(CROSS), r: 9, fill: "none", stroke: SILVER, "stroke-width": W(1), opacity: 0 }, g);
  const labels = [label(svg, C.x + C.k * 52, C.y - 7, "east", 15), label(svg, C.x - C.k * 52, C.y - 7, "west", 15)];
  labels[0].setAttribute("fill", "currentColor");
  el.appendChild(svg);
  const s = { quarters, east, west, cross, glow, labels, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8); // fade away before the loop begins again
  const c = span(t, 0.8, 1.4);
  s.cross.setAttribute("opacity", f(c * out));
  s.glow.setAttribute("opacity", f(c * (1 - span(t, 1.6, 2.4)) * out));
  s.glow.setAttribute("r", f(9 + 8 * span(t, 1.0, 2.4)));
  s.east.setAttribute("stroke-dashoffset", f(1 - span(t, 2.0, 3.8)));
  s.east.setAttribute("opacity", f(out));
  s.west.setAttribute("stroke-dashoffset", f(1 - span(t, 4.6, 6.6)));
  s.west.setAttribute("opacity", f(out));
  s.labels[0].setAttribute("opacity", f(span(t, 3.2, 4.0) * out));
  s.labels[1].setAttribute("opacity", f(span(t, 6.0, 6.8) * out));
  // the four quarters, one after another, then all four together a moment
  s.quarters.forEach((q, i) => {
    const a = 8.6 + 0.6 * i;
    const one = span(t, a, a + 0.3) * (1 - span(t, a + 0.6, a + 0.9));
    const all = span(t, 11.0, 11.3) * (1 - span(t, 11.6, 12.0));
    q.setAttribute("opacity", f(0.16 * Math.max(one, all)));
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
