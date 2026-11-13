// Procedural geometry for the /treatise/ instrument.
//
// Everything here is computed, not traced: a northern astrolabe drawn by
// stereographic projection from the south celestial pole onto the equator,
// for the latitude Chaucer gives for Oxford (51° 50'). SVG user units; the
// centre of the instrument is (0, 0) and y points down. "Up" on the plate is
// south (the meridian line under the throne), as on a real astrolabe.

const DEG = Math.PI / 180;
export const LATITUDE = 51 + 50 / 60; // "the latitude of Oxenford"
const EPS = 23.44; // obliquity of the ecliptic

const f = (n: number) => (Math.abs(n) < 1e-9 ? "0" : n.toFixed(2).replace(/\.?0+$/, ""));

/** Point at radius r, angle a in degrees clockwise from the top. */
export const polar = (r: number, a: number): [number, number] => [
  r * Math.sin(a * DEG),
  -r * Math.cos(a * DEG),
];
const pt = (r: number, a: number) => polar(r, a).map(f).join(" ");

/** Arc path at radius r from angle a0 to a1 (clockwise if a1 > a0). */
export const arc = (r: number, a0: number, a1: number) => {
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M ${pt(r, a0)} A ${f(r)} ${f(r)} 0 ${large} ${sweep} ${pt(r, a1)}`;
};

const ring = (r: number, cls: string) => `<circle r="${f(r)}" class="${cls}"/>`;

// ---------------------------------------------------------------------------
// Radii (user units)
export const R_TOC_OUT = 304; // outer edge of the contents ring
export const R_TOC_IN = 266;
export const R_LIMB = 262; // outer edge of the brass limb
export const R_PLATE = 226; // plate edge = tropic of Capricorn
const R_EQ = R_PLATE / Math.tan(((90 + EPS) / 2) * DEG); // equator
const rDec = (dec: number) => R_EQ * Math.tan(((90 - dec) / 2) * DEG);
const R_CANCER = rDec(EPS);

// ---------------------------------------------------------------------------
// The limb: degree scale and punched numerals.
function limb(): string {
  const out: string[] = [];
  out.push(`<circle r="${R_LIMB}" class="m-limb"/>`);
  out.push(ring(R_LIMB - 1.2, "e-line e-strong"));
  out.push(ring(R_LIMB - 16, "e-line"));
  out.push(ring(R_PLATE + 2, "e-line e-strong"));
  const ticks: string[] = [];
  for (let d = 0; d < 360; d++) {
    const r0 = R_LIMB - 16;
    const len = d % 10 === 0 ? 14 : d % 5 === 0 ? 9 : 5;
    const [x0, y0] = polar(r0, d);
    const [x1, y1] = polar(r0 - len, d);
    ticks.push(`M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`);
  }
  out.push(`<path class="e-line e-tick" d="${ticks.join("")}"/>`);
  for (let d = 0; d < 360; d += 10) {
    const label = d === 0 ? "360" : String(d);
    // Chaucer: the bordure is numbered from the meridian line round about.
    out.push(
      `<text class="e-num" transform="rotate(${d}) translate(0 ${-(R_LIMB - 5.2)})">${label}</text>`
    );
  }
  // Quarter crosses
  for (const d of [0, 90, 180, 270]) {
    const [x, y] = polar(R_LIMB - 8, d);
    out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="1.6" class="e-dot"/>`);
  }
  return out.join("");
}

// ---------------------------------------------------------------------------
// The plate (tympan) for latitude φ.
function plate(): string {
  const phi = LATITUDE;
  const out: string[] = [];
  out.push(`<circle r="${R_PLATE}" class="m-plate"/>`);
  out.push(`<g clip-path="url(#inst-plate-clip)">`);

  // Almucantars (circles of equal altitude), every 5 degrees.
  const alm = (a: number) => {
    const ys = -R_EQ * Math.tan(((180 - phi - a) / 2) * DEG);
    const yn = R_EQ * Math.tan(((phi - a) / 2) * DEG);
    return { cy: (ys + yn) / 2, r: (yn - ys) / 2 };
  };
  const a0 = alm(0);
  for (let a = 5; a < 90; a += 5) {
    const { cy, r } = alm(a);
    out.push(
      `<circle cy="${f(cy)}" r="${f(r)}" class="e-line ${a % 10 === 0 ? "" : "e-faint"}"/>`
    );
  }
  // Azimuths: circles through zenith and nadir, drawn only above the horizon.
  const yz = -R_EQ * Math.tan(((90 - phi) / 2) * DEG);
  const yN = R_EQ * Math.tan(((90 + phi) / 2) * DEG);
  const h = (yN - yz) / 2;
  const ym = (yN + yz) / 2;
  out.push(`<g clip-path="url(#inst-horizon-clip)">`);
  out.push(`<line x1="0" y1="${f(-R_PLATE)}" x2="0" y2="${f(a0.cy + a0.r)}" class="e-line e-faint"/>`);
  for (let A = 15; A <= 90; A += 15) {
    const xc = h / Math.tan(A * DEG);
    const r = Math.hypot(xc, h);
    for (const s of A === 90 ? [1] : [1, -1]) {
      out.push(`<circle cx="${f(s * xc)}" cy="${f(ym)}" r="${f(r)}" class="e-line e-faint"/>`);
    }
  }
  out.push(`</g>`);
  // Crepuscular line (sun 18 degrees below the horizon), dashed.
  const tw = alm(-18);
  out.push(`<circle cy="${f(tw.cy)}" r="${f(tw.r)}" class="e-line e-dash"/>`);
  // Horizon, heavier.
  out.push(`<circle cy="${f(a0.cy)}" r="${f(a0.r)}" class="e-line e-strong"/>`);
  out.push(`</g>`);

  // Tropics and equator.
  out.push(ring(R_CANCER, "e-line"));
  out.push(ring(R_EQ, "e-line"));
  out.push(ring(R_PLATE, "e-line e-strong"));
  // Meridian and east-west line.
  out.push(`<line x1="0" y1="${-R_PLATE}" x2="0" y2="${R_PLATE}" class="e-line"/>`);
  out.push(`<line x1="${-R_PLATE}" y1="0" x2="${R_PLATE}" y2="0" class="e-line"/>`);
  // Zenith mark.
  out.push(`<circle cy="${f(yz)}" r="2.2" class="e-line"/>`);

  // Inscriptions.
  const hy = a0.cy + a0.r; // north point of horizon (below centre)
  out.push(
    `<path id="inst-oxon-r" d="M ${pt(R_PLATE - 10, 218)} A ${R_PLATE - 10} ${R_PLATE - 10} 0 0 0 ${pt(R_PLATE - 10, 142)}" fill="none"/>`
  );
  out.push(
    `<text class="e-inscr"><textPath href="#inst-oxon-r" startOffset="50%" text-anchor="middle">LATITVDO OXENFORD · 51° 50′</textPath></text>`
  );
  out.push(`<text class="e-inscr e-small" x="${f(-R_EQ - 6)}" y="-5" text-anchor="end">ORIENS</text>`);
  out.push(`<text class="e-inscr e-small" x="${f(R_EQ + 6)}" y="-5" text-anchor="start">OCCIDENS</text>`);
  out.push(`<text class="e-inscr e-small" x="0" y="${f(hy + 13)}" text-anchor="middle">SEPTENTRIO</text>`);
  out.push(`<text class="e-inscr e-small" x="0" y="${f(-R_PLATE + 20)}" text-anchor="middle">MERIDIES</text>`);
  return out.join("");
}

// ---------------------------------------------------------------------------
// The rete: rim, ecliptic and star pointers. Drawn at rotation 0 with the
// first point of Aries on the meridian (top).
export const STARS: [string, number, number][] = [
  // name, right ascension (hours), declination (degrees)
  ["ALDEBARAN", 4.598, 16.51],
  ["RIGEL", 5.242, -8.2],
  ["CAPELLA", 5.278, 46.0],
  ["BETELGEUZE", 5.919, 7.41],
  ["ALHABOR", 6.752, -16.72],
  ["PROCYON", 7.655, 5.22],
  ["REGULUS", 10.139, 11.97],
  ["DUBHE", 11.062, 61.75],
  ["SPICA", 13.42, -11.16],
  ["ARCTURUS", 14.261, 19.18],
  ["ALPHECCA", 15.578, 26.71],
  ["WEGA", 18.616, 38.78],
  ["ALTAIR", 19.846, 8.87],
  ["DENEB", 20.69, 45.28],
  ["MARKAB", 23.079, 15.21],
  ["ALGOL", 3.136, 40.96],
];

const eclipticPoint = (lam: number): [number, number] => {
  const l = lam * DEG;
  const e = EPS * DEG;
  const ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) / DEG;
  const dec = Math.asin(Math.sin(e) * Math.sin(l)) / DEG;
  return polar(rDec(dec), -ra);
};

function rete(): string {
  const out: string[] = [];
  const rimIn = R_PLATE - 9;
  // Ecliptic: through the Cancer point (left) and Capricorn point (right).
  const ex = (R_PLATE - R_CANCER) / 2;
  const er = (R_PLATE + R_CANCER) / 2;
  const band = 11;
  const metal: string[] = [];
  // Rim
  metal.push(`<path class="r-metal" fill-rule="evenodd" d="M ${R_PLATE} 0 A ${R_PLATE} ${R_PLATE} 0 1 0 ${-R_PLATE} 0 A ${R_PLATE} ${R_PLATE} 0 1 0 ${R_PLATE} 0 Z M ${rimIn} 0 A ${rimIn} ${rimIn} 0 1 0 ${-rimIn} 0 A ${rimIn} ${rimIn} 0 1 0 ${rimIn} 0 Z"/>`);
  // Ecliptic band
  const eo = er,
    ei = er - band;
  metal.push(
    `<path class="r-metal" fill-rule="evenodd" d="M ${f(ex + eo)} 0 A ${f(eo)} ${f(eo)} 0 1 0 ${f(ex - eo)} 0 A ${f(eo)} ${f(eo)} 0 1 0 ${f(ex + eo)} 0 Z M ${f(ex + ei)} 0 A ${f(ei)} ${f(ei)} 0 1 0 ${f(ex - ei)} 0 A ${f(ei)} ${f(ei)} 0 1 0 ${f(ex + ei)} 0 Z"/>`
  );
  // Struts: the Aries-Libra bar and the solstitial bar, with a central boss.
  const bar = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    const dx = x2 - x1,
      dy = y2 - y1,
      L = Math.hypot(dx, dy);
    const nx = (-dy / L) * w,
      ny = (dx / L) * w;
    return `<path class="r-metal" d="M${f(x1 + nx)} ${f(y1 + ny)}L${f(x2 + nx)} ${f(y2 + ny)}L${f(x2 - nx)} ${f(y2 - ny)}L${f(x1 - nx)} ${f(y1 - ny)}Z"/>`;
  };
  metal.push(bar(0, -rimIn - 2, 0, rimIn + 2, 3.2));
  metal.push(bar(-(ex - ei) - 4, 0, rimIn + 2, 0, 2.6));
  // Decorative counter-arcs (a "quatrefoil" frame round the pole).
  for (const a of [45, 135, 225, 315]) {
    const [cx, cy] = polar(34, a);
    metal.push(
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="24" class="r-metal r-wire" />`
    );
  }
  metal.push(`<circle r="16" class="r-metal"/>`);

  // Star pointers.
  const labels: string[] = [];
  for (const [name, raH, dec] of STARS) {
    const r = rDec(dec);
    if (r > rimIn - 6) continue;
    const ang = -raH * 15;
    const [sx, sy] = polar(r, ang);
    // Nearest support: rim (inner edge) or ecliptic (outer or inner edge).
    const dE = Math.hypot(sx - ex, sy);
    const cands: { d: number; p: [number, number] }[] = [];
    {
      const k = rimIn / Math.hypot(sx, sy);
      cands.push({ d: rimIn - Math.hypot(sx, sy), p: [sx * k, sy * k] });
    }
    {
      const edge = dE > eo ? eo - 1 : ei + 1;
      const k = edge / dE;
      cands.push({ d: Math.abs(dE - edge), p: [ex + (sx - ex) * k, sy * k] });
    }
    cands.sort((a, b) => a.d - b.d);
    let [px, py] = cands[0].p;
    let L = Math.hypot(sx - px, sy - py);
    // Keep every pointer at least a little proud of its support.
    if (L < 16) {
      const ux = (sx - px) / (L || 1),
        uy = (sy - py) / (L || 1);
      px = sx - ux * 16;
      py = sy - uy * 16;
      L = 16;
    }
    const ux = (sx - px) / L,
      uy = (sy - py) / L;
    const nx = -uy,
      ny = ux;
    const flame = Math.min(15, L * 0.6);
    const bx = sx - ux * flame,
      by = sy - uy * flame;
    // Strut, slightly bowed.
    const bow = 0.18 * (L - flame);
    const mx = (px + bx) / 2 + nx * bow,
      my = (py + by) / 2 + ny * bow;
    metal.push(
      `<path class="r-metal r-strut" d="M${f(px)} ${f(py)}Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}"/>`
    );
    // Flame-shaped pointer ending on the star.
    const w = 3.6;
    metal.push(
      `<path class="r-metal" d="M${f(bx + nx * w)} ${f(by + ny * w)}Q${f(bx + ux * flame * 0.55 + nx * w * 0.9)} ${f(by + uy * flame * 0.55 + ny * w * 0.9)} ${f(sx)} ${f(sy)}Q${f(bx + ux * flame * 0.45 - nx * w * 0.3)} ${f(by + uy * flame * 0.45 - ny * w * 0.3)} ${f(bx - nx * w)} ${f(by - ny * w)}A${w} ${w} 0 1 1 ${f(bx + nx * w)} ${f(by + ny * w)}Z"/>`
    );
    metal.push(`<circle cx="${f(bx)}" cy="${f(by)}" r="1.3" class="r-hole"/>`);
    // Name engraved along the strut.
    const deg = (Math.atan2(uy, ux) / DEG + 360) % 360;
    const flip = deg > 90 && deg < 270;
    const lx = bx - ux * 6 - nx * 6,
      ly = by - uy * 6 - ny * 6;
    labels.push(
      `<text class="r-name" text-anchor="${flip ? "start" : "end"}" transform="translate(${f(lx)} ${f(ly)}) rotate(${f(flip ? deg - 180 : deg)})">${name}</text>`
    );
  }

  out.push(`<g class="r-body">${metal.join("")}</g>`);
  // Ecliptic graduations: 5° ticks, sign boundaries long.
  const t: string[] = [];
  for (let lam = 0; lam < 360; lam += 5) {
    const [x, y] = eclipticPoint(lam);
    const dx = x - ex,
      dy = y,
      L = Math.hypot(dx, dy);
    const len = lam % 30 === 0 ? band : 4;
    t.push(`M${f(x - (dx / L) * 0.8)} ${f(y - (dy / L) * 0.8)}L${f(x - (dx / L) * len)} ${f(y - (dy / L) * len)}`);
  }
  out.push(`<path class="r-engr" d="${t.join("")}"/>`);
  out.push(`<circle cx="${f(ex)}" r="${f(er - 4.5)}" class="r-engr r-fine"/>`);
  // Sign names on the ecliptic band, written along the band.
  const signs = ["ARIES", "TAVRVS", "GEMINI", "CANCER", "LEO", "VIRGO", "LIBRA", "SCORPIO", "SAGITTARIVS", "CAPRICORNVS", "AQVARIVS", "PISCES"];
  out.push(`<path id="inst-ecl" d="M ${f(ex)} ${f(-(er - 6.2))} A ${f(er - 6.2)} ${f(er - 6.2)} 0 1 0 ${f(ex)} ${f(er - 6.2)} A ${f(er - 6.2)} ${f(er - 6.2)} 0 1 0 ${f(ex)} ${f(-(er - 6.2))}" fill="none"/>`);
  // Place each name at the mid-point of its sign, measured along the circle
  // (counter-clockwise from the top of the ecliptic circle).
  const C = 2 * Math.PI * (er - 6.2);
  signs.forEach((s, i) => {
    const [x, y] = eclipticPoint(i * 30 + 15);
    // angle of that point about the ecliptic centre, clockwise from top
    const a = (Math.atan2(x - ex, -y) / DEG + 360) % 360;
    const ccw = (360 - a) % 360; // path runs counter-clockwise from top
    const off = ((ccw / 360) * C).toFixed(1);
    out.push(`<text class="r-sign"><textPath href="#inst-ecl" startOffset="${off}" text-anchor="middle">${s}</textPath></text>`);
  });
  out.push(`<g class="r-names">${labels.join("")}</g>`);
  return out.join("");
}

// ---------------------------------------------------------------------------
// The rule ("label"): a double-ended pointer turning on the pin. Drawn
// pointing at the top (angle 0).
function rule(): string {
  const tip = R_TOC_IN + 9;
  const tail = R_PLATE + 22;
  return [
    `<path class="u-metal" d="M0 ${-tip} L5.5 ${-tip + 26} L4.2 ${-60} L7.5 -12 A 7.5 7.5 0 0 1 7.5 12 L4.2 60 L3 ${tail - 30} L0 ${tail} L-3 ${tail - 30} L-4.2 60 L-7.5 12 A 7.5 7.5 0 0 1 -7.5 -12 L-4.2 -60 L-5.5 ${-tip + 26} Z"/>`,
    `<line x1="0" y1="${-tip + 4}" x2="0" y2="${tail - 6}" class="u-fid"/>`,
    `<path class="u-metal" d="M0 ${-tip - 2} L4 ${-tip + 8} L0 ${-tip + 18} L-4 ${-tip + 8} Z"/>`,
    `<circle r="11" class="u-boss"/>`,
    `<circle r="4" class="u-pin"/>`,
    // The wedge ("hors") through the pin.
    `<path class="u-pin" d="M-1.6 -10 L1.6 -10 L1 10 L-1 10 Z" transform="rotate(64)"/>`,
  ].join("");
}

// ---------------------------------------------------------------------------
// The throne ("turet") and ring at the top.
function throne(): string {
  const top = R_LIMB;
  const d = [
    `M -46 ${-top + 16}`,
    `C -44 ${-top - 6}, -30 ${-top - 8}, -24 ${-top - 18}`,
    `C -20 ${-top - 26}, -26 ${-top - 34}, -16 ${-top - 42}`,
    `C -10 ${-top - 47}, -6 ${-top - 50}, 0 ${-top - 58}`,
    `C 6 ${-top - 50}, 10 ${-top - 47}, 16 ${-top - 42}`,
    `C 26 ${-top - 34}, 20 ${-top - 26}, 24 ${-top - 18}`,
    `C 30 ${-top - 8}, 44 ${-top - 6}, 46 ${-top + 16}`,
    "Z",
  ].join(" ");
  const y = -top;
  return [
    `<circle cy="${y - 78}" r="17" class="t-ring"/>`,
    `<circle cy="${y - 78}" r="11" class="t-ring-in"/>`,
    `<rect x="-7" y="${y - 66}" width="14" height="14" rx="3" class="m-throne"/>`,
    `<path d="${d}" class="m-throne"/>`,
    `<path d="M -30 ${y + 2} C -18 ${y - 10}, -10 ${y - 30}, 0 ${y - 44} C 10 ${y - 30}, 18 ${y - 10}, 30 ${y + 2}" class="e-line"/>`,
    `<circle cy="${y - 22}" r="6" class="e-line"/>`,
    `<circle cy="${y - 22}" r="1.6" class="e-dot"/>`,
  ].join("");
}

// ---------------------------------------------------------------------------
export interface Station {
  id: string;
  label: string;
  angle: number;
}

/** Contents ring: one station per section, labels curved along the ring. */
function tocRing(stations: Station[]): string {
  const out: string[] = [];
  out.push(
    `<path class="m-toc" fill-rule="evenodd" d="M ${R_TOC_OUT} 0 A ${R_TOC_OUT} ${R_TOC_OUT} 0 1 0 ${-R_TOC_OUT} 0 A ${R_TOC_OUT} ${R_TOC_OUT} 0 1 0 ${R_TOC_OUT} 0 Z M ${R_TOC_IN} 0 A ${R_TOC_IN} ${R_TOC_IN} 0 1 0 ${-R_TOC_IN} 0 A ${R_TOC_IN} ${R_TOC_IN} 0 1 0 ${R_TOC_IN} 0 Z"/>`
  );
  out.push(ring(R_TOC_OUT - 2.5, "g-line"));
  out.push(ring(R_TOC_IN + 6, "g-line"));
  const tk: string[] = [];
  for (let d = 0; d < 360; d += 2) {
    const len = d % 10 === 0 ? 5 : 2.5;
    const [x0, y0] = polar(R_TOC_IN + 6, d);
    const [x1, y1] = polar(R_TOC_IN + 6 - len, d);
    tk.push(`M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`);
  }
  out.push(`<path class="g-line g-tick" d="${tk.join("")}"/>`);
  stations.forEach((s, i) => {
    const bottom = s.angle > 100 && s.angle < 260;
    const half = 23;
    const rb = bottom ? R_TOC_IN + 27.5 : R_TOC_IN + 16.5;
    const d = bottom
      ? `M ${pt(rb, s.angle + half)} A ${rb} ${rb} 0 0 0 ${pt(rb, s.angle - half)}`
      : `M ${pt(rb, s.angle - half)} A ${rb} ${rb} 0 0 1 ${pt(rb, s.angle + half)}`;
    const [mx, my] = polar(R_TOC_IN + 3, s.angle);
    out.push(
      `<a href="#${s.id}" class="station" data-station="${s.id}" aria-label="${s.label}">` +
        `<path d="${arc((R_TOC_IN + R_TOC_OUT) / 2, s.angle - half, s.angle + half)}" class="station-hit"/>` +
        `<path id="st-path-${i}" d="${d}" fill="none"/>` +
        `<text class="station-text"><textPath href="#st-path-${i}" startOffset="50%" text-anchor="middle">${s.label}</textPath></text>` +
        `<circle cx="${f(mx)}" cy="${f(my)}" r="2.4" class="station-dot"/>` +
        `</a>`
    );
  });
  return out.join("");
}

// ---------------------------------------------------------------------------
const DEFS = `
<defs>
  <radialGradient id="inst-brass" cx="38%" cy="30%" r="80%">
    <stop offset="0" stop-color="#f3d991"/>
    <stop offset="0.45" stop-color="#c99a48"/>
    <stop offset="0.8" stop-color="#94672a"/>
    <stop offset="1" stop-color="#6d4919"/>
  </radialGradient>
  <radialGradient id="inst-plate-g" cx="40%" cy="34%" r="75%">
    <stop offset="0" stop-color="#e4c57c"/>
    <stop offset="0.6" stop-color="#b8893f"/>
    <stop offset="1" stop-color="#8a5f25"/>
  </radialGradient>
  <linearGradient id="inst-rete-g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fae6a8"/>
    <stop offset="0.5" stop-color="#d8a952"/>
    <stop offset="1" stop-color="#9c6d2c"/>
  </linearGradient>
  <linearGradient id="inst-bronze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a2c1b"/>
    <stop offset="1" stop-color="#1c150d"/>
  </linearGradient>
  <linearGradient id="inst-rule-g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#4a3116"/>
    <stop offset="0.5" stop-color="#8a6228"/>
    <stop offset="1" stop-color="#3b2710"/>
  </linearGradient>
  <filter id="inst-lift" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="2.5" dy="4" stdDeviation="2.6" flood-color="#1a0f03" flood-opacity="0.55"/>
  </filter>
  <filter id="inst-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.6"/>
  </filter>
  <clipPath id="inst-plate-clip"><circle r="${R_PLATE}"/></clipPath>
  <clipPath id="inst-horizon-clip"><circle cy="${f(
    (() => {
      const ys = -R_EQ * Math.tan(((180 - LATITUDE) / 2) * DEG);
      const yn = R_EQ * Math.tan((LATITUDE / 2) * DEG);
      return (ys + yn) / 2;
    })()
  )}" r="${f(
    (() => {
      const ys = -R_EQ * Math.tan(((180 - LATITUDE) / 2) * DEG);
      const yn = R_EQ * Math.tan((LATITUDE / 2) * DEG);
      return (yn - ys) / 2;
    })()
  )}"/></clipPath>
</defs>`;

/** The full front of the instrument, as SVG markup (no outer <svg>). */
export function instrumentFront(stations: Station[]): string {
  return [
    DEFS,
    `<g filter="url(#inst-shadow)">`,
    tocRing(stations),
    `<g class="m-body">${throne()}${limb()}</g>`,
    `</g>`,
    plate(),
    `<g filter="url(#inst-lift)"><g class="rete" id="inst-rete">${rete()}</g></g>`,
    `<g filter="url(#inst-lift)"><g class="rule" id="inst-rule">${rule()}</g></g>`,
  ].join("");
}

export const INSTRUMENT_VIEWBOX = `${-R_TOC_OUT - 8} ${-R_LIMB - 100} ${2 * (R_TOC_OUT + 8)} ${R_LIMB + 100 + R_TOC_OUT + 18}`;

// ---------------------------------------------------------------------------
// The back: altitude scales, the shadow square and the alidade with its
// pinnules. Used as the medallion for Part II ("the conclusions").
export function instrumentBack(alidade = -38): string {
  const R = 100;
  const out: string[] = [];
  out.push(`<circle r="${R}" class="b-metal"/>`);
  out.push(ring(R - 1, "b-line b-strong"));
  out.push(ring(R - 9, "b-line"));
  out.push(ring(R - 15, "b-line"));
  out.push(ring(R - 24, "b-line"));
  const tk: string[] = [];
  for (let d = 0; d < 360; d += 2) {
    const len = d % 10 === 0 ? 8 : 4;
    const [x0, y0] = polar(R - 1, d);
    const [x1, y1] = polar(R - 1 - len, d);
    tk.push(`M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`);
  }
  out.push(`<path class="b-line b-fine" d="${tk.join("")}"/>`);
  // Calendar ring: twelve months, set slightly eccentric as on the back of
  // a real instrument.
  for (let m = 0; m < 12; m++) {
    const a = m * 30 + 8;
    const [x0, y0] = polar(R - 15, a);
    const [x1, y1] = polar(R - 24, a);
    out.push(`<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}" class="b-line"/>`);
  }
  const months = "IAN FEB MAR APR MAI IVN IVL AVG SEP OCT NOV DEC".split(" ");
  months.forEach((mth, i) => {
    const a = i * 30 + 23;
    out.push(`<text class="b-txt" transform="rotate(${a}) translate(0 ${-(R - 17.6)})">${mth}</text>`);
  });
  // Shadow square in the lower half.
  const s = 64;
  const top = 6;
  out.push(`<rect x="${-s / 2}" y="${top}" width="${s}" height="${s / 2}" class="b-line"/>`);
  out.push(`<rect x="${-s / 2 + 7}" y="${top}" width="${s - 14}" height="${s / 2 - 7}" class="b-line"/>`);
  const sq: string[] = [];
  for (let i = 1; i < 12; i++) {
    const x = (-s / 2) + (i * (s / 2)) / 12;
    const x2 = (i * (s / 2)) / 12;
    sq.push(`M${f(x)} ${f(top + s / 2)}L${f(x)} ${f(top + s / 2 - (i % 3 === 0 ? 7 : 4))}`);
    sq.push(`M${f(x2)} ${f(top + s / 2)}L${f(x2)} ${f(top + s / 2 - (i % 3 === 0 ? 7 : 4))}`);
    const y = top + (i * (s / 2)) / 12;
    sq.push(`M${f(-s / 2)} ${f(y)}L${f(-s / 2 + (i % 3 === 0 ? 7 : 4))} ${f(y)}`);
    sq.push(`M${f(s / 2)} ${f(y)}L${f(s / 2 - (i % 3 === 0 ? 7 : 4))} ${f(y)}`);
  }
  out.push(`<path class="b-line b-fine" d="${sq.join("")}"/>`);
  out.push(`<line x1="0" y1="${top}" x2="0" y2="${top + s / 2}" class="b-line"/>`);
  out.push(`<text class="b-txt" x="${-s / 4}" y="${top + s / 2 + 9}" text-anchor="middle">VMBRA VERSA</text>`);
  out.push(`<text class="b-txt" x="${s / 4}" y="${top + s / 2 + 9}" text-anchor="middle">VMBRA RECTA</text>`);
  // Altitude scale arcs in the upper quadrants.
  out.push(`<line x1="${-(R - 24)}" y1="0" x2="${R - 24}" y2="0" class="b-line"/>`);
  out.push(`<line x1="0" y1="${-(R - 24)}" x2="0" y2="0" class="b-line"/>`);
  // Alidade with pinnules.
  out.push(
    `<g transform="rotate(${alidade})" class="b-alidade">` +
      `<path class="b-ali" d="M -4 ${-R + 2} L 4 ${-R + 2} L 5 ${R - 2} L -5 ${R - 2} Z"/>` +
      `<rect x="-6" y="${-R + 22}" width="12" height="9" class="b-ali"/>` +
      `<rect x="-6" y="${R - 31}" width="12" height="9" class="b-ali"/>` +
      `<circle cy="${-R + 26.5}" r="1.4" class="b-hole"/><circle cy="${R - 26.5}" r="1.4" class="b-hole"/>` +
      `<line x1="0" y1="${-R + 4}" x2="0" y2="${R - 4}" class="b-fid"/>` +
      `</g>`
  );
  out.push(`<circle r="5" class="b-ali"/><circle r="1.6" class="b-hole"/>`);
  return out.join("");
}
