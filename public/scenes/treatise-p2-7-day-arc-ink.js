// A Treatise on the Astrolabe, Part II, 7: "Set the degree of thy sonne up-on thyn est orisonte, and ley thy label on
// the degree of the sonne, and at the poynt of thy label in the bordure set a prikke. Turn thanne thy riet aboute til
// the degree of the sonne sit up-on the west orisonte, and ley thy label up-on the same degree of the sonne, and at
// the point of thy label set a-nother prikke. Rekne thanne the quantitee of tyme in the bordure by-twixe bothe
// prikkes, and tak ther thyn ark of the day. The remenant of the bordure under the orisonte is the ark of the night."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
// COLOURED WOODCUT on vellum (jes tg 17847), replacing treatise-p2-7-day-arc.js: lib/front-ink.js (the same drawing cut
// and washed by lib/woodcut.js); what the old scene lit silver is lit in the printer's red, gold in a deep ochre.
//
// The front with its rete, the sun at the head of Cancer (midsummer: the text gives no day; at this latitude the
// difference is plainest then).  The sun set on the eastern horizon, the label laid on it, a prick; the rete turned
// west until the sun sits on the western horizon, the label again, another prick; the border between the pricks is
// lit as the arc of the day, the rest as the arc of the night, each with its length in hours.  All solved from the
// plate's geometry; shared lib/front.js; the rete and label are our constructed drawing of inv. 47869's.
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front-ink.js";

const instances = new WeakMap();
const LOOP = 15000;
const STILL = 11000; // ms: both pricks, the two arcs lit and measured
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
// THE DAY (shared by II 7, II 8 and II 10: change all three together): the sun's longitude, 90 = the head of Cancer
// (midsummer); 1 = Chaucer's 12 March
const DAY_SUN_LONGITUDE = 90;
const SUN = DAY_SUN_LONGITUDE;
const [HC, HR] = almucantar(0);
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2; // where the pricks go, on the border's ladder

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const raOf = (lam) => Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
function at(lam, rot) {
  const d = Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
  const r = (P.equator * Math.cos(d)) / (1 + Math.sin(d));
  return rim(270 - raOf(lam) + rot, r);
}
const bearingOf = (lam, rot) => (((270 - raOf(lam) + rot) % 360) + 360) % 360;
// the rete's turn that sets the sun on the horizon, on the east (-1) or west (+1) side
function onHorizon(side) {
  const g = (rot) => {
    const p = at(SUN, rot);
    return Math.hypot(p[0], p[1] + HC) - HR;
  };
  for (let rot = 0; rot < 360; rot += 1) {
    if (g(rot) * g(rot + 1) > 0) continue;
    let a = rot;
    let b = rot + 1;
    for (let k = 0; k < 40; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (Math.sign(at(SUN, a)[0]) === side) return a;
  }
  return 0;
}
const ROT_E = onHorizon(-1);
const ROT_W0 = onHorizon(1);
const ROT_W = ROT_W0 < ROT_E ? ROT_W0 + 360 : ROT_W0; // turning westward (clockwise) from the east setting
const B_E = bearingOf(SUN, ROT_E);
const DAY = ROT_W - ROT_E; // degrees of the border the sun's label passes: the arc of the day
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  fr.plate.horizon.setAttribute("opacity", 1);
  for (const l of fr.letters) l.setAttribute("opacity", 0.45);
  fr.rete.g.setAttribute("opacity", 0.6);
  // the two arcs of the border, day and night, on the ladder
  const arc = (b0, sweep, stroke) => {
    const a = rim(b0, RB);
    const b = rim(b0 + sweep, RB);
    return node("path", { d: `M${f(a[0])} ${f(a[1])}A${f(RB)} ${f(RB)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`, fill: "none", stroke, "stroke-width": W(4), opacity: 0 }, g);
  };
  const dayArc = arc(B_E, DAY, "#b9821c");
  const nightArc = arc(B_E + DAY, 360 - DAY, SILVER);
  const label = node("path", { d: A.rule.d, fill: NIGHT, "fill-opacity": 0.55, stroke: SILVER, "stroke-width": W(0.9), "stroke-linejoin": "round", opacity: 0 }, g);
  const sun = node("circle", { r: 3.4, fill: "#b9821c", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const prick = (b) => {
    const p = rim(b, RB);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.6, fill: "currentColor", stroke: SILVER, "stroke-width": W(0.9), opacity: 0 }, g);
  };
  const pricks = [prick(B_E), prick(B_E + DAY)];
  const word = (str, b, r) => {
    const p = rim(b, r);
    const t = node("text", { x: f(C.x + C.k * p[0]), y: f(C.y + C.k * p[1] + 5), "text-anchor": "middle", "font-size": 13, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const words = [word(`day ${hm(DAY)}`, B_E + DAY / 2, 60), word(`night ${hm(360 - DAY)}`, B_E + DAY + (360 - DAY) / 2, 60)];
  el.appendChild(svg);
  const s = { rete: fr.rete.g, label, sun, pricks, dayArc, nightArc, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 14.0, 14.8);
  // the rete: at the east setting, turned to the west setting, back again for the next loop
  const r = ROT_E + DAY * span(t, 2.6, 6.4) * (1 - span(t, 14.0, 14.8));
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = at(SUN, r);
  s.sun.setAttribute("cx", f(sp[0]));
  s.sun.setAttribute("cy", f(sp[1]));
  // the label laid on the sun at each setting
  const lay = span(t, 0.8, 1.4) * (1 - span(t, 2.2, 2.6)) + span(t, 6.8, 7.4) * (1 - span(t, 8.6, 9.0));
  s.label.setAttribute("transform", `rotate(${f(bearingOf(SUN, r) - (A.rule.contract.zero_deg + 180))})`);
  s.label.setAttribute("opacity", f(lay));
  s.pricks[0].setAttribute("opacity", f(span(t, 1.5, 1.8) * out));
  s.pricks[1].setAttribute("opacity", f(span(t, 7.5, 7.8) * out));
  s.dayArc.setAttribute("opacity", f(0.75 * span(t, 9.0, 9.6) * out));
  s.nightArc.setAttribute("opacity", f(0.45 * span(t, 9.6, 10.2) * out));
  s.words[0].setAttribute("opacity", f(span(t, 9.2, 9.8) * out));
  s.words[1].setAttribute("opacity", f(span(t, 9.8, 10.4) * out));
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
