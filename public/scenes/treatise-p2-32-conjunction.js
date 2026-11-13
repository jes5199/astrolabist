// A Treatise on the Astrolabe, Part II, 32: "lok how many houres thilke coniunccion is fro the midday of the day
// precedent ... Rikne thanne thilke nombre of houres in the bordure of thyn Astrolabie ... and ley thy label over the
// degree of the sonne; and thanne wol the point of thy label sitte up-on the hour of the coniunccion. Loke thanne in
// which azimut the degree of thy sonne sitteth, and in that partie of the firmament is the coniunccioun."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete.  A conjunction three hours after midday (on Chaucer's 12 March; the sun and the moon met in
// the first degree of Aries): the rete turned so that the label, laid over the sun's degree, points three hours past
// the noon line on the border; the azimuth the sun's degree sits in is lit, and that quarter of the sky named.  Solved
// from the plate's geometry (52 degrees); shared lib/front.js; the rete and label are our constructed drawing of
// inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, LAT, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9600; // ms: the label on the hour, the azimuth lit and named
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = A.morning.sunLongitude;
const HOURS = 3; // after midday
const RA = (((Math.atan2(Math.cos(EPS) * Math.sin(SUN * RAD), Math.cos(SUN * RAD)) / RAD) % 360) + 360) % 360;
const DEC = Math.asin(Math.sin(EPS) * Math.sin(SUN * RAD));
const HA = 15 * HOURS; // the sun's hour angle, westward
const ROT = RA - 270 + HA; // the rete's turn that puts the sun's degree HA past the meridian
// the sun's place in the sky then: altitude and azimuth (from the south, westward positive)
const ALT = Math.asin(Math.sin(LAT) * Math.sin(DEC) + Math.cos(LAT) * Math.cos(DEC) * Math.cos(HA * RAD));
const AZ = Math.atan2(Math.sin(HA * RAD), Math.cos(HA * RAD) * Math.sin(LAT) - Math.tan(DEC) * Math.cos(LAT)) / RAD;
// a point of the sky (altitude h, azimuth az from the south, westward positive) on the plate
function sky(h, az) {
  const [hh, a] = [h * RAD, az * RAD];
  const sd = Math.sin(LAT) * Math.sin(hh) - Math.cos(LAT) * Math.cos(hh) * Math.cos(a);
  const cd = Math.sqrt(Math.max(0, 1 - sd * sd));
  const H = Math.atan2(Math.cos(hh) * Math.sin(a), Math.cos(LAT) * Math.sin(hh) + Math.sin(LAT) * Math.cos(hh) * Math.cos(a));
  const r = (P.equator * cd) / (1 + sd);
  return [r * Math.sin(H), -r * Math.cos(H)];
}
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
const sunAt = (rot) => rim(270 - RA + rot, rAt(DEC));

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.12);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.3);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.12);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.55);
  // the hours counted from the noon line on the border
  const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2;
  const a0 = rim(0, RB);
  const a1 = rim(HA, RB);
  const count = node("path", { d: `M${f(a0[0])} ${f(a0[1])}A${f(RB)} ${f(RB)} 0 0 1 ${f(a1[0])} ${f(a1[1])}`, fill: "none", stroke: "#f6d77a", "stroke-width": W(4), opacity: 0 }, g);
  // the azimuth through the sun, from the zenith to the horizon
  let d = "";
  for (let h = 90; h >= 0; h -= 2) {
    const p = sky(h, AZ);
    d += (h === 90 ? "M" : "L") + f(p[0]) + " " + f(p[1]);
  }
  const azLine = node("path", { d, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.6), opacity: 0 }, fr.plate.clip);
  const label = node("path", { d: A.rule.d, fill: NIGHT, "fill-opacity": 0.55, stroke: SILVER, "stroke-width": W(0.9), "stroke-linejoin": "round", opacity: 0 }, g);
  const sun = node("circle", { r: 3.6, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const moon = node("circle", { r: 2.6, fill: SILVER, stroke: NIGHT, "stroke-width": W(0.6) }, g);
  const text = (y, size) => node("text", { x: 0, y: f(y), "text-anchor": "middle", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const t1 = text(C.y + 50, 14);
  t1.textContent = `${HOURS} hours after midday`;
  const t2 = text(C.y + 68, 14);
  t2.textContent = `${Math.round(AZ)}° west of south`;
  el.appendChild(svg);
  const s = { rete: fr.rete.g, count, azLine, label, sun, moon, t1, t2, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  s.count.setAttribute("opacity", f(0.8 * span(t, 0.8, 1.4) * out));
  s.t1.setAttribute("opacity", f(span(t, 1.0, 1.5) * out));
  const r = ROT - 60 * (1 - span(t, 1.8, 5.6)) * out - 60 * (1 - out);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  const sp = sunAt(r);
  for (const e of [s.sun, s.moon]) {
    e.setAttribute("cx", f(sp[0] + (e === s.moon ? 3 : 0)));
    e.setAttribute("cy", f(sp[1] - (e === s.moon ? 2 : 0)));
  }
  const b = 270 - RA + r;
  s.label.setAttribute("transform", `rotate(${f(b - (A.rule.contract.zero_deg + 180))})`);
  s.label.setAttribute("opacity", f(span(t, 5.6, 6.2) * out));
  s.azLine.setAttribute("opacity", f(span(t, 7.0, 7.6) * out));
  s.t2.setAttribute("opacity", f(span(t, 7.6, 8.2) * out));
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
