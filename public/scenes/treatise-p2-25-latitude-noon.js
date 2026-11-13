// A Treatise on the Astrolabe, Part II, 25: "the latitude of any place in a regioun is verreyly the space by-twixe the
// senith of hem that dwellen there and the equinoxial cerkle ... And thilke space is as moche as the pool artik is hey
// ... And than is the depressioun of the pol antartik ... the same quantite ... tak the altitude of the sonne in the
// middel of the day, whan the sonne is in the hevedes of Aries or of Libra ... and abate the nombre of that same sonnes
// altitude out of 90 ... As thus: I suppose that the sonne is thilke day at noon 38 degrees and 10 minutes of heyghte.
// Abate thanne thise degrees and minutes out of 90; so leveth there 51 degrees and 50 minutes, the latitude."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The sky cut through the meridian at Oxford, south on the left: the sun at noon on an equinox stands on the equator,
// 38 10 above the south horizon (Chaucer's supposition); the rest of the way to the zenith is the latitude, 90 less that,
// 51 50; and the southern pole lies as far below the south horizon.  Shared lib/sky.js.  Original line work.

import { cut, sun as sunIcon, node, f, span, label, SILVER, FAINT, SUN } from "./lib/sky.js";

const instances = new WeakMap();
const LOOP = 14000;
const STILL = 9600; // ms: the sun's height, the latitude, the southern pole
const ALT = 38 + 10 / 60;
const RAD = Math.PI / 180;

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const sky = cut(svg, { O: [0, 18], R: 66, stars: 0 });
  const { O, R } = sky;
  // by angle from the SOUTH horizon, counter-clockwise over the top (0 south, 90 zenith, 180 north; below: negative)
  const pt = (a, r = R) => [O[0] - r * Math.cos(a * RAD), O[1] - r * Math.sin(a * RAD)];
  node("path", { d: `M${f(O[0] - R)} ${f(O[1])}A${R} ${R} 0 0 1 ${f(O[0] + R)} ${f(O[1])}`, fill: "none", stroke: FAINT, "stroke-width": 0.8 }, svg);
  node("path", { d: `M${f(O[0] - R)} ${f(O[1])}A${R} ${R} 0 0 0 ${f(pt(-60)[0])} ${f(pt(-60)[1])}`, fill: "none", stroke: FAINT, "stroke-width": 0.7, "stroke-dasharray": "2 3" }, svg);
  node("line", { x1: f(O[0]), y1: f(O[1]), x2: f(O[0]), y2: f(O[1] - R), stroke: FAINT, "stroke-width": 0.7, "stroke-dasharray": "2 3" }, svg);
  const s1 = sunIcon(svg, 5);
  const sp = pt(ALT);
  const arc = (a, b, r, stroke) => {
    const p = pt(a, r);
    const q = pt(b, r);
    return node("path", { d: `M${f(p[0])} ${f(p[1])}A${r} ${r} 0 0 ${a < b ? 1 : 0} ${f(q[0])} ${f(q[1])}`, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, fill: "none", stroke, "stroke-width": 2.6 }, svg);
  };
  const height = arc(0, ALT, R + 5, SUN);
  const lat = arc(ALT, 90, R + 5, SILVER);
  const dep = arc(0, -(90 - ALT), R + 5, FAINT);
  const southPole = node("circle", { cx: f(pt(-(90 - ALT))[0]), cy: f(pt(-(90 - ALT))[1]), r: 2.4, fill: "none", stroke: SILVER, "stroke-width": 1, opacity: 0 }, svg);
  const m = (a, r) => pt(a, r);
  const t1 = label(svg, m(ALT / 2, R - 14)[0], m(ALT / 2, R - 14)[1] + 4, "38°10′", 13);
  const t2 = label(svg, m((ALT + 90) / 2, R - 16)[0] + 6, m((ALT + 90) / 2, R - 16)[1] + 4, "51°50′", 13);
  const t3 = label(svg, 0, -84, "90° − 38°10′ = 51°50′", 13);
  const t4 = label(svg, m(-(90 - ALT), R - 2)[0] + 8, m(-(90 - ALT), R - 2)[1] + 4, "south pole", 12.5, "start");
  const words = [label(svg, pt(0)[0] + 2, O[1] + 14, "S", 13), label(svg, pt(90)[0], pt(90)[1] - 9, "zenith", 13), label(svg, pt(ALT)[0] - 8, pt(ALT)[1] - 8, "equator", 12.5, "end")];
  el.appendChild(svg);
  const s = { s1, sp, height, lat, dep, southPole, t1, t2, t3, t4, words, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const out = 1 - span(t, 13.0, 13.8);
  s.words.forEach((w, i) => w.setAttribute("opacity", f(span(t, 0.3 + 0.2 * i, 0.7 + 0.2 * i) * out)));
  s.s1.set(s.sp[0], s.sp[1], span(t, 0.6, 1.2) * out);
  s.height.setAttribute("stroke-dashoffset", f(1 - span(t, 1.6, 2.8)));
  s.t1.setAttribute("opacity", f(span(t, 2.6, 3.0) * out));
  s.lat.setAttribute("stroke-dashoffset", f(1 - span(t, 3.8, 5.2)));
  s.t2.setAttribute("opacity", f(span(t, 5.0, 5.4) * out));
  s.t3.setAttribute("opacity", f(span(t, 5.6, 6.2) * out));
  s.dep.setAttribute("stroke-dashoffset", f(1 - span(t, 7.0, 8.2)));
  s.southPole.setAttribute("opacity", f(span(t, 8.0, 8.4) * out));
  s.t4.setAttribute("opacity", f(span(t, 8.2, 8.7) * out));
  for (const p of [s.height, s.lat, s.dep]) p.setAttribute("opacity", f(out));
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
