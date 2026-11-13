// A Treatise on the Astrolabe, Part II, 2: "To knowe the altitude of the sonne".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Two views of one instrument, turning in step.  Left: the back, face on, hanging from its ring; the rule
// (alidade) is raised towards the sun and its end reads the altitude on the rim.  Right: the same instrument
// turned on its vertical axis, so the two sights are seen standing off the rule.  There is no beam: what
// you see when you really do this is the shadow of the upper sight falling on the lower one, with a spot of
// light from the upper hole that you bring onto the lower hole.  The spot's place is computed from the
// rule's angle and the sun's altitude, 25 1/2 degrees, Chaucer's own example (12 March 1391).
//
// Original line work: the outlines are those of our constructed drawing of Oxford inv. 47869 (shared module),
// the scales and the projection are computed here.  COLOURED WOODCUT on vellum (jes tg 17847), replacing
// treatise-p2-2-altitude.js: cut and washed by lib/woodcut.js; the shadow and the holes in ink, the sun ochre, the
// reading in the printer's red.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const RAD = Math.PI / 180;

const SUN_ALT = 25.5; // degrees
const SUN = [-86, -12.7]; // the sun's place in the window
const FLAT = { x: -30, y: 14, k: 0.4 }; // face-on copy: centre, scale (limb radius 100 -> 36); the sun lies on its 25 1/2 degree line
const TURN = { x: 50, y: 24, k: 0.55, tilt: 64 }; // turned copy
const CT = Math.cos(TURN.tilt * RAD);
const ST = Math.sin(TURN.tilt * RAD);
const VANE = { at: 75.5, half: 13.9, tall: 30, hole: 17 }; // along the rule, half width, height, hole height
const THICK = 7; // the body's thickness, limb radius 100
const NIGHT = VELLUM; // the ground behind a part
const DARK = "currentColor"; // shadow and holes: ink
const SILVER = RED;
const LIGHT = "#fffaf0"; // the sun's spot: paper left bare and bright
let WC = null; // the woodcut tools, in instrument units at about the copies' scale (set in mount)
const LOOP = 15000; // ms

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();

// the back's scales as line work, limb radius 100, centre (0, 0)
function back(parent, bold) {
  const T = A.backTiers;
  const g = node("g", { fill: "none", stroke: "currentColor", "vector-effect": "non-scaling-stroke", filter: WC.rough }, parent);
  const ring = (r, w, o) =>
    node("circle", { r: f(r), "stroke-width": w * 1.5, opacity: Math.min(1, o + 0.2), "vector-effect": "non-scaling-stroke" }, g);
  node("circle", { r: 100, fill: NIGHT, "stroke-width": bold * 1.5, "vector-effect": "non-scaling-stroke" }, g);
  const ann = (r0, r1) => `M0 ${-r1}A${r1} ${r1} 0 1 1 0 ${r1}A${r1} ${r1} 0 1 1 0 ${-r1}ZM0 ${-r0}A${r0} ${r0} 0 1 1 0 ${r0}A${r0} ${r0} 0 1 1 0 ${-r0}Z`;
  node("path", WC.wash({ d: ann(T.degrees, T.border), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), g);
  node("path", WC.wash({ d: ann(T.signs, T.zodnum), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.5 }), g);
  ring(T.altitude, 0.5, 0.9);
  ring(T.degrees, 0.35, 0.7);
  ring(T.signs, 0.35, 0.55);
  ring(T.months, 0.35, 0.45);
  ring(T.letters, 0.35, 0.45);
  // the altitude scale: a tick every 5 degrees, longer every 15
  let d = "";
  for (let a = 0; a < 360; a += 5) {
    const r1 = a % 15 === 0 ? T.signs + 4 : T.degrees;
    const c = Math.cos(a * RAD);
    const s = Math.sin(a * RAD);
    d += `M${f(r1 * c)} ${f(r1 * s)}L${f(T.border * c)} ${f(T.border * s)}`;
  }
  node("path", { d, "stroke-width": 0.6, opacity: 0.9, "vector-effect": "non-scaling-stroke" }, g);
  // the two lines through the centre, and the shadow square below
  const q = A.backSquare.outer;
  node(
    "path",
    {
      d: `M${-T.letters} 0H${T.letters}M0 ${-T.letters}V${T.letters}M${-q} 0V${q}H${q}V0`,
      "stroke-width": 0.35,
      opacity: 0.55,
      "vector-effect": "non-scaling-stroke",
    },
    g
  );
  // the little cross on the east line, where the scale begins
  node(
    "path",
    { d: `M${T.border - 9} -3V3M${T.border - 12} 0H${T.border - 6}`, "stroke-width": 0.5, "vector-effect": "non-scaling-stroke" },
    g
  );
  return g;
}

function throne(parent, w) {
  const g = node("g", { fill: NIGHT, stroke: "currentColor", "stroke-width": w * 1.5, "stroke-linejoin": "round", filter: WC.rough }, parent);
  for (const k of ["base", "boss", "stem", "shackle"]) {
    node("path", { d: A.throneBack[k], stroke: "none" }, g);
    node("path", WC.wash({ d: A.throneBack[k], fill: WASH.red }), g);
    node("path", { d: A.throneBack[k], fill: "none", "vector-effect": "non-scaling-stroke" }, g);
  }
  node("path", { d: A.throneBack.ring, fill: "none", "vector-effect": "non-scaling-stroke" }, g);
  return g;
}

function rule(parent) {
  const g = node("g", { filter: WC.rough }, parent);
  node("path", WC.wash({ d: A.alidade.body, fill: WASH.ochre, "fill-opacity": 0.7 }), g);
  node(
    "path",
    { d: A.alidade.body, fill: "none", stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round", "vector-effect": "non-scaling-stroke" },
    g
  );
  node("circle", { r: 6, fill: NIGHT, stroke: "currentColor", "stroke-width": 0.9, "vector-effect": "non-scaling-stroke" }, g);
  return g;
}

// turned view: a point of the instrument (u right, v down, z off the face towards us) on the screen
function tp(u, v, z) {
  return [TURN.x + TURN.k * (u * CT + z * ST), TURN.y + TURN.k * v];
}
const poly = (pts) => pts.map((p) => f(p[0]) + "," + f(p[1])).join(" ");

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";

  // ---- the sun: a disc with short rays, and a soft glow.  One sun for the whole window.
  const id = "sun-glow-" + Math.random().toString(36).slice(2, 8);
  const defs = node("defs", {}, svg);
  WC = woodcut(defs, { freq: 0.05, wobble: 2.2, seed: 31 });
  const grad = node("radialGradient", { id }, defs);
  node("stop", { offset: 0, "stop-color": LIGHT, "stop-opacity": 0.5 }, grad);
  node("stop", { offset: 1, "stop-color": LIGHT, "stop-opacity": 0 }, grad);
  const sun = node("g", { transform: `translate(${SUN[0]} ${SUN[1]})` }, svg);
  node("circle", { r: 17, fill: `url(#${id})` }, sun);
  const rays = node("g", { stroke: "currentColor", "stroke-width": 0.9, "stroke-linecap": "round" }, sun);
  for (let i = 0; i < 12; i++) {
    const c = Math.cos(i * 30 * RAD);
    const s = Math.sin(i * 30 * RAD);
    const r2 = i % 2 ? 9.2 : 10.8;
    node("line", { x1: f(7.2 * c), y1: f(7.2 * s), x2: f(r2 * c), y2: f(r2 * s) }, rays);
  }
  node("circle", { r: 5.6, fill: WASH.ochre, stroke: "currentColor", "stroke-width": 1.2 }, sun);

  // ---- the face-on copy
  const flat = node("g", { transform: `translate(${FLAT.x} ${FLAT.y}) scale(${FLAT.k})` }, svg);
  throne(flat, 0.7);
  back(flat, 1.1);
  const flatRule = rule(flat);
  const flatVanes = node("g", { fill: "currentColor" }, flatRule);
  for (const d of A.alidade.vanes) node("path", { d }, flatVanes);
  // the reading: a ring where the rule's end meets the scale, and the figure
  const mark = node("circle", { r: 4.2, fill: "none", stroke: SILVER, "stroke-width": 0.9, opacity: 0 }, svg);
  const label = node(
    "text",
    { x: -50, y: 72, "text-anchor": "middle", "font-size": 15, "font-weight": 600, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" },
    svg
  );
  label.textContent = "25½°";

  // ---- the turned copy: the same drawing squeezed by the cosine of the turn, with its edge showing
  const tg = `translate(${TURN.x} ${TURN.y}) scale(${f(TURN.k * CT)} ${TURN.k})`;
  node(
    "ellipse",
    {
      cx: f(TURN.x - TURN.k * THICK * ST),
      cy: TURN.y,
      rx: f(TURN.k * 100 * CT),
      ry: f(TURN.k * 100),
      fill: "currentColor",
      stroke: "currentColor",
      "stroke-width": 1.2,
    },
    svg
  );
  const turned = node("g", { transform: tg }, svg);
  throne(turned, 0.7);
  back(turned, 1.1);
  const turnRule = rule(turned);
  const vaneStyle = { fill: WASH.ochre, "fill-opacity": 0.85, stroke: "currentColor", "stroke-width": 1.1, "stroke-linejoin": "round" };
  const upper = node("polygon", vaneStyle, svg);
  const upperHole = node("ellipse", { rx: 1.0, ry: 1.3, fill: DARK }, svg);
  const lower = node("polygon", { ...vaneStyle, "fill-opacity": 0.5 }, svg);
  const shadow = node("polygon", { fill: DARK, "fill-opacity": 0.7 }, svg);
  const lowerHole = node("ellipse", { rx: 1.0, ry: 1.3, fill: DARK, stroke: "currentColor", "stroke-width": 0.3 }, svg);
  const glow = node("circle", { r: 4.5, fill: `url(#${id})`, opacity: 0 }, svg);
  const spot = node("ellipse", { rx: 1.0, ry: 1.3, fill: LIGHT }, svg);

  el.appendChild(svg);
  const s = { flatRule, turnRule, upper, upperHole, lower, lowerHole, shadow, spot, glow, mark, label, raf: 0, t0: 0, at: 0 };
  instances.set(el, s);
  draw(s, SUN_ALT, 1); // the still: aligned, the reading shown
}

// h: the rule's altitude in degrees (its left end raised); show: 0..1, how far the reading is shown
function draw(s, h, show) {
  s.flatRule.setAttribute("transform", `rotate(${f(h)})`);
  s.turnRule.setAttribute("transform", `rotate(${f(h)})`);
  const e = [Math.cos(h * RAD), Math.sin(h * RAD)]; // along the rule, from the upper sight to the lower
  const p = [-e[1], e[0]]; // across it, in the instrument's plane
  const vane = (sign, a, b) => {
    const cu = sign * VANE.at * e[0];
    const cv = sign * VANE.at * e[1];
    return [
      tp(cu + a * p[0], cv + a * p[1], 0),
      tp(cu + b * p[0], cv + b * p[1], 0),
      tp(cu + b * p[0], cv + b * p[1], VANE.tall),
      tp(cu + a * p[0], cv + a * p[1], VANE.tall),
    ];
  };
  const at = (sign, a, z) => tp(sign * VANE.at * e[0] + a * p[0], sign * VANE.at * e[1] + a * p[1], z);
  s.upper.setAttribute("points", poly(vane(-1, -VANE.half, VANE.half)));
  s.lower.setAttribute("points", poly(vane(1, -VANE.half, VANE.half)));
  let c = at(-1, 0, VANE.hole);
  s.upperHole.setAttribute("cx", f(c[0]));
  s.upperHole.setAttribute("cy", f(c[1]));
  c = at(1, 0, VANE.hole);
  s.lowerHole.setAttribute("cx", f(c[0]));
  s.lowerHole.setAttribute("cy", f(c[1]));
  // the light runs in the instrument's plane at the sun's altitude: where the upper sight's shadow and the
  // spot from its hole fall across the lower sight
  const q = 2 * VANE.at * Math.tan((SUN_ALT - h) * RAD);
  const a = Math.max(-VANE.half, q - VANE.half);
  const b = Math.min(VANE.half, q + VANE.half);
  if (b > a) {
    s.shadow.setAttribute("points", poly(vane(1, a, b)));
    s.shadow.setAttribute("opacity", 1);
  } else {
    s.shadow.setAttribute("opacity", 0);
  }
  const on = Math.abs(q) < VANE.half - 1.2;
  c = at(1, on ? q : 0, VANE.hole);
  s.spot.setAttribute("cx", f(c[0]));
  s.spot.setAttribute("cy", f(c[1]));
  s.spot.setAttribute("opacity", on ? 1 : 0);
  s.glow.setAttribute("cx", f(c[0]));
  s.glow.setAttribute("cy", f(c[1]));
  s.glow.setAttribute("opacity", f(show * 0.9));
  // the reading on the face-on copy
  const r = A.backTiers.altitude * FLAT.k + 1.2;
  s.mark.setAttribute("cx", f(FLAT.x - r * e[0]));
  s.mark.setAttribute("cy", f(FLAT.y - r * e[1]));
  s.mark.setAttribute("opacity", f(show));
  s.label.setAttribute("opacity", f(show));
}

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));

// the rule at time t (ms into the loop): raised from low, hunting up and down past the sun, settling on it
function pose(t) {
  const u = t / LOOP;
  if (u < 0.5) {
    const x = u / 0.5;
    const swing = 17.5 * Math.exp(-3.4 * x) * Math.cos(x * Math.PI * 5);
    return [SUN_ALT - swing * (1 - ease((x - 0.86) / 0.14)), 0];
  }
  if (u < 0.86) return [SUN_ALT, ease((u - 0.5) / 0.06)];
  const x = (u - 0.86) / 0.14; // let it fall back to where the loop began
  return [SUN_ALT - 17.5 * ease(x), 1 - ease(x / 0.4)];
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.at;
    s.at = (now - s.t0) % LOOP;
    const [h, show] = pose(s.at);
    draw(s, h, show);
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
  s.at = ((ms % LOOP) + LOOP) % LOOP;
  const [h, show] = pose(s.at);
  draw(s, h, show);
}
