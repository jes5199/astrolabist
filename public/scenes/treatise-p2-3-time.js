// A Treatise on the Astrolabe, Part II, 3: "To knowe every tyme of the day by light of the sonne".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Chaucer's own example, on the front of the instrument: 12 March 1391, the sun in the first degree of Aries,
// 25 1/2 degrees high before noon.  The rete is turned until the sun's degree lies on the circle of that
// altitude on the east side (the left); the label is laid over the sun's degree; its point cuts the rim at the
// letter X; the letters are counted from the line of midnight: nine of the clock.
//
// Second act, the same night: the day turns (the label stays on the sun and sweeps the hours) until the fair
// white star Alhabor stands 12 degrees high in the west; the sun is under the horizon; the label, still over the
// sun's degree, is counted from the line of midday: past nine by about ten degrees.
//
// The plate (latitude 52, as this instrument's is engraved) is computed here by stereographic projection.  How
// far the rete turns and where the label cuts the rim come from the shared module, where they were computed on
// our drawing: the label lands a degree and a half short of the X, about five minutes before nine.
// Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const RAD = Math.PI / 180;

const C = { x: 0, y: 26, k: 0.64 }; // the instrument's centre in the window, and its scale (limb radius 100 -> 60)
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const LIGHT = "#fff6dc";
const LOOP = 44000; // ms
const M = A.morning;
const N = A.night;
const ROT0 = M.rot - 75; // where the rete rests before it is turned
const LABEL0 = M.label - 62; // where the label lies before it is laid over the sun
const X_AT = 15 * (1 + A.hourLetters.indexOf("X")); // degrees clockwise from the top: 315

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();
const NSS = { "vector-effect": "non-scaling-stroke" };
// a point on the rim: degrees clockwise from the top, radius in instrument units
const rim = (deg, r) => [r * Math.sin(deg * RAD), -r * Math.cos(deg * RAD)];
// the circle of altitude `alt` on the plate: its centre's height above the pole, and its radius
function almucantar(alt) {
  const den = Math.sin(A.plate.latitude * RAD) + Math.sin(alt * RAD);
  return [(A.plate.equator * Math.cos(A.plate.latitude * RAD)) / den, (A.plate.equator * Math.cos(alt * RAD)) / den];
}

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const defs = node("defs", {}, svg);
  node("circle", { r: A.plate.capricorn }, node("clipPath", { id: "plate-" + uid }, defs));
  const grad = node("radialGradient", { id: "glow-" + uid }, defs);
  node("stop", { offset: 0, "stop-color": LIGHT, "stop-opacity": 0.6 }, grad);
  node("stop", { offset: 1, "stop-color": LIGHT, "stop-opacity": 0 }, grad);

  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})`, fill: "none", stroke: "currentColor" }, svg);

  // ---- the suspension and the rim
  const th = node("g", { fill: NIGHT, "fill-opacity": 0.72, "stroke-width": 0.8, "stroke-linejoin": "round" }, g);
  for (const k of ["base", "boss", "stem", "shackle"]) node("path", { d: A.throneFront[k], ...NSS }, th);
  node("path", { d: A.throneFront.ring, fill: "none", ...NSS }, th);
  const R = A.frontRadii;
  node("circle", { r: R.outer, fill: NIGHT, "fill-opacity": 0.72, "stroke-width": 1.2, ...NSS }, g);
  node("circle", { r: R.blocks, "stroke-width": 0.4, opacity: 0.7, ...NSS }, g);
  node("circle", { r: R.hollow, "stroke-width": 0.7, ...NSS }, g);
  // the 24 hour marks: the cross on the noon line, then a mark for each letter
  let d = "";
  for (let i = 1; i < 24; i++) {
    const a = rim(15 * i, R.blocks + 1.6);
    const b = rim(15 * i, R.hours - 0.6);
    d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  const top = (R.blocks + R.hours) / 2;
  d += `M0 ${f(-top - 3)}V${f(-top + 3)}M-3 ${f(-top)}H3`;
  node("path", { d, "stroke-width": 0.9, "stroke-linecap": "round", opacity: 0.85, ...NSS }, g);

  // ---- the plate: tropics and equator, the horizon, circles of altitude every ten degrees, the meridian
  const plate = node("g", { "clip-path": `url(#plate-${uid})`, stroke: "#a7b0d4" }, g);
  for (const r of [A.plate.cancer, A.plate.equator, A.plate.capricorn])
    node("circle", { r: f(r), "stroke-width": 0.35, opacity: 0.5, "stroke-dasharray": "1.5 2.5", ...NSS }, plate);
  for (let alt = 0; alt <= 80; alt += 10) {
    const [up, r] = almucantar(alt);
    node("circle", { cy: f(-up), r: f(r), "stroke-width": alt ? 0.35 : 0.8, opacity: alt ? 0.55 : 0.9, ...NSS }, plate);
  }
  node("path", { d: `M0 ${-A.plate.capricorn}V${A.plate.capricorn}M${-A.plate.capricorn} 0H${A.plate.capricorn}`, "stroke-width": 0.35, opacity: 0.5, ...NSS }, plate);
  // the circle of 25 1/2 degrees, the one the sun is set upon
  const [up, r] = almucantar(M.sunAlt);
  const circle = node("circle", { cy: f(-up), r: f(r), stroke: SILVER, "stroke-width": 1.1, opacity: 0.35, ...NSS }, plate);
  // and the circle of 12 degrees, for the star at night
  const [up2, r2] = almucantar(N.starAlt);
  const circle2 = node("circle", { cy: f(-up2), r: f(r2), stroke: SILVER, "stroke-width": 1.1, opacity: 0, ...NSS }, plate);

  // ---- the rete, with the sun on its degree of the ecliptic and Alhabor on its pointer's tip
  const rete = node("g", {}, g);
  node("path", { d: A.rete, fill: "currentColor", "fill-opacity": 0.2, "fill-rule": "evenodd", "stroke-width": 0.75, "stroke-linejoin": "round", ...NSS }, rete);
  const sun = node("g", { transform: `translate(${M.sunPoint[0]} ${M.sunPoint[1]})`, stroke: "none" }, rete);
  const sunGlow = node("circle", { r: 12, fill: `url(#glow-${uid})`, opacity: 0.6 }, sun);
  const sunDisc = node("circle", { r: 3.3, fill: LIGHT }, sun);
  const star = node("g", { transform: `translate(${N.tip[0]} ${N.tip[1]})`, stroke: "none" }, rete);
  const starGlow = node("circle", { r: 11, fill: `url(#glow-${uid})`, opacity: 0 }, star);
  node("circle", { r: 2.2, fill: SILVER }, star);

  // ---- the label (the rule on the front) and the pin
  const label = node("g", {}, g);
  node("path", { d: A.rule.d, fill: NIGHT, "fill-opacity": 0.55, stroke: SILVER, "stroke-width": 0.9, "stroke-linejoin": "round", ...NSS }, label);
  node("circle", { r: 4.2, fill: NIGHT, "stroke-width": 0.8, ...NSS }, g);

  // ---- the count along the rim, the letter, the hour, the star's name
  const count = node("path", { fill: "none", stroke: SILVER, "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0 }, svg);
  const text = (x, y, size, str) => {
    const t = node("text", { x: f(x), y: f(y), "text-anchor": "middle", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const xp = rim(X_AT, R.outer * C.k + 11);
  const letter = text(C.x + xp[0], C.y + xp[1] + 5, 15, "X");
  const hour = text(-79, 50, 18, "");
  const hour2 = text(79, 50, 18, "");
  const name = text(64, -40, 13, "Alhabor");

  el.appendChild(svg);
  const s = { rete, label, circle, circle2, sunGlow, sunDisc, starGlow, count, letter, hour, hour2, name, raf: 0, t0: 0, at: 0 };
  instances.set(el, s);
  draw(s, STILL); // the still: the morning, the rete set, the label laid, nine counted
}

// One moment of the scene.  rete, label: degrees clockwise; day: 1 morning lit, 0 not; night: likewise;
// from, to: the count's arc along the rim (degrees clockwise from the top), cnt: its opacity; show: the
// letter X; fig, fig2: the hour figures (morning on the left, night on the right) and their opacities.
const STILL = { rete: M.rot, label: M.label, day: 1, night: 0, sun: 1, from: 180, to: M.label, cnt: 1, show: 1, fig: 9, figA: 1, fig2: 0, figB: 0 };

function draw(s, p) {
  s.rete.setAttribute("transform", `rotate(${f(p.rete)})`);
  s.label.setAttribute("transform", `rotate(${f(p.label - (A.rule.contract.zero_deg + 180))})`);
  s.circle.setAttribute("opacity", f(0.3 + 0.7 * p.day));
  s.circle2.setAttribute("opacity", f(p.night));
  s.sunGlow.setAttribute("opacity", f((0.6 + 0.4 * p.day) * p.sun));
  s.sunDisc.setAttribute("opacity", f(0.35 + 0.65 * p.sun));
  s.starGlow.setAttribute("opacity", f(p.night));
  s.name.setAttribute("opacity", f(p.night));
  // the count: an arc outside the rim, clockwise from the line it is counted from to where the label points
  const r = A.frontRadii.outer * C.k + 3.2;
  if (p.cnt > 0.004 && p.to - p.from > 0.5) {
    const a = rim(p.from, r);
    const b = rim(p.to, r);
    s.count.setAttribute("d", `M${f(C.x + a[0])} ${f(C.y + a[1])}A${f(r)} ${f(r)} 0 ${p.to - p.from > 180 ? 1 : 0} 1 ${f(C.x + b[0])} ${f(C.y + b[1])}`);
    s.count.setAttribute("opacity", f(p.cnt));
  } else {
    s.count.setAttribute("opacity", 0);
  }
  s.hour.textContent = p.fig > 0 ? String(p.fig) : "";
  s.hour.setAttribute("opacity", f(p.figA));
  s.hour2.textContent = p.fig2 > 0 ? String(p.fig2) : "";
  s.hour2.setAttribute("opacity", f(p.figB));
  s.letter.setAttribute("opacity", f(p.show));
}

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (u, a, b) => ease((u - a) / (b - a));
const mix = (a, b, t) => a + (b - a) * t;

function pose(t) {
  const u = t / LOOP;
  // act 1, the morning
  const turn = span(u, 0.02, 0.17);
  const lay = span(u, 0.19, 0.26);
  const c1 = span(u, 0.28, 0.37);
  const show1 = span(u, 0.37, 0.39) * (1 - span(u, 0.46, 0.49));
  // the day passes: the rete and the label upon the sun turn together
  const day = span(u, 0.49, 0.66);
  // act 2, the night
  const c2 = span(u, 0.69, 0.78);
  const show2 = span(u, 0.78, 0.8);
  const out = span(u, 0.92, 1); // back to rest
  const dayTurn = N.rot - M.rot;
  const rete = mix(ROT0, M.rot, turn) + dayTurn * day + (ROT0 + 360 - N.rot) * out;
  const label = mix(LABEL0, M.label, lay) + dayTurn * day + (LABEL0 + 360 - N.label) * out;
  const morning = u < 0.49;
  const to1 = mix(180, M.label, c1);
  const to2 = mix(0, N.label, c2);
  return {
    rete,
    label,
    day: (turn > 0.985 ? 1 : 0) * (1 - span(u, 0.49, 0.52)),
    night: span(u, 0.655, 0.67) * (1 - out),
    sun: 1 - span(u, 0.57, 0.63) + out,
    from: morning ? 180 : 0,
    to: morning ? to1 : to2,
    cnt: morning ? Math.min(1, c1 * 8) * (0.55 + 0.45 * show1) * (1 - span(u, 0.46, 0.49)) : Math.min(1, c2 * 8) * (0.55 + 0.45 * show2) * (1 - out),
    show: show1,
    fig: Math.min(9, Math.floor((to1 - 180) / 15 + 0.12)),
    figA: c1 > 0.02 ? (0.55 + 0.45 * span(u, 0.37, 0.39)) * (1 - span(u, 0.46, 0.49)) : 0,
    fig2: Math.min(9, Math.floor(to2 / 15 + 0.03)),
    figB: c2 > 0.02 ? (0.55 + 0.45 * show2) * (1 - out) : 0,
  };
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.at;
    s.at = (now - s.t0) % LOOP;
    draw(s, pose(s.at));
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
  s.at = ((ms % LOOP) + LOOP) % LOOP;
  draw(s, pose(s.at));
}
