// A Treatise on the Astrolabe, the Prologue: "this tretis, divided in fyve parties" ... "The thridde partie shal contienen diverse tables of longitudes and latitudes of sterres fixe, declinacions of the sonne, and tables of longitudes of citees and of tounes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Part III, the tables: a page ruled for tables, a few rows ruled firm, the rest only pricked out in dashes, and no figures in the cells: present in intent, not in the text.
// The part's state is Skeat's (Oxford Chaucer vol. III, 1894, introduction to the Treatise): "probably consisted entirely of tables, and some at least of these may very well have been transmitted to little Lewis".
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
const STILL = 4200; // ms: the page as far as it goes
const X0 = -52;
const X1 = 52;
const Y0 = -76;
const Y1 = 66;
const COLS = 5;
const ROWS = 12;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const parts = [];
  const g = node("g", { fill: "none", stroke: "currentColor" }, svg);
  parts.push(node("path", { d: `M${X0} ${Y0}H${X1}V${Y1}H${X0}Z`, pathLength: 1, "stroke-width": 2.47 }, g)); // the page
  parts.push(node("path", { d: `M${X0} ${Y0 + 14}H${X1}`, pathLength: 1, "stroke-width": 2.09 }, g)); // the head rule
  for (let c = 1; c < COLS; c++) {
    const x = X0 + ((X1 - X0) * c) / COLS;
    parts.push(node("path", { d: `M${f(x)} ${Y0}V${Y1}`, pathLength: 1, "stroke-width": 1.33 }, g));
  }
  // a few cells filled faintly: tables prepared in part (perhaps sent to Lewis), not in the Treatise
  const cw = (X1 - X0) / COLS;
  const rh = (Y1 - Y0 - 14) / ROWS;
  for (const [c, r] of [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [3, 1], [0, 2], [2, 2]]) {
    const cell = node("rect", { x: f(X0 + c * cw + 3), y: f(Y0 + 14 + r * rh + 3), width: f(cw - 6), height: f(rh - 6), fill: "currentColor", stroke: "none", opacity: 0, "data-cell": 1 }, g);
    parts.push(cell);
  }
  for (let r = 1; r < ROWS; r++) {
    const y = Y0 + 14 + ((Y1 - Y0 - 14) * r) / ROWS;
    const firm = r <= 3; // a few rows ruled; the rest pricked out only
    parts.push(node("path", { d: `M${X0} ${f(y)}H${X1}`, pathLength: 1, "stroke-width": firm ? 0.6 : 0.5, opacity: firm ? 0.9 : 0.45, "data-firm": firm ? 1 : 0 }, g));
  }
  const num = node("text", { x: 0, y: 93, "text-anchor": "middle", "font-size": 24, fill: "currentColor", "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke", opacity: 0.8 }, svg);
  num.textContent = "III";
  el.appendChild(svg);
  const s = { parts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 5.8, 6.4);
  s.parts.forEach((p, i) => {
    if (p.getAttribute("data-cell")) {
      p.setAttribute("opacity", f(0.28 * span(t, 2.6 + 0.12 * i * 0.1, 3.2 + 0.12 * i * 0.1) * out));
      return;
    }
    const firm = p.getAttribute("data-firm");
    const u = span(t, 0.2 + 0.16 * i, 0.9 + 0.16 * i);
    if (firm === "0") {
      p.setAttribute("stroke-dasharray", "0.02 0.03"); // pricked out, never ruled
      p.setAttribute("stroke-dashoffset", "0");
      p.setAttribute("opacity", f(0.45 * u * out));
    } else {
      drawIn(p, u);
      p.setAttribute("opacity", f((i < 2 ? 1 : 0.85) * out));
    }
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
