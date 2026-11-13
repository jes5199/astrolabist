// A Treatise on the Astrolabe, the Prologue: "this tretis, divided in fyve parties" ... "The ferthe partie shal ben a theorike to declare the moevinge of the celestial bodies with hir causes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Part IV, the motions of the heavenly bodies: the planets' circles about the earth, ghosted, faint and dotted, each beginning to draw itself and stopping short; a little epicycle that never closes.
// The part's state is Skeat's (Oxford Chaucer vol. III, 1894, introduction to the Treatise): "This was probably never written."
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
const LOOP = 7000;
const STILL = 4000; // ms: the circles as far as they go
const RADII = [18, 28, 38, 48, 58, 68, 78]; // the seven planets' circles
const STOPS = [0.62, 0.48, 0.71, 0.4, 0.55, 0.33, 0.5]; // how far each gets before it stops

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const parts = [];
  const g = node("g", { fill: "none", stroke: FAINT, "stroke-linecap": "round" }, svg);
  node("circle", { r: 3, fill: "none", stroke: FAINT, "stroke-width": 2.0, opacity: 0.6 }, g); // the earth
  RADII.forEach((r, i) => {
    const a = (i * 47) % 360;
    const d = `M${f(r * Math.cos((a * Math.PI) / 180))} ${f(r * Math.sin((a * Math.PI) / 180))}A${r} ${r} 0 1 1 ${f(r * Math.cos(((a + 359) * Math.PI) / 180))} ${f(r * Math.sin(((a + 359) * Math.PI) / 180))}`;
    parts.push(node("path", { d, pathLength: 1, "stroke-width": 1.9 }, g));
  });
  // an epicycle on the fourth circle, begun and left open
  parts.push(node("path", { d: "M48 -8A8 8 0 1 1 47.9 -8.2", transform: "rotate(-30)", pathLength: 1, "stroke-width": 1.9 }, g));
  const num = node("text", { x: 0, y: 93, "text-anchor": "middle", "font-size": 24, fill: "currentColor", "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", opacity: 0.6 }, svg);
  num.textContent = "IV";
  el.appendChild(svg);
  const s = { parts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const fade = 1 - span(t, 6.2, 6.9);
  s.parts.forEach((p, i) => {
    const stop = i < STOPS.length ? STOPS[i] : 0.45;
    // dotted, faint: the dashes show only up to where the drawing stops
    const u = Math.min(stop, span(t, 0.3 + 0.2 * i, 2.6 + 0.2 * i));
    p.setAttribute("stroke-dasharray", `${f(u)} 1`);
    p.setAttribute("stroke-dashoffset", "0");
    p.setAttribute("opacity", f(0.55 * fade));
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
