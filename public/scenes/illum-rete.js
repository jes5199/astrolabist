// Illuminated astrolabe for the manuscript treatise page.
// Contract (see src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// A brass astrolabe as a painter would gild it: the moder with its limb and
// degree scale, a plate engraved for the latitude of Oxenford (almucantars
// and horizon by stereographic projection), and a pierced gold rete with
// flame-shaped star pointers that turns about the pole. The rule (label)
// turns slowly the other way. mount() leaves a finished still frame.

const NS = "http://www.w3.org/2000/svg";
const instances = new WeakMap();
let uid = 0;

const INK = "#3a230c";

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

const rad = (d) => (d * Math.PI) / 180;
const f = (n) => n.toFixed(2);

export function mount(el) {
  if (instances.has(el)) return;
  const id = `ir${++uid}`;
  const svg = node("svg", {
    viewBox: "-100 -100 200 200",
    width: "100%",
    height: "100%",
    "aria-hidden": "true",
  });

  const defs = node("defs", {}, svg);
  const brass = node("radialGradient", { id: `${id}b`, cx: "38%", cy: "32%", r: "75%" }, defs);
  node("stop", { offset: "0", "stop-color": "#fbe9a8" }, brass);
  node("stop", { offset: ".45", "stop-color": "#d7a845" }, brass);
  node("stop", { offset: "1", "stop-color": "#7e5414" }, brass);
  const plate = node("radialGradient", { id: `${id}p`, cx: "45%", cy: "40%", r: "70%" }, defs);
  node("stop", { offset: "0", "stop-color": "#fff4cc" }, plate);
  node("stop", { offset: ".7", "stop-color": "#e8c574" }, plate);
  node("stop", { offset: "1", "stop-color": "#c0913a" }, plate);
  const gilt = node("linearGradient", { id: `${id}g`, x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
  node("stop", { offset: "0", "stop-color": "#fff6c2" }, gilt);
  node("stop", { offset: ".4", "stop-color": "#e6b84a" }, gilt);
  node("stop", { offset: ".75", "stop-color": "#a87414" }, gilt);
  node("stop", { offset: "1", "stop-color": "#f2d06a" }, gilt);
  const shadow = node("filter", { id: `${id}s`, x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
  node("feDropShadow", { dx: "1.2", dy: "1.6", stdDeviation: "1", "flood-color": "#2a1606", "flood-opacity": ".55" }, shadow);
  const clip = node("clipPath", { id: `${id}c` }, defs);
  node("circle", { r: 68 }, clip);

  // Throne and ring at the top.
  const crown = node("g", { filter: `url(#${id}s)` }, svg);
  node("circle", { cx: 0, cy: -93, r: 5.2, fill: "none", stroke: `url(#${id}g)`, "stroke-width": 2.6 }, crown);
  node("circle", { cx: 0, cy: -93, r: 5.2, fill: "none", stroke: INK, "stroke-width": 0.4 }, crown);
  node(
    "path",
    {
      d: "M-15 -76 C-14 -82 -8 -84 -5 -86 C-3 -88 -2.5 -88 0 -88.5 C2.5 -88 3 -88 5 -86 C8 -84 14 -82 15 -76 Z",
      fill: `url(#${id}g)`,
      stroke: INK,
      "stroke-width": 0.6,
    },
    crown
  );
  node("circle", { cx: 0, cy: -81, r: 2.2, fill: "#b8321f", stroke: INK, "stroke-width": 0.4 }, crown);

  // Moder (mater) and limb.
  const mater = node("g", { filter: `url(#${id}s)` }, svg);
  node("circle", { r: 82, fill: `url(#${id}b)`, stroke: INK, "stroke-width": 0.9 }, mater);
  node("circle", { r: 70, fill: `url(#${id}p)`, stroke: INK, "stroke-width": 0.7 }, svg);
  const limb = node("g", { stroke: INK, fill: "none" }, svg);
  node("circle", { r: 80, "stroke-width": 0.4 }, limb);
  node("circle", { r: 76, "stroke-width": 0.35 }, limb);
  for (let d = 0; d < 360; d += 2.5) {
    const a = rad(d);
    const long = d % 15 === 0;
    const mid = d % 5 === 0;
    const r1 = 76;
    const r2 = long ? 82 : mid ? 80 : 78;
    node(
      "line",
      {
        x1: f(r1 * Math.cos(a)),
        y1: f(r1 * Math.sin(a)),
        x2: f(r2 * Math.cos(a)),
        y2: f(r2 * Math.sin(a)),
        "stroke-width": long ? 0.6 : 0.3,
      },
      limb
    );
  }
  // Hour letters around the limb, as dots of red and blue paint.
  for (let h = 0; h < 24; h++) {
    const a = rad(h * 15 + 7.5);
    node(
      "circle",
      {
        cx: f(73 * Math.cos(a)),
        cy: f(73 * Math.sin(a)),
        r: 1.1,
        fill: h % 2 ? "#2b4c9b" : "#b8321f",
      },
      limb
    );
  }

  // Plate for latitude 51.75 deg (Oxford): tropics, equator, horizon, almucantars.
  const R = 68 / Math.tan(rad((90 + 23.44) / 2)); // equator radius so Capricorn fills the plate
  const phi = 51.75;
  const engr = node(
    "g",
    { stroke: INK, fill: "none", "stroke-width": 0.38, "clip-path": `url(#${id}c)` },
    svg
  );
  node("circle", { r: f(R * Math.tan(rad((90 - 23.44) / 2))), "stroke-dasharray": "1.2 1.2" }, engr);
  node("circle", { r: f(R), "stroke-width": 0.5 }, engr);
  const yOf = (dec) => -R * Math.tan(rad((90 - dec) / 2)); // up = south
  for (let h = 0; h <= 80; h += 10) {
    const z = 90 - h;
    const ys = yOf(phi - z);
    const dn = phi + z;
    const yn = dn <= 90 ? yOf(dn) : R * Math.tan(rad((dn - 90) / 2));
    const cy = (ys + yn) / 2;
    const r = Math.abs(ys - yn) / 2;
    node("circle", { cy: f(cy), r: f(r), "stroke-width": h === 0 ? 0.8 : 0.35 }, engr);
  }
  node("line", { x1: 0, y1: -68, x2: 0, y2: 68, "stroke-width": 0.45 }, engr);
  node("line", { x1: -68, y1: 0, x2: 68, y2: 0, "stroke-width": 0.45 }, engr);
  // Zenith mark.
  const zen = yOf(phi);
  node("circle", { cy: f(zen), r: 1.2, fill: INK }, engr);
  // Twilight shading below the horizon, as a faint wash.
  {
    const ys = yOf(phi - 90);
    const yn = R * Math.tan(rad((phi + 90 - 90) / 2));
    const cy = (ys + yn) / 2;
    const r = Math.abs(ys - yn) / 2;
    const m = node("mask", { id: `${id}m` }, defs);
    node("rect", { x: -100, y: -100, width: 200, height: 200, fill: "#fff" }, m);
    node("circle", { cy: f(cy), r: f(r), fill: "#000" }, m);
    node(
      "circle",
      { r: 68, fill: "#2b4c9b", opacity: 0.14, mask: `url(#${id}m)` },
      svg
    );
  }

  // Rete: pierced gold, turning about the pole.
  const rete = node("g", {}, svg);
  const reteArt = node("g", { filter: `url(#${id}s)` }, rete);
  const rCap = 68;
  const rCan = R * Math.tan(rad((90 - 23.44) / 2));
  const eclC = -(rCap - rCan) / 2; // ecliptic centre, toward the south (up)
  const eclR = (rCap + rCan) / 2;
  const ring = (cx, cy, r0, r1) =>
    `M${f(cx + r1)} ${f(cy)} A${f(r1)} ${f(r1)} 0 1 0 ${f(cx - r1)} ${f(cy)} A${f(r1)} ${f(r1)} 0 1 0 ${f(cx + r1)} ${f(cy)} Z ` +
    `M${f(cx + r0)} ${f(cy)} A${f(r0)} ${f(r0)} 0 1 1 ${f(cx - r0)} ${f(cy)} A${f(r0)} ${f(r0)} 0 1 1 ${f(cx + r0)} ${f(cy)} Z`;
  const gold = { fill: `url(#${id}g)`, stroke: INK, "stroke-width": 0.5, "fill-rule": "evenodd" };
  node("path", { d: ring(0, 0, rCap - 2.6, rCap + 0.6), ...gold }, reteArt);
  node("path", { d: ring(0, eclC, eclR - 5.5, eclR), ...gold }, reteArt);
  // Struts: the equinoctial cross with a quatrefoil at the crossing.
  node("path", { d: "M-66 -1.4 H66 V1.4 H-66 Z M-1.4 -66 H1.4 V66 H-1.4 Z", ...gold }, reteArt);
  node(
    "path",
    {
      d: "M0 -11 C5 -11 5 -5 11 0 C5 5 5 11 0 11 C-5 11 -5 5 -11 0 C-5 -5 -5 -11 0 -11 Z M0 -5 A5 5 0 1 0 0.01 -5 Z",
      ...gold,
    },
    reteArt
  );
  // Zodiac divisions on the ecliptic ring.
  const zt = node("g", { stroke: INK, "stroke-width": 0.5 }, reteArt);
  for (let s = 0; s < 12; s++) {
    const a = rad(s * 30);
    const c = Math.cos(a);
    const sn = Math.sin(a);
    node(
      "line",
      {
        x1: f((eclR - 5.5) * c),
        y1: f(eclC + (eclR - 5.5) * sn),
        x2: f(eclR * c),
        y2: f(eclC + eclR * sn),
      },
      zt
    );
  }
  // Star pointers: flame-shaped, tipped with a red jewel at the star.
  const stars = [
    [205, 58], [250, 40], [290, 62], [330, 52], [20, 63],
    [60, 46], [100, 60], [140, 38], [170, 64],
  ];
  for (const [deg, r] of stars) {
    const a = rad(deg);
    const tx = r * Math.cos(a);
    const ty = r * Math.sin(a);
    const bx = (r - 15) * Math.cos(a);
    const by = (r - 15) * Math.sin(a);
    const px = -Math.sin(a) * 3.2;
    const py = Math.cos(a) * 3.2;
    node(
      "path",
      {
        d: `M${f(bx + px)} ${f(by + py)} Q${f((bx + tx) / 2 + px * 1.6)} ${f((by + ty) / 2 + py * 1.6)} ${f(tx)} ${f(ty)} Q${f((bx + tx) / 2 - px * 0.3)} ${f((by + ty) / 2 - py * 0.3)} ${f(bx - px)} ${f(by - py)} Z`,
        fill: `url(#${id}g)`,
        stroke: INK,
        "stroke-width": 0.45,
      },
      reteArt
    );
    node("circle", { cx: f(tx), cy: f(ty), r: 1.5, fill: "#b8321f", stroke: INK, "stroke-width": 0.3 }, reteArt);
  }

  // Rule (label) across the face.
  const label = node("g", { filter: `url(#${id}s)` }, svg);
  node(
    "path",
    {
      d: "M-74 0 L-62 -3 H62 L74 0 L62 3 H-62 Z",
      fill: `url(#${id}g)`,
      stroke: INK,
      "stroke-width": 0.5,
    },
    label
  );
  node("line", { x1: -62, y1: 0, x2: 62, y2: 0, stroke: INK, "stroke-width": 0.3 }, label);
  node("circle", { r: 4, fill: "#2b4c9b", stroke: INK, "stroke-width": 0.5 }, svg);
  node("circle", { r: 1.4, cx: -1, cy: -1, fill: "#dfe6ff", opacity: 0.8 }, svg);

  const state = { rete, label, angle: 0, raf: 0, last: 0 };
  label.setAttribute("transform", "rotate(-28)");
  rete.setAttribute("transform", "rotate(0)");
  el.appendChild(svg);
  instances.set(el, state);
}

export function start(el) {
  const s = instances.get(el);
  if (!s || s.raf) return;
  s.last = 0;
  const step = (t) => {
    if (s.last) s.angle = (s.angle + (t - s.last) * 0.006) % 360; // ~1 turn a minute
    s.last = t;
    s.rete.setAttribute("transform", `rotate(${s.angle.toFixed(3)})`);
    s.label.setAttribute("transform", `rotate(${(-28 - s.angle * 0.35).toFixed(3)})`);
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
