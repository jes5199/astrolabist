// The step-by-step ascension scenes of the Treatise, II 27 (in the right circle: the sign's head and end set on the
// meridian line) and II 28 (in the oblique circle: on the eastern horizon), v2 large windows (jes tg 17917; 3:2, or 3:4
// stacked on a phone: lib/stage.js).  Chaucer's five steps, for Aries and then Cancer, listed beside the instrument, the
// step being done in red: set the head on the line, prick where the almury touches the border, turn until the end is on
// the line, prick again, count the border between.  Solved from the plate's geometry (52 degrees); COLOURED WOODCUT on
// vellum, lib/front-ink.js; the rete and almury are our constructed drawing of inv. 47869's.  Nothing is traced.
// Hand-written (astrolabe-video web/scenes/lib/ascension-steps.js).

import A from "./astrolabe-47869.js";
import { front, node, f, rim, P, almucantar, SILVER, VELLUM, WASH } from "./front-ink.js";
import { VIEWBOX, layoutOf, watch, stepList } from "./stage.js";

const RAD = Math.PI / 180;
const EPS = P.obliquity * RAD;
const RB = (A.frontRadii.hollow + A.frontRadii.ladder) / 2; // the pricks, on the border's ladder
const norm = (x) => ((x % 360) + 360) % 360;
const raOf = (lam) => norm(Math.atan2(Math.cos(EPS) * Math.sin(lam * RAD), Math.cos(lam * RAD)) / RAD);
const decOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * RAD));
const eclAt = (lam, rot) => rim(270 - raOf(lam) + rot, (P.equator * Math.cos(decOf(lam))) / (1 + Math.sin(decOf(lam))));
const [HC, HR] = almucantar(0);
// the turn that sets the degree lam on the meridian line (bearing 0, under the ring)
const onMeridian = (lam) => raOf(lam) - 270;
// the turn that sets it on the eastern horizon
function onEast(lam) {
  const g = (rot) => Math.hypot(eclAt(lam, rot)[0], eclAt(lam, rot)[1] + HC) - HR;
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
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} m`;
};
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const span = (t, a, b) => ease((t - a) / (b - a));
const arcD = (b0, sweep, r) => {
  const a = rim(b0, r);
  const b = rim(b0 + Math.max(0.01, sweep), r);
  return `M${f(a[0])} ${f(a[1])}A${f(r)} ${f(r)} 0 ${sweep > 180 ? 1 : 0} 1 ${f(b[0])} ${f(b[1])}`;
};

const H = 24; // seconds per sign
const LAYOUT = {
  wide: { C: { x: -72, y: 12, k: 0.76 }, list: { x: 12, y: -80, size: 9.6, lh: 11, gap: 7, indent: 10, width: 134, headSize: 13, headGap: 18, restart: true, number: (i) => (i % 5) + 1 } },
  stack: { C: { x: 0, y: -70, k: 0.9 }, list: { x: -136, y: 50, size: 12.5, lh: 14, gap: 6, indent: 15, width: 272, headSize: 15, headGap: 19, restart: true, number: (i) => (i % 5) + 1 } },
};

// kind: "right" (II 27) or "oblique" (II 28)
export function ascensionScene(kind) {
  const right = kind === "right";
  const setOn = right ? onMeridian : onEast;
  const SIGNS = [
    { name: "Aries", head: 0 },
    { name: "Cancer", head: 90 },
  ].map((sg) => {
    const r0 = setOn(sg.head);
    let r1 = setOn(sg.head + 30);
    if (right) r1 = r1 + 360 * Math.round((r0 + 30 - r1) / 360);
    else if (r1 < r0) r1 += 360;
    return { ...sg, rot0: r0, rot1: r1, deg: r1 - r0 };
  });
  const where = right ? "the meridian line" : "the east horizon";
  const STEPS = [];
  const T = [0.5, 4.6, 7.8, 12.2, 15.4];
  SIGNS.forEach((sg, h) => {
    const b = h * H;
    const count = right ? `count the border between: ${sg.deg.toFixed(1)}°, its ascension in the right circle` : `count the border between: ${sg.deg.toFixed(1)}°, ${hm(sg.deg)}: ${sg.deg < 30 ? "under two hours, a crooked sign" : "over two hours, a sovereign sign"}`;
    const lines = [
      `set the head of ${sg.name} on ${where}`,
      "prick the border where the almury touches it",
      `turn the rete ${right ? "westward" : "upward"} until its end is on ${right ? "the line" : "the horizon"}`,
      "prick again at the almury",
      count,
    ];
    lines.forEach((ln, i) => STEPS.push({ t: b + T[i], lines: [ln], ...(i ? {} : { head: sg.name }) }));
  });
  const LOOP = 2 * H * 1000;
  const STILL = 19000; // ms: Aries counted
  const instances = new WeakMap();
  let C = LAYOUT.wide.C;
  const W = (px) => f(px / C.k);

  function mount(el) {
    if (instances.has(el)) return;
    const s = { raf: 0, t0: 0, tm: STILL };
    instances.set(el, s);
    build(el, s);
    watch(el, s, () => {
      s.svg.remove();
      build(el, s);
    });
  }

  function build(el, s) {
    s.mode = layoutOf(el);
    const Lo = LAYOUT[s.mode];
    C = Lo.C;
    const uid = Math.random().toString(36).slice(2, 8);
    const svg = node("svg", { viewBox: VIEWBOX[s.mode], width: "100%", height: "100%", "aria-hidden": "true" });
    svg.style.fontFamily = "inherit";
    el.appendChild(svg);
    const g = node("g", { transform: `translate(${C.x} ${C.y}) scale(${C.k})` }, svg);
    const fr = front(g, { scale: C.k, faint: 0.4 });
    fr.plate.clip.setAttribute("opacity", 0.3);
    for (const hl of fr.plate.hours) hl.setAttribute("opacity", 0.15);
    for (const l of fr.letters) l.setAttribute("opacity", 0.45);
    fr.rete.g.setAttribute("opacity", 0.85);
    // the line the sign is set on: the meridian, or the eastern half of the horizon
    let line;
    if (right) line = node("path", { d: `M0 ${f(-P.capricorn)}V0`, stroke: SILVER, "stroke-width": W(1.6), "stroke-dasharray": `${W(3)} ${W(2)}`, fill: "none", opacity: 0 }, g);
    else {
      const cp = node("clipPath", { id: "e" + uid }, g);
      node("rect", { x: -100, y: -100, width: 100, height: 200 }, cp);
      line = node("circle", { cy: f(-HC), r: f(HR), fill: "none", stroke: SILVER, "stroke-width": W(2.2), opacity: 0, "clip-path": `url(#e${uid})` }, fr.plate.clip.parentNode);
    }
    // on the rete: the almury, the signs' stretches of the ecliptic, their heads and ends
    const almury = node("path", { d: "M-2.2 -83H2.2V-74.2H-2.2Z", fill: SILVER, stroke: "currentColor", "stroke-width": W(0.8), opacity: 0 }, fr.rete.g);
    const marks = SIGNS.map((sg) => {
      let d = "";
      for (let l = sg.head; l <= sg.head + 30.01; l += 1) {
        const p = eclAt(l, 0);
        d += `${d ? "L" : "M"}${f(p[0])} ${f(p[1])}`;
      }
      const stretch = node("path", { d, fill: "none", stroke: SILVER, "stroke-width": W(3), "stroke-linecap": "round", opacity: 0 }, fr.rete.g);
      const at = (l, fill) => {
        const p = eclAt(l, 0);
        return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 3.4, fill, stroke: "currentColor", "stroke-width": W(1), opacity: 0 }, fr.rete.g);
      };
      return { stretch, head: at(sg.head, SILVER), end: at(sg.head + 30, WASH.ochre) };
    });
    // in the border: the pricks, the arc between, its count
    const pricks = SIGNS.map((sg) => [sg.rot0, sg.rot1].map((b) => {
      const p = rim(b, RB);
      return node("circle", { cx: f(p[0]), cy: f(p[1]), r: 3, fill: SILVER, stroke: VELLUM, "stroke-width": W(0.9), opacity: 0 }, g);
    }));
    const arcs = SIGNS.map((sg) => node("path", { d: arcD(sg.rot0, sg.deg, RB), fill: "none", stroke: "#b9821c", "stroke-width": W(5), opacity: 0 }, g));
    const counts = SIGNS.map((sg) => {
      const mid = sg.rot0 + sg.deg / 2;
      const p = rim(mid, A.frontRadii.hollow - 10); // just inside the border, clear of the list and the throne
      const t = node("text", { x: f(C.x + C.k * p[0]), y: f(C.y + C.k * p[1] + 4), "text-anchor": "middle", "font-size": f((12 * C.k) / 0.76), "font-weight": 700, fill: SILVER, opacity: 0, "font-family": "inherit", stroke: VELLUM, "stroke-width": 3, "stroke-linejoin": "round", "paint-order": "stroke" }, svg);
      t.textContent = `${sg.deg.toFixed(1)}°`;
      return t;
    });
    node("circle", { r: 4.2, fill: VELLUM, stroke: "currentColor", "stroke-width": W(1.2) }, g); // the pin over the rete
    const { rows, heads } = stepList(node("g", {}, svg), STEPS, Lo.list);
    Object.assign(s, { svg, rete: fr.rete.g, line, almury, marks, pricks, arcs, counts, rows, heads });
    draw(s, s.tm / 1000);
  }

  function draw(s, t) {
    const h = t < H ? 0 : 1;
    const u = t - h * H;
    const sg = SIGNS[h];
    const out = 1 - span(u, 22.4, 23.0);
    // the rete: in to the head's setting; on to the end's; at the end on (the short way) to the next sign's start
    const next = SIGNS[(h + 1) % SIGNS.length].rot0 - 25;
    let dr = next - sg.rot1;
    dr -= 360 * Math.round(dr / 360);
    const r = sg.rot0 - 25 + 25 * span(u, 0.8, 3.4) + sg.deg * span(u, 8.2, 11.4) + dr * span(u, 22.4, 24.0);
    s.rete.setAttribute("transform", `rotate(${f(r)})`);
    s.line.setAttribute("opacity", f(span(u, 0.6, 1.1) * out));
    s.almury.setAttribute("opacity", f(span(u, 4.6, 5.0) * out));
    s.marks.forEach((m, i) => {
      const on = i === h ? out : 0;
      m.stretch.setAttribute("opacity", f(0.75 * span(u, 0.6, 1.1) * on));
      m.head.setAttribute("opacity", f(span(u, 0.6, 1.1) * on));
      m.end.setAttribute("opacity", f(span(u, 7.8, 8.2) * on));
      s.pricks[i][0].setAttribute("opacity", f(span(u, 5.0, 5.4) * on));
      s.pricks[i][1].setAttribute("opacity", f(span(u, 12.4, 12.8) * on));
      const a = span(u, 15.6, 17.2);
      s.arcs[i].setAttribute("d", arcD(SIGNS[i].rot0, SIGNS[i].deg * a, RB));
      s.arcs[i].setAttribute("opacity", f(0.85 * span(u, 15.5, 15.7) * on));
      s.counts[i].setAttribute("opacity", f(span(u, 17.0, 17.5) * on));
    });
    // the list: the step being done in red, those done in ink, those to come faint; each sign shows its own five
    STEPS.forEach((st, i) => {
      const half = Math.floor(i / 5);
      const inHalf = half === 0 ? span(t, 0.2, 0.5) * (1 - span(t, H - 1.4, H - 1.0)) : span(t, H + 0.0, H + 0.4) * (1 - span(t, 2 * H - 1.4, 2 * H - 1.0));
      const nx = (i + 1) % 5 ? STEPS[i + 1].t : (half + 1) * H - 1.6;
      const now = t >= st.t && t < nx;
      const done = t >= nx;
      const al = (now || done ? 1 : 0.3) * inHalf;
      for (const e of s.rows[i]) {
        e.setAttribute("opacity", f(al));
        e.setAttribute("fill", now ? SILVER : "currentColor");
      }
      if (s.heads[i]) s.heads[i].setAttribute("opacity", f(inHalf));
    });
  }

  function start(el) {
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

  function stop(el) {
    const s = instances.get(el);
    if (!s || !s.raf) return;
    cancelAnimationFrame(s.raf);
    s.raf = 0;
  }

  // for tests and stills: draw one moment of the loop without animating
  function seek(el, ms) {
    const s = instances.get(el);
    if (!s) return;
    s.tm = ((ms % LOOP) + LOOP) % LOOP;
    draw(s, s.tm / 1000);
  }
  return { mount, start, stop, seek, SIGNS, LOOP };
}
