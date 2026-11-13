// The two layouts of the large step-by-step windows (astrolabist, clod-squad #47871): "wide", 3:2, viewBox
// -150 -100 300 200, the instrument on one side and Chaucer's steps listed beside it; "stack", 3:4, viewBox
// -150 -200 300 400, for a phone, the instrument on top and the steps under it, larger.  The page gives a large window
// a 3:4 box under 600px; a scene reads its container's aspect at mount and again when it is resized (taller than wide:
// stack), and data-layout="stack" or "wide" on the element overrides that.
// Hand-written (astrolabe-video web/scenes/lib/stage.js).

const NS = "http://www.w3.org/2000/svg";
export const VIEWBOX = { wide: "-150 -100 300 200", stack: "-150 -200 300 400" };

export function layoutOf(el) {
  const d = el.getAttribute && el.getAttribute("data-layout");
  if (d === "stack" || d === "wide") return d;
  const w = el.clientWidth;
  const h = el.clientHeight;
  return w > 0 && h > 0 && w < h ? "stack" : "wide";
}

// call rebuild() whenever the container's layout changes (s.mode holds the one built)
export function watch(el, s, rebuild) {
  if (typeof ResizeObserver === "undefined") return;
  s.ro = new ResizeObserver(() => {
    if (layoutOf(el) !== s.mode) rebuild();
  });
  s.ro.observe(el);
}

// The list of steps.  steps: [{lines: [...], head?}]; L: {x, y, size, lh, gap, indent, width?, number(i)?,
// headSize?, headGap?, restart?}.  With L.width the lines of each step are joined and wrapped again to that width
// (measured; the svg must be in the document), else they are kept as given.  A step with a head starts a new block
// (at L.y again when L.restart).  Returns {rows: [[text, ...] per step], heads: [text or null per step]}.
export function stepList(parent, steps, L) {
  const text = (x, y, size, weight) => {
    const t = document.createElementNS(NS, "text");
    for (const [k, v] of Object.entries({ x, y, "font-size": size, "font-weight": weight, fill: "currentColor", opacity: 0, "font-family": "inherit" })) t.setAttribute(k, v);
    parent.appendChild(t);
    return t;
  };
  const num = L.number || ((i) => i + 1);
  let y = L.y;
  const rows = [];
  const heads = [];
  steps.forEach((st, i) => {
    heads.push(null);
    if (st.head) {
      if (i && L.restart) y = L.y;
      const h = text(L.x, y, L.headSize || L.size * 1.3, 700);
      h.textContent = st.head;
      heads[i] = h;
      y += L.headGap || L.lh * 1.7;
    }
    let lines = st.lines;
    if (L.width) lines = wrap(text, `${num(i)}  ` + st.lines.join(" "), L) || [`${num(i)}  ` + st.lines[0], ...st.lines.slice(1)];
    else lines = [`${num(i)}  ` + st.lines[0], ...st.lines.slice(1)];
    rows.push(
      lines.map((ln, j) => {
        const t = text(L.x + (j ? L.indent : 0), y + j * L.lh, L.size, 600);
        t.textContent = ln;
        return t;
      }),
    );
    y += L.lh * lines.length + L.gap;
  });
  return { rows, heads };
}

// greedy wrapping by measured width; null if the text cannot be measured (not in the document)
function wrap(text, str, L) {
  const probe = text(0, 0, L.size, 600);
  const width = (s) => {
    probe.textContent = s;
    return probe.getComputedTextLength();
  };
  if (!(width("M") > 0)) {
    probe.remove();
    return null;
  }
  const words = str.split(" ");
  const out = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    const room = L.width - (out.length ? L.indent : 0);
    if (cur && width(next) > room) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  probe.remove();
  return out;
}
