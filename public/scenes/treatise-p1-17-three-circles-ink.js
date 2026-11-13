// A Treatise on the Astrolabe, Part I, 17: "The plate under thy riet is descryved with 3 principal cercles; of which
// the leste is cleped the cercle of Cancer, by-cause that the heved of Cancer turneth evermor consentrik up-on the
// same cercle ... The middel cercle in wydnesse, of thise 3, is cleped the Cercle Equinoxial; up-on whiche turneth
// evermo the hedes of Aries and Libra ... The wydeste of thise three principal cercles is cleped the Cercle of
// Capricorne, by-cause that the heved of Capricorne turneth evermo consentrik up-on the same cercle."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p1-17-three-circles.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red.
//
// The front, its plate quiet.  The three circles are drawn and named in turn, the least first.  Then the zodiac's
// line (the ecliptic, as the rete carries it) turns over them: the head of Cancer runs round on the circle of Cancer,
// the head of Capricorn on the circle of Capricorn, and the heads of Aries and Libra cross on the equinoxial.  The
// circles are the plate's of inv. 47869 in our drawing; the ecliptic is constructed from them (it touches the
// least and the widest).  Shared lib/front.js.  Original line work; nothing is traced.

import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 15000;
const STILL = 7600; // ms: the three named, the ecliptic on them
const C = { x: 0, y: 18, k: 0.62 }; // the hanging ring inside the window (its top 183 units up, at -95; astrolabist #47901)
const W = (px) => f(px / C.k);
const EC_R = (P.cancer + P.capricorn) / 2; // the ecliptic's radius
const EC_OFF = (P.capricorn - P.cancer) / 2; // its centre's distance from the pole, toward the head of Capricorn

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  // the three circles, drawn in turn: each a path drawn round from the top (pathLength 1)
  const circ = (r) => `M0 ${f(-r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(-r)}`;
  for (const t of fr.plate.tropics) t.setAttribute("display", "none");
  const three = [P.cancer, P.equator, P.capricorn].map((r) => node("path", { d: circ(r), pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke: "currentColor", "stroke-width": W(1.8) }, g));
  const words = ["Tropic of Cancer", "equator", "Tropic of Capricorn"].map((w, i) => {
    const r = [P.cancer, P.equator, P.capricorn][i];
    const t = node("text", { x: 0, y: f(C.y + C.k * r - 3.5), "text-anchor": "middle", "font-size": 10, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = w;
    return t;
  });
  // the ecliptic, turning: its line and the four heads
  const ec = node("g", { opacity: 0 }, g);
  node("circle", { cy: f(EC_OFF), r: f(EC_R), fill: "none", stroke: SILVER, "stroke-width": W(1.2), "stroke-dasharray": `${W(4)} ${W(3)}` }, ec);
  // with Capricorn's head at the bottom (bearing 180): Cancer's at the top, Aries and Libra where it cuts the equator
  const cosA = (EC_R * EC_R - EC_OFF * EC_OFF - P.equator * P.equator) / (2 * EC_OFF * P.equator); // bearing of the crossings
  const aries = (Math.acos(-cosA) * 180) / Math.PI;
  const heads = [
    [0, P.cancer],
    [180, P.capricorn],
    [aries, P.equator],
    [-aries, P.equator],
  ].map(([b, r]) => {
    const p = rim(b, r);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: f(3.2), fill: "currentColor", stroke: NIGHT, "stroke-width": W(0.8) }, ec);
  });
  el.appendChild(svg);
  const s = { three, words, ec, heads, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 14.0, 14.8);
  s.three.forEach((c, i) => {
    const a = 0.6 + 1.6 * i;
    c.setAttribute("stroke-dashoffset", f(1 - span(t, a, a + 1.3)));
    c.setAttribute("opacity", f(out));
  });
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, 1.5 + 1.6 * i, 2.0 + 1.6 * i) * out)));
  s.ec.setAttribute("opacity", f(span(t, 5.6, 6.2) * out));
  // the sky turns: once round in the time left, westward (clockwise on the front)
  const turn = 360 * span(t, 6.2, 13.8) * 0.75 + 20;
  s.ec.setAttribute("transform", `rotate(${f(turn)})`);
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
