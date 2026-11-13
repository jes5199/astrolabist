# Treatise scene plan

Status: **draft, 2026-11-13.** Jes's direction: "let's build proper scenes! we're going to need more
than we had for the video", built **one by one, from the top**. That means scenes are made in text order,
each finished before the next starts. The order below IS the build order.

Kinds:
- **I**: instrument scene. Gold and silver line work on the night glass, built on `lib/astrolabe-47869.js`.
- **F**: figure scene. Colour miniature with Chaucer, Lewis or others, built on `lib/figures-rig.js` and `lib/figures.js`,
  like the sword.
- **S**: sky scene. The heavens themselves (horizon, stars, sun's path), line work.
- **—**: no scene of its own. The section shares its neighbour's figure or keeps the plain night-sky window.

`Effort` and `Reuses` are astrolabe-video's estimates (astrolabe-video c6d0e50): **1–2 h**, **½ day**, or
**1 day+**. The 1 day+ rows build new library material: #1 held instrument and poses, #31 `lib/sky.js`,
#66 the tower. `lib/plate.js` is lifted out at #19. Rows still to build: **31 × 1–2 h, 21 × ½ day,
7 × 1 day+**, roughly 3–4 weeks of nominal effort. Observed pace so far has run well ahead of these grades. "Done" rows are already on
`treatise/style-nightsky`.

| # | Section | What the scene shows | Kind | Reuses | Effort | Status |
|---|---|---|---|---|---|---|
| 1 | Prologue (opener) | Chaucer gives Lewis the astrolabe "compowned after the latitude of Oxenford"; the boy turns it in his hands *(new poses: Chaucer turned from the desk, Lewis reaching and holding by the ring)* | F | rig, room, 47869 (instrument at small size), I §1's ring swing | 1 day+ | **next** |
| 2 | Prologue (inline, "with this swerd") | Pen raised, its shadow a sword, Envy flees | F | rig, room, Envy | | done |
| 3 | I §1 ring | Instrument hung by its ring from the thumb, swinging to rest | I | | | done (peg for thumb; rig thumb later) |
| 4 | I §2 turet | Ring tipping in the shackle while the body hangs plumb | I | | | done |
| 5 | I §3 moder, plates, rete | Mother, plates and rete drawn apart, going in, turning to face us | I | | | done |
| 6 | I §4 back: meridional line | The back: the line from the ring down to the bottom border, the south line drawn in | I | 47869 back, #3's hanging | 1–2 h | |
| 7 | I §5 east–west line, the little cross | The cross line drawn east to west, the little cross (+) marked | I | 47869 back, #6 | 1–2 h | |
| 8 | I §6 right side and left side | Lewis holds it up facing south: east is the right side, west the left. "Forget not this, Lowis" *(a figure holding it up facing south; one new pose)* | F | rig, 47869, #1's held instrument | ½ day | |
| 9 | I §7 the border, 90 degrees per quarter | The degree scale counting up from the cross to the meridional line | I | 47869 backTiers.degrees | 1–2 h | |
| 10 | I §8 signs of the zodiac | The twelve signs' names appearing round their circle *(names in Latin or English: a ledger question)* | I | 47869 backTiers.signs | 1–2 h | |
| 11 | I §9 circle of days | The 365 days ticking round, with long strokes every five | I | 47869 backTiers.days, calendar | 1–2 h | |
| 12 | I §10 months | Month names in place against their days | I | 47869 backTiers.months | 1–2 h | |
| 13 | I §11 holy days and A B C | Saints' days and the dominical letters *(which saints' days to show: ledger)* | I | 47869 backTiers.saints, letters | ½ day | |
| 14 | I §12 shadow square | The shadow square: umbra recta and umbra versa, its twelve divisions | I | 47869 backSquare | 1–2 h | |
| 15 | I §13 the rule and its sights | The alidade with its two plates and their holes, sunlight passing through both | I | 47869 alidade, #27's sun ray | ½ day | |
| 16 | I §14 pin and "hors" | The pin through the stack, and the little horse-shaped wedge locking it *(the horse wedge is a new small outline)* | I | 47869 rule, #5's exploded stack | ½ day | |
| 17 | I §15 front, four quarters | The front's great cross, four quarters | I | 47869 front, frontRadii | 1–2 h | |
| 18 | I §16 front border | The front border's degrees, and the 24 hour letters | I | 47869 frontRadii, hourLetters | 1–2 h | |
| 19 | I §17 three circles | Tropic of Cancer, equinoctial, Tropic of Capricorn engraved on the plate | I | 47869 plate; lift plate lib | ½ day | |
| 20 | I §18 almucantars | Altitude circles, from the horizon up to the zenith | I | plate | 1–2 h | |
| 21 | I §19 azimuths | Azimuth lines ("like the legs of a spider") from the zenith | I | plate | 1–2 h | |
| 22 | I §20 unequal hours | The twelve hour-lines below the horizon | I | plate | 1–2 h | |
| 23 | I §21 the rete | The rete as a "webbe of a loppe", star pointers named *(star names: ledger)* | I | 47869 rete | 1–2 h | |
| 24 | I §22 the label | The front label, straight, without sights, turning | I | 47869 rule | 1–2 h | |
| 25 | I §23 almury | The almury on the head of Capricorn, as the counter for the border | I | 47869 rete, frontRadii | 1–2 h | |
| 26 | II §1 sun's degree | Rule on 12 March → Aries 1°; 13 December → Capricorn 1° | I | | | done |
| 27 | II §2 sun's altitude | Sighting the sun, 25½° | I | | | done |
| 28 | II §3 time of day / night | Morning X = nine; night by Alhabor | I | | | done |
| 29 | II §4 the ascendant | The degree rising on the east horizon, and its "lord" (astrological note) | I | plate, rete, #28 | ½ day | |
| 30 | II §5 between almucantars | Interpolating the sun's position between two altitude circles | I | plate, #27 | 1–2 h | |
| 31 | II §6 dawn and twilight | The sun's nadir at 18° below the horizon, morning and evening *(builds sky.js)* | S | new sky lib | 1 day+ | |
| 32 | II §7 the artificial day | Sun's degree from east horizon to west, the arc counted | I | plate, rete | ½ day | |
| 33 | II §8 unequal → equal hours | The arc divided by 15 | I | #32 | 1–2 h | |
| 34 | II §9 the vulgar day | Dawn to dusk, both twilights included | S | sky | ½ day | |
| 35 | II §10 unequal hour by day | Unequal hours read from the hour lines | I | plate, #28 | 1–2 h | |
| 36 | II §11 equal hours | Equal hours on the border, 15° each | I | 47869 frontRadii, #28 | 1–2 h | |
| 37 | II §12 planetary hours | The seven planets taking the hours in turn *(seven planet signs)* | S | sky | ½ day | |
| 38 | II §13 meridian altitude | The sun at noon on the meridian line | I | plate, rete | 1–2 h | |
| 39 | II §14 sun's degree by the rete | Finding the sun's degree with the rete for any date | I | #26 | 1–2 h | |
| 40 | II §15 days of equal length | Degrees equidistant from the solstices, paired | I | 47869 calendar, rete | ½ day | |
| 41 | II §16 (explanatory) | The zodiac split into its two halves | — | - | — | |
| 42 | II §17 a star's coordinates | A star off the astrolabe, found by its mediation | S | sky | ½ day | |
| 43 | II §18 mediation of a star | A rete star set on the meridian | I | plate, rete | 1–2 h | |
| 44 | II §19 rising with a star | The ecliptic degree that rises with a fixed star | I | plate, rete | 1–2 h | |
| 45 | II §20 declination | Any degree's distance from the equator | I | plate, rete | 1–2 h | |
| 46 | II §21 latitude of the plate | Reading which latitude the plate was made for | I | plate | 1–2 h | |
| 47 | II §22 latitude of Oxford | The pole's altitude at Oxford | S | sky | ½ day | |
| 48 | II §23 latitude by the pole star | A winter night, sighting the pole star twice *(night lighting for the figures; outdoor dress exists in the film rig)* | F | rig, sky, #27's sighting | 1 day+ | |
| 49 | II §24 by a circumpolar star | A star that never sets, at its highest and lowest | S | sky | 1–2 h | |
| 50 | II §25 latitude another way | Zenith to equator | S | sky | 1–2 h | |
| 51 | II §26 ascension of signs | The solid sphere vs. the astrolabe: signs rising *(a turning solid sphere beside the flat projection)* | S | sky, plate | 1 day+ | |
| 52 | II §27 right ascension | Signs rising in the right circle | I | plate, rete | ½ day | |
| 53 | II §28 oblique ascension | Signs rising in the oblique circle, by region | I | plate, rete | ½ day | |
| 54 | II §29 four directions | The sun's azimuth giving east, west, north, south on the ground *(ground in perspective, outdoor)* | F | rig, sky | 1 day+ | |
| 55 | II §30 planets' latitude | A planet off the ecliptic | S | sky | 1–2 h | |
| 56 | II §31 sunrise azimuth | Where on the horizon the sun rises, season by season | S | sky | ½ day | |
| 57 | II §32 direction of conjunction | Sun and Moon meeting, and its azimuth | S | sky | ½ day | |
| 58 | II §33 azimuth from altitude | Altitude in, azimuth out | I | plate, rete | 1–2 h | |
| 59 | II §34 moon's longitude | Moon on the almucantars | I | plate, rete | ½ day | |
| 60 | II §35 direct or retrograde | A planet stepping back against the stars | S | sky | ½ day | |
| 61 | II §36 the houses | The twelve houses from the ascendant | I | plate, rete | ½ day | |
| 62 | II §37 houses another way | The four angles | I | #61 | 1–2 h | |
| 63 | II §38 meridian line on the ground | A metal plate, a pin, the sun's shadow marking the meridian | F | rig, sky, #54's ground | 1 day+ | |
| 64 | II §39 meridians and longitudes of towns | Cities on their meridians *(town names: ledger)* | S | sky | ½ day | |
| 65 | II §40 rising of a planet | A planet's rising degree | I | plate, rete | 1–2 h | |
| 66 | II §41 height of a tower, umbra recta | Lewis (or Chaucer) sighting a tower top through the rule; the shadow square read *(the tower prop and a sighting pose)* | F | rig, tower (new), 47869 backSquare | 1 day+ | |
| 67 | II §41a, §41b (spurious) | Same tower, other points of the square | — | #66 | — | |
| 68 | II §42 umbra versa | Can't reach the tower's foot: two stations | F | #66 | ½ day | |
| 69 | II §42a, §42b, §43, §43a | Variants of the tower problem | — | #66, #68 | — | |
| 70 | II §44 mean motus, the root | Tables of the planets' motions, worked from a root year *(tables: a page matter, not a scene, unless jes wants one)* | — | - | — | |
| 71 | II §45 Arsechiel's tables | Al-Zarqali's tables *(tables: a page matter, not a scene, unless jes wants one)* | — | - | — | |
| 72 | II §46 houses by the tables | *(tables: a page matter, not a scene, unless jes wants one)* | — | - | — | |

Notes:
- The tower scenes (#66, #68) are the natural figure set-piece of Part II, the treatise's famous height-of-a-tower
  problem. They're spurious or supplementary in Skeat, so placing them late in the order is honest to the text order.
- Every in-scene label goes into `docs/treatise-wording.md` for Jes's approval.
- Original art only. Instrument geometry comes from the constructed 47869 drawing; figures come from the rig.
