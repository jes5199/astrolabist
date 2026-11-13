// Demo scene for src/components/Scene.astro.
// Contract: mount(el) once per wrapper, then start(el) / stop(el).
// Draws a simplified astrolabe front: limb with degree ticks, a fixed
// plate (horizon arc, meridian) and a rete (ecliptic ring + star pointers)
// that turns about the pole.

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

export function mount(el) {
  if (instances.has(el)) return;
  const svg = node("svg", {
    viewBox: "-100 -100 200 200",
    width: "100%",
    height: "100%",
    "aria-hidden": "true",
  });
  const ink = { fill: "none", stroke: "currentColor" };

  // Limb and ticks (fixed).
  node("circle", { ...ink, r: 92, "stroke-width": 3 }, svg);
  node("circle", { ...ink, r: 84, "stroke-width": 0.8 }, svg);
  const ticks = node("g", { ...ink, "stroke-width": 0.6 }, svg);
  for (let d = 0; d < 360; d += 5) {
    const a = (d * Math.PI) / 180;
    const r2 = d % 15 === 0 ? 76 : 80;
    node(
      "line",
      {
        x1: (84 * Math.cos(a)).toFixed(2),
        y1: (84 * Math.sin(a)).toFixed(2),
        x2: (r2 * Math.cos(a)).toFixed(2),
        y2: (r2 * Math.sin(a)).toFixed(2),
      },
      ticks
    );
  }

  // Plate (fixed): tropics, horizon, meridian.
  const plate = node("g", { ...ink, "stroke-width": 0.6, opacity: 0.6 }, svg);
  node("circle", { r: 36, "stroke-dasharray": "2 3" }, plate);
  node("circle", { r: 60, "stroke-dasharray": "2 3" }, plate);
  node("path", { d: "M -74 8 A 82 60 0 0 1 74 8" }, plate);
  node("line", { x1: 0, y1: -84, x2: 0, y2: 84 }, plate);

  // Rete (rotating): off-centre ecliptic ring and star pointers.
  const rete = node("g", { "stroke-linecap": "round" }, svg);
  node(
    "circle",
    { ...ink, cx: 0, cy: -12, r: 48, "stroke-width": 2.4, class: "rete-ring" },
    rete
  );
  const stars = [
    [20, 70],
    [95, 55],
    [160, 74],
    [230, 44],
    [300, 66],
  ];
  for (const [deg, r] of stars) {
    const a = (deg * Math.PI) / 180;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    node(
      "path",
      {
        d: `M ${(x * 0.62).toFixed(1)} ${(y * 0.62).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`,
        ...ink,
        "stroke-width": 1.6,
      },
      rete
    );
    node("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 2.2, fill: "var(--text-hover, currentColor)" }, rete);
  }
  node("circle", { r: 3.5, fill: "currentColor" }, svg);

  el.appendChild(svg);
  instances.set(el, { rete, angle: 0, raf: 0, last: 0 });
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.last = 0;
  const step = (t) => {
    if (s.last) s.angle = (s.angle + (t - s.last) * 0.006) % 360; // ~1 turn/min
    s.last = t;
    s.rete.setAttribute("transform", `rotate(${s.angle.toFixed(3)})`);
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
