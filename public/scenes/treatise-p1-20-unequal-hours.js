// A Treatise on the Astrolabe, Part I, 20: "Next thise azimutz, under the Cercle of Cancer, ben ther twelve
// devisiouns embelif, moche like to the shap of the azimutes, that shewen the spaces of the houres of planetes."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The plate, close.  Below the horizon (the night side) the eleven oblique lines are drawn in turn from the west,
// cutting the space between the horizon's two ends into twelve; then the twelve spaces are counted, each lit as its
// number comes, from the western horizon round under the pole to the eastern.  Each line runs through the twelfths of
// the night on the circles of Cancer, the equinoxial and Capricorn, computed for the latitude of inv. 47869's plate in
// our drawing (shared lib/front.js).  Original line work; nothing is traced.

import { front, node, f, rim, P, nightFrom, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 9200; // ms: all twelve drawn and numbered, none lit
const C = { x: 0, y: -8, k: 1.16 };
const W = (px) => f(px / C.k);

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  for (const a of fr.plate.azimuths) a.el.setAttribute("opacity", 0.18);
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.18);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  // the night side: inside the plate, outside the horizon, between the circles of Cancer and Capricorn
  const [hc, hr] = almucantar(0);
  const mask = node("mask", { id: "n" + uid }, g);
  node("circle", { r: f(P.capricorn), fill: "#fff" }, mask);
  node("circle", { r: f(P.cancer), fill: "#000" }, mask);
  node("circle", { cy: f(-hc), r: f(hr), fill: "#000" }, mask);
  const night = node("rect", { x: -100, y: -100, width: 200, height: 200, fill: "currentColor", opacity: 0, mask: `url(#n${uid})` }, g);
  // the lines: the plate's own, drawn in turn (pathLength 1)
  const lines = fr.plate.hours.map((h) => {
    h.setAttribute("pathLength", 1);
    h.setAttribute("stroke-dasharray", "1 1");
    h.setAttribute("stroke", "currentColor");
    h.setAttribute("stroke-width", W(1));
    return h;
  });
  // the twelve spaces: a lit wedge and a number each, between the circle of Cancer and Capricorn's
  const spaces = [];
  for (let j = 0; j < 12; j++) {
    const pt = (rd, k) => {
      const t0 = nightFrom(rd);
      return rim(t0 + (k * (360 - 2 * t0)) / 12, rd);
    };
    const a = [pt(P.cancer, j), pt(P.equator, j), pt(P.capricorn, j)];
    const b = [pt(P.cancer, j + 1), pt(P.equator, j + 1), pt(P.capricorn, j + 1)];
    const d = "M" + [...a, ...b.reverse()].map((p) => f(p[0]) + " " + f(p[1])).join("L") + "Z";
    const cell = node("path", { d, fill: SILVER, opacity: 0 }, g);
    const m = pt((P.equator + P.capricorn) / 2, j + 0.5);
    const num = node("text", { x: f(C.x + C.k * m[0]), y: f(C.y + C.k * m[1] + 5), "text-anchor": "middle", "font-size": 13, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    num.textContent = String(j + 1);
    spaces.push({ cell, num });
  }
  el.appendChild(svg);
  const s = { night, lines, spaces, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  s.night.setAttribute("opacity", f(0.08 * span(t, 0.4, 1.0) * out));
  s.lines.forEach((l, i) => {
    const a = 1.0 + 0.3 * i;
    l.setAttribute("stroke-dashoffset", f(1 - span(t, a, a + 0.5)));
    l.setAttribute("opacity", f(out));
  });
  s.spaces.forEach((sp, j) => {
    const a = 5.0 + 0.25 * j;
    const on = span(t, a, a + 0.2);
    sp.cell.setAttribute("opacity", f(0.22 * on * (1 - span(t, a + 0.35, a + 0.7))));
    sp.num.setAttribute("opacity", f(on * out));
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
