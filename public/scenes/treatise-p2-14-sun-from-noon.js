// A Treatise on the Astrolabe, Part II, 14: "Sek bysily with thy rewle the heyest of the sonne in midde of the day;
// turne thanne thyn Astrolabie, and with a prikke of ink marke the nombre of that same altitude in the lyne meridional.
// Turne thanne thy riet a-boute til thou fynde a degree of thy zodiak acording with the prikke ... and in sooth, thou
// shalt finde but two degrees in al the zodiak of that condicioun; and yit thilke two degrees ben in diverse signes;
// than maistow lightly by the sesoun of the yere knowe the signe in whiche that is the sonne."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete.  The noon height of II 13 (38.4 degrees, 12 March) is marked with a prick on the meridian
// line.  The rete turns once round: the zodiac's degree that comes onto the prick is ringed and named, twice: the first
// degree of Aries and the 29th of Virgo; the season (March) says which is the sun's.  Solved from the plate's geometry;
// shared lib/front.js; the rete is our constructed drawing of inv. 47869's.  Original line work.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 16000;
const STILL = 3000; // ms: the first degree found: Aries 1
const C = { x: 0, y: 10, k: 0.92 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const SUN = A.morning.sunLongitude; // 12 March: the first degree of Aries
const DEC = Math.asin(Math.sin(EPS) * Math.sin(SUN * RAD)) / RAD;
const HEIGHT = 90 - P.latitude + DEC;
const raOf = (lam) => (((Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD) % 360) + 360) % 360;
const L2 = 180 - SUN; // the other degree of the same declination
const R1 = raOf(SUN) - 270; // the turns that bring each under the ring
const R2 = raOf(L2) - 270;
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricornus", "Aquarius", "Pisces"];
const nameOf = (lam) => `${SIGNS[Math.floor(lam / 30)]} ${Math.round(lam % 30)}°`; // as II 1 and II 4 name them

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
// the turn through the loop: up to the first, a pause, on to the second, a pause, on round to the start
function turnAt(t) {
  const a = R1 - 25;
  const b = R2 > R1 ? R2 : R2 + 360;
  if (t < 1.2) return a + 25 * span(t, 0, 1.2);
  if (t < 4.4) return R1;
  if (t < 8.4) return R1 + (b - R1) * span(t, 4.4, 8.4);
  if (t < 11.6) return b;
  return b + (a + 360 - b) * span(t, 11.6, 16);
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.3);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.7);
  const [c, r] = almucantar(HEIGHT);
  const py = -(c + r); // where that almucantar crosses the meridian, toward the south
  node("path", { d: `M0 ${f(py - 20)}V${f(py + 20)}`, stroke: SILVER, "stroke-width": W(0.8), "stroke-dasharray": `${W(2)} ${W(2)}`, opacity: 0.7, fill: "none" }, g);
  node("circle", { cy: f(py), r: 2.4, fill: "#000", stroke: SILVER, "stroke-width": W(0.9) }, g);
  const ring = node("circle", { cy: f(py), r: 5.5, fill: "none", stroke: SILVER, "stroke-width": W(1.3), opacity: 0 }, g);
  const text = (y, size) => node("text", { x: f(C.x + 9), y: f(y), "text-anchor": "start", "font-size": size, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  const found = text(C.y + C.k * py - 8, 15);
  const season = text(C.y + C.k * py + 12, 13);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, ring, found, season, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  s.rete.setAttribute("transform", `rotate(${f(turnAt(t))})`);
  const first = span(t, 1.2, 1.6) * (1 - span(t, 4.2, 4.5));
  const second = span(t, 8.4, 8.8) * (1 - span(t, 11.4, 11.7));
  s.ring.setAttribute("opacity", f(Math.max(first, second)));
  s.found.textContent = second > first ? nameOf(L2) : nameOf(SUN);
  s.found.setAttribute("opacity", f(Math.max(first, second)));
  s.season.textContent = second > first ? "September" : "March";
  s.season.setAttribute("opacity", f(Math.max(first, second)));
  s.season.setAttribute("fill", second > first ? "#a7b0d4" : SILVER);
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
