# /treatise/ pages

Jes, tg 17923 (2026-11-14): "performance is quite bad on iphone. we're going to need to break this into pages,
and also unload animations that are not scrolled into view".

## The pages (`src/lib/treatise-pages.ts`)

| URL | Holds |
| --- | --- |
| `/treatise/` | hero, introduction, contents, Prologue |
| `/treatise/part-1/` | Part I §§ 1–23 |
| `/treatise/part-2/` | Part II §§ 1–12 |
| `/treatise/part-2/13/` | Part II §§ 13–25 |
| `/treatise/part-2/26/` | Part II §§ 26–37 |
| `/treatise/part-2/38/` | Part II §§ 38–40, the supplementary propositions, the spurious sections |

The cut points were chosen by measured HTML weight: the single page was 2.28 MB, and the cuts keep each page at
roughly 300–450 KB of sections. One route file, `src/pages/treatise/[...page].astro`, renders every page. Each
page carries only the glosses its own sections use (popover data and the hidden screen-reader descriptions).

- Part headings appear on the page that holds the part's first section, and the contents links go to
  `<page>#<id>`.
- A pager at the foot of each page links to the previous and next pages. `Explicit` appears only on the last
  page.
- Old single-page links such as `/treatise/#part-2-30` are forwarded by a small inline script, which maps every
  section, part and group id to its page. Unknown hashes stay where they are.
- Every page keeps `noindex` and stays out of the sitemap (the sitemap filter matches `/treatise/`). None is
  linked from the site nav.

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
