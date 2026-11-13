// A Treatise on the Astrolabe, Part II, 2: "Put the ring of thyn Astrolabie up-on thy right thoumbe, and turne thy lift
// syde agayn the light of the sonne. And remeve thy rewle up and doun, til that the stremes of the sonne shyne thorgh
// bothe holes of thy rewle. Loke thanne how many degrees thy rewle is areised fro the litel crois up-on thyn est line,
// and tak ther the altitude of thy sonne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW, 3:2 (viewBox -150 -100 300 200), as II 3 v2 (jes tg 17917): Chaucer's four steps one at a time,
// listed beside the instrument, the step being done in red.  One view only (the old scene showed two at once): the
// back, hanging from the ring; the sun off to its east side (the little cross is at the viewer's right on this back),
// at Chaucer's 25 1/2 degrees (12 March 1391).  The rule is moved up and down; only when it lies true does the beam
// pass both holes; then the degrees are counted up from the cross.  COLOURED WOODCUT on vellum: shared lib/back-ink.js
// (our constructed drawing of Oxford inv. 47869).  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { back, node, f, PIVOT, T, SILVER, NIGHT, VELLUM, WASH } from "./lib/back-ink.js";

const instances = new WeakMap();
const LOOP = 22000;
const STILL = 17000; // ms: the beam through both holes, 25 1/2 counted
const C = { x: 40, y: 22, k: 0.62 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const ALT = A.morning.sunAlt; // 25.5
const SUN = [C.x + 106 * Math.cos(ALT * RAD), C.y - 106 * Math.sin(ALT * RAD)];
const STEPS = [
  { t: 0.5, lines: ["the ring on your", "right thumb"] },
  { t: 4.0, lines: ["your left side", "toward the sun"] },
  { t: 7.4, lines: ["move the rule until the", "sun shines through", "both holes"] },
  { t: 13.4, lines: ["count the degrees up", "from the little cross:", "25½°"] },
];
const END = 20.0;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// the rule's altitude by time: up past it, down below it, up to it
function ruleAt(t) {
  if (t < 7.8) return 0;
  if (t < 9.4) return 40 * span(t, 7.8, 9.4);
  if (t < 10.8) return 40 - 25 * span(t, 9.4, 10.8);
  if (t < END + 0.8) return 15 + (ALT - 15) * span(t, 10.8, 12.2);
  return ALT * (1 - span(t, END + 0.8, END + 1.8));
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-150 -100 300 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  // the sun: ochre, inked, with rays
  const sun = node("g", { transform: `translate(${f(SUN[0])} ${f(SUN[1])})`, opacity: 0 }, svg);
  node("circle", { r: 7, fill: WASH.ochre, stroke: "currentColor", "stroke-width": 1.3 }, sun);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: -10, x2: 0, y2: -14, stroke: "currentColor", "stroke-width": 1.3, "stroke-linecap": "round", transform: `rotate(${45 * i})` }, sun);
  // the beam, from the sun along the true line, on through both holes
  const beam = node("line", { x1: f(SUN[0]), y1: f(SUN[1]), x2: f(C.x - 80 * Math.cos(ALT * RAD)), y2: f(C.y + 80 * Math.sin(ALT * RAD)), stroke: SILVER, "stroke-width": 1.6, "stroke-dasharray": "4 2.5", opacity: 0 }, svg);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const hang = node("g", {}, g);
  const b = back(hang, { scale: C.k, ticks: true });
  // the count, up from the little cross on the east line, on the altitude scale
  const R = (T.altitude + T.border) / 2;
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(3), "stroke-linecap": "round", opacity: 0 }, hang);
  const cross = node("path", { d: `M${f(T.border - 9)} -3.5V3.5M${f(T.border - 12.5)} 0H${f(T.border - 5.5)}`, stroke: SILVER, "stroke-width": W(1.6), opacity: 0 }, hang);
  // the rule with its two sights
  const rule = node("g", { filter: b.wc.rough }, hang);
  node("path", { d: A.alidade.body, fill: VELLUM }, rule);
  node("path", b.wc.wash({ d: A.alidade.body, fill: WASH.ochre, "fill-opacity": 0.85 }), rule);
  node("path", { d: A.alidade.body, fill: "none", stroke: "currentColor", "stroke-width": W(1.3), "stroke-linejoin": "round" }, rule);
  for (const v of A.alidade.vanes) node("path", { d: v, fill: "currentColor" }, rule);
  node("circle", { r: 4.6, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, hang);
  // the thumb's peg
  node("line", { x1: -9, y1: PIVOT + 2.2, x2: 9, y2: PIVOT + 2.2, stroke: "currentColor", "stroke-width": W(2.6), "stroke-linecap": "round" }, g);
  const reading = node("text", { "font-size": 15, "font-weight": 700, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  reading.textContent = "25½°";
  const rp = [C.x + C.k * (T.border + 6) * Math.cos((ALT / 2) * RAD), C.y - C.k * (T.border + 6) * Math.sin((ALT / 2) * RAD)];
  reading.setAttribute("x", f(rp[0] + 2));
  reading.setAttribute("y", f(rp[1] + 5));
  // the steps
  const list = node("g", {}, svg);
  const X0 = -142;
  let y = -60;
  const rows = STEPS.map((st, i) => {
    const els = st.lines.map((ln, j) => {
      const t = node("text", { x: X0 + (j ? 11 : 0), y: y + j * 12, "font-size": 10.5, "font-weight": 600, fill: "currentColor", opacity: 0, "font-family": "inherit" }, list);
      t.textContent = (j ? "" : `${i + 1}  `) + ln;
      return t;
    });
    y += 12 * st.lines.length + 10;
    return els;
  });
  el.appendChild(svg);
  const s = { sun, beam, hang, rule, count, cross, reading, ring: b.ring, rows, R, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  // 1. hung on the thumb: a swing that dies away
  const x = Math.min(1, Math.max(0, (t - 0.6) / 3.2));
  const sw = t < 0.6 ? 0 : 10 * Math.exp(-3.2 * x) * Math.cos(x * Math.PI * 5) * (1 - span(x, 0.85, 1));
  s.hang.setAttribute("transform", `rotate(${f(sw)} 0 ${PIVOT})`);
  s.ring.setAttribute("opacity", f(span(t, 0.6, 1.0) * (1 - span(t, 3.6, 4.0))));
  // 2. the sun
  s.sun.setAttribute("opacity", f(span(t, 4.2, 4.8) * out));
  // 3. the rule moved; the beam passes only when it lies true
  const a = ruleAt(t);
  s.rule.setAttribute("transform", `rotate(${f(-a)})`);
  s.beam.setAttribute("opacity", f(Math.abs(a - ALT) < 0.6 && t > 7.4 ? 0.9 * out : 0));
  // 4. the count from the little cross
  const u = span(t, 13.8, 15.2);
  const p0 = [s.R, 0];
  const p1 = [s.R * Math.cos(ALT * u * RAD), -s.R * Math.sin(ALT * u * RAD)];
  s.count.setAttribute("d", u > 0.01 ? `M${f(p0[0])} ${f(p0[1])}A${f(s.R)} ${f(s.R)} 0 0 0 ${f(p1[0])} ${f(p1[1])}` : "");
  s.count.setAttribute("opacity", f(span(t, 13.6, 13.9) * out));
  s.cross.setAttribute("opacity", f(span(t, 13.4, 13.8) * out));
  s.reading.setAttribute("opacity", f(span(t, 15.2, 15.7) * out));
  STEPS.forEach((st, i) => {
    const next = STEPS[i + 1] ? STEPS[i + 1].t : END;
    const now = t >= st.t && t < next;
    const done = t >= next;
    const al = (now || done ? 1 : 0.3) * span(t, 0.2, 0.5) * out;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(al));
      e.setAttribute("fill", now ? SILVER : "currentColor");
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
