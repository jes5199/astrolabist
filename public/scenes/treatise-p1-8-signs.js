// A Treatise on the Astrolabe, Part I, 8: "Under the compas of thilke degrees ben writen the names of the Twelve
// Signes, as Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricornus, Aquarius,
// Pisces; and the nombres of the degrees of tho signes ben writen in augrim above, and with longe devisiouns, fro
// fyve to fyve."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The back, close on its lower edge, turned in the hand: the signs come round one after another, and each name is
// written in its place as it comes to the foot (engraved tops inwards, they read upright there) and is carried off.  Above the names, the
// degrees of the signs: a stroke each degree, a long one every five, a line where each sign begins.  Counter-clockwise
// from Aries at the right-hand point, as on our drawing of the instrument.
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import { back, node, f, rim, NIGHT, SILVER, T } from "./lib/back.js";

const instances = new WeakMap();
const NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const STEP = 1.25; // s for each sign to come round
const LOOP = 12 * STEP * 1000; // ms: once round (the loop joins without a seam)
const STILL = 300; // ms: Aries just written at the foot, Pisces and Aquarius before it
const C = { x: 0, y: -98, k: 1.6 }; // the centre (above the glass) and scale: the lower edge fills it
const W = (px) => f(px / C.k); // stroke widths in window units
const R_NAME = (T.signs + T.zodnum) / 2 - 2.6; // the names' baseline

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const seg = (b, r0, r1) => {
  const p = rim(b, r0);
  const q = rim(b, r1);
  return `M${f(p[0])} ${f(p[1])}L${f(q[0])} ${f(q[1])}`;
};
// the sign i (0 Aries) spans bearings 90 - 30 i down to 60 - 30 i (bearings clockwise from the top)
const mid = (i) => 75 - 30 * i;

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible"; // the limb runs on past the square to the round glass
  const turn = node("g", {}, node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg));
  const b = back(turn, { scale: C.k, ticks: false, faint: 0.45 });
  b.throne.setAttribute("display", "none"); // the suspension would swing through the picture as it turns
  b.ring.setAttribute("display", "none");
  b.g.lastChild.previousSibling.setAttribute("display", "none"); // the ring's gold outline
  // the degrees of the signs: a stroke each degree, long every five; a line where each sign begins
  let d = "";
  let e = "";
  for (let b = 0; b < 360; b++) {
    if (b % 30 === 0) e += seg(b, T.signs, T.altitude);
    else d += seg(b, b % 5 ? T.degrees : T.zodnum + 2.2, T.altitude);
  }
  node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": W(0.5), opacity: 0.85 }, turn);
  node("path", { d: e, fill: "none", stroke: "currentColor", "stroke-width": W(1) }, turn);
  // the names: each on an arc of its own sign, drawn counter-clockwise (so the letters' tops are inwards)
  const defs = node("defs", {}, turn);
  const names = NAMES.map((name, i) => {
    const a = rim(90 - 30 * i, R_NAME);
    const b = rim(60 - 30 * i, R_NAME);
    const id = `sg${uid}-${i}`;
    node("path", { id, d: `M${f(a[0])} ${f(a[1])}A${f(R_NAME)} ${f(R_NAME)} 0 0 0 ${f(b[0])} ${f(b[1])}` }, defs);
    const t = node("text", { "font-size": f(13 / C.k), fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": f(3 / C.k), "stroke-linejoin": "round", "paint-order": "stroke" }, turn);
    const tp = node("textPath", { href: `#${id}`, startOffset: "50%", "text-anchor": "middle" }, t);
    tp.textContent = name;
    return t;
  });
  el.appendChild(svg);
  const s = { turn, names, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  // turning clockwise, 30 degrees a sign: sign i's middle stands at the foot (bearing 180) when u = i
  const u = t / STEP; // signs come round so far
  const rot = 180 - mid(0) + 30 * u;
  s.turn.setAttribute("transform", `rotate(${f(rot % 360)})`);
  // a name is blank until its sign comes to the foot, written there, and carried off to the left
  s.names.forEach((n, i) => {
    const p = ((((u - i + 6) % 12) + 12) % 12) - 6; // how far past the foot it has gone, in signs
    n.setAttribute("opacity", f(span(p, -0.4, 0)));
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
