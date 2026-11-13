// Night sky behind /treatise/.
//
// The whole page sits inside a giant astrolabe drawn as the sky over Oxford
// ("compowned after the latitude of Oxenford"):
//   - the PLATE (fixed): horizon, almucantars, azimuths, tropics, equator and a
//     graduated limb, in stereographic projection from the south pole;
//   - the RETE (turning): a seeded faint star field, a Milky Way haze, a
//     hand-entered list of bright stars with constellation lines, and the
//     ecliptic band with its twelve signs.
// Scrolling advances sidereal time, so the rete turns about the pole star
// (Chaucer's diurnal motion). Nothing animates on its own: the canvas is
// redrawn only when the scroll position changes, at most once per frame.
// Under prefers-reduced-motion the sky never turns.
//
// Legibility: wherever text sits, the sky recedes. Each redraw erases the
// canvas under every visible text block through a feathered mask (so the
// words sit on plain night with soft edges, no blotches), and star or
// constellation names that would land near text are not drawn at all.
//
// All positions are computed here from public-domain star coordinates
// (approximate J2000 RA in hours, Dec in degrees, visual magnitude).

const D = Math.PI / 180;
const EPS = 23.44 * D; // obliquity of the ecliptic
const LAT = 51.75 * D; // Oxford

type Star = [name: string, ra: number, dec: number, mag: number];

// prettier-ignore
const STARS: Star[] = [
  ["Sirius", 6.752, -16.72, -1.46], ["Arcturus", 14.261, 19.18, -0.05], ["Vega", 18.616, 38.78, 0.03],
  ["Capella", 5.278, 46.0, 0.08], ["Rigel", 5.242, -8.2, 0.13], ["Procyon", 7.655, 5.22, 0.34],
  ["Betelgeuse", 5.919, 7.41, 0.5], ["Altair", 19.846, 8.87, 0.77], ["Aldebaran", 4.599, 16.51, 0.85],
  ["Spica", 13.42, -11.16, 0.97], ["Antares", 16.49, -26.43, 1.06], ["Pollux", 7.755, 28.03, 1.14],
  ["Fomalhaut", 22.961, -29.62, 1.16], ["Deneb", 20.69, 45.28, 1.25], ["Regulus", 10.139, 11.97, 1.35],
  ["Castor", 7.577, 31.89, 1.58], ["Bellatrix", 5.419, 6.35, 1.64], ["Elnath", 5.438, 28.61, 1.65],
  ["Alnilam", 5.604, -1.2, 1.69], ["Alnitak", 5.679, -1.94, 1.77], ["Mintaka", 5.533, -0.3, 2.23],
  ["Saiph", 5.796, -9.67, 2.06],
  // Ursa Maior
  ["Dubhe", 11.062, 61.75, 1.79], ["Merak", 11.031, 56.38, 2.37], ["Phecda", 11.897, 53.69, 2.44],
  ["Megrez", 12.257, 57.03, 3.31], ["Alioth", 12.9, 55.96, 1.77], ["Mizar", 13.399, 54.93, 2.23],
  ["Alkaid", 13.792, 49.31, 1.86],
  // Ursa Minor
  ["Polaris", 2.53, 89.26, 1.98], ["dUMi", 17.537, 86.59, 4.36], ["eUMi", 16.766, 82.04, 4.2],
  ["zUMi", 15.734, 77.79, 4.3], ["eta UMi", 16.292, 75.76, 4.95], ["Kochab", 14.845, 74.16, 2.08],
  ["Pherkad", 15.345, 71.83, 3.0],
  // Cassiopeia
  ["Caph", 0.153, 59.15, 2.27], ["Schedar", 0.675, 56.54, 2.24], ["gCas", 0.945, 60.72, 2.47],
  ["Ruchbah", 1.43, 60.24, 2.68], ["Segin", 1.907, 63.67, 3.37],
  // Perseus
  ["Mirfak", 3.405, 49.86, 1.79], ["Algol", 3.136, 40.96, 2.1],
  // Cygnus
  ["Sadr", 20.37, 40.26, 2.23], ["Gienah", 20.77, 33.97, 2.48], ["dCyg", 19.75, 45.13, 2.87],
  ["Albireo", 19.512, 27.96, 3.05],
  // Lyra
  ["Sheliak", 18.835, 33.36, 3.5], ["Sulafat", 18.982, 32.69, 3.25], ["zLyr", 18.746, 37.6, 4.3],
  // Aquila
  ["Tarazed", 19.771, 10.61, 2.72], ["Alshain", 19.922, 6.41, 3.71],
  // Leo
  ["etaLeo", 10.122, 16.76, 3.5], ["Algieba", 10.333, 19.84, 2.08], ["Adhafera", 10.278, 23.42, 3.43],
  ["Rasalas", 9.879, 26.0, 3.88], ["eLeo", 9.764, 23.77, 2.98], ["Zosma", 11.235, 20.52, 2.56],
  ["Chertan", 11.237, 15.43, 3.33], ["Denebola", 11.818, 14.57, 2.14],
  // Gemini
  ["Alhena", 6.629, 16.4, 1.93], ["Mebsuta", 6.732, 25.13, 3.0], ["Wasat", 7.335, 21.98, 3.53],
  ["Tejat", 6.383, 22.51, 2.88],
  // Taurus
  ["zTau", 5.627, 21.14, 3.0], ["gTau", 4.33, 15.63, 3.65], ["eTau", 4.477, 19.18, 3.53],
  ["dTau", 4.382, 17.54, 3.76],
  // Pegasus, Andromeda
  ["Markab", 23.079, 15.21, 2.48], ["Scheat", 23.063, 28.08, 2.42], ["Algenib", 0.22, 15.18, 2.83],
  ["Alpheratz", 0.14, 29.09, 2.06], ["Mirach", 1.162, 35.62, 2.05], ["Almach", 2.065, 42.33, 2.1],
  // Bootes
  ["Izar", 14.75, 27.07, 2.35], ["Muphrid", 13.911, 18.4, 2.68], ["Seginus", 14.535, 38.31, 3.03],
  ["Nekkar", 15.032, 40.39, 3.5], ["dBoo", 15.258, 33.31, 3.47],
  // Corona Borealis
  ["Alphecca", 15.578, 26.71, 2.23], ["bCrB", 15.464, 29.11, 3.68], ["thCrB", 15.549, 31.36, 4.1],
  ["gCrB", 15.712, 26.3, 3.84], ["dCrB", 15.826, 26.07, 4.6], ["eCrB", 15.96, 26.88, 4.1],
  // Scorpius
  ["Graffias", 16.091, -19.81, 2.6], ["Dschubba", 16.006, -22.62, 2.3], ["piSco", 15.981, -26.11, 2.9],
  ["sSco", 16.353, -25.59, 2.9], ["tSco", 16.598, -28.22, 2.8], ["eSco", 16.836, -34.29, 2.3],
  // Canis Maior
  ["Mirzam", 6.378, -17.96, 1.98], ["Wezen", 7.14, -26.39, 1.83], ["Adhara", 6.977, -28.97, 1.5],
  ["Aludra", 7.402, -29.3, 2.45],
];

// prettier-ignore
const FIGURES: [label: string, lines: string[][]][] = [
  ["URSA MAIOR", [["Dubhe", "Merak", "Phecda", "Megrez", "Dubhe"], ["Megrez", "Alioth", "Mizar", "Alkaid"]]],
  ["URSA MINOR", [["Polaris", "dUMi", "eUMi", "zUMi", "Kochab", "Pherkad", "eta UMi", "zUMi"]]],
  ["CASSIOPEIA", [["Caph", "Schedar", "gCas", "Ruchbah", "Segin"]]],
  ["PERSEUS", [["Mirfak", "Algol"]]],
  ["CIGNUS", [["Deneb", "Sadr", "Albireo"], ["dCyg", "Sadr", "Gienah"]]],
  ["LIRA", [["Vega", "zLyr", "Sheliak", "Sulafat", "zLyr"]]],
  ["AQUILA", [["Tarazed", "Altair", "Alshain"]]],
  ["LEO", [["Regulus", "etaLeo", "Algieba", "Adhafera", "Rasalas", "eLeo"], ["Algieba", "Zosma", "Denebola", "Chertan", "Regulus"], ["Zosma", "Chertan"]]],
  ["GEMINI", [["Castor", "Mebsuta", "Tejat"], ["Pollux", "Wasat", "Alhena"]]],
  ["TAURUS", [["Elnath", "dTau", "gTau", "Aldebaran", "zTau"], ["gTau", "eTau"]]],
  ["ORION", [["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Alnitak", "Alnilam", "Mintaka", "Bellatrix"], ["Alnitak", "Saiph"], ["Mintaka", "Rigel"]]],
  ["PEGASUS", [["Markab", "Scheat", "Alpheratz", "Algenib", "Markab"], ["Alpheratz", "Mirach", "Almach"]]],
  ["BOOTES", [["Arcturus", "Izar", "dBoo", "Nekkar", "Seginus", "Izar"], ["Arcturus", "Muphrid"]]],
  ["CORONA", [["bCrB", "Alphecca", "gCrB", "dCrB", "eCrB"], ["bCrB", "thCrB"]]],
  ["SCORPIUS", [["Graffias", "Dschubba", "piSco"], ["Dschubba", "sSco", "Antares", "tSco", "eSco"]]],
  ["CANIS MAIOR", [["Mirzam", "Sirius", "Wezen", "Adhara"], ["Wezen", "Aludra"]]],
];

// Star names as they appear on medieval astrolabe retes. "Alhabor" is
// Chaucer's own (Part II §3).
const RETE_NAMES: Record<string, string> = {
  Sirius: "Alhabor",
  Arcturus: "Alramech",
  Vega: "Wega",
  Aldebaran: "Aldeboran",
  Capella: "Alhaioth",
  Spica: "Azimech",
  Procyon: "Algomeisa",
  Regulus: "Cor Leonis",
  Altair: "Altair",
  Rigel: "Rigel",
  Deneb: "Deneb",
  Polaris: "the lode-sterre",
};

const SIGNS = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORNUS", "AQUARIUS", "PISCES",
];

// ---------------------------------------------------------------- maths

function eclToEq(lam: number, beta: number): [number, number] {
  const sd = Math.sin(beta) * Math.cos(EPS) + Math.cos(beta) * Math.sin(EPS) * Math.sin(lam);
  const ra = Math.atan2(Math.sin(lam) * Math.cos(EPS) - Math.tan(beta) * Math.sin(EPS), Math.cos(lam));
  return [ra, Math.asin(sd)];
}

function galToEq(l: number, b: number): [number, number] {
  const aG = 192.85948 * D, dG = 27.12825 * D, lN = 122.93192 * D;
  const sd = Math.sin(dG) * Math.sin(b) + Math.cos(dG) * Math.cos(b) * Math.cos(lN - l);
  const ra = aG + Math.atan2(Math.cos(b) * Math.sin(lN - l), Math.cos(dG) * Math.sin(b) - Math.sin(dG) * Math.cos(b) * Math.cos(lN - l));
  return [ra, Math.asin(sd)];
}

// Altitude h, azimuth A (from south, west positive) -> hour angle, declination.
function horToEq(h: number, A: number): [number, number] {
  const sd = Math.sin(LAT) * Math.sin(h) - Math.cos(LAT) * Math.cos(h) * Math.cos(A);
  const H = Math.atan2(Math.sin(A) * Math.cos(h), Math.cos(A) * Math.cos(h) * Math.sin(LAT) + Math.sin(h) * Math.cos(LAT));
  return [H, Math.asin(sd)];
}

// Stereographic projection onto the equator plane; pole at the origin,
// south (H = 0) straight down, west to the right.
const rho = (dec: number, R: number) => R * Math.tan((Math.PI / 2 - dec) / 2);
function xy(H: number, dec: number, R: number): [number, number] {
  const r = rho(dec, R);
  return [r * Math.sin(H), r * Math.cos(H)];
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- drawing

const SERIF = '"Junicode 2", "Junicode", Georgia, serif';

export function initSky(root: HTMLElement) {
  const host = root.querySelector<HTMLElement>(".sky");
  const reteC = host?.querySelector<HTMLCanvasElement>(".sky-rete");
  if (!host || !reteC) return;
  // The plate is static: drawn once per resize offscreen, blitted each frame.
  const plateC = document.createElement("canvas");
  const pctx = plateC.getContext("2d");
  const rctx = reteC.getContext("2d");
  if (!pctx || !rctx) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const BASE = 7.2 * 15 * D; // sidereal time at the top of the page
  const RATE = 0.012 * D; // radians of sidereal time per CSS pixel scrolled

  let W = 0, H = 0, dpr = 1, R = 1, px = 0, py = 0, rmax = 1;
  let faint: Float32Array = new Float32Array(0); // x, y, size, alpha (sky coords)
  let haze: HTMLCanvasElement | null = null;
  let hazeScale = 0.35;
  let figurePath = new Path2D();
  let eclPath = new Path2D();
  let eclTicks = new Path2D();
  let bright: { x: number; y: number; mag: number; name: string }[] = [];
  let figLabels: { x: number; y: number; text: string }[] = [];
  let signLabels: { x: number; y: number; ang: number; text: string }[] = [];
  let lastAngle = NaN;

  const byName = new Map(STARS.map((s) => [s[0], s]));
  const starXY = (ra: number, dec: number): [number, number] => xy(-ra, dec, R);

  function build() {
    W = host!.clientWidth;
    H = host!.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    for (const c of [plateC, reteC!]) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    const wide = W >= 1000;
    px = W * (wide ? 0.5 : 0.55);
    py = Math.min(H * 0.32, 420);
    R = Math.max(W * (wide ? 0.36 : 0.95), 340);
    rmax = Math.hypot(Math.max(px, W - px), Math.max(py, H - py)) + 20;
    const decMin = Math.PI / 2 - 2 * Math.atan(rmax / R);

    // Faint stars, uniform on the sphere, kept only where they can be seen.
    const rand = rng(1391);
    const list: number[] = [];
    const want = Math.round((W * H) / 900);
    let tries = 0;
    while (list.length / 4 < want && tries++ < want * 30) {
      const ra = rand() * Math.PI * 2;
      const dec = Math.asin(2 * rand() - 1);
      if (dec < decMin) continue;
      const [x, y] = starXY(ra, dec);
      const m = Math.pow(rand(), 2.6);
      list.push(x, y, 0.6 + m * 1.6, 0.35 + m * 0.6 + rand() * 0.1);
    }
    faint = new Float32Array(list);

    // Milky Way: soft blobs scattered about the galactic equator.
    hazeScale = 0.3;
    const S = Math.ceil(rmax * 2 * hazeScale);
    haze = document.createElement("canvas");
    haze.width = haze.height = S;
    const h = haze.getContext("2d")!;
    h.translate(S / 2, S / 2);
    h.scale(hazeScale, hazeScale);
    const hr = rng(51);
    for (let i = 0; i < 520; i++) {
      const l = hr() * Math.PI * 2;
      const b = (hr() + hr() + hr() - 1.5) * 9 * D;
      const [ra, dec] = galToEq(l, b);
      if (dec < decMin - 0.1) continue;
      const [x, y] = starXY(ra, dec);
      // Brighter toward Cygnus (l ~ 80) and Sagittarius (l ~ 0).
      const boost = 0.5 + 0.5 * Math.max(Math.cos(l), Math.cos(l - 80 * D));
      const rad = (40 + hr() * 90) * (rho(dec, R) / R + 0.6) * (R / 600);
      const g = h.createRadialGradient(x, y, 0, x, y, rad);
      const tint = hr() < 0.5 ? "150,165,255" : "190,160,230";
      g.addColorStop(0, `rgba(${tint},${(0.007 + 0.01 * boost).toFixed(3)})`);
      g.addColorStop(1, `rgba(${tint},0)`);
      h.fillStyle = g;
      h.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // Constellation figures.
    figurePath = new Path2D();
    figLabels = [];
    for (const [label, lines] of FIGURES) {
      let sx = 0, sy = 0, n = 0;
      for (const line of lines) {
        line.forEach((nm, i) => {
          const s = byName.get(nm)!;
          const [x, y] = starXY(s[1] * 15 * D, s[2] * D);
          if (i === 0) figurePath.moveTo(x, y);
          else figurePath.lineTo(x, y);
          sx += x; sy += y; n++;
        });
      }
      figLabels.push({ x: sx / n, y: sy / n, text: label });
    }

    bright = STARS.map(([name, ra, dec, mag]) => {
      const [x, y] = starXY(ra * 15 * D, dec * D);
      return { x, y, mag, name };
    });

    // Ecliptic band (6 degrees either side), sign divisions and ticks.
    eclPath = new Path2D();
    eclTicks = new Path2D();
    signLabels = [];
    for (const beta of [-6, 0, 6]) {
      for (let k = 0; k <= 360; k += 2) {
        const [ra, dec] = eclToEq(k * D, beta * D);
        const [x, y] = starXY(ra, dec);
        if (k === 0) eclPath.moveTo(x, y);
        else eclPath.lineTo(x, y);
      }
    }
    for (let k = 0; k < 360; k += 2) {
      const len = k % 30 === 0 ? 6 : k % 10 === 0 ? 3 : 1.4;
      const [r1, d1] = eclToEq(k * D, (k % 30 === 0 ? -6 : 6 - len) * D);
      const [r2, d2] = eclToEq(k * D, 6 * D);
      const a = starXY(r1, d1), b = starXY(r2, d2);
      eclTicks.moveTo(a[0], a[1]);
      eclTicks.lineTo(b[0], b[1]);
    }
    SIGNS.forEach((text, i) => {
      const lam = (i * 30 + 15) * D;
      const [ra, dec] = eclToEq(lam, -2.6 * D);
      const [x, y] = starXY(ra, dec);
      const [ra2, dec2] = eclToEq(lam + 0.02, -2.6 * D);
      const [x2, y2] = starXY(ra2, dec2);
      signLabels.push({ x, y, ang: Math.atan2(y2 - y, x2 - x), text });
    });

    drawPlate();
    lastAngle = NaN;
    drawRete(true);
  }

  function drawPlate() {
    const c = pctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.translate(px, py);
    c.lineCap = "round";

    // Almucantars every 6 degrees, stronger every 30, horizon strongest.
    for (let hd = 0; hd < 90; hd += 6) {
      c.beginPath();
      for (let A = -180; A <= 180; A += 2) {
        const [Hh, dec] = horToEq(hd * D, A * D);
        const [x, y] = xy(Hh, dec, R);
        if (A === -180) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.strokeStyle = hd === 0 ? "rgba(196,206,255,0.30)" : hd % 30 === 0 ? "rgba(170,184,255,0.15)" : "rgba(160,176,255,0.075)";
      c.lineWidth = hd === 0 ? 1.4 : 0.8;
      c.stroke();
    }
    // Azimuths every 15 degrees, from the zenith down to the horizon.
    c.beginPath();
    for (let A = 0; A < 360; A += 15) {
      for (let hd = 90; hd >= 0; hd -= 2) {
        const [Hh, dec] = horToEq(hd * D, A * D);
        const [x, y] = xy(Hh, dec, R);
        if (hd === 90) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
    }
    c.strokeStyle = "rgba(160,176,255,0.065)";
    c.lineWidth = 0.8;
    c.stroke();

    // Equator and tropics, centred on the pole.
    for (const [dec, a] of [[23.44, 0.13], [0, 0.17], [-23.44, 0.13]] as const) {
      c.beginPath();
      c.arc(0, 0, rho(dec * D, R), 0, Math.PI * 2);
      c.strokeStyle = `rgba(233,200,119,${a})`;
      c.lineWidth = dec === 0 ? 1 : 0.7;
      c.setLineDash(dec === 0 ? [] : [2, 5]);
      c.stroke();
    }
    c.setLineDash([]);

    // The limb: a graduated ring just outside the tropic of Capricorn.
    const L = rho(-23.44 * D, R) + 18;
    c.beginPath();
    c.arc(0, 0, L, 0, Math.PI * 2);
    c.arc(0, 0, L + 26, 0, Math.PI * 2);
    c.strokeStyle = "rgba(233,200,119,0.2)";
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    for (let d = 0; d < 360; d += 1) {
      const a = d * D;
      const len = d % 15 === 0 ? 14 : d % 5 === 0 ? 8 : 4;
      c.moveTo(L * Math.sin(a), L * Math.cos(a));
      c.lineTo((L + len) * Math.sin(a), (L + len) * Math.cos(a));
    }
    c.strokeStyle = "rgba(233,200,119,0.16)";
    c.lineWidth = 0.8;
    c.stroke();

    // Meridian line through pole and zenith.
    c.beginPath();
    c.moveTo(0, -L - 26);
    c.lineTo(0, L + 26);
    c.strokeStyle = "rgba(196,206,255,0.10)";
    c.stroke();

    // A few plate words, in Chaucer's spelling.
    c.font = `500 11px ${SERIF}`;
    c.fillStyle = "rgba(200,210,255,0.34)";
    c.textAlign = "center";
    c.letterSpacing = "4px";
    const zen = xy(0, LAT, R);
    c.fillText("CENITH", zen[0], zen[1] + 18);
    const hz = horToEq(0, 50 * D);
    const hp = xy(hz[0], hz[1], R);
    c.save();
    c.translate(hp[0], hp[1]);
    c.rotate(-0.55);
    c.fillText("ORISONTE OBLIQUE", 0, -6);
    c.restore();
    const alm = horToEq(30 * D, -40 * D);
    const ap = xy(alm[0], alm[1], R);
    c.save();
    c.translate(ap[0], ap[1]);
    c.rotate(0.5);
    c.fillText("ALMIKANTERAS", 0, -5);
    c.restore();
    c.letterSpacing = "0px";
  }

  // Pre-rendered glow sprite for bright stars.
  const glow = document.createElement("canvas");
  glow.width = glow.height = 64;
  {
    const g = glow.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(235,240,255,0.9)");
    grd.addColorStop(0.18, "rgba(190,205,255,0.35)");
    grd.addColorStop(0.5, "rgba(140,160,255,0.08)");
    grd.addColorStop(1, "rgba(140,160,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  }

  // Feather sprite for the text veils: a solid 2px core with a smooth
  // falloff of F px on every side, drawn as a nine-slice around each block.
  const F = 56;
  const feather = document.createElement("canvas");
  feather.width = feather.height = 2 * F + 2;
  {
    const g = feather.getContext("2d")!;
    const img = g.createImageData(2 * F + 2, 2 * F + 2);
    for (let y = 0; y < 2 * F + 2; y++) {
      for (let x = 0; x < 2 * F + 2; x++) {
        const dx = Math.max(0, F - x, x - (F + 1));
        const dy = Math.max(0, F - y, y - (F + 1));
        const t = Math.max(0, 1 - Math.hypot(dx, dy) / F);
        const a = t * t * (3 - 2 * t); // smoothstep
        img.data[(y * (2 * F + 2) + x) * 4 + 3] = Math.round(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
  }

  // What the sky must stay clear of: [selector, padding px, strength].
  const VEILS: [string, number, number][] = [
    [".t-body", 22, 0.97],
    [".t-sec-label", 18, 0.95],
    [".t-hero > :not(h1)", 14, 0.95],
    [".t-hero h1", 10, 0.7],
    [".t-toc h2, .toc-text", 10, 0.95],
    [".t-view", 10, 0.95],
    [".t-part-head > :not(svg)", 14, 0.95],
    [".t-end > *", 14, 0.95],
    // Sky windows: not erased (strength 0), but labels keep clear of them.
    [".win", 4, 0],
  ];
  const veilEls = VEILS.map(([sel, pad, k]) => ({ els: [...root.querySelectorAll<HTMLElement>(sel)], pad, k }));
  type Box = { l: number; t: number; r: number; b: number; k: number };
  function veilBoxes(): Box[] {
    const out: Box[] = [];
    const hostTop = host!.getBoundingClientRect().top;
    for (const v of veilEls) {
      for (const el of v.els) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const t = r.top - hostTop, b = r.bottom - hostTop;
        if (b < -F - v.pad || t > H + F + v.pad) continue;
        out.push({ l: r.left - v.pad, t: t - v.pad, r: r.right + v.pad, b: b + v.pad, k: v.k });
      }
    }
    return out;
  }
  const near = (boxes: Box[], l: number, t: number, r: number, b: number, m: number) =>
    boxes.some((x) => l < x.r + m && r > x.l - m && t < x.b + m && b > x.t - m);

  function angleNow() {
    if (reduce.matches) return BASE;
    const top = root.getBoundingClientRect().top + window.scrollY;
    return BASE + Math.max(0, window.scrollY - top + H) * RATE;
  }

  let lastScroll = NaN;
  function drawRete(force = false) {
    const a = angleNow();
    // Text moves with the page even when the sky does not turn, so redraw
    // whenever either changes.
    if (!force && Math.abs(a - lastAngle) < 1e-5 && window.scrollY === lastScroll) return;
    lastAngle = a;
    lastScroll = window.scrollY;
    const narrow = W < 600;
    const boxes = veilBoxes();
    const c = rctx!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, reteC!.width, reteC!.height);
    c.drawImage(plateC, 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.translate(px, py);
    c.rotate(-a);

    if (haze) {
      c.imageSmoothingQuality = "high";
      const S = haze.width / hazeScale;
      c.drawImage(haze, -S / 2, -S / 2, S, S);
    }

    // Faint stars.
    c.fillStyle = "#dfe6ff";
    for (let i = 0; i < faint.length; i += 4) {
      c.globalAlpha = faint[i + 3];
      const s = faint[i + 2];
      c.fillRect(faint[i] - s / 2, faint[i + 1] - s / 2, s, s);
    }
    c.globalAlpha = 1;

    // Ecliptic band.
    c.strokeStyle = "rgba(233,200,119,0.30)";
    c.lineWidth = 0.9;
    c.stroke(eclPath);
    c.strokeStyle = "rgba(233,200,119,0.34)";
    c.lineWidth = 0.7;
    c.stroke(eclTicks);

    // Constellation lines.
    c.strokeStyle = "rgba(185,200,255,0.34)";
    c.lineWidth = 0.9;
    c.stroke(figurePath);

    // Bright stars.
    for (const s of bright) {
      const size = Math.max(1.4, 4.2 - s.mag * 0.8);
      const g = size * 7;
      c.globalAlpha = Math.min(1, 0.55 + (3 - s.mag) * 0.2);
      c.drawImage(glow, s.x - g / 2, s.y - g / 2, g, g);
      c.globalAlpha = 1;
      c.fillStyle = s.name === "Antares" || s.name === "Betelgeuse" || s.name === "Aldebaran" ? "#ffe2c4" : "#f6f8ff";
      c.beginPath();
      c.arc(s.x, s.y, size * 0.62, 0, Math.PI * 2);
      c.fill();
    }

    // Labels are placed in screen space and skipped when they would land
    // near text.
    const ca = Math.cos(a), sa = Math.sin(a);
    const rot = (x: number, y: number): [number, number] => [px + x * ca + y * sa, py - x * sa + y * ca];
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.textBaseline = "middle";
    const M = narrow ? 26 : 34; // clearance from any text block

    // Sign names ride the band, turning with it.
    c.font = `600 ${narrow ? 8.5 : 10}px ${SERIF}`;
    c.letterSpacing = narrow ? "2px" : "3px";
    c.textAlign = "center";
    c.fillStyle = "rgba(233,200,119,0.55)";
    for (const l of signLabels) {
      const [x, y] = rot(l.x, l.y);
      const w = c.measureText(l.text).width / 2 + 4;
      if (near(boxes, x - w, y - w, x + w, y + w, M)) continue;
      let ang = l.ang - a;
      if (Math.cos(ang) < 0) ang += Math.PI; // keep the lettering upright
      c.save();
      c.translate(x, y);
      c.rotate(ang);
      c.fillText(l.text, 0, 0);
      c.restore();
    }

    // Constellation names (not on small screens, where they crowd).
    if (!narrow) {
      c.font = `500 10.5px ${SERIF}`;
      c.letterSpacing = "5px";
      c.fillStyle = "rgba(190,204,255,0.42)";
      for (const l of figLabels) {
        const [x, y0] = rot(l.x, l.y);
        const y = y0 + 22;
        const w = c.measureText(l.text).width / 2;
        if (near(boxes, x - w, y - 7, x + w, y + 7, M)) continue;
        c.fillText(l.text, x, y);
      }
    }

    // Rete star names; on small screens only a few of the brightest.
    c.font = `400 ${narrow ? 11.5 : 13}px ${SERIF}`;
    c.letterSpacing = "0.5px";
    c.fillStyle = "rgba(240,214,150,0.58)";
    c.textAlign = "left";
    for (const s of bright) {
      const label = RETE_NAMES[s.name];
      if (!label || (narrow && s.mag > 0.5 && s.name !== "Polaris")) continue;
      const [x, y] = rot(s.x, s.y);
      const w = c.measureText(label).width;
      if (near(boxes, x + 9, y - 16, x + 9 + w, y - 2, M)) continue;
      c.fillText(label, x + 9, y - 9);
    }
    c.letterSpacing = "0px";

    // Let the sky recede behind text: erase it through feathered veils.
    c.globalCompositeOperation = "destination-out";
    for (const b of boxes) {
      if (!b.k) continue;
      const w = b.r - b.l, h = b.b - b.t;
      c.globalAlpha = b.k;
      // corners
      c.drawImage(feather, 0, 0, F, F, b.l - F, b.t - F, F, F);
      c.drawImage(feather, F + 2, 0, F, F, b.r, b.t - F, F, F);
      c.drawImage(feather, 0, F + 2, F, F, b.l - F, b.b, F, F);
      c.drawImage(feather, F + 2, F + 2, F, F, b.r, b.b, F, F);
      // edges
      c.drawImage(feather, F, 0, 2, F, b.l, b.t - F, w, F);
      c.drawImage(feather, F, F + 2, 2, F, b.l, b.b, w, F);
      c.drawImage(feather, 0, F, F, 2, b.l - F, b.t, F, h);
      c.drawImage(feather, F + 2, F, F, 2, b.r, b.t, F, h);
      // core
      c.fillStyle = "#000";
      c.fillRect(b.l, b.t, w, h);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      drawRete();
    });
  };

  let lastW = 0, lastH = 0, timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      const w = host!.clientWidth, h = host!.clientHeight;
      // Ignore the small height changes of mobile URL bars.
      if (w === lastW && Math.abs(h - lastH) < 140) return;
      lastW = w; lastH = h;
      build();
    }, 150);
  };

  lastW = host.clientWidth;
  lastH = host.clientHeight;
  build();
  host.classList.add("ready");
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  reduce.addEventListener?.("change", () => drawRete(true));
  // Text reflows (fonts arriving, the view toggle) move the veils.
  new ResizeObserver(() => drawRete(true)).observe(root);
  document.fonts?.ready.then(() => {
    drawPlate();
    drawRete(true);
  });
}
