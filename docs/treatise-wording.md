# /treatise/ wording ledger

Every piece of text on the treatise page that is **not** Skeat's Middle English
or Morrison's modern English, i.e. words we wrote or chose. Nothing here is
approved yet: Jes has not signed off on the framing lines.

- Status for every entry: **provisional; awaiting Jes**.
- Line numbers are as of the commit that last touched this file.
- If you change any wording on the page, update the entry here and note the change
  in the change log at the bottom.

## Page frame (`src/pages/treatise.astro`)

| Text | Where | Notes | Status |
|---|---|---|---|
| `A Treatise on the Astrolabe - Astrolab.ist` (document title) | treatise.astro:122 | Site title comes from `src/consts.ts`. | provisional; awaiting Jes |
| `Geoffrey Chaucer, A Treatise on the Astrolabe (c. 1391), in W. W. Skeat's Middle English text (1894).` (meta description) | treatise.astro:123 | Doesn't mention the modern text. | provisional; awaiting Jes |
| `Geoffrey Chaucer ✦ c. 1391` (hero kicker) | treatise.astro:150 | | provisional; awaiting Jes |
| `A Treatise on the Astrolabe` (h1) | treatise.astro:151 | Conventional modern title. | provisional; awaiting Jes |
| `“Litell Lowis my sone…”` (hero line) | treatise.astro:152 | Skeat's opening words, quoted. We chose to excerpt them and added the ellipsis. | provisional; awaiting Jes |
| `Middle English text: W. W. Skeat (1894).` | treatise.astro:154 | Credit line. | provisional; awaiting Jes |
| `Modern English: James E. Morrison.` | treatise.astro:155, :282 | Required credit; keep. | provisional; awaiting Jes |
| `Draft preview; publication permission pending.` | treatise.astro:155, :282 | Required notice; keep until permission is granted. | provisional; awaiting Jes |
| `Read on, and the heavens turn about the lode-sterre.` | treatise.astro:158 | Framing flourish. Shown only when motion is allowed. "lode-sterre" is Chaucer's word (pole star). | provisional; awaiting Jes |
| `Contents` (nav aria-label) | treatise.astro:161 | Screen-reader only. | provisional; awaiting Jes |
| `The Conclusiouns, as a constellacioun` (contents heading) | treatise.astro:162 | Framing flourish in mock Middle English spelling. | provisional; awaiting Jes |
| `Prologue` / `Part I · § 1` … (contents star labels) | treatise.astro:174 | Generated from `part` and `section`. | provisional; awaiting Jes |
| Contents sub-labels, e.g. `Thyn Astrolabie hath a ring…`, `To knowe the altitude of the…` | treatise.astro:93–96, :176 | First 4–6 words of Skeat's text or rubric, with Part II rubrics lower-cased and an ellipsis added by us. | provisional; awaiting Jes |
| `Show` (toggle legend, screen-reader only) | treatise.astro:186 | | provisional; awaiting Jes |
| `Middle English` / `Both` / `Modern` (toggle) | treatise.astro:188, :190, :192 | | provisional; awaiting Jes |
| Part `aria-label`: `Prologue`, `Part I`, `Part II` | treatise.astro:197 | | provisional; awaiting Jes |
| `PARS PRIMA` / `PARS SECUNDA` (above part headings) | treatise.astro:19–21, :208 | Our Latin, modelled on the Latin rubrics in Skeat. | provisional; awaiting Jes |
| `Part I` / `Part II` (part headings) | treatise.astro:209 | | provisional; awaiting Jes |
| `HERE BIGINNETH THE DESCRIPCION…` / `HERE BIGINNEN THE CONCLUSIONS…` | treatise.astro:15–16, :210 | **Skeat's**, listed only because the page supplies them rather than the collection. | n/a (source text) |
| Sky-window ring legends: `PROLOGUS · LITELL LOWIS MY SONE`, `PARS PRIMA · CAPITULUM I`…, `PARS SECUNDA · CONCLUSIO I`… | treatise.astro:83–85, :226 | Our Latin. "Conclusio" follows Skeat's Latin rubric ("conclusiones"). "Capitulum" for Part I is our choice. | provisional; awaiting Jes |
| `Figure for Prologue` / `Figure for Part II § 1` … (figure aria-label) | treatise.astro:236 | Screen-reader label for each sky window. | provisional; awaiting Jes |
| `The Prologue` / `Part II · § 1` … (section kicker) | treatise.astro:242 | | provisional; awaiting Jes |
| Section titles for sections without a rubric, e.g. `Litell Lowis my sone…`, `Thyn Astrolabie hath a ring…` | treatise.astro:93, :245 | First 4–5 words of Skeat's text plus our ellipsis. Part II titles are Skeat's rubrics, unchanged. | provisional; awaiting Jes |
| `Chaucer` (column tag, aria-hidden) | treatise.astro:256 | | provisional; awaiting Jes |
| `In modern English` (column tag, aria-hidden) | treatise.astro:261 | | provisional; awaiting Jes |
| `Modern rendering — pending` | treatise.astro:267 | Shown only where no modern text exists (none at present). | provisional; awaiting Jes |
| `Explicit` (closing word) | treatise.astro:279 | Conventional Latin end-of-text mark. | provisional; awaiting Jes |
| `Middle English: W. W. Skeat (1894). … Sky drawn for the latitude of Oxford.` (closing credit) | treatise.astro:281–284 | | provisional; awaiting Jes |

## Sky labels (`src/scripts/treatise-sky.ts`)

These are drawn on the canvas. They are historical astrolabe and star-chart
terms rather than prose, but we chose them and their spellings.

| Text | Where | Notes | Status |
|---|---|---|---|
| Constellation names: `URSA MAIOR`, `URSA MINOR`, `CASSIOPEIA`, `PERSEUS`, `CIGNUS`, `LIRA`, `AQUILA`, `LEO`, `GEMINI`, `TAURUS`, `ORION`, `PEGASUS`, `BOOTES`, `CORONA`, `SCORPIUS`, `CANIS MAIOR` | treatise-sky.ts:88–103 | Latin names, with medieval spellings (MAIOR, CIGNUS, LIRA). Hidden under 600px wide and wherever they would land near text. | provisional; awaiting Jes |
| Star names: `Alhabor` (Sirius), `Alramech` (Arcturus), `Wega` (Vega), `Aldeboran` (Aldebaran), `Alhaioth` (Capella), `Azimech` (Spica), `Algomeisa` (Procyon), `Cor Leonis` (Regulus), `Altair`, `Rigel`, `Deneb` | treatise-sky.ts:109–119 | Names as found on medieval astrolabe retes. "Alhabor" is Chaucer's (Part II §3). The others are traditional rete names and are worth a second check. | provisional; awaiting Jes |
| `the lode-sterre` (Polaris) | treatise-sky.ts:120 | Chaucer's word for the pole star. | provisional; awaiting Jes |
| Zodiac signs: `ARIES` … `PISCES` | treatise-sky.ts:124–125 | Latin sign names on the ecliptic band. | provisional; awaiting Jes |
| Plate words: `CENITH`, `ORISONTE OBLIQUE`, `ALMIKANTERAS` | treatise-sky.ts:390, :396, :403 | Chaucer's spellings of zenith, (oblique) horizon and almucantars. "Oblique" as a horizon qualifier is ours. | provisional; awaiting Jes |

## Not on the page

- `public/scenes/night-window.js` and `public/scenes/demo-rete.js` draw no text.

## Change log

- No wording changed in the legibility pass. Lines were only moved or hidden; nothing was reworded.
