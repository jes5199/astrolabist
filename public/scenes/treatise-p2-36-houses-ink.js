// A Treatise on the Astrolabe, Part II, 36: "Set the by-ginning of the degree that assendeth up-on the ende of the 8
// houre inequal; thanne wol the by-ginning of the 2 hous sitte up-on the lyne of midnight. Remove thanne the degree that
// assendeth, and set him on the ende of the 10 hour inequal; and thanne wol the byginning of the 3 hous sitte up-on the
// midnight lyne. Bring up agayn the same degree that assendeth first, and set him up-on the orisonte; and thanne wol
// the be-ginning of the 4 hous sitte up-on the lyne of midnight. Tak thanne the nadir of the degree that first
// assendeth, and set him on the ende of the 2 houre inequal; ... set thanne the nadir of the assendent on the ende of
// the 4 houre, than wol the byginning of the 6 house sitte on the midnight lyne. The byginning of the 7 hous is nadir of
// the assendent, and the byginning of the 8 hous is nadir of the 2; ... and the byginning of the 12 hous is nadir of
// the 6."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// COLOURED WOODCUT on vellum (jes tg 17847; lib/woodcut.js): cut, washed, lettered in the printer's red.
// pre-built in ink).  The front, cut down to what the conclusion uses: the limb, the three circles, the horizon, the
// unequal hour lines under it (numbered), the midnight line; the rete's zodiac ring, hatched.  The ascendant is
// Chaucer's own (Gemini 20, II 3).  The ring is turned as the text says, step by step, and each time the degree on the
// midnight line is marked: houses 2 to 6 (computed: Cancer 7, Cancer 24, Leo 12, Virgo 26, Scorpio 10; the same as
// trisecting the ascendant's semi-arcs in time).  Houses 7 to 12 are the nadirs of 1 to 6: lines through the pin.
// The plate is for 52 degrees (lib/front.js's geometry); our own line work, nothing traced or copied.

import { woodcut, RED, VELLUM, WASH } from "./lib/woodcut.js";
import { node, f, rim, P, LAT, almucantar, nightFrom, hourLine } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 26000;
const STILL = 22000; // ms: all twelve houses marked
const INK2 = "currentColor"; // the hatching ink
const C = { x: 0, y: -8, k: 0.72 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const norm = (x) => ((x % 360) + 360) % 360;
const raOf = (lam) => norm(Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD);
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const rAt = (dec) => (P.equator * Math.cos(dec)) / (1 + Math.sin(dec));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, rAt(decOf(lam)));
const nameOf = (lam) => `${SIGNS[Math.floor(norm(lam) / 30)]} ${Math.round(norm(lam) % 30)}°`;
// the rete's setting that puts the degree lam on the end of unequal hour k (12: the eastern horizon)
const rotFor = (lam, k) => {
  const t0 = nightFrom(rAt(decOf(lam)));
  return norm(t0 + (k * (360 - 2 * t0)) / 12 - 270 + raOf(lam));
};
// the degree on the midnight line (bearing 180) at a setting
const onMidnight = (rot) => {
  const a = norm(90 + rot) * RAD;
  return norm(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(EPS)) / RAD);
};
const ASC = 80; // Gemini 20
const ROT1 = rotFor(ASC, 12);
// the steps of the text: [the degree set, the hour, the house found]
const STEPS = [[ASC, 8, 2], [ASC, 10, 3], [ASC, 12, 4], [ASC + 180, 2, 5], [ASC + 180, 4, 6]].map(([lam, k, h]) => {
  const rot = rotFor(lam, k);
  return { lam, k, h, rot, cusp: onMidnight(rot) };
});
const CUSPS = [ASC, ...STEPS.map((s) => s.cusp)];
for (let i = 0; i < 6; i++) CUSPS.push(norm(CUSPS[i] + 180));
const RE = (P.capricorn + P.cancer) / 2; // the zodiac ring's outer edge: the ecliptic
const OFF = (P.capricorn - P.cancer) / 2; // its centre's distance from the pole (towards Capricorn's head)
const BAND = 11;
const T1 = 2.0; // the first step begins
const STEP = 2.8;
const BACK = T1 + 5 * STEP; // the ring turned back to the ascendant on the horizon
const NADIRS = BACK + 1.6;

// angles (degrees) pushed apart to at least min between neighbours round the circle, each as little as it can
function spread(ang, min) {
  const n = ang.length;
  const order = ang.map((a, i) => i).sort((i, j) => ang[i] - ang[j]);
  const x = order.map((i) => ang[i]);
  for (let it = 0; it < 60; it++) {
    for (let k = 0; k < n; k++) {
      const k2 = (k + 1) % n;
      const gap = k2 ? x[k2] - x[k] : x[0] + 360 - x[n - 1];
      if (gap < min) {
        x[k] -= (min - gap) / 2;
        x[k2] += (min - gap) / 2;
      }
    }
  }
  const out = [];
  order.forEach((i, k) => (out[i] = x[k]));
  return out;
}
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const win = (p) => [C.x + C.k * p[0], C.y + C.k * p[1]];

export function mount(el) {
  if (instances.has(el)) return;
  const uid = Math.random().toString(36).slice(2, 8);
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const defs = node("defs", {}, svg);
  const wc = woodcut(defs, { freq: 0.11 * C.k, wobble: 1.0 / C.k, seed: 41 });
  const pat = node("pattern", { id: "h" + uid, width: 2.6, height: 2.6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  node("line", { x1: 0, y1: 0, x2: 0, y2: 2.6, stroke: INK2, "stroke-width": 1.1 }, pat);
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const ink = { fill: "none", stroke: "currentColor", "stroke-linejoin": "round" };
  const circW = (r, cy = 0) => `M0 ${f(cy - r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy + r)}A${f(r)} ${f(r)} 0 1 1 0 ${f(cy - r)}Z`;
  node("path", wc.wash({ d: circW(100) + circW(86), "fill-rule": "evenodd", fill: WASH.ochre, "fill-opacity": 0.6 }), g);
  // the limb: two circles, a tick every 5 degrees, a longer one every 15
  node("circle", { ...ink, r: 100, "stroke-width": W(1.65) }, g);
  node("circle", { ...ink, r: 86, "stroke-width": W(1.05) }, g);
  let dt = "";
  for (let i = 0; i < 360; i += 5) {
    const a = rim(i, 86);
    const b = rim(i, i % 15 ? 91 : 95);
    dt += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
  }
  node("path", { ...ink, d: dt, "stroke-width": W(0.6), stroke: INK2 }, g);
  // the plate: the three circles, the horizon (clipped to the plate), the hour lines and the midnight line
  for (const r of [P.cancer, P.equator, P.capricorn]) node("circle", { ...ink, r: f(r), "stroke-width": W(r === P.capricorn ? 0.8 : 0.5), stroke: r === P.capricorn ? "currentColor" : INK2 }, g);
  const cp = node("clipPath", { id: "p" + uid }, g);
  node("circle", { r: f(P.capricorn) }, cp);
  const [hc, hr] = almucantar(0);
  const clip = node("g", { "clip-path": `url(#p${uid})` }, g);
  node("path", wc.wash({ d: circW(P.capricorn) + circW(hr, -hc), "fill-rule": "evenodd", fill: WASH.blue, "fill-opacity": 0.45 }), clip);
  node("circle", { ...ink, cy: f(-hc), r: f(hr), "stroke-width": W(1.35) }, clip);
  const hours = [];
  for (let k = 1; k < 12; k++) hours.push(node("path", { ...ink, d: hourLine(k), "stroke-width": W(k === 6 ? 0.9 : 0.45), stroke: k === 6 ? "currentColor" : INK2 }, g));
  // the hour numbers, at each line's end on the Capricorn circle
  const t0c = nightFrom(P.capricorn);
  for (let k = 1; k < 12; k++) {
    if (k === 6) continue;
    const p = rim(t0c + (k * (360 - 2 * t0c)) / 12, P.capricorn + 4.5);
    const t = node("text", { x: f(p[0]), y: f(p[1] + 3.6), "text-anchor": "middle", "font-size": 10, fill: INK2, "font-family": "inherit" }, g);
    t.textContent = k;
  }
  // the lines a step uses, drawn again in red: an hour line or the horizon, and the midnight line
  const redHour = {};
  for (const k of [2, 4, 8, 10]) redHour[k] = node("path", { ...ink, d: hourLine(k), "stroke-width": W(2.1), stroke: RED, opacity: 0 }, g);
  redHour[12] = node("circle", { ...ink, cy: f(-hc), r: f(hr), "stroke-width": W(2.1), stroke: RED, opacity: 0, "clip-path": `url(#p${uid})` }, g);
  const midnight = node("path", { ...ink, d: `M0 0V100`, "stroke-width": W(2.4), stroke: RED, opacity: 0 }, g);
  // the rete's zodiac ring, hatched as a cut part; sign divisions, a tick every 10 degrees
  const rete = node("g", {}, g);
  const cx = 0;
  const cy = -OFF;
  const ring = `M${f(cx)} ${f(cy - RE)}A${f(RE)} ${f(RE)} 0 1 0 ${f(cx)} ${f(cy + RE)}A${f(RE)} ${f(RE)} 0 1 0 ${f(cx)} ${f(cy - RE)}Z` +
    `M${f(cx)} ${f(cy - RE + BAND)}A${f(RE - BAND)} ${f(RE - BAND)} 0 1 0 ${f(cx)} ${f(cy + RE - BAND)}A${f(RE - BAND)} ${f(RE - BAND)} 0 1 0 ${f(cx)} ${f(cy - RE + BAND)}Z`;
  node("path", wc.wash({ d: ring, "fill-rule": "evenodd", fill: WASH.red, "fill-opacity": 0.75 }), rete);
  node("path", { d: ring, fill: `url(#h${uid})`, "fill-rule": "evenodd", stroke: "currentColor", "stroke-width": W(1.2) }, rete);
  let dd = "";
  for (let lam = 0; lam < 360; lam += 10) {
    const p = eclAt(lam, 0);
    const u = [(p[0] - cx) / RE, (p[1] - cy) / RE];
    const len = lam % 30 ? BAND * 0.45 : BAND;
    dd += `M${f(p[0])} ${f(p[1])}L${f(p[0] - u[0] * len)} ${f(p[1] - u[1] * len)}`;
  }
  node("path", { ...ink, d: dd, "stroke-width": W(0.9) }, rete);
  // the houses' beginnings: a red stroke across the band; 7 to 12 joined to their opposites through the pin
  const cuspMark = CUSPS.map((lam) => {
    const p = eclAt(lam, 0);
    const u = [(p[0] - cx) / RE, (p[1] - cy) / RE];
    return node("path", { ...ink, d: `M${f(p[0] + u[0] * 2)} ${f(p[1] + u[1] * 2)}L${f(p[0] - u[0] * (BAND + 1))} ${f(p[1] - u[1] * (BAND + 1))}`, stroke: RED, "stroke-width": W(2.4), opacity: 0 }, rete);
  });
  const nadirLine = [];
  for (let i = 0; i < 6; i++) {
    const a = eclAt(CUSPS[i], 0);
    const b = eclAt(CUSPS[i + 6], 0);
    nadirLine.push(node("path", { ...ink, d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, stroke: RED, "stroke-width": W(0.9), "stroke-dasharray": `${W(4.5)} ${W(3.0)}`, opacity: 0 }, rete));
  }
  // the degree being set: a red point on the ecliptic (the ascendant, then its nadir)
  const dot = [ASC, ASC + 180].map((lam) => {
    const p = eclAt(lam, 0);
    return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.4, fill: RED, stroke: VELLUM, "stroke-width": W(1.2), opacity: 0 }, rete);
  });
  node("circle", { r: 4, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.35) }, g); // the pin
  // words, in the window's units
  const text = (str, size, fill, italic = true, anchor = "middle") => {
    const t = node("text", { "text-anchor": anchor, "font-size": size, fill, opacity: 0, "font-family": "inherit", "font-weight": 600, stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const num = CUSPS.map((_, i) => text(String(i + 1), 13, RED, false));
  const lead = CUSPS.map(() => node("path", { fill: "none", stroke: RED, "stroke-width": 0.6, opacity: 0 }, svg));
  const tAsc = text("ascendant", 13, RED, true, "end");
  const tNad = text("its nadir", 13, RED, true, "start");
  const tMid = text("midnight line", 13, RED, true, "start");
  tMid.setAttribute("text-anchor", "middle");
  tMid.setAttribute("x", f(C.x));
  tMid.setAttribute("y", f(C.y + C.k * 100 + 12));
  const cap = text("", 14, "currentColor", false);
  cap.setAttribute("x", 0);
  cap.setAttribute("y", f(C.y + C.k * 100 + 29));
  // the cut: the still drawing wobbles as one; the rete has its own wobble, so it turns with it
  const base = node("g", { filter: wc.rough });
  while (g.firstChild && g.firstChild !== rete) base.appendChild(g.firstChild);
  g.insertBefore(base, rete);
  rete.setAttribute("filter", wc.rough);
  el.appendChild(svg);
  const s = { rete, redHour, midnight, cuspMark, nadirLine, dot, num, lead, tAsc, tNad, tMid, cap, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 24.6, 25.6);
  // the setting: the ascendant on the horizon, then each step in turn, then back
  let rot = ROT1;
  let prev = ROT1;
  for (let i = 0; i < STEPS.length; i++) {
    const a = T1 + i * STEP;
    rot = prev + (STEPS[i].rot - prev) * span(t, a, a + 1.3);
    if (t < a + 1.3) break;
    prev = STEPS[i].rot;
  }
  if (t >= BACK) rot = STEPS[4].rot + (ROT1 - STEPS[4].rot) * span(t, BACK, BACK + 1.3);
  s.rete.setAttribute("transform", `rotate(${f(rot)})`);
  // which step is showing (its hour line red, the midnight line red, the caption)
  let cur = -1;
  for (let i = 0; i < STEPS.length; i++) if (t >= T1 + i * STEP && t < T1 + (i + 1) * STEP) cur = i;
  for (const k in s.redHour) {
    const i = STEPS.findIndex((st) => st.k === +k);
    const a = T1 + i * STEP;
    s.redHour[k].setAttribute("opacity", f(i === cur ? span(t, a + 0.2, a + 0.6) * (1 - span(t, a + STEP - 0.3, a + STEP)) : 0));
  }
  const found = (i) => T1 + i * STEP + 1.4; // when step i's house is marked
  const midOn = cur >= 0 ? span(t, found(cur) - 0.2, found(cur) + 0.2) * (1 - span(t, T1 + (cur + 1) * STEP - 0.3, T1 + (cur + 1) * STEP)) : 0;
  s.midnight.setAttribute("opacity", f(midOn));
  s.tMid.setAttribute("opacity", f(Math.max(midOn, span(t, 0.8, 1.4) * (1 - span(t, T1, T1 + 0.4)))));
  // the marks: house 1 at the start, 2 to 6 as found, 7 to 12 with the nadir lines
  const when = [0.6, ...STEPS.map((_, i) => found(i)), ...[0, 1, 2, 3, 4, 5].map((i) => NADIRS + 0.55 * i)];
  const c = [Math.cos(rot * RAD), Math.sin(rot * RAD)];
  const centre = [-OFF * -c[1], -OFF * c[0]]; // the ring's centre, turned (rim(rot, OFF))
  // the numbers stand round the ring, pushed apart where the beginnings crowd (near the pin), each with a leader
  const ang = CUSPS.map((lam) => {
    const p = eclAt(lam, rot);
    return Math.atan2(p[1] - centre[1], p[0] - centre[0]) / RAD;
  });
  const pos = spread(ang, 14);
  for (let i = 0; i < 12; i++) {
    const a = span(t, when[i], when[i] + 0.4) * out;
    s.cuspMark[i].setAttribute("opacity", f(a));
    if (i >= 6) s.nadirLine[i - 6].setAttribute("opacity", f(a * 0.9));
    const p = eclAt(CUSPS[i], rot);
    const q = [centre[0] + (RE + 11) * Math.cos(pos[i] * RAD), centre[1] + (RE + 11) * Math.sin(pos[i] * RAD)];
    const w = win(q);
    s.num[i].setAttribute("x", f(w[0]));
    s.num[i].setAttribute("y", f(w[1] + 4.5));
    s.num[i].setAttribute("opacity", f(a));
    const from = win([p[0] + 2.5 * Math.cos(ang[i] * RAD), p[1] + 2.5 * Math.sin(ang[i] * RAD)]);
    const to = win([centre[0] + (RE + 6.5) * Math.cos(pos[i] * RAD), centre[1] + (RE + 6.5) * Math.sin(pos[i] * RAD)]);
    s.lead[i].setAttribute("d", `M${f(from[0])} ${f(from[1])}L${f(to[0])} ${f(to[1])}`);
    s.lead[i].setAttribute("opacity", f(a * 0.8));
  }
  // the degree being set
  const ascOn = span(t, 0.4, 0.8) * (1 - span(t, T1 + 3 * STEP - 0.2, T1 + 3 * STEP + 0.2));
  const nadOn = span(t, T1 + 3 * STEP - 0.2, T1 + 3 * STEP + 0.2) * (1 - span(t, BACK - 0.2, BACK + 0.2));
  s.dot[0].setAttribute("opacity", f(ascOn * out));
  s.dot[1].setAttribute("opacity", f(nadOn * out));
  const pa = win(eclAt(ASC, rot));
  s.tAsc.setAttribute("x", f(pa[0] - 6));
  s.tAsc.setAttribute("y", f(pa[1] - 6));
  s.tAsc.setAttribute("opacity", f(span(t, 0.6, 1.0) * (1 - span(t, T1 + STEP - 0.4, T1 + STEP))));
  const pn = win(eclAt(ASC + 180, rot));
  s.tNad.setAttribute("x", f(pn[0] + 6));
  s.tNad.setAttribute("y", f(pn[1] - 6));
  s.tNad.setAttribute("opacity", f(span(t, T1 + 3 * STEP, T1 + 3 * STEP + 0.4) * (1 - span(t, T1 + 4 * STEP - 0.4, T1 + 4 * STEP))));
  // the caption
  let str = "";
  let a = 0;
  if (t < T1) {
    str = `house 1: ${nameOf(ASC)}`;
    a = span(t, 0.6, 1.0) * (1 - span(t, T1 - 0.3, T1));
  } else if (cur >= 0) {
    const st = STEPS[cur];
    str = `house ${st.h}: ${nameOf(st.cusp)}`;
    a = span(t, found(cur), found(cur) + 0.3) * (1 - span(t, T1 + (cur + 1) * STEP - 0.3, T1 + (cur + 1) * STEP));
  } else if (t >= NADIRS) {
    str = "houses 7–12: nadirs of 1–6";
    a = span(t, NADIRS, NADIRS + 0.4) * out;
  }
  if (s.cap.textContent !== str) s.cap.textContent = str;
  s.cap.setAttribute("opacity", f(a));
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
