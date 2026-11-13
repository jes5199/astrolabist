// A Treatise on the Astrolabe, the Prologue: "this tretis, divided in fyve parties" ... "The seconde partie shal teche thee werken the verrey practik of the forseide conclusiouns."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Part II, the practice: the back of the instrument with its rule sighting the sun, the beam through both sights; drawn finished but for a faint unfinished edge, a hair short of whole.
// The part's state is Skeat's (Oxford Chaucer vol. III, 1894, introduction to the Treatise): "we have nearly all, and probably all that ever was written".
// One of five small scenes, one beside each part in the Prologue; drawn so that what was finished looks finished and
// what was never made stays a drawing that stops.  Original line work; nothing is traced.


const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const FAINT = "#a7b0d4";
function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a path drawn in from its start: share u (0..1) of its length shown, up to `stop` (an unfinished drawing stops short)
function drawIn(el, u, stop = 1) {
  el.setAttribute("stroke-dasharray", "1 1");
  el.setAttribute("stroke-dashoffset", f(1 - Math.min(stop, u)));
}
const LOOP = 6500;
const STILL = 4200; // ms: drawn, its edge left unfinished
const RAD = Math.PI / 180;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const parts = [];
  const g = node("g", { fill: "none", stroke: "currentColor", "stroke-linecap": "round" }, svg);
  const C = [-14, 22];
  const R = 58;
  const circ = (r) => `M${f(C[0])} ${f(C[1] - r)}A${r} ${r} 0 1 1 ${f(C[0])} ${f(C[1] + r)}A${r} ${r} 0 1 1 ${f(C[0])} ${f(C[1] - r)}`;
  parts.push(node("path", { d: circ(R), pathLength: 1, "stroke-width": 2.85 }, g)); // the rim, never quite closed
  parts.push(node("path", { d: circ(R), pathLength: 1, "stroke-width": 1.9, "stroke-dasharray": "0.01 0.02", opacity: 0 }, g)); // its last stretch, dotted
  for (const r of [R * 0.88, R * 0.7]) parts.push(node("path", { d: circ(r), pathLength: 1, "stroke-width": 1.14, opacity: 0.7 }, g));
  // the ring
  parts.push(node("path", { d: `M${f(C[0])} ${f(C[1] - R)}V${f(C[1] - R - 10)}M${f(C[0] - 7)} ${f(C[1] - R - 17)}a7 7 0 1 0 14 0a7 7 0 1 0 -14 0`, pathLength: 1, "stroke-width": 2.28 }, g));
  // the rule pointing at the sun, up to the left, its two sights
  const a = -40 * RAD;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const L = R * 0.95;
  parts.push(node("path", { d: `M${f(C[0] - ux * L)} ${f(C[1] - uy * L)}L${f(C[0] + ux * L)} ${f(C[1] + uy * L)}`, pathLength: 1, stroke: SILVER, "stroke-width": 7.6 }, g));
  const sun = [C[0] - ux * (L + 40), C[1] - uy * (L + 40)];
  const sg = node("g", { opacity: 0 }, svg);
  node("circle", { cx: f(sun[0]), cy: f(sun[1]), r: 8, fill: "#f6d77a" }, sg);
  for (let i = 0; i < 8; i++) node("line", { x1: f(sun[0]), y1: f(sun[1] - 11), x2: f(sun[0]), y2: f(sun[1] - 15), stroke: "#f6d77a", "stroke-width": 2.66, "stroke-linecap": "round", transform: `rotate(${45 * i} ${f(sun[0])} ${f(sun[1])})` }, sg);
  parts.push(sg);
  parts.push(node("path", { d: `M${f(sun[0])} ${f(sun[1])}L${f(C[0] + ux * L)} ${f(C[1] + uy * L)}`, pathLength: 1, stroke: "#f6d77a", "stroke-width": 3.04 }, svg));
  const num = node("text", { x: 0, y: 93, "text-anchor": "middle", "font-size": 24, fill: "currentColor", "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", opacity: 0.95 }, svg);
  num.textContent = "II";
  el.appendChild(svg);
  const s = { parts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 5.8, 6.4);
  const [rim, rest, c1, c2, ring, rule, sun, beam] = s.parts;
  drawIn(rim, span(t, 0.2, 1.8), 0.93); // a hair short of closing
  rest.setAttribute("opacity", f(0.5 * span(t, 1.8, 2.2) * out));
  rest.setAttribute("stroke-dasharray", "0.004 0.012");
  rest.setAttribute("stroke-dashoffset", "0");
  rest.setAttribute("d", rim.getAttribute("d"));
  drawIn(c1, span(t, 0.6, 1.8));
  drawIn(c2, span(t, 0.8, 2.0));
  drawIn(ring, span(t, 1.2, 1.8));
  drawIn(rule, span(t, 1.8, 2.6));
  sun.setAttribute("opacity", f(span(t, 2.4, 2.9) * out));
  drawIn(beam, span(t, 2.9, 3.6));
  for (const p of [rim, c1, c2, ring, rule, beam]) p.setAttribute("opacity", f((p === c1 || p === c2 ? 0.7 : 1) * out));
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
