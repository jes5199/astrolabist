// A Treatise on the Astrolabe, Part II, 31: "the sonne aryseth nat al-wey verrey est, but some tyme by north the est,
// and som tyme by southe the est. Sothly, the sonne aryseth never-mo verrey est in oure orisonte, but he be in the heved
// of Aries or Libra. Now is thyn orisonte departed in 24 parties by thy azimutz ... Thanne is ther no more but waite in
// which azimut that thy sonne entreth at his arysing."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The plate, close, its azimuths quiet.  The sun rises three times on the eastern horizon: at midsummer where the horizon
// meets the circle of Cancer, at the equinox where it meets the equator (very east), at midwinter where it meets
// Capricorn's.  Each time the azimuth it enters is lit and its distance from very east named.  Computed for the
// latitude of inv. 47869's plate (52); shared lib/front.js.  Original line work; nothing is traced.

import { front, node, f, rim, P, LAT, nightFrom, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 15000;
const STILL = 2600; // ms: midsummer's sunrise named
const C = { x: 0, y: 6, k: 1.12 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const OBL = P.obliquity;
// distance of sunrise from very east at declination dec: sin a = sin dec / cos lat
const amp = (dec) => Math.asin(Math.sin(dec * RAD) / Math.cos(LAT)) / RAD;
// a point of the sky (altitude h, azimuth az from the south, westward positive) on the plate
function sky(h, az) {
  const [hh, a] = [h * RAD, az * RAD];
  const sd = Math.sin(LAT) * Math.sin(hh) - Math.cos(LAT) * Math.cos(hh) * Math.cos(a);
  const cd = Math.sqrt(Math.max(0, 1 - sd * sd));
  const H = Math.atan2(Math.cos(hh) * Math.sin(a), Math.cos(LAT) * Math.sin(hh) + Math.sin(LAT) * Math.cos(hh) * Math.cos(a));
  const r = (P.equator * cd) / (1 + sd);
  return [r * Math.sin(H), -r * Math.cos(H)];
}
const ACTS = [
  { season: "midsummer", rd: P.cancer, dec: OBL },
  { season: "equinox", rd: P.equator, dec: 0 },
  { season: "midwinter", rd: P.capricorn, dec: -OBL },
].map((a) => {
  const A = amp(a.dec); // north of east (positive) or south
  const az = -(90 + A); // from the south, westward positive: east is -90
  const word = Math.abs(A) < 0.05 ? "very east" : `${Math.round(Math.abs(A))}° ${A > 0 ? "north" : "south"} of east`;
  return { ...a, A, az, word, at: rim(-nightFrom(a.rd), a.rd) };
});

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, rete: false, faint: 0.4 });
  for (const a of fr.plate.almucantars) a.el.setAttribute("opacity", 0.12);
  for (const z of fr.plate.azimuths) z.el.setAttribute("opacity", 0.35);
  for (const h of fr.plate.hours) h.setAttribute("opacity", 0.12);
  for (const l of fr.letters) l.setAttribute("opacity", 0.3);
  fr.plate.horizon.setAttribute("opacity", 1);
  const acts = ACTS.map((a) => {
    let d = "";
    for (let h = 90; h >= 0; h -= 2) {
      const p = sky(h, a.az);
      d += (h === 90 ? "M" : "L") + f(p[0]) + " " + f(p[1]);
    }
    const line = node("path", { d, fill: "none", stroke: "#f6d77a", "stroke-width": W(1.6), opacity: 0 }, fr.plate.clip);
    const sun = node("circle", { cx: f(a.at[0]), cy: f(a.at[1]), r: 3.6, fill: "#f6d77a", stroke: NIGHT, "stroke-width": W(0.7), opacity: 0 }, g);
    return { line, sun };
  });
  const text = (y, size) => node("text", { x: 0, y: f(y), "text-anchor": "middle", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const season = text(C.y + 50, 14);
  const word = text(C.y + 68, 14);
  el.appendChild(svg);
  const s = { acts, season, word, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const i = Math.min(2, Math.floor(t / 5));
  const u = t - 5 * i;
  const out = 1 - span(u, 4.3, 4.9);
  s.acts.forEach((a, j) => {
    const on = j === i ? out : 0;
    a.sun.setAttribute("opacity", f(span(u, 0.3, 0.8) * on));
    a.line.setAttribute("opacity", f(span(u, 0.9, 1.5) * on));
  });
  s.season.textContent = ACTS[i].season;
  s.word.textContent = ACTS[i].word;
  s.season.setAttribute("opacity", f(span(u, 0.5, 1.0) * out));
  s.word.setAttribute("opacity", f(span(u, 1.4, 1.9) * out));
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
