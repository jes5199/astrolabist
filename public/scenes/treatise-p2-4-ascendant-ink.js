// A Treatise on the Astrolabe, Part II, 4: "The assendent sothly, to take it at the largeste, is thilke degree that
// assendeth at any of thise forseide tymes upon the est orisonte."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-4-ascendant.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// v2 (jes tg 17908: "confusing"): one idea at a time, in the text's order, each held with a short caption.
// 1. the eastern horizon, drawn in red;  2. the rete turned (slowly) into Chaucer's morning (II 3: the sun in the first
// degree of Aries at 25 1/2 degrees);  3. the degree of the zodiac then on the eastern horizon, pricked and named:
// Gemini 20 (computed 79.7 degrees of longitude, Chaucer's figure 80);  4. "the ascendant";  5. what the text calls
// the house of the ascendant: from 5 degrees above that degree to 25 below it along the zodiac, as Chaucer reports
// the astrologers' rule (no reading of it: he says he has no faith in it).  Shared lib/front-ink.js; the rete and
// its setting are our constructed drawing of inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 22000;
const STILL = 17500; // ms: the ascendant named, its house shown
const C = { x: 0, y: -4, k: 0.7 };
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

const ASC = ascendant(SET, 79.7); // the degree on the eastern horizon at Chaucer's setting

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3); // the plate's lines quiet: only the horizon matters here
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  // 1. the eastern half of the horizon, in red, drawn in from the north point round by the east
  let d = "";
  for (let a = 0; a <= 180; a += 3) {
    const x = -HR * Math.sin(a * RAD);
    const y = -HC + HR * Math.cos(a * RAD);
    if (Math.hypot(x, y) <= P.capricorn) d += (d ? "L" : "M") + f(x) + " " + f(y);
  }
  const east = node("path", { d, fill: "none", stroke: SILVER, "stroke-width": W(2.2), pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }, g);
  // 5. the house of the ascendant: along the ecliptic from 5 degrees above the ascendant to 25 below
  let hd = "";
  for (let l = ASC - 5; l <= ASC + 25.01; l += 1) {
    const p = at(l, 0); // on the rete itself (the group is turned)
    hd += (hd ? "L" : "M") + f(p[0]) + " " + f(p[1]);
  }
  const house = node("path", { d: hd, fill: "none", stroke: "#b9821c", "stroke-width": W(6), "stroke-linecap": "round", opacity: 0 }, fr.rete.g);
  const ends = [ASC - 5, ASC + 25].map((l) => {
    const p = at(l, 0);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.2, fill: "#b9821c", stroke: NIGHT, "stroke-width": W(0.8), opacity: 0 }, fr.rete.g);
  });
  // 3. the degree on the horizon, pricked (it rides the rete: it is a degree of the zodiac)
  const pa = at(ASC, SET); // where it stands on the plate at Chaucer's setting (for the words)
  const p0 = at(ASC, 0);
  const mark = node("circle", { cx: f(p0[0]), cy: f(p0[1]), r: 3.8, fill: SILVER, stroke: NIGHT, "stroke-width": W(1), opacity: 0 }, fr.rete.g);
  const word = (x, y, str, size = 14, anchor = "middle") => {
    const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": size, "font-weight": 600, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3.5, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const wx = C.x + C.k * pa[0];
  const wy = C.y + C.k * pa[1];
  const L = ((ASC % 360) + 360) % 360;
  // both words above the mark: the house runs below it, toward Cancer
  const deg = word(wx - 4, wy - 9, `${SIGNS[Math.floor(L / 30)]} ${Math.round(L % 30)}°`, 14, "start");
  const asc = word(wx - 4, wy - 25, "the ascendant", 14, "start");
  const caps = [
    [0.4, 3.4, ["the eastern horizon"]],
    [3.8, 8.0, ["turn the rete"]],
    [8.4, 11.4, ["the degree on the eastern horizon"]],
    [11.8, 14.6, ["is the ascendant"]],
    [15.0, 20.6, ["its house: from 5° above it", "to 25° below"]],
  ].map(([a, b, lines]) => ({ a, b, el: lines.map((str, i) => word(0, 95 - (lines.length - 1 - i) * 14, str, 13)) }));
  el.appendChild(svg);
  const s = { rete: fr.rete.g, east, house, ends, mark, deg, asc, caps, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 20.6, 21.2); // the marks go; then the rete goes back for the next round
  // 1. the horizon drawn in, and held
  s.east.setAttribute("stroke-dashoffset", f(1 - span(t, 0.4, 2.0)));
  s.east.setAttribute("opacity", f(out));
  // 2. the rete turned slowly into Chaucer's morning; back again at the very end
  const r = SET - 60 * (1 - span(t, 3.8, 7.6)) - 60 * span(t, 21.0, 22.0);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  // 3, 4. the degree pricked and named; called the ascendant
  s.mark.setAttribute("opacity", f(span(t, 8.4, 8.9) * out));
  s.deg.setAttribute("opacity", f(span(t, 9.0, 9.5) * out));
  s.asc.setAttribute("opacity", f(span(t, 11.8, 12.3) * out));
  // 5. its house
  const h = span(t, 15.0, 16.2) * out;
  s.house.setAttribute("opacity", f(0.85 * h));
  for (const e of s.ends) e.setAttribute("opacity", f(h));
  for (const c of s.caps) {
    const a = span(t, c.a, c.a + 0.4) * (1 - span(t, c.b - 0.4, c.b));
    for (const e of c.el) e.setAttribute("opacity", f(a));
  }
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
