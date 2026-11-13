// The figures' runtime: builds a jointed figure from the rig data as SVG and poses it.
// A figure is a flat list of parts in drawing order; every part has a parent, a pivot in the parent's frame and
// an angle.  A pose is a table of angles; posing a figure rewrites one transform per part.
// Hand-written (astrolabe-video web/scenes/lib/figures.js); the rig data is in figures-rig.js.

const NS = "http://www.w3.org/2000/svg";
const RAD = Math.PI / 180;

function node(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// 2 x 3 matrices [a b c d e f] as SVG writes them; mul(m, n): n first, then m
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
export const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const str = (m) => `matrix(${m.map((v) => +v.toFixed(4)).join(" ")})`;

let serial = 0;

// Build a figure.  rig: its data; style: {contour, contourWidth}; scale: the size it will be drawn at (for the
// contour's weight, as the film has it); split: z values at which the drawing is cut into layers, so that a prop
// can be slipped between (the desk lies between Chaucer's body and his writing arm).
// Returns {layers: [<g>...], pose(p, place), matrix(name), anchor(part, name)}.
export function build(rig, style, scale = 1, split = []) {
  const uid = "fg" + ++serial;
  const w = style.contourWidth * (0.85 + 0.15 * scale);
  const cuts = [...split, Infinity];
  const layers = cuts.map(() => node("g", {}));
  const batches = new Map();
  for (const p of rig.parts) {
    if (!p.f) continue;
    const key = p.z + "|" + p.g;
    if (!batches.has(key)) batches.set(key, { z: p.z, parts: [] });
    batches.get(key).parts.push(p);
  }
  const els = {};
  for (const b of [...batches.values()].sort((a, c) => a.z - c.z)) {
    const g = node("g", {}, layers[cuts.findIndex((c) => b.z <= c)]);
    const made = b.parts.map((p) => ({ p, shapes: {} }));
    // as the film draws a group: every contour first, then every fill, then the folds, clipped to their part
    for (const m of made) m.stroke = node("path", { fill: "none", stroke: "#" + style.contour, "stroke-width": +(2 * w / scale).toFixed(3), "stroke-linejoin": "round" }, g);
    for (const m of made) m.fill = node("path", { fill: "#" + m.p.f }, g);
    for (const m of made) {
      for (const key in m.p.s) {
        const sh = m.p.s[key];
        if (!sh.det.length) continue;
        const id = `${uid}-${m.p.n}-${key || "0"}`;
        const dg = node("g", { "clip-path": `url(#${id})` }, g);
        node("path", { d: sh.d }, node("clipPath", { id }, dg));
        for (const d of sh.det) {
          if (d[0] === "l") node("path", { d: d[1], fill: "none", stroke: "#" + d[2], "stroke-opacity": d[4], "stroke-width": +(w * d[3] / scale).toFixed(3), "stroke-linecap": "round" }, dg);
          else if (d[0] === "s") node("path", { d: d[1], fill: "#" + d[2], stroke: "#" + style.contour, "stroke-width": +(w * 0.7 / scale).toFixed(3) }, dg);
          else node("circle", { cx: d[1][0], cy: d[1][1], r: d[1][2], fill: "#" + d[2], "fill-opacity": d[3] }, dg);
        }
        m.shapes[key] = dg;
      }
      els[m.p.n] = m;
    }
  }
  const M = {};
  let placed = [1, 0, 0, 1, 0, 0];
  return {
    layers,
    // p: {a: {part: degrees}, o: {part: [dx, dy]}, swap: {part: shape}, hide: [...], show: [...]}; place: where the
    // figure stands, a matrix [a b c d e f] in the scene's units
    pose(p, place) {
      placed = place;
      const world = {};
      for (const q of rig.parts) {
        const pm = q.p ? M[q.p] : [1, 0, 0, 1, 0, 0];
        const a = ((p.a && p.a[q.n]) || 0) * RAD;
        const o = p.o && p.o[q.n];
        const c = Math.cos(a);
        const s = Math.sin(a);
        M[q.n] = mul(mul(pm, [1, 0, 0, 1, q.o[0] + (o ? o[0] : 0), q.o[1] + (o ? o[1] : 0)]), [c, s, -s, c, 0, 0]);
        const m = els[q.n];
        if (!m) continue;
        const hidden = (p.hide && p.hide.includes(q.n)) || (rig.hidden.includes(q.n) && !(p.show && p.show.includes(q.n)));
        const key = (p.swap && p.swap[q.n]) || "";
        const t = str(mul(place, M[q.n]));
        for (const e of [m.stroke, m.fill]) {
          e.setAttribute("display", hidden ? "none" : "inline");
          e.setAttribute("transform", t);
          if (m.key !== key) e.setAttribute("d", q.s[key].d);
        }
        m.key = key;
        for (const k in m.shapes) {
          const on = !hidden && k === key;
          m.shapes[k].setAttribute("display", on ? "inline" : "none");
          if (on) m.shapes[k].setAttribute("transform", t);
        }
      }
    },
    // a point of a part's own frame, in the scene's units (after the last pose)
    point(part, x, y) {
      return apply(mul(placed, M[part]), x, y);
    },
  };
}

// the pose a share t of the way from p to q: angles and offsets go across, shapes change at the half
export function blend(p, q, t) {
  const src = t > 0.5 ? q : p;
  const out = { a: {}, o: {}, swap: src.swap, hide: src.hide, show: src.show };
  for (const k of new Set([...Object.keys(p.a || {}), ...Object.keys(q.a || {})])) {
    const a = (p.a && p.a[k]) || 0;
    let d = ((q.a && q.a[k]) || 0) - a;
    d -= 360 * Math.round(d / 360);
    out.a[k] = a + d * t;
  }
  for (const k of new Set([...Object.keys(p.o || {}), ...Object.keys(q.o || {})])) {
    const a = (p.o && p.o[k]) || [0, 0];
    const b = (q.o && q.o[k]) || [0, 0];
    out.o[k] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  return out;
}

// a pose from a row of key poses at the given shares (keys ascending), at share u
export function along(keys, poses, u) {
  if (u <= keys[0]) return poses[0];
  for (let i = 1; i < keys.length; i++) if (u <= keys[i]) return blend(poses[i - 1], poses[i], (u - keys[i - 1]) / (keys[i] - keys[i - 1]));
  return poses[poses.length - 1];
}

// Catmull-Rom through pts as path data, as the film's own spline: a point [x, y, 1] is a corner
export function spline(pts, closed = true) {
  const n = pts.length;
  const r = (v) => +v.toFixed(1);
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const pa = closed ? pts[(i - 1 + n) % n] : pts[Math.max(i - 1, 0)];
    const pb = closed ? pts[(i + 2) % n] : pts[Math.min(i + 2, n - 1)];
    const ca = a[2] || (!closed && i === 0);
    const cb = b[2] || (!closed && i + 1 === n - 1);
    const c1 = ca ? [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3] : [a[0] + (b[0] - pa[0]) / 6, a[1] + (b[1] - pa[1]) / 6];
    const c2 = cb ? [b[0] - (b[0] - a[0]) / 3, b[1] - (b[1] - a[1]) / 3] : [b[0] - (pb[0] - a[0]) / 6, b[1] - (pb[1] - a[1]) / 6];
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(b[0])} ${r(b[1])}`;
  }
  return d + (closed ? "Z" : "");
}
