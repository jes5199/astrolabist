# Treatise glosses (gloss variant, `treatise/style-gloss`)

Status: **sample, 2026-11-13.** The Prologue and Part I §§ 1–3 are glossed; later sections show
Skeat's text unglossed after a note. Every gloss we wrote ourselves is listed in
`docs/treatise-wording.md` as provisional, awaiting Jes.

## What is where

| Piece | File |
|---|---|
| Gloss data (generated; do not hand-edit sourced entries) | `src/treatise-text/glosses.json` |
| Curated list: which entry glosses which word, Skeat's wording for each | `tools/treatise-glosses/curate.py` |
| Gate + generator: checks every gloss against the OCR, writes the JSON | `tools/treatise-glosses/build_glosses.py` |
| Downloads, OCR parsers, printed-page lookup | `tools/treatise-glosses/fetch_sources.sh`, `parse_eets.py`, `parse_oxf.py`, `iapages.py` |
| Curation aid (candidate entries per word) | `tools/treatise-glosses/sheet.py` |
| Build-time tokenizer: wraps glossed words, applies phrases and sense choices | `src/lib/treatise-gloss.ts` |
| Page, popover, show-all mode | `src/pages/treatise.astro` |

Skeat's Markdown in `src/content/treatise/` is not edited. The page tokenizes it at build time.

## Sources (all public domain)

| id | Edition | Year | URL | Why public domain |
|---|---|---|---|---|
| `eets` | *A Treatise on the Astrolabe; addressed to his son Lowys by Geoffrey Chaucer, A.D. 1391*, ed. W. W. Skeat, Early English Text Society, Extra Series 16. Glossarial Index, pp. 106–119. | 1872 | https://archive.org/details/onastrol00chautreatiserich (OCR: `…_djvu.txt`) | Published 1872; Skeat died 1912. The scan is the 1968 lithographic reprint ("reprinted lithographically"), a photographic copy of the 1872 pages that adds no new text. Internet Archive marks it NOT_IN_COPYRIGHT. |
| `oxf6` | *The Complete Works of Geoffrey Chaucer*, ed. W. W. Skeat, vol. VI: Introduction, Glossary and Indexes (Oxford: Clarendon Press). Glossarial Index. | 1894 | https://archive.org/details/completeworksofg06chauuoft (OCR: `…_djvu.txt`) | Published 1894. The scan is the 1926 impression, "produced photographically from sheets of the First Edition"; pre-1929 either way. |
| `oxf6n` | The same volume, Index of Proper Names. | 1894 | as `oxf6` | as `oxf6` |
| `oxf3` | *The Complete Works of Geoffrey Chaucer*, ed. W. W. Skeat, vol. III: Introduction to the Treatise (§ 28) and Notes to the Treatise. | 1894 | https://www.gutenberg.org/cache/epub/45027/pg45027.txt (Project Gutenberg #45027) | Published 1894. The same file is the source of the Middle English text on the page (`src/content/treatise/_SOURCE.md`). |

Line references: the EETS glossary cites the EETS text (`pr. 57`, `i. 2. 1`); the Oxford glossary
cites the 1894 text (`A. pr. 61`, `A. i. 2. 1`), which is the text on the page. The two number the
Prologue differently. Where Skeat's definition quotes another authority, the popover says so:
Wedgwood (*con … thank*), Bailey (*dignetes*), Tyrwhitt (*Somer*), Brae (*Lenne*).

## The rules

- **Every sourced gloss, short gloss and definition is a verbatim substring of the cited Skeat
  entry**, after the logged OCR fixes below. `build_glosses.py` refuses to write the JSON otherwise.
  `--selftest` swaps in an invented gloss for *turet* and must fail (it does).
- Choosing among Skeat's senses for a passage is ours (e.g. *ben* = "are" / "been" / "be";
  *latitude* terrestrial at "the latitude of Oxenford", astronomical at "after his latitude").
  These are the `overrides`, listed in the wording ledger.
- EETS first when it has an entry for the word in this sense; then the Oxford glossary; definitions
  for technical words from either glossary. Passages from Skeat's notes or introduction (vol. III) are
  commentary, not definitions: the popover labels them "Skeat's note" / "From Skeat's introduction"
  and sets them as an indented italic note.
- `ours`: only a plain modern equivalent of a spelling, where no Skeat entry was found
  (14 entries, 16 forms; see the ledger). No `ours` entry may carry a definition (the gate checks).
- Not glossed: words spelled and used as in modern English; transparent respellings with no
  Skeat entry (*alle, olde, owne, whiche, wordes, betre, wryten, redeth, hereth, bereth*…); and
  words whose sense here we could not source (*bisy, wrappeth, discret*). Better unglossed than guessed.
- The page build fails if a phrase or sense choice no longer matches the text (checked:
  breaking one override makes `astro build` exit 1).

## Counts (sample: Prologue, Part I §§ 1–3)

| | |
|---|---|
| Word tokens in the sample | 985 |
| Under each word, on the modern line | Skeat's gloss 364, ours 91, the same word (identity) 528, `·` 2 (*bisy*, *discret*) |
| Distinct glossed forms | 279 (including 8 phrases such as *tak keep*, *con me the more thank*) |
| Entries | 267: EETS 120, Oxford glossary 87, Oxford names 6, ours 54 (14 with a popover; 40 plain respellings for the line only) |
| Departures in the minimal-translation line | 57 rows, 68 placements: modernised-form 38, reordered 9, added-word 7, paraphrase-phrase 3 |
| Second paragraphs | 27: 18 glossary definitions (EETS 17, Oxford 1); 9 pieces of commentary, labelled as such: 6 "Skeat's note" (*Lowis, philosofre, suffisaunt, certein, Somer, Lenne*) and 3 "From Skeat's introduction" (*Astrolabie, rewle, clymatz*) |

## The modern line

Under every word of a glossed section is a modern word (a `<ruby>`): Skeat's gloss (his first sense, or a
piece of it chosen in `LINE_STRICT` in `curate.py`; the gate checks it is his wording), our plain respelling,
the word itself where modern English uses it unchanged (set quieter), or `·` where there is no clean
equivalent. A modern word wider than the Middle English widens that word's column; a word and its gloss
never part at a line end; punctuation rides with both.

That is the **strict** line. The page shows the **translation** line: the same, with the authored spans in
`TRANSLATION` (`curate.py`, `lineSpans` in the JSON) replacing it where word-for-word would not read as
English: modern forms, a few added function words, short reorderings, three small paraphrases. Each span
stands under exactly the words it renders. It is our text, built on Skeat's glosses, written from the
Middle English, Skeat's glosses and notes and plain English only (no modern translation was consulted).
The popover keeps Skeat's exact gloss. `LINE_MODE = "strict"` in `treatise.astro` switches back.
Every span is listed in the wording ledger.

## Provenance in the data

Each entry in `glosses.json` carries `source` and `ref`: Skeat's headword (`head`), the printed page
(`page`, from the Internet Archive page-number map, not guessed from the OCR), the OCR line where the
entry starts (`ocr`), Skeat's citation of the passage (`loc`), and any OCR fixes (`ocrFixes`).
Definitions have `defSource` and `defRef` (page, or the Gutenberg line and Skeat's locator such as
"note to Prol. l. 7").

## OCR fixes (only obvious ones)

| Source | Headword | Page | OCR line | Fix |
|---|---|---|---|---|
| oxf6 | Wel | 287 | 51703 | `Wei, adv.` → `Wel, adv.` |
| oxf6 | Certeyne | 44 | 11835 | `pL certain` → `pl. certain` |
| oxf6 | Thyn | 266 | 48116 | `pass. pron.` → `poss. pron.` |
| eets | Proporciouns | 115 | 11709 | `j3r. 3` → `pr. 3` |
| oxf6 | Special | 243 | 44373 | `iti special` → `in special` |
| eets | Mechel | 113 | 11426 | `^r. 4` → `pr. 4` |
| eets | Geuen | 111 | 11093 | `p)pgiven, pr. G.` → `pp. given, pr. 6.` |
| eets | Suffisaunt | 117 | 12011 | `Sufiisaunt` → `Suffisaunt` |
| eets | Compowned | 108 | 10758 | `CompoAvned, 2^Pcompounded` → `Compowned, pp. compounded` |
| eets | Han | 111 | 11115 | `pr.2?l.` → `pr. pl.` |
| eets | Vnknowe | 118 | 12154 | `j;?\ 1 3` → `pr. 13` |
| oxf6 | Hir (4) | 129 | 25887 | `{^),poss.f>rofi. their` → `(4), poss. pron. their` |
| eets | Hem | 111 | 11130 | `2)ron. p)lthem` → `pron. pl. them` |
| eets | Rewles | 116 | 11783 | `2^. 19` → `pr. 19` |
| oxf6 | Writen | 301 | 53902 | `WrUen, pt. pi. wrote` → `Writen, pt. pl. wrote` |
| eets | Mo | 113 | 11462 | `^•. 26` → `pr. 26` |
| eets | Euerech | 110 | 11018 | `pv. 40` → `pr. 40` |
| eets | Vsurpe | 118 | 12175 | `Vsiirpe, 1 J), s. p)r.` → `Vsurpe, 1 p. s. pr.` |
| eets | Reherse | 115 | 11731 | `Eeherse,v.` → `Reherse, v.` |
| oxf6 | Forseid | 105 | 21813 | `Porseid, pp.` → `Forseid, pp.` |
| eets | Narwe | 114 | 11514 | `fir. 49` → `pr. 49` |
| eets | Portatif | 115 | 11690 | `portable,^. 50` → `portable, pr. 50` |
| oxf6 | Fraccions | 107 | 22202 | `Fraecions` → `Fraccions` |
| eets | Declinacioun | 109 | 10822 | `celestial obiect` → `celestial object` |
| eets | Meridian | 113 | 11436 | `southing,exact` → `southing, exact` |
| eets | Canon | 108 | 10702 | `yr. 63` → `pr. 63` |
| eets | Ecliptik | 109 | 10894 | `with (he equator` → `with the equator` |
| eets | Vouche | 118 | 12165 | `Youclie, V. to vouch` → `Vouche, v. to vouch` |
| oxf6 | Rewle | 216 | 40031 | `long and 2l6 narrow` → `long and narrow` (the running page number, 216, caught in the line) |
| eets | Resseyuyth | 115 | 11754 | `Resseyuy th, jj>r. s.` → `Resseyuyth, pr. s.` |
| eets | Riet | 116 | 11785 | `the " rete " or net` → `the "rete" or net` |

Also applied to every source: whitespace collapsed, line-end hyphens joined, Gutenberg's `_italic_`
marks dropped.

## Regenerating

```sh
tools/treatise-glosses/fetch_sources.sh /some/new/dir        # refuses an existing directory
python3 -I tools/treatise-glosses/parse_eets.py /some/new/dir/onastrol00chautreatiserich_djvu.txt /some/new/dir/eets.json
python3 -I tools/treatise-glosses/parse_oxf.py  /some/new/dir/completeworksofg06chauuoft_djvu.txt /some/new/dir/oxf.json
python3 -I tools/treatise-glosses/parse_oxf.py  /some/new/dir/completeworksofg06chauuoft_djvu.txt /some/new/dir/oxfn.json 63494 'INDEX\s+OF\s+AUTHORS'
python3 -I tools/treatise-glosses/build_glosses.py /some/new/dir src/treatise-text/glosses.json
python3 -I tools/treatise-wording-ledger.py .
```

From a fresh download this reproduces the committed `glosses.json` byte for byte (checked
2026-11-13). To add a gloss, add a row to `curate.py` with Skeat's exact wording and the OCR line of
the entry (`sheet.py` lists candidates), then rerun.

