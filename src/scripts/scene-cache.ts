// Bitmap cache for the scenes' woodcut parts (Jes tg 17947: "the paper edge doesn't change during the
// animation, can't we just pre-calculate it? it could even be raster"; tg 17952: "still choppy on the
// spider"; tg 17958: "spider is better! can we apply that kind of fix everywhere").
//
// The woodcut filters (feTurbulence + feDisplacementMap, laid on each part by the scene modules) are
// rendered by WebKit on the CPU every frame the scene repaints, over the filter's whole region. Each
// outermost filtered part is drawn once, filter and all, to a bitmap at device resolution, and the
// bitmap is shown in its place. The live part stays in the document, hidden, so the scene module can
// keep using it.
//
// - A change to the part's own transform or opacity is copied to the bitmap (it moves or fades with it).
// - Pieces inside the part that change (a mark fading in, a line being drawn) and text (web fonts do not
//   load inside an SVG image) are "live units": they are left out of the bitmap and shown live above it,
//   under a copy of the part's filter fitted to the units alone, so only they are re-filtered per frame.
// - A part whose units grow to most of it, or that changes in a way we cannot follow, goes back to live
//   drawing for good.
// - Parts still empty when the scene mounts are cached once their filter has been fitted (Scene.astro).
//
// Jes accepted the bitmap's look (tg 17956): its wobble is computed at its own resolution, a little smoother
// than the live filter when zoomed in. The scene modules are not changed.

const NS = "http://www.w3.org/2000/svg";
// Inherited properties a part can take from its ancestors; copied onto the snapshot's wrapper.
const INHERIT = [
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap",
  "stroke-linejoin", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "color", "paint-order",
  "shape-rendering", "color-interpolation-filters",
];
const MAX_PX = 3072;
const MAX_REBUILDS = 4; // new live units found after this many snapshots: give up, draw live
const MAX_UNIT_SHARE = 0.5; // live units covering more than this share of the part: give up
const LIVE_PAD = 6; // user units round the live units for the wobble
// Resources inside a part: hiding the part must not hide them (a clip path whose shapes are hidden clips
// everything away).
const RESOURCE = "clipPath, mask, pattern, marker, symbol, defs";

type Entry = { undo: () => void };
const entries = new WeakMap<HTMLElement, Entry[]>();

/** Every element referenced (url(#id) or href="#id") from `root`, transitively, found inside `stage`. */
function refs(stage: HTMLElement, root: Element): Element[] {
  const seen = new Map<string, Element>();
  const queue: Element[] = [root];
  while (queue.length) {
    const s = queue.pop()!.outerHTML;
    for (const m of s.matchAll(/url\(#([^)"']+)\)|href="#([^"]+)"/g)) {
      const id = m[1] || m[2];
      if (seen.has(id)) continue;
      const d = stage.querySelector(`[id="${CSS.escape(id)}"]`);
      if (d) {
        seen.set(id, d);
        queue.push(d);
      }
    }
  }
  return [...seen.values()];
}

const props = (e: Element) => {
  const cs = getComputedStyle(e);
  return INHERIT.map((p) => `${p}="${cs.getPropertyValue(p).replace(/"/g, "'")}"`).join(" ");
};

/** Path of child indexes from `root` down to `el`. */
function pathTo(root: Element, el: Element): number[] {
  const p: number[] = [];
  for (let n: Element = el; n !== root; n = n.parentElement!) p.unshift([...n.parentElement!.children].indexOf(n));
  return p;
}
const follow = (root: Element, p: number[]) => p.reduce<Element | undefined>((n, i) => n?.children[i], root);

/** Bounding box of `unit`, in the user space of `part`. */
function boxIn(part: SVGGraphicsElement, unit: SVGGraphicsElement): DOMRect | null {
  const a = part.getScreenCTM(), b = unit.getScreenCTM();
  if (!a || !b) return null;
  let bb: DOMRect;
  try {
    bb = unit.getBBox();
  } catch {
    return null;
  }
  const m = a.inverse().multiply(b);
  const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return new DOMRect(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function cachePart(stage: HTMLElement, el: SVGGraphicsElement, list: Entry[]) {
  if (el.matches("text, image, foreignObject") || el.querySelector("image, foreignObject, [visibility]")) return;
  if (el.hasAttribute("visibility") || el.hasAttribute("style")) return;
  const m = /^url\(#([^)]+)\)$/.exec(el.getAttribute("filter") || "");
  if (!m || !m[1].includes("-fit")) return;
  const fitId = m[1];
  const f = stage.querySelector<SVGFilterElement>(`filter[id="${CSS.escape(fitId)}"]`);
  if (!f) return;

  let units: SVGGraphicsElement[] = [...el.querySelectorAll<SVGGraphicsElement>("text")];
  let gs: SVGGElement[] = []; // the bitmap layers (below the live units, and above them)
  let urls: string[] = [];
  let liveF: SVGFilterElement | null = null; // the part's filter, fitted to the live units
  let region = { x: 0, y: 0, w: 0, h: 0, fx: 0, fy: 0, fw: 0, fh: 0 };
  let dead = false;
  let building = false;
  let rebuilds = 0;
  let pending: Set<SVGGraphicsElement> | null = null;
  let ours = 0; // attribute writes of our own, for the observer to skip

  const set = (e: Element, a: string, v: string | null) => {
    if (e.getAttribute(a) === v) return;
    ours++;
    v == null ? e.removeAttribute(a) : e.setAttribute(a, v);
  };

  // Back to plain live drawing, for good.
  const undo = () => {
    if (dead) return;
    dead = true;
    mo.disconnect();
    gs.forEach((o) => o.remove());
    urls.forEach((u) => URL.revokeObjectURL(u));
    liveF?.remove();
    for (const u of units) if (u.getAttribute("visibility") === "visible") u.removeAttribute("visibility");
    for (const r of el.querySelectorAll(RESOURCE)) if (r.getAttribute("visibility") === "visible") r.removeAttribute("visibility");
    el.removeAttribute("visibility");
    if (el.isConnected) el.setAttribute("filter", `url(#${fitId})`);
  };

  // Does the bitmap still cover every point of the stage that the part could be drawn at?
  const cover = () => {
    const mm = el.getScreenCTM();
    if (!mm) return false;
    const s = stage.getBoundingClientRect();
    const iv = mm.inverse();
    const { x, y, w, h, fx, fy, fw, fh } = region;
    const pts = [[s.left, s.top], [s.right, s.top], [s.left, s.bottom], [s.right, s.bottom]].map(([px, py]) => new DOMPoint(px, py).matrixTransform(iv));
    const inside = (p: DOMPoint) => p.x >= x - 0.5 && p.x <= x + w + 0.5 && p.y >= y - 0.5 && p.y <= y + h + 0.5;
    return pts.every(inside) || (x === fx && y === fy && w === fw && h === fh);
  };

  // Fit the live units' filter to them (it only grows).
  const fitLive = () => {
    if (!units.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const u of units) {
      const b = boxIn(el, u);
      if (!b || (b.width === 0 && b.height === 0)) continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    if (!isFinite(x0)) return;
    if (!liveF) {
      liveF = f.cloneNode(true) as SVGFilterElement;
      liveF.id = `${fitId}-live`;
      liveF.setAttribute("x", String(x0 - LIVE_PAD));
      liveF.setAttribute("y", String(y0 - LIVE_PAD));
      liveF.setAttribute("width", String(x1 - x0 + 2 * LIVE_PAD));
      liveF.setAttribute("height", String(y1 - y0 + 2 * LIVE_PAD));
      f.after(liveF);
      return;
    }
    const lx = +liveF.getAttribute("x")!, ly = +liveF.getAttribute("y")!;
    const lx1 = lx + +liveF.getAttribute("width")!, ly1 = ly + +liveF.getAttribute("height")!;
    if (x0 >= lx && y0 >= ly && x1 <= lx1 && y1 <= ly1) return;
    const nx = Math.min(lx, x0 - LIVE_PAD), ny = Math.min(ly, y0 - LIVE_PAD);
    liveF.setAttribute("x", String(nx));
    liveF.setAttribute("y", String(ny));
    liveF.setAttribute("width", String(Math.max(lx1, x1 + LIVE_PAD) - nx));
    liveF.setAttribute("height", String(Math.max(ly1, y1 + LIVE_PAD) - ny));
  };

  // Draw the part, minus its live units, to a bitmap; show it, and the units live above it.
  const build = async () => {
    if (dead || building) return;
    building = true;
    try {
      const ctm = el.getScreenCTM();
      if (!ctm) return undo();
      const scale = Math.hypot(ctm.a, ctm.b);
      // Only what can ever be on screen: the filter region, cut to a square round the stage's centre wide
      // enough for any turn about that centre (the stage's half-diagonal).
      const sr = stage.getBoundingClientRect();
      const c = new DOMPoint(sr.left + sr.width / 2, sr.top + sr.height / 2).matrixTransform(ctm.inverse());
      const r = Math.hypot(sr.width, sr.height) / 2 / scale;
      const fx = +f.getAttribute("x")!, fy = +f.getAttribute("y")!, fw = +f.getAttribute("width")!, fh = +f.getAttribute("height")!;
      const x = Math.max(fx, c.x - r), y = Math.max(fy, c.y - r);
      const w = Math.min(fx + fw, c.x + r) - x, h = Math.min(fy + fh, c.y + r) - y;
      if (!(w > 0 && h > 0)) return undo();
      const k = scale * (window.devicePixelRatio || 1);
      if (Math.max(w, h) * k > MAX_PX) return undo(); // too big to draw sharp
      const cw = Math.ceil(w * k), ch = Math.ceil(h * k);
      if (cw < 2 || ch < 2) return undo();

      const whole = boxIn(el, el);

      units = units.filter((u) => u.isConnected && el.contains(u));
      // Paint order: the bitmap is drawn in two layers, what lies below the first live unit and what lies
      // above the last, so the live units keep their place in the drawing. Unchanging pieces that lie
      // between live units in paint order are drawn live with them.
      const LEAF = "path, circle, ellipse, line, rect, polygon, polyline, use, text";
      const after = (a: Node, b: Node) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      const inUnit = (l: Element) => units.some((u) => u === l || u.contains(l));
      const ordered = [...units].sort((a, b) => (after(a, b) ? -1 : 1));
      const first = ordered[0], last = ordered[ordered.length - 1];
      // Shapes inside clip paths, masks, patterns and markers are not drawn themselves: not leaves.
      let leaves = [...el.querySelectorAll<SVGGraphicsElement>(LEAF)].filter((l) => !inUnit(l) && !l.parentElement?.closest(RESOURCE));
      if (first && last !== first) {
        const between = leaves.filter((l) => after(first, l) && after(l, last) && !last.contains(l));
        if (between.length) {
          units = units.concat(between);
          leaves = leaves.filter((l) => !between.includes(l));
        }
      }
      // Too much of the part is live: not worth it.
      if (whole && units.length) {
        let ua = 0;
        for (const u of units) {
          const b = boxIn(el, u);
          if (b) ua += b.width * b.height;
        }
        if (ua > MAX_UNIT_SHARE * whole.width * whole.height) return undo();
      }
      const above = last ? leaves.filter((l) => after(last, l) && !last.contains(l)) : [];
      const below = leaves.filter((l) => !above.includes(l));
      const unitPaths = units.map((u) => pathTo(el, u));
      // Remove from the end backwards, so earlier removals do not shift later paths.
      const byLast = (a: number[], b: number[]) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return b[i] - a[i];
        return b.length - a.length;
      };
      const styles = [...(el.ownerSVGElement?.querySelectorAll("style") ?? [])].map((s) => s.outerHTML).join("");
      const defs = refs(stage, el).filter((d) => d !== liveF).map((d) => d.outerHTML).join("");
      const rootProps = el.ownerSVGElement ? props(el.ownerSVGElement) : "";
      const wrapProps = props(el.parentElement || el);

      // The part in its own user space (its own transform and opacity dropped), with only `keep` drawn.
      const draw = async (keep: SVGGraphicsElement[]): Promise<Blob | null> => {
        const clone = el.cloneNode(true) as Element;
        clone.removeAttribute("transform");
        clone.removeAttribute("opacity");
        clone.removeAttribute("visibility");
        clone.setAttribute("filter", `url(#${fitId})`);
        clone.querySelectorAll("[visibility]").forEach((e) => e.removeAttribute("visibility"));
        for (const l of leaves) if (!keep.includes(l)) follow(clone, pathTo(el, l))?.setAttribute("visibility", "hidden");
        for (const p of [...unitPaths].sort(byLast)) follow(clone, p)?.remove();
        const svg =
          `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${cw}" height="${ch}" ` +
          `viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" ${rootProps}>` +
          `${styles}<defs>${defs}</defs><g ${wrapProps}>${clone.outerHTML}</g></svg>`;
        const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        const img = new Image();
        img.src = src;
        try {
          await img.decode();
        } catch {
          URL.revokeObjectURL(src);
          return null;
        }
        const cv = document.createElement("canvas");
        cv.width = cw;
        cv.height = ch;
        cv.getContext("2d")!.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(src);
        const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/png"));
        cv.width = cv.height = 0;
        return blob;
      };
      const layers = [below, above].filter((ls, i) => i === 0 || ls.length);
      const blobs: (Blob | null)[] = [];
      for (const ls of layers) blobs.push(await draw(ls));
      if (blobs.some((b) => !b)) return undo();
      if (dead || !el.isConnected) return;
      if (pending) return; // the part changed while we drew: draw again (below)

      const ngs: SVGGElement[] = [], nurls: string[] = [];
      blobs.forEach((blob, i) => {
        const ng = document.createElementNS(NS, "g");
        for (const a of ["transform", "opacity"]) if (el.hasAttribute(a)) ng.setAttribute(a, el.getAttribute(a)!);
        ng.setAttribute("aria-hidden", "true");
        const im = document.createElementNS(NS, "image");
        const nurl = URL.createObjectURL(blob!);
        im.setAttribute("href", nurl);
        im.setAttribute("x", String(x));
        im.setAttribute("y", String(y));
        im.setAttribute("width", String(w));
        im.setAttribute("height", String(h));
        im.setAttribute("preserveAspectRatio", "none");
        ng.appendChild(im);
        i === 0 ? el.before(ng) : el.after(ng);
        ngs.push(ng);
        nurls.push(nurl);
      });
      gs.forEach((o) => o.remove());
      urls.forEach((u) => URL.revokeObjectURL(u));
      gs = ngs;
      urls = nurls;
      region = { x, y, w, h, fx, fy, fw, fh };

      // The part itself now shows only its live units, under a filter fitted to them.
      set(el, "visibility", "hidden");
      for (const r of el.querySelectorAll(RESOURCE)) set(r, "visibility", "visible");
      for (const u of units) set(u, "visibility", "visible");
      if (units.length) {
        fitLive();
        set(el, "filter", `url(#${liveF!.id})`);
      }
    } finally {
      building = false;
      if (pending && !dead) {
        const add = pending;
        pending = null;
        grow(add);
      }
    }
  };

  // New live units: take them out of the bitmap (draw it again), or give up after a few rounds.
  const grow = (add: Set<SVGGraphicsElement>) => {
    if (dead) return;
    const fresh = [...add].filter((u) => !units.some((v) => v === u || v.contains(u)));
    if (!fresh.length) return fitLive();
    if (building) {
      pending = new Set([...(pending ?? []), ...fresh]);
      return;
    }
    if (++rebuilds > MAX_REBUILDS) return undo();
    units = units.filter((v) => !fresh.some((u) => u.contains(v))).concat(fresh);
    // Until the new bitmap is ready, draw the whole part live (no gap, no stale piece).
    gs.forEach((o) => o.remove());
    urls.forEach((u) => URL.revokeObjectURL(u));
    gs = [];
    urls = [];
    set(el, "visibility", null);
    set(el, "filter", `url(#${fitId})`);
    void build();
  };

  const mo = new MutationObserver((records) => {
    if (dead) return;
    const add = new Set<SVGGraphicsElement>();
    for (const r of records) {
      if (r.type === "attributes" && ours > 0 && (r.attributeName === "visibility" || r.attributeName === "filter")) {
        ours--;
        continue;
      }
      if (r.type === "attributes" && r.target === el) {
        const a = r.attributeName!;
        if (a === "transform" || a === "opacity") {
          const v = el.getAttribute(a);
          for (const o of gs) v == null ? o.removeAttribute(a) : o.setAttribute(a, v);
          if (a === "transform" && gs.length && !cover()) return undo();
          continue;
        }
        return undo(); // anything else on the part itself
      }
      if (r.type === "childList" && r.target === el) return undo();
      // Something inside changed: that element (its text, if inside text) becomes a live unit.
      const t = (r.target.nodeType === 1 ? r.target : r.target.parentElement) as Element | null;
      if (!t || !el.contains(t) || t === el) continue;
      const unit = (t.closest("text") ?? t) as SVGGraphicsElement;
      if (unit.hasAttribute("visibility") && !units.includes(unit)) return undo();
      if (units.some((v) => v === unit || v.contains(unit))) {
        add.add(unit); // already live: only its filter region may need to grow
        continue;
      }
      add.add(unit);
    }
    if (add.size) grow(add);
  });
  mo.observe(el, { subtree: true, attributes: true, childList: true, characterData: true });
  list.push({ undo });
  void build();
}

/** Snapshot the stage's filtered parts (call after the filters are fitted). */
export function cacheScene(stage: HTMLElement) {
  const list: Entry[] = [];
  entries.set(stage, list);
  stage.querySelectorAll<SVGGraphicsElement>("[filter]").forEach((el) => {
    if (el.parentElement?.closest("[filter]")) return; // outermost filtered parts only
    if (/-fit/.test(el.getAttribute("filter") || "")) return cachePart(stage, el, list);
    // Empty at mount: cache it once Scene.astro has fitted its filter.
    const wait = new MutationObserver(() => {
      if (!/-fit/.test(el.getAttribute("filter") || "")) return;
      wait.disconnect();
      cachePart(stage, el, list);
    });
    wait.observe(el, { attributes: true, attributeFilter: ["filter"] });
    list.push({ undo: () => wait.disconnect() });
  });
}

/** Free the bitmaps of a stage that is being torn down. */
export function uncacheScene(stage: HTMLElement) {
  entries.get(stage)?.forEach((e) => e.undo());
  entries.delete(stage);
}
