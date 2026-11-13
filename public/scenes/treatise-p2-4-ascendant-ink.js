// A Treatise on the Astrolabe, Part II, 4: "The assendent sothly, to take it at the largeste, is thilke degree that
// assendeth at any of thise forseide tymes upon the est orisonte."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-4-ascendant.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete, turning westward into the setting of Chaucer's morning (II 3: 12 March 1391, the sun in
// the first degree of Aries at 25 1/2 degrees): all the while a mark rides the eastern horizon at the degree of the
// zodiac that is rising there.  At rest it is named: the ascendant, the 20th degree of Gemini, as Chaucer found it.
// The degree is found here by the plate's geometry (computed 79.7 degrees of longitude at Chaucer's setting, his
// figure 80); only the rising degree is shown (no astrological reading).  Shared lib/front.js; the rete and its
// setting are our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 13000;
const STILL = 8800; // ms: at Chaucer's setting, the ascendant named
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const [HC, HR] = almucantar(0);
const SET = A.morning.rot; // the rete's turn at Chaucer's morning
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// the ecliptic degree lam on the rete turned by rot (clockwise), in the plate's units
function at(lam, rot) {
  const l = lam * RAD;
  const ra = Math.atan2(Math.cos(EPS) * Math.sin(l), Math.cos(l)) / RAD;
  const d = Math.asin(Math.sin(EPS) * Math.sin(l));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - ra + rot, r);
}
// the degree on the eastern (left) horizon, searched near a guess
function ascendant(rot, guess) {
  const g = (lam) => {
    const p = at(lam, rot);
    return Math.hypot(p[0], p[1] + HC) - HR;
  };
  for (let i = -80; i < 80; i++) {
    let a = guess + i / 2;
    let b = a + 0.5;
    if (g(a) * g(b) > 0) continue;
    for (let k = 0; k < 30; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (at(a, rot)[0] < 0) return a;
  }
  return guess;
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.75);
  // the eastern half of the horizon, bright
  const east = node("path", { fill: "none", stroke: SILVER, "stroke-width": W(1.6) }, g);
  {
    let d = "";
    for (let a = 0; a <= 180; a += 3) { // from the north point (bottom) round by the east (left) toward the south
      const x = -HR * Math.sin(a * RAD);
      const y = -HC + HR * Math.cos(a * RAD);
      if (Math.hypot(x, y) <= P.capricorn) d += (d ? "L" : "M") + f(x) + " " + f(y);
    }
    east.setAttribute("d", d);
  }
  const sun = node("circle", { r: 3.2, fill: "#b9821c", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const mark = node("circle", { r: 3.6, fill: SILVER, stroke: NIGHT, "stroke-width": W(0.8) }, g);
  const word = (size) => node("text", { "text-anchor": "start", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const w1 = word(15);
  const w2 = word(14);
  w1.textContent = "ascendant";
  el.appendChild(svg);
  const s = { rete: fr.rete.g, sun, mark, w1, w2, guess: 50, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const back = span(t, 11.8, 12.8);
  // turning westward (clockwise) into Chaucer's setting; at the end, back to where it began for the next loop
  const r = back > 0 ? SET - 75 * back : SET - 75 * (1 - span(t, 0.6, 7.2));
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = at(A.morning.sunLongitude, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  const lam = ascendant(r, 79.7 - 75 * (1 - span(t, 0.6, 7.2)));
  const p = at(lam, r);
  s.mark.setAttribute("cx", f(p[0]));
  s.mark.setAttribute("cy", f(p[1]));
  const x = C.x + C.k * p[0];
  const y = C.y + C.k * p[1];
  const rest = span(t, 7.4, 8.0) * (1 - back);
  s.w1.setAttribute("x", f(x - 4));
  s.w1.setAttribute("y", f(y - 9));
  s.w1.setAttribute("opacity", f(rest));
  const L = ((lam % 360) + 360) % 360;
  s.w2.textContent = `${SIGNS[Math.floor(L / 30)]} ${Math.round(L % 30)}°`;
  s.w2.setAttribute("x", f(x - 4));
  s.w2.setAttribute("y", f(y + 17));
  s.w2.setAttribute("opacity", f(rest));
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
