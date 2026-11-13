// A Treatise on the Astrolabe, Prologue: "And the seconde cause is this, that sothly me semeth betre to wryten un-to a
// child twyes a good sentence, than he for-gete it ones."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// (jes tg 17902.)  COLOURED WOODCUT on vellum.  Two small leaves.  On the left a line is written once, and fades
// away: forgotten.  On the right the same line is written, and written again, and stays.  The writing is a hand's
// scribble, not words (nothing is put in Chaucer's mouth); the rubric gives the clause.  lib/woodcut.js; our own
// drawing.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const LOOP = 13000;
const STILL = 9600; // ms: the once-written line gone, the twice-written one standing
const LEAF = { w: 82, h: 104, y: -18 };

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// a line of a hand's writing: little loops and strokes along a baseline, the same every time
function scribble(x0, x1, y) {
  let d = `M${f(x0)} ${f(y)}`;
  let x = x0;
  let k = 0;
  while (x < x1) {
    const w = 2.2 + ((k * 7) % 5) * 0.35;
    const tall = k % 6 === 2 ? 5.5 : k % 9 === 4 ? -3.5 : 2.4;
    d += `C${f(x + w * 0.2)} ${f(y - tall)} ${f(x + w * 0.8)} ${f(y - tall)} ${f(x + w)} ${f(y)}`;
    x += w;
    if (k % 5 === 4) {
      x += 2.6; // a space between words
      d += `M${f(x)} ${f(y)}`;
    }
    k++;
  }
  return d;
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11, wobble: 0.9, seed: 59 });
  const leaf = (cx) => {
    const g = node("g", { filter: wc.rough }, svg);
    const d = `M${f(cx - LEAF.w / 2)} ${f(LEAF.y - LEAF.h / 2)}H${f(cx + LEAF.w / 2)}V${f(LEAF.y + LEAF.h / 2)}H${f(cx - LEAF.w / 2)}Z`;
    node("path", { d, fill: VELLUM }, g);
    node("path", wc.wash({ d, fill: WASH.ochre, "fill-opacity": 0.35 }), g);
    node("path", { d, fill: "none", stroke: "currentColor", "stroke-width": 1.6 }, g);
    // ruled lines, faint
    let r = "";
    for (let i = 0; i < 9; i++) r += `M${f(cx - LEAF.w / 2 + 7)} ${f(LEAF.y - LEAF.h / 2 + 14 + i * 10)}H${f(cx + LEAF.w / 2 - 7)}`;
    node("path", { d: r, stroke: RED, "stroke-width": 0.4, opacity: 0.45 }, g);
    return g;
  };
  const L = -46;
  const R = 46;
  leaf(L);
  leaf(R);
  const line = (cx, row) => {
    const y = LEAF.y - LEAF.h / 2 + 14 + row * 10 - 1;
    return node("path", { d: scribble(cx - LEAF.w / 2 + 9, cx + LEAF.w / 2 - 9, y), fill: "none", stroke: "currentColor", "stroke-width": 1.15, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, svg);
  };
  const once = line(L, 3);
  const twice = [line(R, 3), line(R, 4)];
  const word = (x, y, str, size = 13) => {
    const t = node("text", { x, y, "text-anchor": "middle", "font-size": size, "font-weight": 600, fill: RED, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const tOnce = word(L, LEAF.y - LEAF.h / 2 - 6, "once");
  const tTwice = word(R, LEAF.y - LEAF.h / 2 - 6, "twice");
  const cap = [word(0, 62, "better written twice", 13), word(0, 78, "than forgotten once", 13)];
  el.appendChild(svg);
  const s = { once, twice, tOnce, tTwice, cap, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 12.0, 12.8);
  s.tOnce.setAttribute("opacity", f(span(t, 0.3, 0.8) * out));
  s.tTwice.setAttribute("opacity", f(span(t, 0.3, 0.8) * out));
  // once: written, then it fades away
  s.once.setAttribute("stroke-dashoffset", f(1 - span(t, 1.0, 3.0)));
  s.once.setAttribute("opacity", f(1 - span(t, 5.5, 8.0)));
  // twice: written, and written again; it stays
  s.twice[0].setAttribute("stroke-dashoffset", f(1 - span(t, 1.0, 3.0)));
  s.twice[1].setAttribute("stroke-dashoffset", f(1 - span(t, 3.4, 5.4)));
  for (const p of s.twice) p.setAttribute("opacity", f(out));
  s.cap[0].setAttribute("opacity", f(span(t, 8.2, 8.8) * out));
  s.cap[1].setAttribute("opacity", f(span(t, 8.6, 9.2) * out));
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
