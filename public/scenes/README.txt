Scene modules for /treatise/ (loaded lazily by src/components/Scene.astro).
Contract: export mount(el), start(el), stop(el).

demo-rete.js, night-window.js
  Written for this site. demo-rete is the Prologue's opening window;
  night-window is the default for sections with no scene.

From the astrolabe-video repository (web/scenes/...), copied byte-for-byte:
  treatise-prologue.js         commit ae9749e (inline, at "sleen envye")
  lib/figures-rig.js           commit ae9749e
  lib/figures.js               commit ae9749e
  lib/prologue-data.js         commit ae9749e
  treatise-p1-1-ring.js        commit 5712b02
  treatise-p1-2-shackle.js     commit 5712b02
  treatise-p1-3-mother-rete.js commit 5712b02
  treatise-p2-1-sun-degree.js  commit 96b870a (March and December acts)
  treatise-p2-2-altitude.js    commit e5ff358 (unchanged through 96b870a)
  treatise-p2-3-time.js        commit 35daf72 (morning and night acts; unchanged through 96b870a)
  lib/astrolabe-47869.js       commit 0f3a311 (calendar parameters added; unchanged through 96b870a)

The astrolabe outlines are constructed from Jes's own CC BY reconstruction
drawing of Oxford, History of Science Museum, inv. 47869; the scenes' scales
and projections are computed in the modules. The Prologue's figures, room and
props are astrolabe-video's own drawing, made in code. Regenerate all of
these there, not here.

2026-11-13: treatise-prologue.js, treatise-p2-1-sun-degree.js, treatise-p2-2-altitude.js and
treatise-p2-3-time.js re-copied byte-for-byte from astrolabe-video 3a89640 (larger, haloed labels;
Envy's flight clear of Lewis's hand). Libraries unchanged.
2026-11-13: treatise-p1-1-ring.js, treatise-p1-3-mother-rete.js, treatise-p2-2-altitude.js and
treatise-p2-3-time.js re-copied byte-for-byte from astrolabe-video 6060d72 (instruments ~10% larger).
2026-11-13: treatise-prologue-gift.js and lib/prologue-gift-data.js copied byte-for-byte from astrolabe-video bffc9b4
(the Prologue opener: Chaucer gives Lewis the astrolabe). Prologue's opening window now uses it (was demo-rete).
2026-11-13: treatise-p1-4-meridional.js lib/back.js copied byte-for-byte from astrolabe-video bfe8a43.
2026-11-13: treatise-p1-5-east-west.js copied byte-for-byte from astrolabe-video e80e012.
2026-11-13: treatise-p1-6-right-left.js lib/painted.js lib/figures-rig.js treatise-prologue-gift.js copied byte-for-byte from astrolabe-video 7ab74e2.
2026-11-13: treatise-p1-7-border.js copied byte-for-byte from astrolabe-video 7f49755.
2026-11-13: treatise-p1-8-signs.js copied byte-for-byte from astrolabe-video 2441d5e.
