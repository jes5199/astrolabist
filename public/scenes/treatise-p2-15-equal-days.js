// A Treatise on the Astrolabe, Part II, 15: "Loke whiche degrees ben y-lyke fer fro the hevedes of Cancer and Capricorn;
// and lok, whan the sonne is in any of thilke degrees, than ben the dayes y-lyke of lengthe ... Also, yif thou take two
// dayes naturaly in the yer y-lyke fer fro eyther pointe of the equinoxial in the opposit parties, than as long is the
// day artificial of that on day as is the night of that othere."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete.  First, two degrees equally far from the head of Cancer (Taurus 10 and Leo 20, fifty
// degrees either side): both lie on the same circle about the pole (the same declination), so the sun in either has
// the same day.  Then two degrees equally far from the equinoxes on opposite sides (Taurus 10 and Scorpio 10): the
// day of the one is as long as the night of the other.  Lengths computed from each degree's declination at the
// latitude of inv. 47869's plate (52); shared lib/front.js; the rete is our constructed drawing.  Original line work.

import { front, node, f, rim, P, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 5200; // ms: the first pair, its circle and its equal days
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const ROT = 90; // the rete's turn (any would do: this one stands the first pair one above the other)
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const rOf = (lam) => (P.equator * Math.cos(decOf(lam))) / (1 + Math.sin(decOf(lam)));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
const at = (lam) => rim(270 - raOf(lam) + ROT, rOf(lam));
const dayOf = (lam) => (2 * Math.acos(-Math.tan(P.latitude * RAD) * Math.tan(decOf(lam)))) / RAD; // degrees
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`;
const ACTS = [
  { a: 40, b: 140, wa: "day", wb: "day" }, // equally far from the head of Cancer
  { a: 40, b: 220, wa: "day", wb: "night" }, // equally far from the equinoxes, opposite
];

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.25);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.2);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("transform", `rotate(${ROT})`);
  fr.rete.g.setAttribute("opacity", 0.6);
  // the line through the heads of Cancer and Capricorn
  const hc = at(90);
  const hp = at(270);
  node("line", { x1: f(hc[0]), y1: f(hc[1]), x2: f(hp[0]), y2: f(hp[1]), stroke: SILVER, "stroke-width": W(0.7), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.6 }, g);
  const acts = ACTS.map((act) => {
    const grp = node("g", { opacity: 0 }, g);
    for (const lam of [act.a, act.b]) node("circle", { r: f(rOf(lam)), fill: "none", stroke: SILVER, "stroke-width": W(1), "stroke-dasharray": `${W(3)} ${W(2)}`, opacity: 0.8 }, grp);
    const marks = [act.a, act.b].map((lam) => {
      const p = at(lam);
      return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 3.4, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.7) }, grp);
    });
    const tg = node("g", { opacity: 0 }, svg);
    const text = (x, y, str, anchor = "middle") => {
      const t = node("text", { x: f(x), y: f(y), "text-anchor": anchor, "font-size": 13, fill: SILVER, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, tg);
      t.textContent = str;
      return t;
    };
    // each degree named beside its point, a little in toward the pin
    const words = [act.a, act.b].map((lam) => {
      const p = at(lam);
      const k = (Math.hypot(p[0], p[1]) - 13) / Math.hypot(p[0], p[1]);
      return text(C.x + C.k * p[0] * k, C.y + C.k * p[1] * k + 4.5, nameOf(lam));
    });
    // the comparison, in the middle
    const len = hm(dayOf(act.a));
    words.push(text(C.x, C.y - 62, act.wb === "day" ? `same day: ${len}` : `day = night: ${len}`));
    return { grp, marks, tg, words };
  });
  el.appendChild(svg);
  const s = { acts, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const a1 = span(t, 0.6, 1.4) * (1 - span(t, 7.4, 8.0));
  const a2 = span(t, 8.4, 9.2) * (1 - span(t, 15.2, 15.8));
  s.acts[0].grp.setAttribute("opacity", f(a1));
  s.acts[0].tg.setAttribute("opacity", f(span(t, 2.2, 2.8) * (1 - span(t, 7.4, 8.0))));
  s.acts[1].grp.setAttribute("opacity", f(a2));
  s.acts[1].tg.setAttribute("opacity", f(span(t, 10.0, 10.6) * (1 - span(t, 15.2, 15.8))));
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
