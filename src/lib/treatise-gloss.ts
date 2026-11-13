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
};
const G = data as Data;

export const GLOSS_SAMPLE = new Set(G.sample);
export const glossSources = G.sources;
export const glossEntries = G.entries;

const WORD = /[A-Za-z]+(?:-[A-Za-z]+)*/g;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Skeat's italics arrive as _underscores_ (none in the sample, but keep them working).
const inline = (s: string) => esc(s).replace(/_([^_]+)_/g, "<em>$1</em>");

// A plain respelling ("thyn" → "thine") gets a fainter mark than a change of
// meaning or a technical term, so the page does not read as a field of links.
const minor = (e: GlossEntry) => !e.def && e.gloss.split(/\s+/).length <= 2;

export type GlossStats = { tokens: number; glossed: number; forms: Set<string>; keys: Set<string> };

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
 * Gloss one section. Returns the paragraphs as HTML strings (each without its
 * <p> wrapper) plus counts. Throws if an override or phrase in the data no
 * longer matches the text, so a changed text cannot silently lose glosses.
 */
export function glossSection(slug: string, body: string, stats?: GlossStats): string[] {
  const paras = body.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const overrides = G.overrides.filter((o) => o.section === slug);
  const hit = new Set<number>();
  const out = paras.map((para) => {
    const toks = [...para.matchAll(WORD)].map((m) => ({ w: m[0], lo: m[0].toLowerCase(), i: m.index!, end: m.index! + m[0].length }));
    const key: (string | null | undefined)[] = toks.map((t) => G.forms[t.lo]);
    const span: number[] = toks.map(() => 1); // tokens covered by a unit starting here (0 = inside another)
    const seq = (words: string[], at: number) => words.every((w, k) => toks[at + k]?.lo === w);
    // Phrases: one unit across several words.
    for (const ph of G.phrases) {
      const ws = ph.words.split(" ");
      for (let a = 0; a + ws.length <= toks.length; a++) {
        if (!seq(ws, a) || span[a] === 0) continue;
        key[a] = ph.key;
        span[a] = ws.length;
        for (let k = 1; k < ws.length; k++) span[a + k] = 0;
      }
    }
    // Occurrence overrides: a word read in a particular sense here.
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
    let html = "";
    let pos = 0;
    for (let a = 0; a < toks.length; a++) {
      if (span[a] === 0) continue;
      const t = toks[a];
      const last = toks[a + span[a] - 1];
      const k = key[a];
      if (stats) stats.tokens += span[a];
      if (!k || !G.entries[k]) continue;
      const e = G.entries[k];
      if (stats) {
        stats.glossed += span[a];
        stats.forms.add(span[a] > 1 ? para.slice(t.i, last.end).toLowerCase() : t.lo);
        stats.keys.add(k);
      }
      html += inline(para.slice(pos, t.i));
      const text = para.slice(t.i, last.end);
      // Interlinear text: the short form, else the first of Skeat's alternatives.
      const short = e.short ?? e.gloss.split(/[,;] /)[0];
      html +=
        `<span class="gw${e.source === "ours" ? " gw-ours" : ""}${minor(e) ? " gw-minor" : ""}" role="button" tabindex="0" aria-expanded="false" data-g="${k}" aria-describedby="gd-${k}">` +
        `${esc(text)}<span class="gw-i" aria-hidden="true">${esc(short)}</span></span>`;
      pos = last.end;
    }
    html += inline(para.slice(pos));
    return html;
  });
  overrides.forEach((o, n) => {
    if (!hit.has(n)) throw new Error(`treatise glosses: override "${o.match}" (${o.word}) not found in ${slug}`);
  });
  return out;
}
