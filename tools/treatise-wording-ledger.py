"""Regenerate docs/treatise-wording.md with current line numbers.

usage: python3 -I tools/treatise-wording-ledger.py REPO_ROOT
Each entry names a search string; its line(s) are looked up in the file, and
the script fails if a string is not found (so the ledger cannot drift silently).
"""
import json
import os
import sys

root = sys.argv[1]
P = "src/pages/treatise.astro"
S = "src/scripts/treatise-sky.ts"
SC = "public/scenes"
L = "src/lib/treatise-gloss.ts"
B = "tools/treatise-glosses/build_glosses.py"
lines = {}


def where(path, *needles):
    if path not in lines:
        lines[path] = open(os.path.join(root, path), encoding="utf-8").read().split("\n")
    out = []
    for n in needles:
        hits = [i + 1 for i, l in enumerate(lines[path]) if n in l]
        if not hits:
            raise SystemExit(f"ledger: {n!r} not found in {path}")
        out.append(hits[0])
    name = os.path.basename(path)
    return name + ":" + ", :".join(str(h) for h in out)


PROV = "provisional; awaiting Jes"
rows = [
    ("`A Treatise on the Astrolabe - Astrolab.ist` (document title)", where(P, "title={`A Treatise on the Astrolabe"), "Site title comes from `src/consts.ts`.", PROV),
    ("`Geoffrey Chaucer, A Treatise on the Astrolabe (c. 1391), in W. W. Skeat's Middle English text (1894).` (meta description)", where(P, 'description="Geoffrey Chaucer'), "Doesn't mention the modern text.", PROV),
    ("`Geoffrey Chaucer ✦ c. 1391` (hero kicker)", where(P, '<p class="t-kicker">'), "", PROV),
    ("`A Treatise on the Astrolabe` (h1)", where(P, '<h1><span class="h1-a">'), "Conventional modern title.", PROV),
    ("`“Litell Lowis my sone…”` (hero line)", where(P, 'class="t-dedication"'), "Skeat's opening words, quoted. We chose to excerpt them and added the ellipsis.", PROV),
    ("`Middle English text: W. W. Skeat (1894).`", where(P, "Middle English text: W. W. Skeat"), "Credit line.", PROV),
    ("`Glosses from Skeat's glossaries to the Treatise (1872) and to Chaucer (1894), for the Prologue and Part I §§ 1–3.`", where(P, "Glosses from Skeat's glossaries to the Treatise"), "Gloss variant. Credit for the glosses and the extent of the sample.", PROV),
    ("`Modern rendering, folded under each section: James E. Morrison.`", where(P, "Modern rendering, folded under each section: {PRIVATE_MODERN.credit}"), "Required credit; keep. Gloss variant wording (was `Modern English: …`). Removed with the rest of Morrison by `SHOW_MORRISON = false`.", PROV),
    ("`Draft preview; publication permission pending.`", where(P, "Draft preview; publication permission pending."), "Required notice; keep until permission is granted. Also in the closing credit.", PROV),
    ("`Read on, and the heavens turn about the lode-sterre.`", where(P, "Read on, and the heavens turn"), "Framing flourish. Shown only when motion is allowed. \"lode-sterre\" is Chaucer's word (pole star).", PROV),
    ("`Contents` (nav aria-label)", where(P, 'aria-label="Contents"'), "Screen-reader only.", PROV),
    ("`The Conclusiouns, as a constellacioun` (contents heading)", where(P, "<h2>The Conclusiouns, as a constellacioun</h2>"), "Framing flourish in mock Middle English spelling.", PROV),
    ("Contents group titles: `Prologue`, `Part I`, `Part II`, `Supplementary propositions`, `Spurious sections`", where(P, 'title: "Prologue", items', 'title: "Supplementary propositions"', 'title: "Spurious sections"'), "New in the whole-treatise pass. \"Supplementary propositions\" follows Skeat's heading; \"Spurious sections\" follows his note.", PROV),
    ("Contents group subtitles: `The descripcioun`, `The conclusiouns`, `printed by Skeat after the Explicit`, `so marked by Skeat`", where(P, 'sub: "The descripcioun"', 'sub: "The conclusiouns"', 'sub: "printed by Skeat after the Explicit"', 'sub: "so marked by Skeat"'), "New in the whole-treatise pass. The first two in mock Middle English spelling.", PROV),
    ("Contents star numerals: `P` (Prologue), `1`…`46`, `41a`…", where(P, 'num: s.entry.data.part === "Prologue" ? "P"'), "New. \"P\" is ours; the rest are Skeat's section numbers.", PROV),
    ("Contents star accessible names, e.g. `Part II · § 12: Special declaracioun of the houres of planetes`; the caption under the chart (same words)", where(P, "aria-label={`${s.kicker}: ${s.label}`}", 'class="toc-caption"'), "New. Kicker plus the first words (below).", PROV),
    ("Contents sub-labels / full-list entries, e.g. `Thyn Astrolabie hath a ring…`, `To knowe the altitude of the…`", where(P, "const label = heading", '<span class="tl-t" lang="enm">'), "First 4–6 words of Skeat's text or rubric, Part II rubrics lower-cased, ellipsis added by us.", PROV),
    ("`Every section, by its first words` (disclosure for the full list)", where(P, "<summary>Every section, by its first words</summary>"), "New in the whole-treatise pass.", PROV),
    ("`Glosses` (gloss bar group label, screen-reader only)", where(P, 'class="gl-bar" role="group" aria-label="Glosses"'), "Gloss variant; replaces the Middle English / Both / Modern toggle.", PROV),
    ("`Hover or tap a marked word for its gloss` (wide) / `Tap a marked word` (under 600px)", where(P, '<span class="gl-hint-wide">Hover or tap a</span>'), "Gloss variant. Hint in the sticky bar; \"marked word\" carries the same dotted underline as the glossed words.", PROV),
    ("`Show all glosses` (wide) / `All glosses` (under 600px) (switch)", where(P, '<span class="gl-hint-wide">Show&nbsp;</span>all glosses'), "Gloss variant. Turns on interlinear glosses under every glossed word; remembered per viewer.", PROV),
    ("Gloss popover: the word as printed, Skeat's gloss and definition, then `Shown in the figure` (only for words the section's figure shows)", where(P, '<p class="gp-fig">Shown in the figure</p>'), "Gloss variant. \"Shown in the figure\" is ours.", PROV),
    ("Gloss popover: second paragraph labelled `Skeat's note` (from his notes) or `From Skeat's introduction` (introduction § 28), set as an indented italic note; glossary definitions carry no label", where(P, 'q(".gp-dl").textContent = kind === "note"'), "Gloss variant. Commentary is never presented as a definition.", PROV),
    ("Gloss popover source line, e.g. `Skeat, EETS 1872, glossary · s.v. Turet, p. 118`; then `Definition: …` / `Note: Skeat, Oxford Chaucer 1894, vol. III, note to Prol. l. 7` / `Introduction: …`; `our gloss · provisional`", where(L, 'if (e.source === "ours") return "our gloss · provisional";') + "; " + where(P, 'const lab = kind === "note" ? "Note"'), "Gloss variant. Source names are written in the gloss builder (next row).", PROV),
    ("Source names: `Skeat, EETS 1872, glossary`, `Skeat, Oxford Chaucer 1894, glossary`, `Skeat, Oxford Chaucer 1894, index of names`, `Skeat, Oxford Chaucer 1894, vol. III`, `our gloss`; locators `note to Prol. l. 7`, `Introduction, § 28`", where(B, '"eets": "Skeat, EETS 1872, glossary"', 'OXF3_WHERE = {'), "Gloss variant. Our short names for the editions; full titles and URLs are in `glosses.json` and `docs/treatise-glosses.md`.", PROV),
    ("Screen-reader description of each glossed word: gloss, definition (or `Skeat's note: …` / `From Skeat's introduction: …`), then `Source: …` or `Our gloss.`", where(P, 'e.source === "ours" ? "Our gloss." : `Source: ${sourceLine(e)}.`'), "Gloss variant. Hidden text, read through aria-describedby.", PROV),
    ("Interlinear (show-all) glosses: Skeat's first alternative, or a shorter piece of his gloss for long ones (e.g. `propositions`, `the eye`, `plate or rod`)", where(L, "const short = e.short ?? e.gloss.split"), "Gloss variant. Still Skeat's words (the builder checks every short form is a substring of his entry), but which piece to show is our choice.", PROV),
    ("Which glossed words light their section's figure (e.g. `turet`, `moder` in § 2; `riet`, `wombe`, `loppe` in § 3; `swerd` in the Prologue)", where(P, "const FIGURE_TERMS: Record<string, string[]> = {"), "Gloss variant. Our reading of what each scene shows.", PROV),
    ("`Modern rendering (Morrison)` (disclosure under each section) and its credit `James E. Morrison. Draft preview; publication permission pending.`", where(P, "<summary>Modern rendering (Morrison)</summary>", '<p class="tm-credit">'), "Gloss variant. Collapsed by default. Required credit and notice kept. `SHOW_MORRISON = false` removes all of it.", PROV),
    ("`The glossed sample ends here.` / `From § 4 on, Skeat's text is shown without glosses.` (aria-label `End of the glossed sample`)", where(P, "<p>The glossed sample ends here.</p>", "<p>From § 4 on, Skeat's text is shown without glosses.</p>"), "Gloss variant. After Part I § 3.", PROV),
    ("Part `aria-label`: `Prologue`, `Part I`, `Part II`", where(P, 'class="t-part" aria-label={p.name}'), "", PROV),
    ("`PARS PRIMA` / `PARS SECUNDA` (above part headings)", where(P, '"Part I": "PARS PRIMA"', '<p class="t-part-latin">'), "Our Latin, modelled on the Latin rubrics in Skeat.", PROV),
    ("`Part I` / `Part II` (part headings)", where(P, "<h2>{p.name}</h2>"), "", PROV),
    ("`HERE BIGINNETH THE DESCRIPCION…` / `HERE BIGINNEN THE CONCLUSIONS…` / `HERE ENDETH THE DESCRIPCION OF THE ASTROLABIE.`", where(P, '"Part I": "HERE BIGINNETH', '"Part I": "HERE ENDETH'), "**Skeat's**, listed only because the page supplies them rather than the collection. The \"HERE ENDETH\" rubric is new on the page.", "n/a (source text)"),
    ("Skeat's group labels: `SUPPLEMENTARY PROPOSITIONS.` and `[The following sections are spurious; …]`; the Explicit colophon after §40", where(P, 'class={`t-group-head t-group-${kind}`}', 'class="t-colophon"'), "**Skeat's**, carried in the collection's `note` / `colophon` fields and shown as printed (italic underscores removed).", "n/a (source text)"),
    ("Section kicker suffixes `· supplementary` / `· spurious`", where(P, '<span class="t-sec-kind"> · {kind}</span>'), "New. Quiet labels on sections outside the main sequence.", PROV),
    ("Sky-window ring legends: `PROLOGUS · LITELL LOWIS MY SONE`, `PARS PRIMA · CAPITULUM I`…, `PARS SECUNDA · CONCLUSIO I`…, `… CONCLUSIO XLI a`", where(P, '? "PROLOGUS · LITELL LOWIS MY SONE"', 'CONCLUSIO" : "CAPITULUM"'), "Our Latin. \"Conclusio\" follows Skeat's Latin rubric (\"conclusiones\"); \"Capitulum\" for Part I is our choice; Skeat's letter suffix kept for the spurious sections.", PROV),
    ("Inline window legend `WITH THIS SWERD SHAL I SLEEN ENVYE` and aria-label `Figure: with this swerd shal I sleen envye`", where(P, 'legend: sc.label.replace'), "New. Label from `00-prologue.md` (`inlineScenes`); the legend is the label without \"Figure:\", upper-cased. The words are Skeat's.", PROV),
    ("`Figure for Prologue` / `Figure for Part II § 1` … (figure aria-label)", where(P, "label={`Figure for ${entry.data.part}"), "Screen-reader label for each sky window.", PROV),
    ("`The Prologue` / `Part II · § 1` … (section kicker)", where(P, 'const kicker = part === "Prologue" ? "The Prologue"'), "", PROV),
    ("Section titles for sections without a rubric, e.g. `Litell Lowis my sone…`, `Thyn Astrolabie hath a ring…`", where(P, "title: heading || `${incipit(entry.body"), "First 4–5 words of Skeat's text plus our ellipsis. Part II titles are Skeat's rubrics, unchanged.", PROV),

    ("`Explicit` (closing word)", where(P, '<p class="t-explicit">Explicit</p>'), "Conventional Latin end-of-text mark.", PROV),
    ("`Middle English: W. W. Skeat (1894). Glosses: W. W. Skeat, Early English Text Society (1872) and Oxford Chaucer (1894), except those marked as ours. … Sky drawn for the latitude of Oxford.` (closing credit)", where(P, "Middle English: W. W. Skeat (1894). Glosses: W. W. Skeat", "Sky drawn for the latitude of Oxford."), "Gloss credit added in the gloss variant; Morrison credit there reads `Modern rendering: …`.", PROV),
]

sky = [
    ("Constellation names: `URSA MAIOR`, `URSA MINOR`, `CASSIOPEIA`, `PERSEUS`, `CIGNUS`, `LIRA`, `AQUILA`, `LEO`, `GEMINI`, `TAURUS`, `ORION`, `PEGASUS`, `BOOTES`, `CORONA`, `SCORPIUS`, `CANIS MAIOR`", where(S, '["URSA MAIOR"', '["CANIS MAIOR"'), "Latin names, medieval spellings (MAIOR, CIGNUS, LIRA). Hidden under 600px wide and wherever they would land near text.", PROV),
    ("Star names `Alhabor` (Sirius), `Alramech` (Arcturus), `Azimech` (Spica), `Algomeisa` (Procyon), `Cor Leonis` (Regulus)", where(S, 'Sirius: "Alhabor"', 'Regulus: "Cor Leonis"'), "**Verified (Skeat notes / Wikipedia).** \"Alhabor\" is Chaucer's own (Part II §3).", "verified (Skeat notes / Wikipedia); wording provisional; awaiting Jes"),
    ("`Wega` (Vega)", where(S, 'Vega: "Wega"'), "**Verified (Wikipedia: \"Vega (earlier Wega)\").**", "verified (Skeat notes / Wikipedia); wording provisional; awaiting Jes"),
    ("`Aldeberan` (Aldebaran)", where(S, 'Aldebaran: "Aldeberan"'), "**Verified (Skeat notes).** Chaucer's own spelling in the Treatise. Corrected from \"Aldeboran\".", "verified (Skeat notes / Wikipedia); wording provisional; awaiting Jes"),
    ("`Alhajoth` (Capella)", where(S, 'Capella: "Alhajoth"'), "**Verified (attested medieval form; variant \"Alhaior\").** Corrected from \"Alhaioth\".", "verified (Skeat notes / Wikipedia); wording provisional; awaiting Jes"),
    ("`Altair`, `Rigel`, `Deneb`", where(S, 'Altair: "Altair"', 'Deneb: "Deneb"'), "Modern names, kept as is.", PROV),
    ("`the lode-sterre` (Polaris)", where(S, 'Polaris: "the lode-sterre"'), "Chaucer's word for the pole star.", PROV),
    ("Zodiac signs: `ARIES` … `PISCES`", where(S, '"ARIES", "TAURUS"'), "Latin sign names on the ecliptic band.", PROV),
    ("Plate words: `CENITH`, `ORISONTE OBLIQUE`, `ALMIKANTERAS`", where(S, 'fillText("CENITH"', 'fillText("ORISONTE OBLIQUE"', 'fillText("ALMIKANTERAS"'), "Chaucer's spellings of zenith, (oblique) horizon and almucantars. \"Oblique\" as a horizon qualifier is ours.", PROV),
]

scenes = [
    ("`25½°`", where(f"{SC}/treatise-p2-2-altitude.js", 'label.textContent = "25½°"'), "Part II §2 (astrolabe-video e5ff358). Chaucer's example altitude.", PROV),
    ("`X`, the hour numerals (`1`…`9`), `Alhabor`", where(f"{SC}/treatise-p2-3-time.js", 'text(C.x + xp[0], C.y + xp[1] + 5, 15, "X")', 'const name = text(64, -40, 13, "Alhabor")'), "Part II §3 (35daf72). The hour figure is computed (morning 9; night 9).", PROV),
    ("`12 March`, `Aries 1°`, `13 December`, `Capricorn 1°`", where(f"{SC}/treatise-p2-1-sun-degree.js", '"12 March", "Aries 1°"', '"13 December", "Capricorn 1°"'), "Part II §1 (96b870a). Chaucer's two examples.", PROV),
    ("Engraved scale names `Aries`, `Pisces`, `Capricornus`, `Sagittarius`, `Marcius`, `Februarius`, `Aprilis`, `December`, `November`, `Januarius`", where(f"{SC}/treatise-p2-1-sun-degree.js", 'along("Aries"', 'along("Januarius"'), "Part II §1. Inscriptions on the instrument's back, in Latin as engraved.", PROV),
]

out = ["# /treatise/ wording ledger\n",
       "Every piece of text on the treatise page that is **not** Skeat's Middle English",
       "or Morrison's modern English, i.e. words we wrote or chose. Nothing here is",
       "approved yet: Jes has not signed off on the framing lines.\n",
       "- Status for every entry: **provisional; awaiting Jes** (star names that were",
       "  checked are marked verified, but their use is still Jes's call).",
       "- Line numbers are regenerated by a script that fails if a phrase is missing.",
       "- If you change any wording on the page, update the entry here and note the change",
       "  in the change log at the bottom.\n"]
for title, rs in [("Page frame (`src/pages/treatise.astro`)", rows), ("Sky labels (`src/scripts/treatise-sky.ts`)", sky), ("Labels inside scenes (`public/scenes/`)", scenes)]:
    out.append(f"## {title}\n")
    if rs is sky:
        out.append("These are drawn on the canvas. They are historical astrolabe and star-chart\nterms rather than prose, but we chose them and their spellings.\n")
    if rs is scenes:
        out.append("Drawn by the astrolabe-video scene modules (copied byte-for-byte; edit them there).\nThe Part I scenes (p1-1, p1-2, p1-3) and the Prologue miniature draw no words.\n")
    out.append("| Text | Where | Notes | Status |")
    out.append("|---|---|---|---|")
    for t, w, n, st in rs:
        out.append(f"| {t} | {w} | {n} | {st} |")
    out.append("")
G = json.load(open(os.path.join(root, "src/treatise-text/glosses.json"), encoding="utf-8"))
out.append("## Glosses we wrote (`src/treatise-text/glosses.json`, source `ours`)\n")
out.append("Plain modern equivalents of a spelling, written where no Skeat entry was found. Shown with a fainter")
out.append("mark and the source line \"our gloss · provisional\". Every other gloss is Skeat's own wording; see")
out.append("`docs/treatise-glosses.md` for sources and provenance.\n")
out.append("| Form(s) in the text | Our gloss | Status |")
out.append("|---|---|---|")
for k, e in G["entries"].items():
    if e["source"] != "ours":
        continue
    fs = sorted(f for f, kk in G["forms"].items() if kk == k)
    out.append(f"| {', '.join('`' + f + '`' for f in fs)} | {e['gloss']} | {PROV} |")
out.append("")
out.append("## Sense choices we made (`overrides` in `glosses.json`)\n")
out.append("Where one spelling needs two of Skeat's senses, we chose the sense for these passages. The glosses")
out.append("themselves are Skeat's.\n")
out.append("| Passage | Word | Gloss shown | Status |")
out.append("|---|---|---|---|")
for o in G["overrides"]:
    shown = G["entries"][o["key"]]["gloss"] if o["key"] else "(no gloss here)"
    out.append(f"| {o['section']}: \"{o['match']}\" | `{o['word']}` | {shown} | {PROV} |")
out.append("")
out.append("## Not on the page\n")
out.append("- `public/scenes/night-window.js`, `public/scenes/demo-rete.js` and the Part I and Prologue scene modules draw no text.\n")
out.append("## Change log\n")
out.append("- Legibility pass: no wording changed. Lines were only moved or hidden.")
out.append("- Gloss review: Skeat's notes and introduction are no longer shown as definitions; labelled `Skeat's note` / `From Skeat's introduction` and set as notes (9 entries). Source name `Skeat's notes, Oxford Chaucer 1894` → `Skeat, Oxford Chaucer 1894, vol. III`.")
out.append("- Gloss variant (`treatise/style-gloss`): the Middle English / Both / Modern toggle and the column tags (`Chaucer`, `In modern English`) and `Modern rendering — pending` are gone. New: the gloss bar, popover labels, source names, the sample-end note, the Morrison disclosure, the gloss credits, the figure-term choice, our 14 glosses and the sense choices (tables above). `Modern English: James E. Morrison.` now reads `Modern rendering, folded under each section: James E. Morrison.` (hero) and `Modern rendering: James E. Morrison.` (closing credit).")
out.append("- Whole-treatise pass: star names corrected: `Aldeboran` → `Aldeberan` (Chaucer's spelling), `Alhaioth` → `Alhajoth` (attested form). Star-name rows marked verified (Skeat notes / Wikipedia). New entries: contents group titles and subtitles, `P`, the full-list disclosure, the `· supplementary` / `· spurious` kicker suffixes, the inline sword window's legend and label, the \"HERE ENDETH\" rubric, Skeat's group labels and colophon (source text), and the in-scene labels. The \"Modern rendering — pending\" note now appears on 11 sections.")
open(os.path.join(root, "docs/treatise-wording.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("ledger rows", len(rows) + len(sky) + len(scenes))
