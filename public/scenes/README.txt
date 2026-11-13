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
2026-11-13: treatise-p1-9-days.js lib/back.js treatise-p1-4-meridional.js treatise-p1-5-east-west.js treatise-p1-7-border.js treatise-p1-8-signs.js copied byte-for-byte from astrolabe-video b994c88.
2026-11-13: treatise-p1-10-months.js copied byte-for-byte from astrolabe-video feb358e.
2026-11-13: treatise-p1-11-holy-days.js copied byte-for-byte from astrolabe-video 932aae7.
2026-11-13: treatise-p1-12-shadow-square.js treatise-p1-10-months.js treatise-p2-1-sun-degree.js copied byte-for-byte from astrolabe-video 5369e56.
2026-11-13: treatise-p1-13-rule.js copied byte-for-byte from astrolabe-video e8f2c18.
2026-11-13: back-large.svg copied byte-for-byte from astrolabe-video 2bbde39 (static, no script; shown via <img> in PlateViewer).
2026-11-13: treatise-p1-14-pin-horse.js copied byte-for-byte from astrolabe-video d2c0b6d.
2026-11-13: treatise-p1-15-front-quarters.js lib/front.js copied byte-for-byte from astrolabe-video c20a560.
2026-11-13: treatise-p1-16-front-border.js copied byte-for-byte from astrolabe-video c20a560.
2026-11-13: treatise-p1-17-three-circles.js copied byte-for-byte from astrolabe-video 2766b18.
2026-11-13: treatise-p1-18-almucantars.js copied byte-for-byte from astrolabe-video 876ff9d.
2026-11-13: treatise-p1-19-azimuths.js copied byte-for-byte from astrolabe-video 5ffa27a.
2026-11-13: treatise-p1-20-unequal-hours.js copied byte-for-byte from astrolabe-video e6688c8.
2026-11-13: treatise-p1-21-rete.js copied byte-for-byte from astrolabe-video 349d221.
2026-11-13: treatise-p1-22-label.js copied byte-for-byte from astrolabe-video 1da41a4.
2026-11-13: treatise-p1-23-almury.js copied byte-for-byte from astrolabe-video 9b177af.
2026-11-13: treatise-p2-4-ascendant.js copied byte-for-byte from astrolabe-video e3761ba.
2026-11-13: treatise-p2-5-between.js copied byte-for-byte from astrolabe-video b9d9945.
2026-11-13: treatise-p2-6-twilight.js lib/sky.js copied byte-for-byte from astrolabe-video fcc1e69.
2026-11-13: treatise-p2-7-day-arc.js copied byte-for-byte from astrolabe-video 2c96bc1.
2026-11-13: treatise-p1-17-three-circles.js treatise-p1-14-pin-horse.js copied byte-for-byte from astrolabe-video 2c96bc1.
2026-11-13: treatise-p2-8-equal-hours.js copied byte-for-byte from astrolabe-video 6bbf7cd.
2026-11-13: treatise-p2-9-vulgar-day.js copied byte-for-byte from astrolabe-video 984f843.
2026-11-13: treatise-p2-10-unequal-sum.js copied byte-for-byte from astrolabe-video b1fc953.
2026-11-13: treatise-p2-11-from-sunrise.js treatise-p2-7-day-arc.js treatise-p2-8-equal-hours.js treatise-p2-10-unequal-sum.js copied byte-for-byte from astrolabe-video 0df1b4f.
2026-11-13: treatise-p2-12-planet-hours.js copied byte-for-byte from astrolabe-video 6a3c7c2.
2026-11-13: treatise-p2-13-noon.js copied byte-for-byte from astrolabe-video f18ee01.
2026-11-13: treatise-p2-14-sun-from-noon.js copied byte-for-byte from astrolabe-video 79c0abf.
2026-11-13: treatise-p2-15-equal-days.js copied byte-for-byte from astrolabe-video da8e9df.
2026-11-13: treatise-p2-17-star-place.js copied byte-for-byte from astrolabe-video 3b6d423.
2026-11-13: treatise-p2-18-mediation.js copied byte-for-byte from astrolabe-video b0aa6d2.
2026-11-13: treatise-p2-19-rises-with.js copied byte-for-byte from astrolabe-video 5a73248.
2026-11-13: treatise-p2-20-declination.js copied byte-for-byte from astrolabe-video 6d31e3d.
2026-11-13: treatise-p2-21-plate-latitude.js copied byte-for-byte from astrolabe-video d9c5279.
2026-11-13: treatise-p2-22-oxford.js copied byte-for-byte from astrolabe-video 512e17c.
2026-11-13: treatise-p2-23-pole-star.js copied byte-for-byte from astrolabe-video 4532b23.
2026-11-13: treatise-p2-24-never-sets.js copied byte-for-byte from astrolabe-video 1b2003c.
2026-11-13: treatise-p2-25-latitude-noon.js copied byte-for-byte from astrolabe-video bea40ec.
2026-11-13: treatise-p2-26-right-sphere.js copied byte-for-byte from astrolabe-video 503356d.
2026-11-13: treatise-p2-27-right-ascension.js copied byte-for-byte from astrolabe-video 798773d.
2026-11-13: treatise-p2-28-oblique-ascension.js copied byte-for-byte from astrolabe-video 258e8ed.
2026-11-13: treatise-p2-29-four-quarters.js copied byte-for-byte from astrolabe-video 5dfc993.
2026-11-13: treatise-p2-30-planet-latitude.js copied byte-for-byte from astrolabe-video 308c33b.
2026-11-13: treatise-p2-31-sunrise-azimuth.js copied byte-for-byte from astrolabe-video 1ce3664.
2026-11-13: treatise-p2-31-sunrise-azimuth.js copied byte-for-byte from astrolabe-video 8eec225.
2026-11-13: treatise-p2-32-conjunction.js copied byte-for-byte from astrolabe-video 793a8af.
2026-11-13: treatise-prologue-part-1..5.js copied byte-for-byte from astrolabe-video b688da9 (used by the gloss edition's Prologue five-parts windows).
2026-11-13: treatise-p2-33-quarter.js copied byte-for-byte from astrolabe-video 09f125d.
2026-11-13: treatise-p2-34-moon.js copied byte-for-byte from astrolabe-video f826d30.
2026-11-13: treatise-p2-35-retrograde.js copied byte-for-byte from astrolabe-video ddefaab.
2026-11-13: treatise-p2-38-meridian-line.js copied byte-for-byte from astrolabe-video bfc9f42.
2026-11-13: lib/woodcut.js copied byte-for-byte from astrolabe-video d575ad4.
2026-11-13: treatise-p1-3-mother-rete-ink.js copied byte-for-byte from astrolabe-video d575ad4.
2026-11-13: treatise-p1-14-pin-horse-ink.js copied byte-for-byte from astrolabe-video d575ad4.
2026-11-13: treatise-p2-36-houses-ink.js copied byte-for-byte from astrolabe-video deff733.
2026-11-13: treatise-p2-37-houses-label-ink.js copied byte-for-byte from astrolabe-video 7ec8c51.
2026-11-13: treatise-p2-39-town-meridians.js copied byte-for-byte from astrolabe-video 8bea500.
2026-11-13: treatise-p2-41-tower.js copied byte-for-byte from astrolabe-video ffe3d92.
2026-11-13: treatise-p2-42-two-stations.js copied byte-for-byte from astrolabe-video 1580477.
2026-11-13: lib/woodcut.js lib/front-ink.js lib/back-ink.js treatise-p1-1-ring-ink.js copied byte-for-byte from astrolabe-video 7bfb7b7.
2026-11-13: treatise-p1-2-shackle-ink.js copied byte-for-byte from astrolabe-video 7bfb7b7.
2026-11-13: treatise-p1-3-mother-rete-ink.js copied byte-for-byte from astrolabe-video 7bfb7b7.
2026-11-13: treatise-p1-4-meridional-ink.js copied byte-for-byte from astrolabe-video 7bfb7b7.
2026-11-13: treatise-p1-5-east-west-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-7-border-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-8-signs-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-9-days-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-10-months-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-11-holy-days-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-12-shadow-square-ink.js copied byte-for-byte from astrolabe-video ba5eac8.
2026-11-13: treatise-p1-13-rule-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-14-pin-horse-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-15-front-quarters-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-16-front-border-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-17-three-circles-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-18-almucantars-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-19-azimuths-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-20-unequal-hours-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-21-rete-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-22-label-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p1-23-almury-ink.js copied byte-for-byte from astrolabe-video 730e315.
2026-11-13: treatise-p2-1-sun-degree-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-2-altitude-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-3-time-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-4-ascendant-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-5-between-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-7-day-arc-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-8-equal-hours-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-10-unequal-sum-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-11-from-sunrise-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-13-noon-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-14-sun-from-noon-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-15-equal-days-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-18-mediation-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-19-rises-with-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-20-declination-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-21-plate-latitude-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-27-right-ascension-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-28-oblique-ascension-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-33-quarter-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-34-moon-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-36-houses-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-37-houses-label-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p2-40-planet-rising-ink.js copied byte-for-byte from astrolabe-video 6006a4c.
2026-11-13: treatise-p1-1-ring-back-ink.js copied byte-for-byte from astrolabe-video 30bad16.
2026-11-13: treatise-p2-27-right-ascension-ink.js treatise-p2-28-oblique-ascension-ink.js treatise-p1-22-label-ink.js treatise-p2-7-day-arc-ink.js copied byte-for-byte from astrolabe-video 7346769.
2026-11-13: treatise-p1-3-mother-rete-ink.js copied byte-for-byte from astrolabe-video ac57dfe.
2026-11-13: treatise-prologue-cause-1-ink.js copied byte-for-byte from astrolabe-video eaa552a.
2026-11-13: treatise-prologue-cause-2a-ink.js copied byte-for-byte from astrolabe-video 2cdf3a6.
2026-11-13: treatise-prologue-cause-2b.js copied byte-for-byte from astrolabe-video 9e92aee.
2026-11-13: treatise-prologue-oxford-globe-ink.js copied byte-for-byte from astrolabe-video 5909f79.
2026-11-13: treatise-p1-3-mother-rete-ink.js copied byte-for-byte from astrolabe-video e3a3ac8.
2026-11-13: treatise-prologue-oxford-globe-ink.js copied byte-for-byte from astrolabe-video 563e342.
2026-11-13: lib/map-oldworld-data.js copied byte-for-byte from astrolabe-video 726caae.
2026-11-13: treatise-prologue-languages-ink.js copied byte-for-byte from astrolabe-video 726caae.
2026-11-13: treatise-p1-10-months-ink.js copied byte-for-byte from astrolabe-video d0d931c.
2026-11-13: treatise-prologue-twice-ink.js copied byte-for-byte from astrolabe-video e3709ac.
2026-11-13: treatise-p2-4-ascendant-ink.js copied byte-for-byte from astrolabe-video 4fa4225.
2026-11-13: treatise-p2-3-time-ink.js copied byte-for-byte from astrolabe-video 750342d.
2026-11-13: treatise-p2-7-day-arc-ink.js copied byte-for-byte from astrolabe-video 6d1ef55.
2026-11-13: treatise-p2-2-altitude-ink.js copied byte-for-byte from astrolabe-video 2db245c.
2026-11-13: lib/stage.js treatise-p2-2-altitude-ink.js treatise-p2-3-time-ink.js treatise-p2-7-day-arc-ink.js copied byte-for-byte from astrolabe-video 997da26.
2026-11-13: treatise-p2-12-planet-hours-ink.js copied byte-for-byte from astrolabe-video e83b33c.
2026-11-13: treatise-p2-17-star-place-ink.js copied byte-for-byte from astrolabe-video 4c0e308.
2026-11-13: lib/ascension-steps.js treatise-p2-27-right-ascension-ink.js treatise-p2-28-oblique-ascension-ink.js copied byte-for-byte from astrolabe-video 804e957.
2026-11-13: treatise-p2-26-right-sphere-ink.js copied byte-for-byte from astrolabe-video 9df944e.
2026-11-13: treatise-p2-34-moon-ink.js copied byte-for-byte from astrolabe-video d7a1ece.
2026-11-13: treatise-p2-40-planet-rising-ink.js copied byte-for-byte from astrolabe-video eaa369a.
2026-11-13: treatise-p2-6-twilight-ink.js copied byte-for-byte from astrolabe-video f0e30ce.
2026-11-13: treatise-p2-5-between-ink.js copied byte-for-byte from astrolabe-video b9379a0.
