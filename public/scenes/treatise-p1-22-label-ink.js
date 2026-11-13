// A Treatise on the Astrolabe, Part I, 22: "Thanne hastow a label, that is schapen lyk a rewle, save that it is streit
// and hath no plates on either ende with holes; but, with the smale point of the forseide label, shallow calcule thyne
// equaciouns in the bordure of thin Astrolabie."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-22-label.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front with its rete.  The label, a straight rule without sights, turns about the pin; as its small point passes
// each hour letter of the border the letter lights; it comes to rest on X (Chaucer's reading in II 3) and its point is
// marked.  The label's outline is our constructed drawing of inv. 47869's (shared lib/front.js and
// astrolabe-47869.js).  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 9000; // ms: at rest on X, its point marked
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const X_AT = 15 * (1 + A.hourLetters.indexOf("X")); // the letter X: 315 degrees clockwise from the top

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  fr.rete.g.setAttribute("opacity", 0.55);
  fr.rete.g.setAttribute("transform", `rotate(${A.morning.rot})`);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  // the label: turned so that its point stands at a bearing (as II 3's scene turns it)
  const label = node("g", {}, g); // the label lies over everything on the front
  node("path", { d: A.rule.d, fill: NIGHT, "fill-opacity": 0.6, stroke: SILVER, "stroke-width": W(1), "stroke-linejoin": "round" }, label);
  // the reading: X shown again over the label's end, lit, with a ring about it
  const xl = fr.letters[1 + A.hourLetters.indexOf("X")];
  const reading = node("g", { opacity: 0 }, g);
  const xr = rim(X_AT, (A.frontRadii.blocks + A.frontRadii.hours) / 2);
  node("circle", { cx: f(xr[0]), cy: f(xr[1]), r: 6.5, fill: NIGHT, "fill-opacity": 0.85, stroke: SILVER, "stroke-width": W(1.1) }, reading);
  const xt = xl.cloneNode(true);
  xt.setAttribute("fill", SILVER);
  xt.setAttribute("opacity", 1);
  reading.appendChild(xt);
  const point = reading;
  el.appendChild(svg);
  const s = { label, point, letters: fr.letters, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

// where the label's point stands, degrees clockwise from the top: once round from the cross, then on to X
function bearing(t) {
  return 360 * span(t, 0.8, 6.0) + X_AT * span(t, 6.0, 7.6);
}

function draw(s, t) {
  const back = span(t, 12.0, 12.8); // round to the cross again for the next loop
  // back to the cross the short way round (not unwinding every turn it made)
  const b0 = ((bearing(t) % 360) + 360) % 360;
  const b = b0 + ((b0 > 180 ? 360 : 0) - b0) * back;
  s.label.setAttribute("transform", `rotate(${f(b - (A.rule.contract.zero_deg + 180))})`);
  const at = ((b % 360) + 360) % 360;
  s.letters.forEach((l, i) => {
    const d = Math.abs((((at - 15 * i) % 360) + 540) % 360 - 180);
    const lit = Math.max(0, 1 - d / 9);
    const rest = i * 15 === X_AT ? span(t, 7.4, 7.9) * (1 - back) : 0;
    l.setAttribute("opacity", f(0.45 + 0.55 * Math.max(lit, rest)));
    l.setAttribute("fill", rest > 0.5 ? SILVER : "currentColor");
  });
  s.point.setAttribute("opacity", f(span(t, 7.6, 8.0) * (1 - back)));
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
