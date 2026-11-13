// A Treatise on the Astrolabe, Part II, 28: "Set the heved of the signe which as thee list to knowe his ascensioun
// up-on the est orisonte, and waite wher thyn almury toucheth the bordure, and set ther a prikke. Turne thanne thy riet
// upward til that the ende of the same signe sitte up-on the est orisonte, and waite eft-sones wher as thyn almury
// toucheth the bordure, and set ther a-nother prikke. Rikne thanne the noumbre of degrees in the bordure by-twixe bothe
// prikkes, and tak ther the assencioun of the signe in the embelif cercle ... every signe by-twixe the heved of
// Capricorne un-to the ende of Geminis aryseth on oure orisonte in lasse than two houres equales."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// The front with its rete, the almury lit.  Aries: its head set on the eastern horizon, a prick where the almury
// touches the border; turned till its end is on the horizon, another prick; the border between counted, with its time:
// a crooked sign, rising in far less than two hours.  Then Cancer, a sign of right ascension, rising slowly.  Solved
// from the plate's geometry (52 degrees); shared lib/front.js; the rete and almury are our constructed drawing of
// inv. 47869's.  Original line work; nothing is traced.

import A from "./lib/astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, NIGHT } from "./lib/front.js";

const instances = new WeakMap();
const LOOP = 18000;
const STILL = 7400; // ms: Aries counted
const C = { x: 0, y: 10, k: 0.9 };
const W = (px) => f(px / C.k);
const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2;
const raOf = (lam) => {
  const r = Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD;
  return ((r % 360) + 360) % 360;
};
const [HC, HR] = almucantar(0);
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, (P.equator * Math.cos(decOf(lam))) / (1 + Math.sin(decOf(lam))));
// the turn that sets the degree lam on the eastern horizon
function rising(lam) {
  const g = (rot) => Math.hypot(...((p) => [p[0], p[1] + HC])(eclAt(lam, rot))) - HR;
  for (let r = 0; r < 360; r += 1) {
    if (g(r) * g(r + 1) > 0) continue;
    let a = r;
    let b = r + 1;
    for (let k = 0; k < 50; k++) {
      const m = (a + b) / 2;
      if (g(a) * g(m) <= 0) b = m;
      else a = m;
    }
    if (eclAt(lam, a)[0] < 0) return a;
  }
  return 0;
}
const hm = (deg) => {
  const m = Math.round((deg / 15) * 60);
  return `${Math.floor(m / 60)} h ${m % 60} m`;
};
const ACTS = [
  { name: "Aries", head: 0 },
  { name: "Cancer", head: 90 },
].map((a) => {
  const r0 = rising(a.head);
  let r1 = rising(a.head + 30);
  if (r1 < r0) r1 += 360;
  return { ...a, rot0: r0, rot1: r1, deg: r1 - r0 };
});

const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const arcD = (b0, sweep, r) => {
  const a = rim(b0, r);
  const b = rim(b0 + Math.max(0.01, sweep), r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
};

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", { viewBox: "-100 -100 200 200", width: "100%", height: "100%", "aria-hidden": "true" });
  svg.style.fontFamily = "inherit";
  svg.style.overflow = "visible";
  const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
  const fr = front(g, { scale: C.k, faint: 0.4 });
  fr.plate.clip.setAttribute("opacity", 0.25);
  for (const l of fr.letters) l.setAttribute("opacity", 0.4);
  fr.rete.g.setAttribute("opacity", 0.7);
  node("path", { d: "M-1.7 -82.6H1.7V-74.6H-1.7Z", fill: SILVER }, fr.rete.g); // the almury, lit
  fr.plate.horizon.setAttribute("opacity", 1);
  const acts = ACTS.map(() => {
    const arc = node("path", { fill: "none", stroke: "#f6d77a", "stroke-width": W(4), opacity: 0 }, g);
    const p = [0, 1].map(() => node("circle", { r: 2.4, fill: "#000", stroke: SILVER, "stroke-width": W(0.9), opacity: 0 }, g));
    return { arc, p };
  });
  const cap = node("text", { x: 0, y: f(C.y + 52), "text-anchor": "middle", "font-size": 15, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: NIGHT, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
  el.appendChild(svg);
  const s = { rete: fr.rete.g, acts, cap, raf: 0, t0: 0, tm: STILL };
  instances.set(el, s);
  draw(s, STILL / 1000);
}

function draw(s, t) {
  const act = t < 9 ? 0 : 1;
  const u = t - 9 * act;
  const A0 = ACTS[act];
  const out = 1 - span(u, 8.2, 8.9);
  const r = u < 1.0 ? A0.rot0 - 20 + 20 * span(u, 0, 1.0) : A0.rot0 + (A0.rot1 - A0.rot0) * span(u, 2.6, 5.2);
  s.rete.setAttribute("transform", `rotate(${f(r)})`);
  s.acts.forEach((a, i) => {
    const on = i === act ? out : 0;
    a.p[0].setAttribute("cx", f(rim(ACTS[i].rot0, RB)[0]));
    a.p[0].setAttribute("cy", f(rim(ACTS[i].rot0, RB)[1]));
    a.p[1].setAttribute("cx", f(rim(ACTS[i].rot1, RB)[0]));
    a.p[1].setAttribute("cy", f(rim(ACTS[i].rot1, RB)[1]));
    a.p[0].setAttribute("opacity", f(span(u, 1.4, 1.8) * on));
    a.p[1].setAttribute("opacity", f(span(u, 5.4, 5.8) * on));
    a.arc.setAttribute("d", arcD(ACTS[i].rot0, ACTS[i].deg, RB));
    a.arc.setAttribute("opacity", f(0.8 * span(u, 6.0, 6.5) * on));
  });
  s.cap.textContent = `${A0.name}: ${A0.deg.toFixed(1)}°, ${hm(A0.deg)}`;
  s.cap.setAttribute("opacity", f(span(u, 6.2, 6.8) * out));
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
