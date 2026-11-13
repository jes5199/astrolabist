// A Treatise on the Astrolabe, Part II, 1: "To fynde the degree in which the sonne is day by day".
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The back of the instrument, seen close at its right-hand point, where the zodiac begins.  Outermost, the
// degrees of the signs; inside them the circle of the days with the months.  The rule is laid on the day,
// Chaucer's example: the 12th day of March (1391); its edge then cuts the scale of the signs at the
// beginning of Aries, "a litel within the degree".
//
// Second act, his other example: the instrument is turned a quarter round under the rule, to the foot of the
// back, and the rule is laid on the 13th day of December: the beginning of Capricorn.
//
// The circle of days is this instrument's own: eccentric, fitted in our drawing to where each sign begins
// against the days; on it the middle of the cell of 12 March is the first point of Aries, to a third of a day.
// Computed here from those parameters (shared module).  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
const RAD = Math.PI / 180;
const C = { x: -115, y: 0, k: 2 }; // the instrument's centre (off the window to the left) and scale
const NIGHT = "#0a1030";
const SILVER = "#e4e7f3";
const FAINT = "#a7b0d4";
const LOOP = 30000;
const T = A.backTiers;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ACTS = [
  { day: 59 + 11.5, at: 0, text: ["12 March", "Aries 1°"] }, // days of the year elapsed at midday; where the view looks
  { day: 334 + 12.5, at: 270, text: ["13 December", "Capricorn 1°"] },
];
const START = 15; // how far above the day the rule rests before it is laid, degrees

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => (Math.round(n * 100) / 100).toString();

// the longitude at which d days of the year have elapsed, on the instrument's eccentric circle of days
function lon(d) {
  const c = A.calendar;
  const a = c.apogee * RAD;
  const m0 = -Math.asin(c.e * Math.sin(a));
  const m = m0 + ((d - c.ariesDoy) * 2 * Math.PI) / c.days;
  return Math.atan2(Math.sin(m) + c.e * Math.sin(a), Math.cos(m) + c.e * Math.cos(a)) / RAD;
}
// a point of the back in the window: longitude (anticlockwise from the right-hand point), radius (limb 100)
const pt = (l, r) => [C.x + C.k * r * Math.cos(l * RAD), C.y - C.k * r * Math.sin(l * RAD)];
const seg = (l, r1, r2) => {
  const a = pt(l, r1);
  const b = pt(l, r2);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  const turn = node("g", {}, svg); // the instrument, turned in the hand between the two examples
  const g = node("g", { fill: "none", stroke: "currentColor" }, turn);
  node("circle", { cx: C.x, cy: C.y, r: 100 * C.k, fill: NIGHT, "fill-opacity": 0.72, "stroke-width": 1.4 }, g);
  for (const k of ["border", "altitude", "degrees", "zodnum", "signs", "spacer", "ladder", "daynum", "months", "saints", "days", "letters"])
    node("circle", { cx: C.x, cy: C.y, r: f(T[k] * C.k), "stroke-width": k === "degrees" || k === "ladder" ? 0.6 : 0.35, opacity: 0.7 }, g);
  const near = (l) => ACTS.some((a) => Math.abs(((l - a.at + 540) % 360) - 180) <= 42);

  // ---- the degrees of the signs: a tick each degree, longer every five; the line where a sign begins
  let d = "";
  let e = "";
  for (let l = 0; l < 360; l++) {
    if (!near(l)) continue;
    if (l % 30 === 0) e += seg(l, T.signs, T.altitude);
    else d += seg(l, l % 5 ? T.degrees : T.zodnum + 2.2, T.altitude);
  }
  node("path", { d, "stroke-width": 0.45, opacity: 0.85 }, g);
  node("path", { d: e, "stroke-width": 0.9 }, g);

  // ---- the days: a tick each day, longer every five of the month; the line where a month begins
  let small = "";
  let big = "";
  let doy = 0;
  for (let m = 0; m < 12; m++) {
    for (let i = 0; i < MONTH_DAYS[m]; i++) {
      const l = lon(doy + i);
      if (!near(l)) continue;
      if (i === 0) big += seg(l, T.months, T.spacer);
      else small += seg(l, i % 5 ? T.ladder : T.daynum + 2, T.spacer);
    }
    doy += MONTH_DAYS[m];
  }
  node("path", { d: small, "stroke-width": 0.45, opacity: 0.85 }, g);
  node("path", { d: big, "stroke-width": 0.9 }, g);

  // ---- the names, along their circles, tops inwards as engraved
  const names = node("g", { fill: "currentColor", stroke: "none", "font-size": 8.5, "text-anchor": "middle", "font-family": "inherit" }, turn);
  const along = (str, l, r, size) => {
    const p = pt(l, r);
    const t = node("text", { transform: `translate(${f(p[0])} ${f(p[1])}) rotate(${f(-90 - l)})`, opacity: 0.9 }, names);
    if (size) t.setAttribute("font-size", size);
    t.textContent = str;
  };
  const rs = (T.signs + T.zodnum) / 2 - 1.3;
  along("Aries", 13, rs);
  along("Pisces", -15, rs);
  along("Capricornus", 286, rs);
  along("Sagittarius", 254, rs);
  const rm = (T.months + T.daynum) / 2 - 1.2;
  along("Marcius", lon(59 + 15.5), rm, 7.5);
  along("Februarius", lon(31 + 14), rm, 7.5);
  along("Aprilis", lon(90 + 15), rm, 7.5);
  along("December", lon(334 + 17), rm, 7.5);
  along("November", lon(304 + 15), rm, 7.5);
  along("Januarius", lon(15), rm, 7.5);

  // ---- the rule
  const rule = node("g", {}, node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, turn));
  node("path", { d: A.alidade.body, fill: NIGHT, "fill-opacity": 0.3, stroke: SILVER, "stroke-width": 0.45, "stroke-linejoin": "round" }, rule);
  for (const v of A.alidade.vanes) node("path", { d: v, fill: "none", stroke: SILVER, "stroke-width": 0.35, opacity: 0.7 }, rule);

  // ---- for each example: the day's cell, where the rule's edge cuts the degrees of the signs, what is read
  const text = (x, y, str) => {
    const t = node("text", { x, y, "text-anchor": "middle", "font-size": 10, fill: SILVER, opacity: 0, "font-family": "inherit" }, svg);
    t.textContent = str;
    return t;
  };
  const acts = ACTS.map((a) => {
    const d0 = Math.floor(a.day);
    const q = [pt(lon(d0), T.ladder), pt(lon(d0), T.spacer), pt(lon(d0 + 1), T.spacer), pt(lon(d0 + 1), T.ladder)];
    const cell = node("polygon", { points: q.map((p) => f(p[0]) + "," + f(p[1])).join(" "), fill: SILVER, opacity: 0 }, turn);
    const at = lon(a.day);
    const ring = (r) => {
      const p = pt(at, r);
      return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 4.6, fill: "none", stroke: SILVER, "stroke-width": 0.9, opacity: 0 }, turn);
    };
    return { at, turn: a.at, cell, rings: [ring((T.ladder + T.spacer) / 2), ring((T.degrees + T.altitude) / 2)], texts: [text(-60, -34, a.text[0]), text(-58, 46, a.text[1])] };
  });

  el.appendChild(svg);
  const s = { turn, rule, acts, raf: 0, t0: 0, tm: 0 };
  instances.set(el, s);
  draw(s, STILL); // the still: the rule laid on the 12th of March, the degree read
}

// turned: 0..1 the instrument turned from the first example to the second; lift: how far the rule stands above
// the day (degrees); show: [0..1, 0..1] each example's reading shown
const STILL = { turned: 0, lift: 0, show: [1, 0] };

function draw(s, p) {
  const [a, b] = s.acts;
  const quarter = ((b.turn - a.turn + 540) % 360) - 180; // -90: the short way round
  const view = a.turn + quarter * p.turned; // the longitude that stands at the right hand
  s.turn.setAttribute("transform", `rotate(${f(view)} ${C.x} ${C.y})`);
  // the rule keeps its place in the hand; the scales pass under it
  const day = a.at + (((b.at - a.at + 540) % 360) - 180) * p.turned;
  s.rule.setAttribute("transform", `rotate(${f(-(day + p.lift))})`);
  s.acts.forEach((act, i) => {
    const show = p.show[i];
    const here = i ? p.turned : 1 - p.turned;
    act.cell.setAttribute("opacity", f((0.25 + 0.6 * show) * (here > 0.5 ? 1 : 0)));
    for (const r of act.rings) r.setAttribute("opacity", f(show));
    act.texts[0].setAttribute("opacity", f((0.45 + 0.55 * show) * ease((here - 0.5) * 2)));
    act.texts[1].setAttribute("opacity", f(show));
  });
}

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (u, a, b) => ease((u - a) / (b - a));

function pose(t) {
  const u = t / LOOP;
  const out = span(u, 0.93, 1); // back to the first example
  const turned = span(u, 0.46, 0.6) * (1 - out);
  // the rule: down onto the day (a little past it and back), up again while the instrument is turned, down again
  const lay1 = span(u, 0.04, 0.2) + 0.07 * Math.sin(Math.PI * span(u, 0.14, 0.26)) * (1 - span(u, 0.2, 0.26));
  const up = span(u, 0.42, 0.5);
  const lay2 = span(u, 0.6, 0.72) + 0.07 * Math.sin(Math.PI * span(u, 0.68, 0.78)) * (1 - span(u, 0.72, 0.78));
  const lift = START * (1 - lay1 + up * Math.min(1, lay1) - lay2 * up + out * lay2);
  return { turned, lift, show: [span(u, 0.24, 0.28) * (1 - span(u, 0.4, 0.44)), span(u, 0.76, 0.8) * (1 - span(u, 0.9, 0.94))] };
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.t0 = 0;
  const step = (now) => {
    if (!s.t0) s.t0 = now - s.tm;
    s.tm = (now - s.t0) % LOOP;
    draw(s, pose(s.tm));
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
  draw(s, pose(s.tm));
}
