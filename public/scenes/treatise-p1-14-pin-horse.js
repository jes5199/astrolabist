// A Treatise on the Astrolabe, Part I, 14: "Thanne is ther a large Pyn, in maner of an extree, that goth thorow the
// hole that halt the tables of the clymates and the riet in the wombe of the Moder, thorw which Pyn ther goth a
// litel wegge which that is cleped 'the hors,' that streyneth alle thise parties to-hepe; this forseide grete Pyn,
// in maner of an extree, is imagined to be the Pol Artik in thyn Astrolabie."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The instrument seen edge-on, cut through its middle, its thicknesses drawn about twice as deep as they are so
// that the layers can be told apart: from the back, the rule with its sights; the mother, its back and the rim of
// its womb; a plate in the womb; the rete on it; the label in front.  Drawn a little apart, they close up; the pin
// goes through them all like an axle; the little wedge, the horse, drops through the slot at its end and holds
// them together.  Then the pin's line runs on to a star: the pole.  Original line work; nothing is traced.

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 13000;
const STILL = 9000; // ms: assembled, the horse in, the pole named
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const FAINT = "#a7b0d4";
const R = 70; // the disc's half-height in the window
const X = 3.5; // depth drawn this many times its share of the radius (for legibility)
const d = (v) => v * X * (R / 100); // depth units (hundredths of the radius) to the window
const FRONT = d(2); // the label's front face
const SLOT = FRONT + 4; // where the horse goes through the pin
const END = FRONT + 11; // the pin's end
const HEAD = d(-34); // the pin's head, behind the rule's sights
const Y0 = 6; // the axis's height in the window

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const rect = (x0, x1, y0, y1) => `M${f(x0)} ${f(y0)}H${f(x1)}V${f(y1)}H${f(x0)}Z`;

// the parts, back to front: depth (left edge, right edge) in units of the radius/100, and how far each stands
// out when the stack is drawn apart; shapes are cut through the middle, the pin's hole left open
const HOLE = 2.4; // the hole's half-height
function parts() {
  const P = [];
  // the rule (alidade) on the back, its two sights standing off it
  P.push({ apart: -22, d: [rect(d(-20), d(-16), -R, -HOLE), rect(d(-20), d(-16), HOLE, R), rect(d(-31), d(-20), -R * 0.77, -R * 0.74), rect(d(-31), d(-20), R * 0.74, R * 0.77)].join(""), fill: 0.25 });
  // the mother: its back and the rim that makes the womb
  P.push({ apart: -8, d: [rect(d(-15), d(-10), -R - 2, -HOLE), rect(d(-15), d(-10), HOLE, R + 2), rect(d(-10), d(-1), -R - 2, -R + 4), rect(d(-10), d(-1), R - 4, R + 2)].join(""), fill: 0.45 });
  // a plate in the womb
  P.push({ apart: 6, d: rect(d(-10), d(-7.5), -R + 4.5, -HOLE) + rect(d(-10), d(-7.5), HOLE, R - 4.5), fill: 0.3, silver: true });
  // the rete on the plate: cut through, its web shows as pieces
  P.push({ apart: 16, d: [[-R + 5, -R + 14], [-R + 26, -R + 31], [-R + 44, -R + 52], [-14, -HOLE], [HOLE, 12], [30, 36], [R - 22, R - 16], [R - 12, R - 5]].map(([a, b]) => rect(d(-7.5), d(-5.5), a, b)).join(""), fill: 0.5 });
  // the label in front, across the whole face
  P.push({ apart: 28, d: rect(d(-1), d(2), -R, -HOLE) + rect(d(-1), d(2), HOLE, R), fill: 0.25 });
  return P;
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const root = node("g", { transform: `translate(4 ${Y0})` }, svg);
  // the pole: the pin's line runs on to a star
  const axis = node("path", { d: `M${f(END)} 0H96`, stroke: FAINT, "stroke-width": 0.8, "stroke-dasharray": "2 3", fill: "none", opacity: 0 }, root);
  const star = node("path", { d: "M0 -6L1.4 -1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4 -1.4Z", transform: "translate(92 0)", fill: SILVER, opacity: 0 }, root);
  const word = node("text", { x: 90, y: -12, "text-anchor": "end", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, root);
  word.textContent = "Pol Artik";
  const P = parts().map((p) => ({ ...p, el: node("path", { d: p.d, fill: p.silver ? FAINT : "currentColor", "fill-opacity": p.fill, stroke: p.silver ? SILVER : "currentColor", "stroke-width": 0.8, "stroke-linejoin": "round" }, root) }));
  // the pin: a head at the back, a shank through the stack, a slot near its end
  const pin = node("g", {}, root);
  node("path", { d: `M${f(HEAD - 6)} -5.5H${f(HEAD)}V-2H${f(END)}V2H${f(HEAD)}V5.5H${f(HEAD - 6)}Z`, fill: SILVER, "fill-opacity": 0.35, stroke: SILVER, "stroke-width": 0.9, "stroke-linejoin": "round" }, pin);
  node("path", { d: `M${f(SLOT - 1.6)} -2V2M${f(SLOT + 1.6)} -2V2`, stroke: NIGHT, "stroke-width": 1.4 }, pin);
  // the horse: a little wedge with a horse's head, as these wedges were often made
  const horse = node("path", { transform: "", d: "M-1.3 9L-0.9 -12C-1.7 -15 -2.1 -18 -0.5 -20C1.1 -22.5 4.3 -22 6.1 -19.5L7.5 -16.5L5.1 -15.6L3.7 -17.2C2.5 -16.6 1.9 -15 1.7 -13L1.3 9Z", fill: "currentColor", "fill-opacity": 0.55, stroke: "currentColor", "stroke-width": 0.9, "stroke-linejoin": "round", opacity: 0 }, root);
  el.appendChild(svg);
  const s = { P, pin, horse, axis, star, word, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const back = span(t, 11.4, 12.6); // drawn apart again for the next round
  const close = span(t, 0.8, 2.6) * (1 - back);
  for (const p of s.P) p.el.setAttribute("transform", `translate(${f(p.apart * (1 - close))} 0)`);
  const fade = 1 - span(t, 11.0, 11.6);
  // the pin comes in from the back (left) through everything
  const pinIn = span(t, 2.8, 4.8);
  s.pin.setAttribute("transform", `translate(${f(-60 * (1 - pinIn))} 0)`);
  s.pin.setAttribute("opacity", f(span(t, 2.6, 3.0) * fade));
  // the horse drops through the slot and settles
  const drop = span(t, 5.2, 6.4);
  const settle = 1.5 * Math.sin(Math.PI * span(t, 6.3, 6.8));
  s.horse.setAttribute("transform", `translate(${f(SLOT)} ${f(-58 * (1 - drop) + settle)})`);
  s.horse.setAttribute("opacity", f(span(t, 5.0, 5.3) * fade));
  // the pin's line runs on to the pole
  s.axis.setAttribute("opacity", f(span(t, 7.2, 7.9) * 0.8 * fade));
  s.star.setAttribute("opacity", f(span(t, 7.6, 8.1) * fade));
  s.word.setAttribute("opacity", f(span(t, 8.0, 8.6) * fade));
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
