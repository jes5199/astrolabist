// A Treatise on the Astrolabe, Part I, 6: "The est side of thyn Astrolabie is cleped the right side, and the west
// side is cleped the left side. Forget nat this, litel Lowis. Put the ring of thyn Astrolabie upon the thoumbe of
// thy right hand, and thanne wole his right syde be toward thy left syde, and his left syde wol be toward thy right
// syde."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A painted miniature: Lewis, turned to us, holds the instrument up by its ring on his right hand (on our left),
// looking at its front; we see its back.  The little cross is marked at the east end, and the east line, on its
// right side, lies toward the boy's left; the west line toward his right.  His left hand opens to his left side.
// The figure is the film's front view of Lewis (figures-rig.js, lewisFront); the instrument is painted by
// lib/painted.js (our constructed drawing of Oxford inv. 47869).  Our own drawing throughout; nothing is traced.

import RIG from "./lib/figures-rig.js";
import { build } from "./lib/figures.js";
import { instrument, PIVOT } from "./lib/painted.js";
import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 12000;
const STILL = 7600; // ms: both lines drawn and named, his left hand open
const INK = "#17100d";
const RED = "#b3261e"; // the rubricator's red
const SILVER = "#e4e7f3";
const NIGHT = "#0a1030";
const S = 0.36; // the boy's scale (his own units to the window's)
const AT = [56, 136]; // where his feet stand, in the window's units (below the glass: we see him half-length)
const DIA = 72; // the instrument's diameter, window units
const T = A.backTiers;
const CROSS = (T.altitude + T.border) / 2;

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const clamp = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => ((u = clamp(u)), u * u * (3 - 2 * u));
const es = (t, a, b) => ease((t - a) / (b - a));
const f = (n) => (Math.round(n * 100) / 100).toString();

// the wall behind him: the chamber's diaper (a gold lattice, a small flower in every cell), at this scale
function wall(svg, uid) {
  const defs = node("defs", {}, svg);
  const lat = node("pattern", { id: "lat" + uid, width: 23.2, height: 29, patternUnits: "userSpaceOnUse", x: -11.6, y: -14.5 }, defs);
  node("path", { d: "M0 0L23.2 29M23.2 0L0 29", stroke: "#dcb44c", "stroke-width": 0.8, fill: "none" }, lat);
  node("circle", { cx: 11.6, cy: 14.5, r: 1.4, fill: "#dcb44c" }, lat);
  for (const fill of ["#7d2622", `url(#lat${uid})`]) node("rect", { x: -130, y: -130, width: 260, height: 260, fill }, svg);
}

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.overflow = "visible"; // the picture runs on to the edge of the round glass
  svg.style.fontFamily = "inherit";
  wall(svg, uid);
  // the boy in two layers: body and head, then the arms; the instrument hangs between (the ring over the thumb)
  const style = { contour: RIG.contour, contourWidth: RIG.contourWidth };
  const boy = build(RIG.lewisFront, style, S * 2.4, [35]);
  svg.appendChild(boy.layers[0]);
  const inst = instrument(svg, DIA);
  const K = DIA / 200;
  const w = (px) => +(px / K).toFixed(3);
  const bk = inst.back;
  // on its back: the meridional line, quiet; the east line (red) from the little cross, the west line (ink)
  node("path", { d: `M0 -100V${T.border}`, stroke: INK, "stroke-width": w(0.5), opacity: 0.6 }, bk);
  const line = (x0, x1, stroke) => node("path", { d: `M${x0} 0H${x1}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke, "stroke-width": w(2), "stroke-linecap": "round" }, bk);
  const east = line(CROSS - 4, 0, RED);
  const west = line(0, -T.border, INK);
  const cross = node("path", { d: `M${f(CROSS)} -9V9M${f(CROSS - 9)} 0H${f(CROSS + 9)}`, stroke: RED, "stroke-width": w(1.8), "stroke-linecap": "round", opacity: 0 }, bk);
  svg.appendChild(boy.layers[1]);
  const text = (x, y, str, anchor) => {
    const t = node("text", { x, y, "text-anchor": anchor, "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const labels = [text(0, 0, "east", "middle"), text(0, 0, "west", "middle")];
  el.appendChild(svg);
  const s = { inst, boy, east, west, cross, labels, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - es(t, 11.2, 11.9); // the lines and words fade before the loop begins again
  const open = es(t, 6.2, 7.0) * (1 - es(t, 10.4, 11.9)); // his left hand opens out to his left side, and comes back
  // the boy (the rig's _l side is on our left: his right arm, raised; his left arm, _r, on our right)
  const a = {
    uarm_l: 76 + 2 * Math.sin((2 * Math.PI * t) / 4),
    farm_l: 22,
    hand_l: -8,
    uarm_r: -6 - 34 * open,
    farm_r: 4 - 40 * open,
    hand_r: -10 * open,
    head: 6 + 1.5 * Math.sin((2 * Math.PI * t) / 3.7),
    torso: 0.7 * Math.sin((2 * Math.PI * t) / 4.9),
  };
  s.boy.pose({ a }, [S, 0, 0, S, AT[0], AT[1]]);
  const hook = s.boy.point("hand_l", -12, 22); // the top of the hand, where the thumb is
  const sway = 3 * Math.sin((2 * Math.PI * t) / 2.3) + 2 * Math.sin((2 * Math.PI * t) / 4);
  s.inst.set(hook, sway, Math.PI); // its back to us
  const cy = hook[1] - PIVOT * (DIA / 200); // its centre, near enough (the sway is small)
  for (const [lb, x] of [[s.labels[0], hook[0] + 22], [s.labels[1], hook[0] - 22]]) {
    lb.setAttribute("x", f(x));
    lb.setAttribute("y", f(cy + DIA / 2 + 15)); // under the instrument, below each end of its line
  }
  // the cross, the east line, the west line, the words
  s.cross.setAttribute("opacity", f(es(t, 1.0, 1.6) * out));
  s.east.setAttribute("stroke-dashoffset", f(1 - es(t, 1.8, 3.4)));
  s.east.setAttribute("opacity", f(out));
  s.west.setAttribute("stroke-dashoffset", f(1 - es(t, 4.0, 5.6)));
  s.west.setAttribute("opacity", f(out));
  s.labels[0].setAttribute("opacity", f(es(t, 3.0, 3.8) * out));
  s.labels[1].setAttribute("opacity", f(es(t, 5.2, 6.0) * out));
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
