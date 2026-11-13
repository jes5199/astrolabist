Source of the Middle English text in this collection
=====================================================

(The leading underscore keeps Astro from treating this note as a collection entry.)

- Text: Geoffrey Chaucer, *A Treatise on the Astrolabe*, ed. W. W. Skeat,
  *The Complete Works of Geoffrey Chaucer*, vol. 3 (Oxford: Clarendon Press, 1894).
- Transcription: Project Gutenberg eBook #45027, "Chaucer's Works, Volume 3",
  plain-text UTF-8 file at https://www.gutenberg.org/cache/epub/45027/pg45027.txt
  (fetched 2026-11-13).
- Status: Skeat's 1894 text is in the public domain. The Project Gutenberg
  header, licence and trademark text are not reproduced here.

Sections included: the whole treatise as Skeat prints it (75 entries):
Prologue; Part I §1–23; Part II §1–40; the six "SUPPLEMENTARY PROPOSITIONS"
§41–46 that Skeat prints after the Explicit; and the five sections he marks
as spurious (§41a, 41b, 42a, 43a, 42b, in his printed order). Skeat's text
ends at the line before 'COMMENTARY ("FOOTNOTES").' in the Gutenberg file.

Editing applied:
- Skeat's marginal line numbers (every fifth line) removed; wrapped lines joined
  into paragraphs. Spelling, punctuation and hyphenation are unchanged.
- Line numbers are recognised as a number at the end of a line that follows
  a run of spaces, or a single space when the line reaches Skeat's right
  margin (72+ characters). All 231 removed were multiples of 5. Text lines
  that really end in a number are no longer than 67 characters.
- Gutenberg's `_underscores_` for Skeat's italics are kept (Markdown renders
  them as italics). Skeat's square brackets (e.g. "[thou shall do wel
  y-now]") are kept. Occasional double spaces inside a line are as in the
  source.
- No footnote markers or figures occur inline; Chaucer's "lo here thy
  figure" phrases are kept as words.
- `order`: Prologue 0; Part I 100+§; Part II 200+§ (including the
  supplementary §41–46); the spurious sections 301–305 in Skeat's printed
  order.
- `note`: Skeat's own label for sections outside the main sequence, verbatim:
  "SUPPLEMENTARY PROPOSITIONS." (his heading over §41–46) and
  "[_The following sections are spurious; they are numbered so as to shew
  what propositions they repeat._]" (his note over 41a–42b).
- `colophon` on Part II §40: Skeat's "EXPLICIT TRACTATUS DE CONCLUSIONIBUS
  ASTROLABII, …" which follows §40 and precedes the supplementary sections.
- The extraction is scripted and was checked by regenerating the seven
  entries of the first slice: bodies and frontmatter (except `order`)
  were reproduced exactly.
- Skeat's English rubrics for Part II are in `heading`; his bracketed Latin
  rubrics are in `latin`. The part-level rubrics ("HERE BIGINNETH THE
  DESCRIPCION OF THE ASTROLABIE." / "HERE BIGINNEN THE CONCLUSIONS OF THE
  ASTROLABIE.") are rendered by `src/pages/treatise.astro`, not stored per
  section.

The `modern` field is intentionally empty: no modern-English rendering has been
written or licensed yet.
