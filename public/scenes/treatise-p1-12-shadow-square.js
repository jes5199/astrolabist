// A Treatise on the Astrolabe, Part I, 12: "Next the forseide Cercle of the Abc., under the cros-lyne, is marked the
// scale, in maner of two squyres, or elles in manere of laddres, that serveth by hise 12 poyntes and his devisiouns
// of ful many a subtil conclusioun. Of this forseide scale, fro the croos-lyne un-to the verre angle, is cleped umbra
// versa, and the nether partie is cleped the umbra recta, or elles umbra extensa."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The back, close on its middle: under the cross line, the shadow square.  Its two sides are struck, twelve parts
// each from the cross line down to the corner, numbered 3 6 9 12: umbra versa; then the base, twelve parts each way
// from the middle to the corners: umbra recta.  As on inv. 47869 in our drawing (docs/video2/drawings/back47869.md):
// three lines (outer, ladder, inner), every division aimed at the centre, numerals every third part.
// Shared drawing of the back (lib/back.js, from our constructed drawing of Oxford inv. 47869).  Original line work.

import A from "./lib/astrolabe-47869.js";
import { back, node, label, f, SILVER, NIGHT, T } from "./lib/back.js";

const instances = new WeakMap();
const LOOP = 12000;
const STILL = 8500; // ms: both parts struck, numbered and named
const C = { x: 0, y: -42, k: 3.05 }; // the square's top (the cross line) above the middle of the glass
const W = (px) => f(px / C.k);
const SO = +A.backSquare.outer;
const SL = +A.backSquare.ladder;
const SI = +A.backSquare.inner;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const P = (x, y) => `${f(x)} ${f(y)}`;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const b = back(g, { scale: C.k, ticks: false, faint: 0.4 });
  b.throne.setAttribute("display", "none");
  // the cross line and the meridian, as this back has them: from the letters' ring in to the square's inner edge
  node("path", { d: `M${-T.letters} 0H${-SI}M${SI} 0H${T.letters}M0 ${SI}V${T.letters}`, fill: "none", stroke: "currentColor", "stroke-width": W(0.9), opacity: 0.7 }, g);
  // the three lines of each part: the sides (umbra versa), the base (umbra recta)
  const sideD = [SO, SL, SI].map((s) => `M${P(-s, 0)}V${f(s)}M${P(s, 0)}V${f(s)}`).join("");
  const baseD = [SO, SL, SI].map((s) => `M${P(-s, s)}H${f(s)}`).join("");
  let sideT = "";
  let baseT = "";
  for (let i = 1; i <= 12; i++) {
    const long = i % 3 === 0;
    const r1 = long ? SI : SL; // a longer line every third part
    for (const sx of [-1, 1]) {
      sideT += `M${P((sx * SO), (SO * i) / 12)}L${P(sx * r1, (r1 * i) / 12)}`; // on the ray from the centre
      baseT += `M${P((sx * SO * i) / 12, SO)}L${P((sx * r1 * i) / 12, r1)}`;
    }
  }
  const part = (d, w) => node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": W(w), opacity: 0 }, g);
  const sides = [part(sideD, 1), part(sideT, 0.6)];
  const base = [part(baseD, 1), part(baseT, 0.6)];
  // the numerals, every third part, in the band between the ladder and the inner line
  const rm = (SL + SI) / 2;
  const at = (x, y) => [C.x + C.k * x, C.y + C.k * y + 4];
  const sideN = [];
  const baseN = [];
  for (const v of [3, 6, 9, 12]) {
    for (const sx of [-1, 1]) {
      const p = at(sx * (rm - 1.2), ((rm - 1.2) * (v - 1.5)) / 12);
      sideN.push(label(svg, p[0], p[1], String(v), 13));
      const q = at((sx * (rm - 1.2) * (v - 1.5)) / 12, rm - 1.2);
      baseN.push(label(svg, q[0], q[1], String(v), 13));
    }
  }
  const versa = label(svg, 0, C.y + C.k * 9.5, "umbra versa", 14);
  const recta = label(svg, 0, C.y + C.k * 15.6, "umbra recta", 14);
  versa.setAttribute("fill", "currentColor");
  recta.setAttribute("fill", "currentColor");
  el.appendChild(svg);
  const s = { sides, base, sideN, baseN, versa, recta, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 11.0, 11.8);
  const sd = span(t, 0.8, 2.2);
  const bs = span(t, 4.2, 5.6);
  // a part is drawn bright while it is named, then settles
  for (const p of s.sides) p.setAttribute("opacity", f(sd * (1 - 0.35 * span(t, 4.0, 4.6)) * out));
  for (const p of s.base) p.setAttribute("opacity", f(bs * out));
  s.sideN.forEach((n, i) => n.setAttribute("opacity", f(span(t, 1.8 + 0.12 * i, 2.2 + 0.12 * i) * out)));
  s.baseN.forEach((n, i) => n.setAttribute("opacity", f(span(t, 5.2 + 0.12 * i, 5.6 + 0.12 * i) * out)));
  s.versa.setAttribute("opacity", f(span(t, 2.8, 3.5) * out));
  s.recta.setAttribute("opacity", f(span(t, 6.4, 7.1) * out));
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
