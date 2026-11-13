# Treatise glosses (gloss variant, `treatise/style-gloss`)

Status: **the whole Treatise, 2026-11-13.** The Prologue, Part I §§ 1–23 and all of Part II are glossed:
§§ 1–40, the supplementary §§ 41–46 and the spurious §§ 41a, 41b, 42a, 42b, 43a (the sample was the
Prologue and Part I §§ 1–3; the rest added on Jes's go, tg 17907). The sample-end note is gone. Every
gloss and line departure we wrote ourselves is listed in `docs/treatise-wording.md` as provisional,
awaiting Jes.

Part II's English rubrics (frontmatter `heading`) and Latin lines (`latin`) are not glossed: the
tokenizer reads only the section body, and the rubric is set as a heading in Skeat's spelling, with no
modern line. The Latin stays as is. Skeat's italic Latin inside the body follows Part I: a term Skeat
glosses keeps the Latin on the line (*umbra recta, orison rectum, in horoscopo, anni collecti et
expansi*), *nota* reads "note", and the two short tags read in plain English (*et sic deinceps* "and so
on", *et sic de ceteris* "and so for the rest"; both `paraphrase-phrase`).

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
  (14 entries with a popover, 16 forms, all from the sample; the rest, including all 182 added in
  Part II, are line-only respellings; see the ledger). No `ours` entry may carry a definition (the gate checks).
- No popover: words spelled and used as in modern English; transparent respellings with no
  Skeat entry (*alle, olde, owne, whiche, wordes, betre, wryten, redeth, hereth, bereth*…, and in
  §§ 4–23 *cercle, devyded, contieneth, monthes, turneth*…, and in Part II *wher-fore, schadwe, multiplye,
  findest, worchest*…), which get an `ours` line-only word; and
  words whose sense here we could not source (*bisy, discret*). Better unglossed than guessed.
- Skeat's `_italic_` Latin (*umbra versa, tropos, angulus primi motus…*) is set in italics on both
  lines; the tokenizer drops the underscores.
- The page build fails if a phrase or sense choice no longer matches the text (checked:
  breaking one override makes `astro build` exit 1).

Prologue sense change in the §§ 4–23 pass: *certein* now maps to a plain *certain* (EETS); Skeat's
note to Prol. l. 10 stays only on "I seye a certein of conclusiouns", the passage it annotates.

## Counts (the whole Treatise; Part II alone in brackets)

| | |
|---|---|
| Word tokens | 14,878 (Part II: 11,286; Prologue and Part I: 3,592) |
| Under each word, on the modern line | Skeat's gloss 4,908, ours 1,777, the same word (identity) 8,191, `·` 2 (*bisy*, *discret*) (Part II: Skeat 3,715, ours 1,344, identity 6,227, `·` 0) |
| Distinct glossed forms | 1,301 on the page; 1,225 mapped forms and 46 phrases (Part II added 618 forms and 30 phrases, such as *in cas that*, *par aventure*, *orison rectum*, *anni collecti et expansi*, *fulle see*) |
| Entries | 1,242: EETS 449, Oxford glossary 417, Oxford names 30, ours 346 (14 with a popover; 332 line-only) (Part II: 646 new: EETS 226, Oxford glossary 225, Oxford names 13, ours 182, all line-only) |
| Sense choices (`overrides`) | 369 (Part II: 299) |
| Departures in the minimal-translation line | 698 rows, 1,017 placements: modernised-form 429, reordered 168, paraphrase-phrase 58, added-word 43 (Part II: 532 rows, 820 placements: modernised-form 328, reordered 136, paraphrase-phrase 40, added-word 28) |
| Second paragraphs | 66: 57 glossary definitions (EETS 45, Oxford 12); 9 pieces of commentary, labelled as such: 6 "Skeat's note" (*Lowis, philosofre, suffisaunt, certein, Somer, Lenne*) and 3 "From Skeat's introduction" (*Astrolabie, rewle, clymatz*). Part II added 33 definitions (EETS 25, Oxford 8), among them *assendent, aspect, combust, dignite, hous, succedent, episicle, anni collecti, anni expansi, mote, rote*; no notes |

Tokenizer fix in the Part II pass: a shorter line span that began on the same word as a longer one
already placed used to overwrite it, and the words between dropped off the line (it happened in II
§ 40, "latitude septentrional"). A span is now placed only on a word no other span has taken. Part I
renders byte for byte as before (checked).

Line spans are kept short enough to fit a phone column (a span is one unbreakable ruby): five long ones
were split after the 390 px check found them cut off at the edge.

## The modern line

Under every word of a glossed section is a modern word (a `<ruby>`): Skeat's gloss (his first sense, or a
piece of it chosen in `LINE_STRICT` in `curate.py`; the gate checks it is his wording), our plain respelling,
the word itself where modern English uses it unchanged (set quieter), or `·` where there is no clean
equivalent. Bare numerals get the numeral beneath (their own ruby, not counted as words). A modern word wider than the Middle English widens that word's column; a word and its gloss
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
| oxf6 | Mile-wey | 166 | 31874 | `minutesof time` → `minutes of time` |
| oxf6 | Umbra versa / Umbra extensa, or recta | 275 | 49627 | `or recla,` → `or recta,`; `' skale '` → `'skale'`; `' crossline,'` → `'crossline,'` |
| eets | Hors | 111 | 11182 | `the " horse," … the •'pyn/'` → `the "horse," … the "pyn,"` |
| eets | Centre | 108 | 10709 | `the " centre " or` → `the "centre" or` |
| eets | Bestes | 108 | 10663 | `the " beasts " or` → `the "beasts" or` |
| oxf6 | Almury | 10 | 6322 | `the ' denticle ' or tooth like` → `the 'denticle' or tooth-like` (EETS prints *tooth-like*) |
| oxf6 | Heep | 124 | 25012 | `gieat number` → `great number` |
| oxf6 | Hous | 133 | 26523 | `a ' house' or portion of the sky (in astrologjO` → `a 'house' or portion of the sky (in astrology)` |
| eets | Hole | 111 | 11167 | `Avhole` → `whole` |
| eets | Vulgar | 119 | 12189 | `the " artificial" day` → `the "artificial" day` |
| oxf6 | Naturel | 174 | 33169 | `'day natural '` → `'day natural'`; `' day artificial.'` → `'day artificial.'` |
| eets | Strange | 117 | 11962 | `otcn` → `own`; `tlie` → `the` |
| eets | Perche | 115 | 11638 | `liigh` → `high` |
| eets | Ferther-over | 111 | 11061 | `Ferther-oner` → `Ferther-over` |
| eets | Orizon rectum | 114 | 11591 | `representea` → `represented` |
| eets | Aperceyve | 107 | 10532 | `Aperceyne, v.` → `Aperceyve, v.` |
| eets | Clymat | 108 | 10735 | `two ^iven lines` → `two given lines` |
| eets | Peyre | 115 | 11650 | `a " pair," a set` → `a "pair," a set` |
| eets | Forþer | 111 | 11075 | `Forjjer` → `Forþer` |
| oxf6 | Entere | 88 | 18947 | `set down in writmg` → `set down in writing` |
| eets | Mote | 114 | 11496 | `mea?i motion` → `mean motion` |
| oxf6 | Rotes | 219 | 40471 | `' roots,'` → `'roots,'` |

Part II also reuses the Part I fixes for *Declinacioun* and *Umbra versa*. Not fixed, and so not used:
the OCR of an italic word in *Hous* (`called /(fl/^j-^i-,`; the definition stops before it) and in
*Entere* (`entere /a't`). Oxford entries at the start of the glossary (*Aboute, Abyde, Adden,
Again*) sit on leaves with no printed page number in the Internet Archive map, so they are not cited;
those words take EETS or an `ours` respelling instead.

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

