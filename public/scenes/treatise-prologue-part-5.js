// A Treatise on the Astrolabe, the Prologue: "this tretis, divided in fyve parties" ... "The fifte partie shal shewen thee the rewles of thy conclusiouns, as the equacions of houses, the ... dignitees of planetes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Part V, the twelve houses: the square figure astrologers drew for them, ghosted, its lines beginning to draw themselves and stopping, none of its twelve spaces closed.
// The part's state is Skeat's (Oxford Chaucer vol. III, 1894, introduction to the Treatise): "in all probability, none (or, at least, no more) of this fifth Part was ever written".
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
const STILL = 4000; // ms: the figure as far as it goes
const S = 60; // half the outer square

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const parts = [];
  const g = node("g", { fill: "none", stroke: FAINT, "stroke-linecap": "round" }, svg);
  const lines = [
    `M${-S} ${-S}H${S}V${S}H${-S}Z`, // the outer square
    `M0 ${-S}L${S} 0L0 ${S}L${-S} 0Z`, // the inner, set on its corner
    `M${-S / 2} ${-S / 2}H${S / 2}V${S / 2}H${-S / 2}Z`, // the middle square
    `M${-S} ${-S}L${-S / 2} ${-S / 2}M${S} ${-S}L${S / 2} ${-S / 2}M${S} ${S}L${S / 2} ${S / 2}M${-S} ${S}L${-S / 2} ${S / 2}`, // the corners in
  ];
  const stops = [0.58, 0.44, 0.3, 0.5];
  lines.forEach((d, i) => {
    const p = node("path", { d, pathLength: 1, "stroke-width": 1.9 }, g);
    p.dataset.stop = stops[i];
    parts.push(p);
  });
  const num = node("text", { x: 0, y: 93, "text-anchor": "middle", "font-size": 24, fill: "currentColor", "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", opacity: 0.6 }, svg);
  num.textContent = "V";
  el.appendChild(svg);
  const s = { parts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const fade = 1 - span(t, 6.2, 6.9);
  s.parts.forEach((p, i) => {
    const u = Math.min(+p.dataset.stop, span(t, 0.3 + 0.4 * i, 2.8 + 0.4 * i));
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
