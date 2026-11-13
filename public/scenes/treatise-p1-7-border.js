// A Treatise on the Astrolabe, Part I, 7: "Fro this litel + up to the ende of the lyne meridional, under the ring,
// shaltow finden the bordure devyded with 90 degrees; and by that same proporcioun is every quarter of thin
// Astrolabie devyded. Over the whiche degrees ther ben noumbres of augrim, that devyden thilke same degrees fro fyve
// to fyve, as sheweth by longe strykes by-twene."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The back, close on its upper right quarter: from the little cross at the east end up to the meridional line
// under the ring.  The degrees are struck one by one, counting up; every fifth is a long stroke, and at every tenth
// its number (ours in modern figures; the instrument has them every five, too close to read at this size).  At 90 the
// meridional line is reached; then the other three quarters fill at once, "by that same proporcioun".
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import { back, node, label, f, rim, SILVER, T } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 8000; // ms: the quarter counted, its numbers shown
const C = { x: -60, y: 60, k: 1.3 }; // the centre (down and to the left) and scale: the quarter fills the glass
const W = (px) => f(px / C.k); // stroke widths in window units
const CROSS = (T.altitude + T.border) / 2;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const seg = (deg, r0, r1) => {
  const a = rim(deg, r0);
  const b = rim(deg, r1);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible"; // the limb runs on past the square to the round glass
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  back(g, { scale: C.k, ticks: false, faint: 0.45 });
  // the cross lines as I 4 and I 5 drew them, quiet
  node("path", { d: `M0 -143V0H${f(CROSS - 4)}`, fill: "none", stroke: "currentColor", "stroke-width": W(1), opacity: 0.5 }, g);
  node("path", { d: `M${f(CROSS)} -4V4M${f(CROSS - 4)} 0H${f(CROSS + 4)}`, fill: "none", stroke: SILVER, "stroke-width": W(1.6), "stroke-linecap": "round" }, g);
  // the first quarter's strokes, one element each (they come in one by one), from the cross (bearing 90) up to 0
  const strokes = [];
  for (let i = 1; i <= 90; i++) {
    const long = i % 5 === 0;
    strokes.push(node("path", { d: seg(90 - i, long ? T.degrees : T.altitude, T.border), fill: "none", stroke: "currentColor", "stroke-width": W(long ? 1.1 : 0.6), opacity: 0 }, g));
  }
  // the other three quarters, all at once
  let d = "";
  for (let b = 90; b < 360; b++) d += seg(b, b % 5 ? T.altitude : T.degrees, T.border);
  const rest = node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": W(0.6), opacity: 0 }, g);
  // the numbers, every ten, just inside the scale
  const nums = [];
  for (let n = 10; n <= 90; n += 10) {
    const p = rim(90 - n, T.degrees - 7);
    const x = C.x + C.k * p[0];
    const y = C.y + C.k * p[1] + 5;
    nums.push(label(svg, x, y, String(n), 13));
  }
  const bead = node("circle", { r: 2.4, fill: SILVER, opacity: 0 }, g);
  el.appendChild(svg);
  const s = { strokes, rest, nums, bead, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  const count = 90 * Math.min(1, Math.max(0, (t - 0.8) / 5.4)); // degrees struck so far
  s.strokes.forEach((p, i) => p.setAttribute("opacity", f(Math.min(1, Math.max(0, count - i)) * out)));
  s.nums.forEach((n, i) => n.setAttribute("opacity", f(Math.min(1, Math.max(0, (count - 10 * (i + 1) + 2) / 2)) * out)));
  const b = rim(90 - count, (T.altitude + T.border) / 2);
  s.bead.setAttribute("cx", f(b[0]));
  s.bead.setAttribute("cy", f(b[1]));
  s.bead.setAttribute("opacity", f(span(t, 0.6, 0.9) * (1 - span(t, 6.2, 6.8))));
  s.rest.setAttribute("opacity", f(span(t, 7.0, 8.0) * 0.8 * out));
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
