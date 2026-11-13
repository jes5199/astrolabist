// A Treatise on the Astrolabe, Part II, 38: "Tak a rond plate of metal ... and make ther-upon a iust compas, a lite
// with-in the bordure; and ley this ronde plate up-on an evene grond ... And in centre of the compas stike an evene pin
// or a wyr upright ... and let this pin be no lengere than a quarter of the diametre of thy compas ... And waite
// bisily, aboute 10 or 11 of the clokke and whan the sonne shyneth, whan the shadwe of the pin entreth any-thing
// with-in the cercle of thy plate an heer-mele, and mark ther a prikke with inke. Abyde thanne stille waiting on the
// sonne after 1 of the clokke, til that the schadwe ... passe ony-thing out of the cercle ... and set ther a-nother
// prikke of inke. Take than a compas, and mesure evene the middel by-twixe bothe prikkes; and set ther a prikke. Take
// thanne a rewle, and draw a stryke, evene a-lyne fro the pin un-to the middel prikke; and tak ther thy lyne meridional
// for evere-mo ... And yif thow drawe a cros-lyne over-thwart the compas, iustly over the lyne meridional, than hastow
// est and west and south; and, par consequence, than the nadir of the south lyne is the north lyne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// Seen from above, as II 29: level ground, north at the top, east to the right.  A round plate with its circle, the
// pin upright at the centre, a quarter of the circle's diameter long.  The day runs from 9:00 to 15:00 (local sun
// time); the sun moves across the south and the pin's shadow swings and shortens; its tip's track is drawn.  The tip
// comes into the circle (a prick), goes out again (a prick); the middle of the two is pricked; the line from the pin
// through it is the meridian line, and the cross-line gives east and west.  Computed for latitude 52; the day is one
// whose shadow comes in at 10:30 and goes out at 13:30 (the sun's declination solved for that, about -8 degrees:
// late February, or mid October), to agree with "aboute 10 or 11" and "after 1".  Original line work.

import { node, f, SILVER, NIGHT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 15000; // ms: the meridian and the cross-line drawn, the quarters named
const RAD = Math.PI / 180;
const LAT = 52 * RAD;
const R = 56; // the circle's radius in the window
const PLATE = 66; // the plate's
const PIN = R / 2; // the pin's height: a quarter of the diameter
const H_IN = -22.5; // the hour angle (degrees, west positive) when the shadow comes in: 10:30
// the sun's direction (east, north, up) at hour angle H for declination d
const sunAt = (H, d) => [-Math.cos(d) * Math.sin(H * RAD), Math.cos(LAT) * Math.sin(d) - Math.sin(LAT) * Math.cos(d) * Math.cos(H * RAD), Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H * RAD)];
// the shadow's tip on the ground, in the window (north up, east right)
const tipAt = (H, d) => {
  const [e, n, u] = sunAt(H, d);
  return [(-PIN * e) / u, (PIN * n) / u];
};
// the declination for which the shadow's length is R at H_IN (its altitude then: atan(PIN / R))
const DEC = (() => {
  const want = Math.atan(PIN / R);
  let a = -23 * RAD;
  let b = 23 * RAD;
  for (let i = 0; i < 50; i++) {
    const m = (a + b) / 2;
    if (Math.asin(sunAt(H_IN, m)[2]) < want) a = m;
    else b = m;
  }
  return (a + b) / 2;
})();
const H0 = -45; // 9:00 (15 degrees an hour)
const H1 = 45; // 15:00
const D0 = 0.6; // the day starts running (s)
const D1 = 9.6; // and ends
const hourAt = (t) => H0 + (H1 - H0) * Math.min(1, Math.max(0, (t - D0) / (D1 - D0)));
const tAt = (H) => D0 + ((H - H0) / (H1 - H0)) * (D1 - D0);
const T_IN = tAt(H_IN);
const T_OUT = tAt(-H_IN);
const P_IN = tipAt(H_IN, DEC);
const P_OUT = tipAt(-H_IN, DEC);
const clock = (H) => {
  const m = Math.round((12 * 60 + H * 4) / 5) * 5;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  node("rect", { x: -120, y: -120, width: 240, height: 240, fill: "#12182e" }, svg);
  // the plate, its circle a little within the border
  node("circle", { r: PLATE, fill: "#1c2446", stroke: "currentColor", "stroke-width": 1.4 }, svg);
  node("circle", { r: R, fill: "none", stroke: SILVER, "stroke-width": 0.9, opacity: 0.85 }, svg);
  // the tip's track through the day, and the shadow
  const track = node("path", { fill: "none", stroke: SILVER, "stroke-width": 0.8, "stroke-dasharray": "1.5 2.5", opacity: 0.7 }, svg);
  const shadow = node("line", { x1: 0, y1: 0, stroke: "#05070f", "stroke-width": 2.6, "stroke-linecap": "round", opacity: 0.95 }, svg);
  const tip = node("circle", { r: 1.4, fill: SILVER }, svg);
  // the arc between the pricks (shown when the middle is found), the meridian and the cross-line
  const a0 = Math.atan2(P_IN[1], P_IN[0]);
  const a1 = Math.atan2(P_OUT[1], P_OUT[0]);
  const between = node("path", { d: `M${f(P_IN[0])} ${f(P_IN[1])}A${R} ${R} 0 0 1 ${f(P_OUT[0])} ${f(P_OUT[1])}`, fill: "none", stroke: SUN, "stroke-width": 2, opacity: 0 }, svg);
  const am = (a0 + a1) / 2;
  const MID = [R * Math.cos(am), R * Math.sin(am)];
  const meridian = node("line", { x1: f(-MID[0] * (PLATE / R)), y1: f(-MID[1] * (PLATE / R)), x2: f(MID[0] * (PLATE / R)), y2: f(MID[1] * (PLATE / R)), stroke: "currentColor", "stroke-width": 1.6 }, svg);
  const cross = node("line", { x1: f(MID[1] * (PLATE / R)), y1: f(-MID[0] * (PLATE / R)), x2: f(-MID[1] * (PLATE / R)), y2: f(MID[0] * (PLATE / R)), stroke: "currentColor", "stroke-width": 1.6 }, svg);
  const prick = (p) => node("circle", { cx: f(p[0]), cy: f(p[1]), r: 2.6, fill: SUN, stroke: NIGHT, "stroke-width": 1, opacity: 0 }, svg);
  const pIn = prick(P_IN);
  const pOut = prick(P_OUT);
  const pMid = prick(MID);
  // the pin, upright: seen from above, its head
  node("circle", { r: 2.2, fill: SILVER, stroke: NIGHT, "stroke-width": 0.8 }, svg);
  // the sun, moving along the south edge of the window in its bearing
  const sun = node("g", {}, svg);
  node("circle", { r: 6, fill: SUN }, sun);
  for (let i = 0; i < 8; i++) node("line", { x1: 0, y1: -8.5, x2: 0, y2: -11.5, stroke: SUN, "stroke-width": 1.3, "stroke-linecap": "round", transform: `rotate(${45 * i})` }, sun);
  const text = (x, y, str, size = 14, anchor = "middle") => {
    const t = node("text", { x, y, "text-anchor": anchor, "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
    t.textContent = str;
    return t;
  };
  const tClock = text(0, 34, "", 15); // inside the plate, south of the pin: the shadow points north
  const tIn = text(f(P_IN[0] - 6), f(P_IN[1] - 6), "in", 13, "end");
  const tOut = text(f(P_OUT[0] + 6), f(P_OUT[1] - 6), "out", 13, "start");
  const tMer = text(7, 30, "meridian line", 13, "start");
  const words = [
    text(0, -PLATE - 6, "north"),
    text(0, PLATE + 16, "south"),
    text(PLATE + 6, 5, "east", 14, "start"),
    text(-PLATE - 6, 5, "west", 14, "end"),
  ];
  el.appendChild(svg);
  const s = { track, shadow, tip, sun, between, meridian, cross, pIn, pOut, pMid, tClock, tIn, tOut, tMer, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 16.6, 17.4);
  const H = hourAt(t);
  const day = span(t, 0.1, 0.6) * (1 - span(t, D1, D1 + 0.6));
  // the sun: on a circle about the pin, in its bearing (seen from above)
  const [e, n] = sunAt(H, DEC);
  const k = 88 / Math.hypot(e, n);
  s.sun.setAttribute("transform", `translate(${f(e * k)} ${f(-n * k)})`);
  s.sun.setAttribute("opacity", f(day));
  const p = tipAt(H, DEC);
  s.shadow.setAttribute("x2", f(p[0]));
  s.shadow.setAttribute("y2", f(p[1]));
  s.shadow.setAttribute("opacity", f(0.95 * day));
  s.tip.setAttribute("cx", f(p[0]));
  s.tip.setAttribute("cy", f(p[1]));
  s.tip.setAttribute("opacity", f(day));
  let d = "";
  for (let h = H0; h <= H; h += 1.5) {
    const q = tipAt(h, DEC);
    d += `${d ? "L" : "M"}${f(q[0])} ${f(q[1])}`;
  }
  s.track.setAttribute("d", d || "M0 0");
  s.track.setAttribute("opacity", f(0.7 * out));
  s.tClock.textContent = clock(H);
  s.tClock.setAttribute("opacity", f(day));
  // the pricks as the tip comes in and goes out; the middle; the lines; the quarters
  s.pIn.setAttribute("opacity", f(span(t, T_IN, T_IN + 0.25) * out));
  s.tIn.setAttribute("opacity", f(span(t, T_IN, T_IN + 0.3) * (1 - span(t, 10.0, 10.4))));
  s.pOut.setAttribute("opacity", f(span(t, T_OUT, T_OUT + 0.25) * out));
  s.tOut.setAttribute("opacity", f(span(t, T_OUT, T_OUT + 0.3) * (1 - span(t, 10.0, 10.4))));
  s.between.setAttribute("opacity", f(0.8 * span(t, 10.0, 10.5) * (1 - span(t, 11.4, 11.9))));
  s.pMid.setAttribute("opacity", f(span(t, 10.6, 10.9) * out));
  // the meridian drawn from the pin through the middle prick, then on through the pin to the other side
  const m = span(t, 11.2, 12.2) * out;
  s.meridian.setAttribute("stroke-dasharray", `${f(2 * PLATE * m)} 400`);
  s.meridian.setAttribute("stroke-dashoffset", f(-PLATE * (1 - m)));
  s.meridian.setAttribute("opacity", f(m > 0 ? 1 : 0));
  s.tMer.setAttribute("opacity", f(span(t, 12.0, 12.4) * out));
  const c = span(t, 12.6, 13.4) * out;
  s.cross.setAttribute("stroke-dasharray", `${f(2 * PLATE * c)} 400`);
  s.cross.setAttribute("stroke-dashoffset", f(-PLATE * (1 - c)));
  s.cross.setAttribute("opacity", f(c > 0 ? 1 : 0));
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, 13.6 + 0.25 * i, 14.0 + 0.25 * i) * out)));
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
