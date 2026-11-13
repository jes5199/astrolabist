// A Treatise on the Astrolabe, Part II, 34: "Tak the altitude of the mone, and rikne thyn altitude up among thyne
// almikanteras on which syde that the mone stande; and set there a prikke. Tak thenne anon-right, up-on the mones syde,
// the altitude of any sterre fix which that thou knowest, and set his centre up-on his altitude among thyn almikanteras
// ther the sterre is founde. Waite thanne which degree of the zodiak toucheth the prikke of the altitude of the mone,
// and tak ther the degree in which the mone standeth ... And _nota_, that yif the mone shewe himself by light of day,
// than maystow wyrke this same conclusioun by the sonne, as wel as by the fix sterre."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone: lib/stage.js), after II 4 v2 (jes tg 17908, 17914, 17917):
// Chaucer's steps one at a time, listed beside the instrument, the step being done in red.  The moon 30 degrees high in
// the west; its altitude found among the almucantars on that side and pricked; a star on the same side (the text: "up-on
// the mones syde"; the woodcut v1 had it on the other side: wrong), Alhabor, at Chaucer's 18 degrees (II 3; v1 used the
// film's 12: wrong); the rete turned till it sits there; the degree of the zodiac then on the moon's prick ringed and
// named.  The moon is taken on the ecliptic (the text makes no exception for its latitude).  Replaces the woodcut v1 of
// the same name.  Solved from the plate's geometry (52 degrees); COLOURED WOODCUT on vellum, lib/front-ink.js; the rete
// is our constructed drawing of inv. 47869's.  Nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./lib/front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./lib/stage.js";

const instances = new WeakMap();
const LOOP = 30000;
const STILL = 21500; // ms: the star set, the moon's degree named
const LAYOUT = {
  wide: { C: { x: -76, y: 27, k: 0.67 }, list: { x: 4, y: -78, size: 9.6, lh: 11, gap: 7, indent: 10, width: 142 } },
  stack: { C: { x: 0, y: -52, k: 0.78 }, list: { x: -136, y: 46, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272 } },
};
let C = LAYOUT.wide.C;
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const H_MOON = 30;
const H_STAR = 18;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`;

const turn = (p, r) => [p[0] * Math.cos(r * RAD) - p[1] * Math.sin(r * RAD), p[0] * Math.sin(r * RAD) + p[1] * Math.cos(r * RAD)];
const raOf = (l) => (Math.atan2(Math.cos(EPS) * Math.sin(l * RAD), Math.cos(l * RAD)) / RAD + 360) % 360;
const decOf = (l) => Math.asin(Math.sin(EPS) * Math.sin(l * RAD));
const ecl = (l) => rim(270 - raOf(l), (P.equator * Math.cos(decOf(l))) / (1 + Math.sin(decOf(l))));
const off = (p, h) => {
  const [c, r] = almucantar(h);
  return Math.hypot(p[0], p[1] + c) - r;
};
// the turn of the rete that sets point p (on the rete) on the circle of altitude h, on the given side
function setOn(p, h, west) {
  let best = 0;
  for (let r = 0; r < 360; r += 0.25) {
    const a = turn(p, r);
    const b = turn(p, r + 0.25);
    if (off(a, h) * off(b, h) <= 0 && a[0] > 0 === west) {
      let lo = r;
      let hi = r + 0.25;
      for (let k = 0; k < 40; k++) {
        const m = (lo + hi) / 2;
        if (off(turn(p, lo), h) * off(turn(p, m), h) <= 0) hi = m;
        else lo = m;
      }
      best = lo;
    }
  }
  return best;
}
const TIP = A.night.tip; // Alhabor's pointer, on the rete
const ROT = setOn(TIP, H_STAR, true);
// the moon's degree, found as the text does: the degree of the zodiac on the moon's altitude, on its side (the west)
const FOUND = (() => {
  let best = null;
  for (let l = 0; l < 360; l += 0.25) {
    const a = turn(ecl(l), ROT);
    const b = turn(ecl(l + 0.25), ROT);
    if (a[0] > 0 && off(a, H_MOON) * off(b, H_MOON) <= 0) best = l + 0.125;
  }
  return best;
})();
const PRICK = turn(ecl(FOUND), ROT); // where the prick is set on the moon's circle (where the degree will come)
const R0 = ROT - 50; // the rete's rest before it is set

const STEPS = [
  { t: 0.5, lines: ["the moon's altitude: 30°, in the west"] },
  { t: 4.2, lines: ["find it among the almucantars on the moon's side; prick it"] },
  { t: 8.4, lines: ["on the moon's side, a star you know: Alhabor, 18° high"] },
  { t: 12.4, lines: ["turn the rete until the star sits on its 18° circle"] },
  { t: 17.4, lines: ["the degree of the zodiac on the moon's prick: the moon's degree"] },
  { t: 23.0, lines: ["(by day the sun serves as well as a star)"] },
];
const END = 27.6;

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const s = { raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  build(el, s);
  watch(el, s, () => {
    s.svg.remove();
    build(el, s);
  });
}

function build(el, s) {
  s.mode = layoutOf(el);
  const Lo = LAYOUT[s.mode];
  C = Lo.C;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  el.appendChild(svg);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.15);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.85);
  // the two circles of altitude, on the west side only
  const cp = node("clipPath", { id: "w" + uid }, g);
  node("rect", { x: 0, y: -100, width: 100, height: 200 }, cp);
  const circle = (h, stroke) => {
    const [c, r] = almucantar(h);
    return node("circle", { cy: f(-c), r: f(r), fill: "none", stroke, "stroke-width": W(2), opacity: 0, "clip-path": `url(#w${uid})` }, fr.plate.clip.parentNode);
  };
  const moonC = circle(H_MOON, SILVER);
  const starC = circle(H_STAR, "#b9821c");
  // the moon's prick on its circle; the star's pointer ringed (on the rete); the found degree ringed
  const prick = node("circle", { cx: f(PRICK[0]), cy: f(PRICK[1]), r: 2.6, fill: SILVER, stroke: VELLUM, "stroke-width": W(0.9), opacity: 0 }, g);
  const star = node("circle", { cx: f(TIP[0]), cy: f(TIP[1]), r: 4.6, fill: "none", stroke: SILVER, "stroke-width": W(1.8), opacity: 0 }, fr.rete.g);
  const ring = node("circle", { cx: f(PRICK[0]), cy: f(PRICK[1]), r: 6, fill: "none", stroke: SILVER, "stroke-width": W(2), opacity: 0 }, g);
  // the moon, a small crescent, out at the edge of the plate on its side
  const text = (size, anchor = "start") => node("text", { "text-anchor": anchor, "font-size": f((size * C.k) / 0.76), "font-weight": 700, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const [mc, mr] = almucantar(H_MOON);
  const tMoon = text(10, "middle");
  tMoon.textContent = "30°";
  const lp = [mr * Math.sin(140 * RAD), -mc - mr * Math.cos(140 * RAD)];
  tMoon.setAttribute("x", f(C.x + C.k * lp[0] + 10));
  tMoon.setAttribute("y", f(C.y + C.k * lp[1] - 2));
  const tStar = text(10, "middle");
  tStar.textContent = "Alhabor";
  const tFound = text(12, "end");
  tFound.textContent = nameOf(FOUND);
  tFound.setAttribute("x", f(C.x + C.k * (PRICK[0] - 8)));
  tFound.setAttribute("y", f(C.y + C.k * PRICK[1] + 4));
  const { rows } = stepList(node("g", {}, svg), STEPS, Lo.list);
  Object.assign(s, { svg, C, rete: fr.rete.g, moonC, starC, prick, star, ring, tMoon, tStar, tFound, rows });
  draw(s, s.tm / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, END, END + 0.8);
  const r = R0 + 50 * span(t, 12.8, 16.4) - 50 * span(t, END + 0.4, LOOP / 1000 - 0.2);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.moonC.setAttribute("opacity", f(span(t, 4.4, 5.0) * out));
  s.tMoon.setAttribute("opacity", f(span(t, 4.6, 5.0) * (1 - span(t, 17.2, 17.6))));
  s.prick.setAttribute("opacity", f(span(t, 6.0, 6.4) * out));
  s.starC.setAttribute("opacity", f(span(t, 8.6, 9.2) * out));
  s.star.setAttribute("opacity", f(span(t, 8.8, 9.2) * out));
  const sp = turn(TIP, r);
  s.tStar.setAttribute("x", f(s.C.x + s.C.k * sp[0]));
  s.tStar.setAttribute("y", f(s.C.y + s.C.k * (sp[1] - 8)));
  s.tStar.setAttribute("opacity", f(span(t, 9.0, 9.4) * out));
  s.ring.setAttribute("opacity", f(span(t, 17.6, 18.1) * out));
  s.tFound.setAttribute("opacity", f(span(t, 18.0, 18.5) * out));
  STEPS.forEach((st, i) => {
    const next = STEPS[i + 1] ? STEPS[i + 1].t : END;
    const now = t >= st.t && t < next;
    const done = t >= next;
    const a = (now || done ? 1 : 0.3) * span(t, 0.2, 0.5) * out;
    for (const e of s.rows[i]) {
      e.setAttribute("opacity", f(a));
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
