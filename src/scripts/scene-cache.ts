// Bitmap cache for the scenes' unchanging woodcut parts (Jes tg 17947: "the paper edge doesn't change
// during the animation, can't we just pre-calculate it? it could even be raster"; tg 17950: "the
// animations themselves were slow").
//
// The woodcut filters (feTurbulence + feDisplacementMap, laid on each part by the scene modules) are
// rendered by WebKit on the CPU every frame the scene repaints. Most filtered parts never change while
// a scene runs (90–92% measured over 20 s on part-1 and part-2). Each such part is drawn once, filter
// and all, to a bitmap at device resolution, and the bitmap is shown in its place; the live part stays
// in the document, hidden, so the scene module can keep using it.
//
// - A change to the part's own transform or opacity is copied to the bitmap (it moves or fades with it).
// - Any other change to the part (its content, attributes or children) puts the live part back for good.
// - Parts with text, images or their own visibility settings are left live (web fonts and external
//   images do not load inside an SVG image, and a hidden part must stay hidden).
// - Only fitted filters are used (see Scene.astro); the bitmap covers exactly the filter region.
//
// The scene modules are not changed.

const NS = "http://www.w3.org/2000/svg";
// Inherited properties a part can take from its ancestors; copied onto the snapshot's wrapper.
const INHERIT = [
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap",
  "stroke-linejoin", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "color", "paint-order",
  "shape-rendering", "color-interpolation-filters",
];
const MAX_PX = 3072;

type Entry = { url: string; undo: () => void };
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

async function cachePart(stage: HTMLElement, el: SVGGraphicsElement, list: Entry[]) {
  if (el.matches("text, image, foreignObject") || el.querySelector("text, image, foreignObject, [visibility]")) return;
  if (el.hasAttribute("visibility") || el.hasAttribute("style")) return;
  const m = /^url\(#([^)]+)\)$/.exec(el.getAttribute("filter") || "");
  if (!m || !m[1].includes("-fit")) return;
  const f = stage.querySelector(`filter[id="${CSS.escape(m[1])}"]`);
  if (!f) return;
  const ctm = el.getScreenCTM();
  if (!ctm) return;
  const scale = Math.hypot(ctm.a, ctm.b);
  // Only what can ever be on screen: the filter region, cut to a square round the stage's centre wide
  // enough for any turn about that centre (the stage's half-diagonal). A part that later moves so that
  // the bitmap no longer covers the stage goes back to live drawing (see cover()).
  const sr = stage.getBoundingClientRect();
  const inv = ctm.inverse();
  const c = new DOMPoint(sr.left + sr.width / 2, sr.top + sr.height / 2).matrixTransform(inv);
  const r = Math.hypot(sr.width, sr.height) / 2 / scale;
  const fx = +f.getAttribute("x")!, fy = +f.getAttribute("y")!, fw = +f.getAttribute("width")!, fh = +f.getAttribute("height")!;
  const x = Math.max(fx, c.x - r), y = Math.max(fy, c.y - r);
  const w = Math.min(fx + fw, c.x + r) - x, h = Math.min(fy + fh, c.y + r) - y;
  if (!(w > 0 && h > 0)) return;
  const k = scale * (window.devicePixelRatio || 1);
  if (Math.max(w, h) * k > MAX_PX) return; // too big to draw sharp: leave it live
  const cw = Math.ceil(w * k), ch = Math.ceil(h * k);
  if (cw < 2 || ch < 2) return;

  // The part in its own user space (its own transform dropped), with everything it refers to.
  const clone = el.cloneNode(true) as Element;
  clone.removeAttribute("transform");
  clone.removeAttribute("opacity");
  // Inherited properties: the part's from its parent; the defs' (hatch patterns use currentColor) from
  // the scene's own <svg>.
  const props = (e: Element) => {
    const cs = getComputedStyle(e);
    return INHERIT.map((p) => `${p}="${cs.getPropertyValue(p).replace(/"/g, "'")}"`).join(" ");
  };
  const wrap = props(el.parentElement || el);
  const rootProps = el.ownerSVGElement ? props(el.ownerSVGElement) : "";
  const styles = [...(el.ownerSVGElement?.querySelectorAll("style") ?? [])].map((s) => s.outerHTML).join("");
  const defs = refs(stage, el).map((d) => d.outerHTML).join("");
  const svg =
    `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${cw}" height="${ch}" ` +
    `viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" ${rootProps}>${styles}<defs>${defs}</defs><g ${wrap}>${clone.outerHTML}</g></svg>`;

  const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(src);
    return;
  }
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = ch;
  cv.getContext("2d")!.drawImage(img, 0, 0, cw, ch);
  URL.revokeObjectURL(src);
  const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, "image/png"));
  cv.width = cv.height = 0;
  if (!blob || !el.isConnected) return;

  const g = document.createElementNS(NS, "g");
  for (const a of ["transform", "opacity"]) if (el.hasAttribute(a)) g.setAttribute(a, el.getAttribute(a)!);
  g.setAttribute("aria-hidden", "true");
  const im = document.createElementNS(NS, "image");
  const url = URL.createObjectURL(blob);
  im.setAttribute("href", url);
  im.setAttribute("x", String(x));
  im.setAttribute("y", String(y));
  im.setAttribute("width", String(w));
  im.setAttribute("height", String(h));
  im.setAttribute("preserveAspectRatio", "none");
  g.appendChild(im);
  el.before(g);
  el.setAttribute("visibility", "hidden");

  // Does the bitmap still cover every point of the stage that the part could be drawn at?
  const cover = () => {
    const m = el.getScreenCTM();
    if (!m) return false;
    const s = stage.getBoundingClientRect();
    const iv = m.inverse();
    const pts = [[s.left, s.top], [s.right, s.top], [s.left, s.bottom], [s.right, s.bottom]].map(([px, py]) => new DOMPoint(px, py).matrixTransform(iv));
    const inside = (p: DOMPoint) => p.x >= x - 0.5 && p.x <= x + w + 0.5 && p.y >= y - 0.5 && p.y <= y + h + 0.5;
    // the stage lies inside the cropped square, or the crop was not needed (the whole filter region is drawn)
    return pts.every(inside) || (x === fx && y === fy && w === fw && h === fh);
  };

  let live = false;
  const undo = () => {
    if (live) return;
    live = true;
    mo.disconnect();
    g.remove();
    URL.revokeObjectURL(url);
    el.removeAttribute("visibility");
  };
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "attributes" && r.target === el) {
        const a = r.attributeName!;
        if (a === "transform" || a === "opacity") {
          const v = el.getAttribute(a);
          v == null ? g.removeAttribute(a) : g.setAttribute(a, v);
          if (a === "transform" && !cover()) return undo();
          continue;
        }
        if (a === "visibility" && el.getAttribute("visibility") === "hidden") continue; // our own
      }
      return undo();
    }
  });
  mo.observe(el, { subtree: true, attributes: true, childList: true, characterData: true });
  list.push({ url, undo });
}

/** Snapshot the stage's unchanging filtered parts (call after the filters are fitted). */
export function cacheScene(stage: HTMLElement) {
  const list: Entry[] = [];
  entries.set(stage, list);
  stage.querySelectorAll<SVGGraphicsElement>("[filter]").forEach((el) => {
    if (el.parentElement?.closest("[filter]")) return; // outermost filtered parts only
    cachePart(stage, el, list).catch(() => {});
  });
}

/** Free the bitmaps of a stage that is being torn down. */
export function uncacheScene(stage: HTMLElement) {
  entries.get(stage)?.forEach((e) => e.undo());
  entries.delete(stage);
}
