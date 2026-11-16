# /treatise/ pages

Jes, tg 17923 (2026-11-14): "performance is quite bad on iphone. we're going to need to break this into pages,
and also unload animations that are not scrolled into view".

## The pages (`src/lib/treatise-pages.ts`)

Jes, tg 17962 (2026-11-15): "i think I want even smaller pages. like one proposition per page".

One page per content entry (75), in reading order:

| URL | Holds |
| --- | --- |
| `/treatise/` | hero, introduction, contents, Prologue |
| `/treatise/part-1/` | Part I § 1, under the Part I heading |
| `/treatise/part-1/<n>/` | Part I § n |
| `/treatise/part-2/` | Part II § 1, under the Part II heading |
| `/treatise/part-2/<n>/` | Part II § n, including the supplementary (41–46) and spurious (41a, 41b, 42a, 42b, 43a) sections |

The URLs of the earlier six-page split (`/treatise/part-2/13/`, `/26/`, `/38/`) are now the pages of their
first sections, so old links still land in the right place. `buildPages` throws if two entries would share a URL.
One route file, `src/pages/treatise/[...page].astro`, renders every page. It renders and glosses only its
own section; the Prologue page also glosses every section once, for the whole-Treatise totals printed in the
build log. Each page carries only the glosses its own section uses.

- Part headings appear on the page of the part's first section. The supplementary and spurious group headings
  appear on the page of their first section, and "HERE ENDETH THE DESCRIPCION" appears on Part I § 23 only.
- The contents list the major divisions and then every section by number, with the current one marked. On
  `/treatise/` they sit under the introduction. On every other page they come after the section and the pager,
  so the proposition is first.
- A pager at the foot of each page links to the previous and next pages. `Explicit` appears only on the last
  page.
- Old single-page links such as `/treatise/#part-2-30` are forwarded by a small inline script, which maps every
  section, part and group id to its page. Unknown hashes stay where they are.
- Every page keeps `noindex` and stays out of the sitemap (the sitemap filter matches `/treatise/`). None is
  linked from the site nav.

## Two columns (Jes tg 17988)

Jes, tg 17988 (2026-11-16): "modern text separate from original text, not woven together. two columns. on mobile
have some way to toggle between two views."

- Each paragraph of a glossed section is a row (`.pr`): Chaucer's words (`.pr-me`, with the glossed words, the ☞
  marks and the figures) and the modern line (`.pr-mod`). The modern line is the one that used to sit under the
  words: `modernOf` takes each ruby's `<rt>`, keeps the text between rubies, and drops the "·" placeholders. The
  `<rt>`s stay in the markup but are hidden.
- The k-th `<span>` of a modern paragraph is the k-th word unit (`ruby.lu`) of its Middle English.
- 1000px and up (Jes tg 17995: "I want the art on prologue to be in the center line"): three columns per row,
  modern | art | Chaucer (tg 18003: "can we put the modern text on the left"), with a faint line down the centre. The page script moves the row's figures out of
  Chaucer's paragraph into the centre cell and sets each one's top level with its ☞ phrase (or its paragraph),
  never above the figure before it (`level()`, run again whenever Chaucer's paragraphs change size, e.g. when a
  web font arrives). The centre cell is a flex column, so the figures' margins never collapse. A large
  step-by-step figure goes above its row at full width instead. With JavaScript off, the figures stay in
  Chaucer's paragraphs.
- Both columns use the same face, size, weight and colour (tg 17995: "both versions the same font
  size/weight/color except for the dictionary stuff"); only the glossed words and the ☞ marks differ. Both
  open with the drop cap. With the `<rt>` hidden the rubies are plain inline text, so the drop cap floats
  beside the first line.
- Below 1000px: one column. A switch fixed at the foot of the screen ("Modern" / "Chaucer") shows one or the other.
  The modern line shows first (tg 18003 put it first on the wide layout); `html.t-meview` shows Chaucer's instead.
  The choice is kept in `localStorage` (`treatise-view`), on that device only. In the modern view the figures that
  sit at a phrase move to the same word unit in the modern paragraph, and come back to their phrase on switching back.
  `__alignPhraseWins` does nothing while `html.t-modview` is set.

## Scenes (`src/components/Scene.astro`)

- A scene mounts within one screen of the viewport and animates only while it is on screen.
- More than three screens away, it is torn down: it is stopped, its stage element is replaced by an empty
  shallow clone, and the poster returns. Scene modules keep their state in WeakMaps keyed by the stage, so the
  state goes with it.
- Coming back near mounts the scene again.

## Sky (`src/scripts/treatise-sky.ts`)

On screens narrower than 600px, the sky canvas renders at 1× device pixels with low-quality haze smoothing. It
is redrawn on every scroll frame, and in the profile it was about 60% of the scroll cost on a throttled phone
proxy.

## Scene filter regions (`src/components/Scene.astro`)

Jes, tg 17934 (iPhone): "scrolling reveals blank sections that take several seconds to fill in, and occasionally
the entire page reloads a the top". The cause, measured in WebKit (Playwright's WPE build, iPhone 13 viewport at
3×): the scenes' woodcut filters (`public/scenes/lib/woodcut.js`, feTurbulence and feDisplacementMap) cover an
800×800-unit region around every part they roughen. WebKit renders SVG filters on the CPU over that whole region
whenever the part changes, and holds buffers that size. On part-1 that meant 2.5–4 GB and frames of tens of
seconds. Chromium accelerates these filters, so the earlier Chromium proxy did not show it.

After a scene mounts, Scene.astro gives each filtered part its own copy of the filter, with the region fitted to
the part's bounding box plus a margin (25% of its larger side, plus 6 units). The noise is laid in user space, so
the drawing inside the region is unchanged: still frames of all 88 scenes are pixel-identical, live against
fitted. Regions only grow. While a scene runs, every 250 ms, any part that has moved or grown past its region
has the region widened. Parts that are empty at mount keep the original region. The scene modules are not
changed (they are copied byte-for-byte from astrolabe-video).

## Running scenes on their own layer, and pre-drawn woodcut parts

Jes, tg 17947: "the paper edge doesn't change during the animation, can't we just pre-calculate it? it could
even be raster". Tg 17950: "the animations themselves were slow". Tg 17952: "still choppy on the spider".

- A running scene's stage has `will-change: transform` (Scene.astro). Its repaints stay in its own layer, so
  the paper leaf beneath is not redrawn every frame.
- `src/scripts/scene-cache.ts`: once a scene has mounted, each outermost woodcut-filtered part is drawn once
  to a bitmap at device resolution, cropped to what can ever be on screen. The bitmap is shown in the part's
  place, and the live part stays hidden in the document. Changes to the part's transform and opacity are
  copied to the bitmap. Any other change to the part puts the live part back for good. Parts with text,
  images or visibility settings stay live.
- The bitmap computes the woodcut filter at its own resolution, so the wobble is a little smoother than the
  live filter when zoomed in (up to 4.7% of a scene's pixels differ at CSS-pixel scale). Jes accepted that
  in tg 17956 ("let's ship it").

Ship 25 (Jes tg 17958: "can we apply that kind of fix everywhere"):

- Pieces inside a part that change (a mark fading, a line being drawn) and text are kept out of the bitmap
  as "live units". They are drawn live under a copy of the part's filter fitted to them alone. The bitmap
  is drawn in two layers, below and above them, so paint order is kept. Unchanging pieces lying between
  live units are drawn live with them.
- Clip paths, masks and patterns inside a part stay visible while the part itself is hidden.
- Parts that are empty at mount are cached once their filter has been fitted. Caching starts two frames
  after mount instead of 0.6 s.
- Coverage on all six pages: 162 of 174 outermost woodcut parts are cached (147 in ship 24). Against ship
  24, animated frames at a fixed clock differ by at most 1.4% of a scene at CSS-pixel scale, and still
  frames by at most 1.94%.

