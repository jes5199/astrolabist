// A Treatise on the Astrolabe, Part II, 27: "Set the heved of what signe thee liste to knowe his assending in the right
// cercle up-on the lyne meridional; and waite wher thyn almury toucheth the bordure, and set ther a prikke. Turne thanne
// thy riet westward til that the ende of the forseide signe sitte up-on the meridional lyne; and eft-sones waite wher
// thyn almury toucheth the bordure, and set ther another prikke. Rikne thanne the nombre of degrees in the bordure
// by-twixe bothe prikkes, and tak the assencioun of the signe in the right cercle."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-27-right-ascension.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete, the almury lit.  Aries: its head on the meridian line, a prick where the almury touches the
// border; turned westward till its end is on the line, another prick; the border between them lit and counted: less
// than its thirty degrees.  Then Cancer: more than thirty (the signs of right ascension, II 28).  Solved from the
// plate's geometry; shared lib/front.js; the rete and almury are our constructed drawing of inv. 47869's.
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 7400; // ms: Aries counted
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2;
const raOf = (lam) => {
  const r = Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
  return ((r % 360) + 360) % 360;
};
const unwrap = (a, ref) => a + 360 * Math.round((ref - a) / 360);
const ACTS = [
  { name: "Aries", head: 0 },
  { name: "Cancer", head: 90 },
].map((a) => {
  const r0 = raOf(a.head);
  const r1 = unwrap(raOf(a.head + 30), r0 + 30);
  return { ...a, rot0: r0 - 270, rot1: r1 - 270, deg: r1 - r0 };
});

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const arcD = (b0, sweep, r) => {
  const a = rim(b0, r);
  const b = rim(b0 + Math.max(0.01, sweep), r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.7);
  node("path", { d: "M-1.7 -82.6H1.7V-74.6H-1.7Z", fill: SILVER }, fr.rete.g); // the almury, lit
  node("path", { d: `M0 -${f(P.capricorn)}V0`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6, fill: "none" }, g);
  const acts = ACTS.map(() => {
    const arc = node("path", { fill: "none", stroke: "#b9821c", "stroke-width": W(4), opacity: 0 }, g);
    const p = [0, 1].map(() => node("circle", { r: 2.4, fill: "currentColor", stroke: SILVER, "stroke-width": W(0.9), opacity: 0 }, g));
    return { arc, p };
  });
  const cap = node("text", { x: 0, y: f(C.y + 52), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, acts, cap, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const act = t < 9 ? 0 : 1;
  const u = t - 9 * act;
  const A0 = ACTS[act];
  const out = 1 - span(u, 8.2, 8.9);
  let r = u < 1.0 ? A0.rot0 - 20 + 20 * span(u, 0, 1.0) : A0.rot0 + (A0.rot1 - A0.rot0) * span(u, 2.6, 5.2);
  // as this example fades, the rete turns on to where the next one begins (no snap between them, or at the loop)
  const next = ACTS[(act + 1) % ACTS.length].rot0 - 20;
  let dr = next - A0.rot1;
  dr -= 360 * Math.round(dr / 360);
  r += dr * span(u, 8.2, 9.0);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.acts.forEach((a, i) => {
    const on = i === act ? out : 0;
    a.p[0].setAttribute("cx", f(rim(ACTS[i].rot0, RB)[0]));
    a.p[0].setAttribute("cy", f(rim(ACTS[i].rot0, RB)[1]));
    a.p[1].setAttribute("cx", f(rim(ACTS[i].rot1, RB)[0]));
    a.p[1].setAttribute("cy", f(rim(ACTS[i].rot1, RB)[1]));
    a.p[0].setAttribute("opacity", f(span(u, 1.4, 1.8) * on));
    a.p[1].setAttribute("opacity", f(span(u, 5.4, 5.8) * on));
    a.arc.setAttribute("d", arcD(ACTS[i].rot0, ACTS[i].deg, RB));
    a.arc.setAttribute("opacity", f(0.8 * span(u, 6.0, 6.5) * on));
  });
  s.cap.textContent = `${A0.name}: ${A0.deg.toFixed(1)}° of the equator`;
  s.cap.setAttribute("opacity", f(span(u, 6.2, 6.8) * out));
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
