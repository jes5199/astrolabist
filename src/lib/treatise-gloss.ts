// Build-time glossing of Skeat's Middle English for /treatise/.
//
// Glosses live in src/treatise-text/glosses.json (generated and checked by
// tools/treatise-glosses/build_glosses.py; see docs/treatise-glosses.md). This
// module tokenizes a section's Markdown body, maps each word (or phrase) to a
// gloss entry, and returns paragraph HTML in which glossed words are focusable
// spans. The Skeat Markdown itself is never edited.
import data from "../treatise-text/glosses.json";

export type GlossEntry = {
  gloss: string;
  short?: string;
  /** The strict modern line under the word: a piece of Skeat's gloss (or ours). */
  line?: string;
  /** Ours, added only so the modern line has a word here: no popover. */
  lineOnly?: boolean;
  def?: string;
  source: string;
  defSource?: string;
  defQuotes?: string;
  ref?: { head: string; page: number | string | null; loc?: string; ocr?: string; ocrFixes?: string[] };
  defRef?: { where?: string; pgLine?: number; ocr?: string; page?: number | string | null };
};
type Data = {
  sample: string[];
  sources: Record<string, { cite: string; title: string; url?: string }>;
  entries: Record<string, GlossEntry>;
  forms: Record<string, string>;
  phrases: { words: string; key: string }[];
  overrides: { section: string; match: string; word: string; key: string | null }[];
  blank: string[];
  lineSpans: { section: string; match: string; line: string; kind: string }[];
};
const G = data as Data;

export const GLOSS_SAMPLE = new Set(G.sample);
export const glossSources = G.sources;
export const glossEntries = G.entries;

const WORD = /[A-Za-z]+(?:-[A-Za-z]+)*/g;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Skeat's italics arrive as _underscores_ (none in the sample, but keep them working).
const inline = (s: string) => esc(s).replace(/_([^_]+)_/g, "<em>$1</em>");

export type GlossStats = {
  tokens: number;
  glossed: number;
  forms: Set<string>;
  keys: Set<string>;
  skeat?: number;
  ours?: number;
  identity?: number;
  blank?: number;
  blankForms?: Set<string>;
  departures?: number;
};

/** One line of source credit, e.g. "Skeat, EETS 1872, glossary · s.v. Turet, p. 118". */
export function sourceLine(e: GlossEntry): string {
  const cite = G.sources[e.source]?.cite ?? e.source;
  if (e.source === "ours") return "our gloss · provisional";
  const r = e.ref;
  const where = r ? ` · s.v. ${r.head}${r.page ? `, p.\u00a0${r.page}` : ""}` : "";
  return `${cite}${where}`;
}
/**
 * What the second paragraph is: a glossary definition ("def"), or commentary from
 * Skeat's notes ("note") or his introduction ("intro") in vol. III, which must not
 * be presented as a definition.
 */
export function defKind(e: GlossEntry): "def" | "note" | "intro" | null {
  if (!e.def) return null;
  if (e.defSource !== "oxf3") return "def";
  return e.defRef?.where?.startsWith("Introduction") ? "intro" : "note";
}
/** Where the definition comes from, when that differs from the gloss's source or Skeat is quoting someone. */
export function defLine(e: GlossEntry): string | null {
  if (!e.def || !e.defSource) return null;
  const quoting = e.defQuotes ? `, quoting ${e.defQuotes}` : "";
  if (e.defSource === e.source && e.defRef?.page === e.ref?.page) return quoting ? `Skeat${quoting}` : null;
  const cite = G.sources[e.defSource]?.cite ?? e.defSource;
  const r = e.defRef;
  const where = r?.where ? `, ${r.where}` : r?.page ? `, p.\u00a0${r.page}` : "";
  return `${cite}${where}${quoting}`;
}

/**
 * Gloss one section. Every word gets a modern word beneath it (a <ruby>, the
 * modern line in its <rt>): Skeat's gloss for glossed words, our plain
 * respelling for the "ours" entries, the word itself where modern English uses
 * it unchanged, and "·" where there is no clean equivalent. In "translation"
 * mode the authored spans in `lineSpans` replace the strict line over their
 * words (one <rt> under the whole span). Glossed words are focusable spans that
 * open the popover. Throws if an override, phrase or span no longer matches.
 */
export type LineMode = "translation" | "strict";
export function glossSection(slug: string, body: string, stats?: GlossStats, mode: LineMode = "translation"): string[] {
  const paras = body.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const overrides = G.overrides.filter((o) => o.section === slug);
  const spans = mode === "translation" ? G.lineSpans.filter((s) => s.section === slug) : [];
  const blank = new Set(G.blank);
  const hit = new Set<number>();
  const spanHit = new Set<number>();
  const out = paras.map((para) => {
    const toks = [...para.matchAll(WORD)].map((m) => ({ w: m[0], lo: m[0].toLowerCase(), i: m.index!, end: m.index! + m[0].length }));
    const key: (string | null | undefined)[] = toks.map((t) => G.forms[t.lo]);
    const span: number[] = toks.map(() => 1); // tokens covered by a gloss unit starting here (0 = inside another)
    const seq = (words: string[], at: number) => words.every((w, k) => toks[at + k]?.lo === w);
    for (const ph of G.phrases) {
      const ws = ph.words.split(" ");
      for (let a = 0; a + ws.length <= toks.length; a++) {
        if (!seq(ws, a) || span[a] === 0) continue;
        key[a] = ph.key;
        span[a] = ws.length;
        for (let k = 1; k < ws.length; k++) span[a + k] = 0;
      }
    }
    overrides.forEach((o, n) => {
      const ws = o.match.split(" ");
      for (let a = 0; a + ws.length <= toks.length; a++) {
        if (!seq(ws, a)) continue;
        const at = a + ws.indexOf(o.word);
        if (span[at] === 0) continue;
        key[at] = o.key;
        hit.add(n);
      }
    });
    // Line units: each gloss unit, unless an authored span joins several.
    const lineLen: number[] = span.slice();
    const lineText: (string | null)[] = toks.map(() => null);
    const lineKind: (string | null)[] = toks.map(() => null);
    spans.forEach((s, n) => {
      const ws = s.match.split(" ");
      for (let a = 0; a + ws.length <= toks.length; a++) {
        if (!seq(ws, a)) continue;
        const endTok = a + ws.length; // exclusive
        // Must start and end on gloss-unit boundaries, and not overlap another span.
        if (span[a] === 0 || (endTok < toks.length && span[endTok] === 0) || lineLen[a] === 0) continue;
        let ok = true;
        for (let k = a + 1; k < endTok; k++) if (lineText[k] !== null) ok = false;
        if (!ok) continue;
        lineLen[a] = ws.length;
        for (let k = a + 1; k < endTok; k++) lineLen[k] = 0;
        lineText[a] = s.line;
        lineKind[a] = s.kind;
        spanHit.add(n);
      }
    });
    const cap = (line: string, word: string) =>
      /^[A-Z]/.test(word) && /^[a-z]/.test(line) ? line[0].toUpperCase() + line.slice(1) : line;
    const strictLine = (a: number) => {
      const k = key[a];
      const text = para.slice(toks[a].i, toks[a + span[a] - 1].end);
      if (k && G.entries[k]) return cap(G.entries[k].line ?? G.entries[k].gloss, text);
      if (blank.has(toks[a].lo)) return "·";
      return text;
    };
    const glossUnit = (a: number) => {
      const k = key[a];
      const last = toks[a + span[a] - 1];
      const text = para.slice(toks[a].i, last.end);
      const e = k ? G.entries[k] : undefined;
      if (stats) {
        stats.tokens += span[a];
        if (e) {
          stats.glossed += span[a];
          stats.forms.add(span[a] > 1 ? text.toLowerCase() : toks[a].lo);
          stats.keys.add(k!);
          if (e.source === "ours") stats.ours = (stats.ours ?? 0) + span[a];
          else stats.skeat = (stats.skeat ?? 0) + span[a];
        } else if (blank.has(toks[a].lo)) {
          stats.blank = (stats.blank ?? 0) + span[a];
          stats.blankForms?.add(toks[a].lo);
        } else stats.identity = (stats.identity ?? 0) + span[a];
      }
      if (!e || e.lineOnly) return esc(text);
      return (
        `<span class="gw${e.source === "ours" ? " gw-ours" : ""}" role="button" tabindex="0" aria-expanded="false" ` +
        `data-g="${k}" data-w="${esc(text)}" aria-describedby="gd-${k}">${esc(text)}</span>`
      );
    };
    // Punctuation touching a unit (no space between) rides with it, above and below.
    const lead = (i: number, floor: number) => {
      let j = i;
      while (j > floor && !/\s/.test(para[j - 1])) j--;
      return j;
    };
    const trail = (i: number, ceil: number) => {
      let j = i;
      while (j < ceil && !/\s/.test(para[j])) j++;
      return j;
    };
    let html = "";
    let pos = 0;
    for (let a = 0; a < toks.length; a++) {
      if (lineLen[a] === 0) continue;
      const endTok = a + lineLen[a];
      const nextStart = endTok < toks.length ? toks[endTok].i : para.length;
      const from = lead(toks[a].i, pos);
      const to = trail(toks[endTok - 1].end, nextStart);
      html += inline(para.slice(pos, from));
      // Base: the gloss units inside this line unit, with the text between them.
      let base = esc(para.slice(from, toks[a].i));
      let line = "";
      let kind = "";
      let prevEnd = -1;
      for (let b = a; b < endTok; b++) {
        if (span[b] === 0) continue;
        if (prevEnd >= 0) base += esc(para.slice(prevEnd, toks[b].i));
        base += glossUnit(b);
        prevEnd = toks[b + span[b] - 1].end;
        if (lineText[a] === null) {
          line = strictLine(b);
          const k = key[b];
          kind = k && G.entries[k] ? (G.entries[k].source === "ours" ? "ours" : "sk") : blank.has(toks[b].lo) ? "blank" : "id";
        }
      }
      if (lineText[a] !== null) {
        line = cap(lineText[a]!, toks[a].w);
        kind = "dep";
        if (stats) stats.departures = (stats.departures ?? 0) + 1;
      }
      base += esc(para.slice(prevEnd, to));
      const pre = para.slice(from, toks[a].i);
      const post = para.slice(prevEnd, to);
      html += `<ruby class="lu lu-${kind}">${base}<rt aria-hidden="true">${esc(pre + line + post)}</rt></ruby>`;
      pos = to;
    }
    html += inline(para.slice(pos));
    return html;
  });
  overrides.forEach((o, n) => {
    if (!hit.has(n)) throw new Error(`treatise glosses: override "${o.match}" (${o.word}) not found in ${slug}`);
  });
  spans.forEach((s, n) => {
    if (!spanHit.has(n)) throw new Error(`treatise glosses: line span "${s.match}" not placed in ${slug} (missing, or splits a glossed phrase)`);
  });
  return out;
}
