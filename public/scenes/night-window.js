// Default "sky window" scene for /treatise/ (night-sky direction).
// Contract (see src/components/Scene.astro): mount(el) once, start(el) / stop(el).
//
// A small round patch of procedurally generated sky: seeded faint stars, one
// little made-up asterism, a fixed horizon arc and almucantars (the "plate"),
// and a turning star field with an off-centre ecliptic ring (the "rete").
// The seed comes from the nearest ancestor id, so every window differs but
// stays the same between visits.

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => n.toFixed(2);

export function mount(el) {
  if (instances.has(el)) return;
  const seedSrc = el.closest("[id]")?.id || "sky";
  const rand = rng(hash(seedSrc));

  const svg = node("svg", {
    viewBox: "-100 -100 200 200",
    width: "100%",
    height: "100%",
    "aria-hidden": "true",
  });

  // Rete: everything that turns about the pole.
  const rete = node("g", {}, svg);

  // Ecliptic ring, off-centre as on an astrolabe, with sign divisions.
  const ecl = node("g", { fill: "none", stroke: "#e9c877" }, rete);
  const ecy = -18 - rand() * 10;
  const ecr = 52 + rand() * 8;
  node("circle", { cx: 0, cy: f(ecy), r: f(ecr), "stroke-width": 1.1, opacity: 0.55 }, ecl);
  node("circle", { cx: 0, cy: f(ecy), r: f(ecr - 6), "stroke-width": 0.5, opacity: 0.4 }, ecl);
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    node(
      "line",
      {
        x1: f((ecr - 6) * Math.cos(a)),
        y1: f(ecy + (ecr - 6) * Math.sin(a)),
        x2: f(ecr * Math.cos(a)),
        y2: f(ecy + ecr * Math.sin(a)),
        "stroke-width": 0.6,
        opacity: 0.6,
      },
      ecl
    );
  }

  // Faint stars.
  const faint = node("g", { fill: "#dfe6ff" }, rete);
  for (let i = 0; i < 90; i++) {
    const r = 96 * Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    const m = rand();
    node(
      "circle",
      {
        cx: f(r * Math.cos(a)),
        cy: f(r * Math.sin(a)),
        r: f(0.35 + m * m * 0.9),
        opacity: f(0.3 + m * 0.6),
      },
      faint
    );
  }

  // A small asterism: a chain of brighter stars.
  const pts = [];
  let x = (rand() - 0.5) * 60;
  let y = (rand() - 0.5) * 60;
  const n = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    pts.push([x, y]);
    const a = rand() * Math.PI * 2;
    const d = 14 + rand() * 16;
    x = Math.max(-62, Math.min(62, x + d * Math.cos(a)));
    y = Math.max(-62, Math.min(62, y + d * Math.sin(a)));
  }
  node(
    "path",
    {
      d: "M " + pts.map(([px, py]) => `${f(px)} ${f(py)}`).join(" L "),
      fill: "none",
      stroke: "#b9c8ff",
      "stroke-width": 0.6,
      opacity: 0.5,
    },
    rete
  );
  const bright = node("g", { fill: "#f4f6ff" }, rete);
  pts.forEach(([px, py], i) => {
    const r = i === 0 ? 2.4 : 1.2 + rand() * 1.1;
    node("circle", { cx: f(px), cy: f(py), r: f(r * 2.6), fill: "#9fb4ff", opacity: 0.12 }, bright);
    node("circle", { cx: f(px), cy: f(py), r: f(r) }, bright);
  });

  // Plate: fixed horizon and a few almucantars about the zenith.
  const plate = node("g", { fill: "none", stroke: "#a9b6e8", opacity: 0.35 }, svg);
  node("path", { d: "M -96 30 A 120 90 0 0 1 96 30", "stroke-width": 0.9 }, plate);
  for (let i = 1; i <= 4; i++) {
    const rr = 74 - i * 15;
    node("ellipse", { cx: 0, cy: f(22 - i * 3), rx: f(rr), ry: f(rr * 0.82), "stroke-width": 0.4, "stroke-dasharray": "1.5 2.5" }, plate);
  }
  node("line", { x1: 0, y1: -100, x2: 0, y2: 100, "stroke-width": 0.4 }, plate);
  // The pole.
  node("circle", { r: 1.6, fill: "#e9c877" }, svg);

  el.appendChild(svg);
  const angle = rand() * 360;
  rete.setAttribute("transform", `rotate(${f(angle)})`);
  instances.set(el, { rete, angle, raf: 0, last: 0 });
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.last = 0;
  const step = (t) => {
    if (s.last) s.angle = (s.angle + (t - s.last) * 0.0025) % 360; // ~1 turn / 2.4 min
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
