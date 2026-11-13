# Treatise alignment: Skeat sections ↔ Morrison sections

Generated from `src/content/treatise/*.md` (Skeat, Gutenberg #45027) and
`src/treatise-text/morrison/*.txt` (Morrison's modern rendering, branch only).
Morrison's per-section files were split from his PDF (`pdftotext -layout`, lines
~89–1130) by section number. The split is checked word for word against the
source: the 12,847 words of the region, minus page numbers, the leading 'N.'
and five part-level rubric lines, equal the concatenated files exactly. The
same split reproduces the seven Morrison files of the first slice byte for byte.

## Summary

- Skeat sections: 75 (Prologue 1, Part I 23, Part II 51 including 6 supplementary and 5 spurious).
- Matched to a Morrison section: **64** (Prologue, Part I §1–23, Part II §1–40). Morrison's numbering agrees with Skeat's one-for-one over this range; no merged or split sections were found.
- No Morrison counterpart: **11**. The Morrison file is absent and the page shows its "Modern rendering — pending" placeholder:
  - `p2-41`: Skeat §41 (supplementary)
  - `p2-42`: Skeat §42 (supplementary)
  - `p2-43`: Skeat §43 (supplementary)
  - `p2-44`: Skeat §44 (supplementary)
  - `p2-45`: Skeat §45 (supplementary)
  - `p2-46`: Skeat §46 (supplementary)
  - `p2-41a`: Skeat §41a (spurious)
  - `p2-41b`: Skeat §41b (spurious)
  - `p2-42a`: Skeat §42a (spurious)
  - `p2-43a`: Skeat §43a (spurious)
  - `p2-42b`: Skeat §42b (spurious)
  Morrison says why, after his §40: "Some later editions include six supplementary propositions. They were probably not written by Chaucer and are not included here but are in the original text which follows." (His own Middle English text after that point was not used.)
- Morrison text not placed in any section (part-level rubrics, as in Skeat, which the page renders itself): "The description of your astrolabe begins here.", "This ends the description of the Astrolabe and now begins the uses of the astrolabe." (printed under his §23), "The uses of the astrolabe begin here.", and the note quoted above.
- Headings worded differently (same operation, checked by reading): Part II §17 and §30 (see spot checks), §14 (Morrison quotes Skeat's heading in an (ed.) note).

## Spot checks (read in both texts)

Beyond comparing the opening of every pair (table below), these pairs were read in full in both texts to confirm the same operation and the same ending:

- `p1-04`: Both: the line down the back from the ring, south/meridional line, then north line or line of midnight; both end on the figure.
- `p1-10`: Both: the circle of month names, Julius and Augustus naming their months, the sun no longer in a sign for it. Morrison adds an (ed.) note.
- `p1-17`: Both: the three principal circles of the plate (Cancer, equinoctial, Capricorn) and the winter solstice / tropic.
- `p1-21`: Both: the rete, the zodiac crossing the equinoctial, ending on 'the treatise of the sphere'.
- `p2-05`: Both: setting the sun between two almucantars, then reading the time on the border and the ascendant on the east horizon.
- `p2-12`: Both: the planetary hours, Saturday's first hour to Saturn, the order Saturn to Moon. Morrison adds a long (ed.) note.
- `p2-17`: Same operation (a star's longitude/latitude from its mediation). Morrison's (ed.) says he modified this item considerably; heading reworded.
- `p2-23`: Both: a winter night, a star A over the pole and F under it, halving to find the pole's height. Morrison ends on his (ed.) note about Polaris.
- `p2-25`: Both: latitude as zenith-to-equator distance; noon altitude at the equinox; the fixed-star fallback at the end.
- `p2-30`: Same operation (a planet's distance from the sun's path). Heading differs: Skeat 'altitude of planetes fro the wey of the sonne', Morrison 'latitude of the planets'; Morrison's (ed.) says terms were changed.
- `p2-36`: Both: equation of houses from the 8th unequal hour, ending with the 12th house as nadir of the 6th; Morrison adds a pointer to North.
- `p2-39`: Both: the meridian line and longitudes/latitudes of towns and climates, ending on the latitude of a climate. Morrison condenses the opening.
- `p2-40`: Both: Venus 6° Capricorn 2° north with compass points A and F; Jupiter in Pisces; both end on the unfinished sentence ([thou shall do wel y-now] / Morrison's bracketed note).

## Table

| Skeat slug | Skeat § | Morrison § | Skeat: first 6 words | Morrison: first 6 words | Note |
|---|---|---|---|---|---|
| `00-prologue` | Prologue | Prologue | Litell Lowis my sone, I have | Little Lewis, my son, I see |  |
| `p1-01` | 1 | I.1 | Thyn Astrolabie hath a ring to | Your astrolabe has a ring in |  |
| `p1-02` | 2 | I.2 | This ring renneth in a maner | This ring goes through a kind |  |
| `p1-03` | 3 | I.3 | The Moder of thyn Astrolabie is | The body of your astrolabe, the |  |
| `p1-04` | 4 | I.4 | This moder is devyded on the | (ed. Chaucer describes the back of | spot-checked |
| `p1-05` | 5 | I.5 | Over-thwart this for-seide longe lyne, ther | Another line of the same length |  |
| `p1-06` | 6 | I.6 | The est side of thyn Astrolabie | The east side of your astrolabe |  |
| `p1-07` | 7 | I.7 | Fro this litel + up to | The border is divided into 90 |  |
| `p1-08` | 8 | I.8 | Under the compas of thilke degrees | The names of the twelve signs |  |
| `p1-09` | 9 | I.9 | Next this folweth the Cercle of | Next is the circle of the |  |
| `p1-10` | 10 | I.10 | Next the Cercle of the Dayes, | Next comes the circle of the | spot-checked |
| `p1-11` | 11 | I.11 | Than folwen the names of the | Then follow the names of the |  |
| `p1-12` | 12 | I.12 | Next the forseide Cercle of the | Next to the A, B, C |  |
| `p1-13` | 13 | I.13 | Thanne hastow a brood Rewle, that | You also have a broad rule |  |
| `p1-14` | 14 | I.14 | Thanne is ther a large Pyn, | There is also a large pin, |  |
| `p1-15` | 15 | I.15 | The wombe-side of thyn Astrolabie is | The cavity side or your astrolabe |  |
| `p1-16` | 16 | I.16 | The bordure of which wombe-side is | Each border of each quadrant of |  |
| `p1-17` | 17 | I.17 | The plate under thy riet is | The plate under the rete is | spot-checked |
| `p1-18` | 18 | I.18 | Upon this forseide plate ben compassed | Circles of altitude called almucantars are |  |
| `p1-19` | 19 | I.19 | From this senith, as it semeth, | A type of curved lines, like |  |
| `p1-20` | 20 | I.20 | Next thise azimutz, under the Cercle | Next to the azimuths, under the |  |
| `p1-21` | 21 | I.21 | The Riet of thyn Astrolabie with | The rete of your astrolabe with | spot-checked |
| `p1-22` | 22 | I.22 | Thanne hastow a label, that is | You have a ‘label’ (ed. more |  |
| `p1-23` | 23 | I.23 | Thyn Almury is cleped the Denticle | The almuri is called the tooth |  |
| `p2-01` | 1 | II.1 | TO FYNDE THE DEGREE IN WHICH … / Rekene and knowe which is the | To find the Sun’s longitude for |  |
| `p2-02` | 2 | II.2 | TO KNOWE THE ALTITUDE OF THE … / Put the ring of thyn Astrolabie | To find the altitude of the |  |
| `p2-03` | 3 | II.3 | TO KNOWE EVERY TYME OF THE … / Tak the altitude of the sonne | To find the time of day |  |
| `p2-04` | 4 | II.4 | SPECIAL DECLARACION OF THE ASSENDENT. … / The assendent sothly, as wel in | A special note about the ascendant. |  |
| `p2-05` | 5 | II.5 | TO KNOWE THE VERREY EQUACIOUN OF … / For as moche as the almikanteras | To find the position of the | spot-checked |
| `p2-06` | 6 | II.6 | TO KNOWE THE SPRING OF THE … / Set the nadir of thy sonne | To find daybreak t and the |  |
| `p2-07` | 7 | II.7 | TO KNOWE THE ARCH OF THE … / Set the degree of thy sonne | To find the length of the |  |
| `p2-08` | 8 | II.8 | TO TURN THE HOURES IN-EQUALES IN … / Knowe the nombre of the degrees | To convert unequal hours to equal |  |
| `p2-09` | 9 | II.9 | TO KNOWE THE QUANTITEE OF THE … / Know the quantitee of thy crepusculis, | To find the length of the |  |
| `p2-10` | 10 | II.10 | TO KNOWE THE QUANTITE OF HOURES … / Understond wel, that thise houres in-equales | To find the unequal hour during |  |
| `p2-11` | 11 | II.11 | TO KNOWE THE QUANTITE OF HOURES … / The quantitee of houres equales, that | To find the size of the |  |
| `p2-12` | 12 | II.12 | SPECIAL DECLARACIOUN OF THE HOURES OF … / Understond wel, that evere-mo, fro the | Special explanation of the planetary hours. | spot-checked |
| `p2-13` | 13 | II.13 | TO KNOWE THE ALTITUDE OF THE … / Set the degree of the sonne | To find the Sun’s noon altitude |  |
| `p2-14` | 14 | II.14 | TO KNOWE THE DEGREE OF THE … / Sek bysily with thy rewle the | To find the degree of the |  |
| `p2-15` | 15 | II.15 | TO KNOW WHICH DAY IS LYK … / Loke whiche degrees ben y-lyke fer | To find which days have the |  |
| `p2-16` | 16 | II.16 | THIS CHAPITRE IS A MANER DECLARACIOUN … / Understond wel that thy zodiak is | This chapter explains the following conclusions. |  |
| `p2-17` | 17 | II.17 | TO KNOWE THE VERREY DEGREE OF … / Tak the altitude of this sterre | To find the coordinates of any | spot-checked |
| `p2-18` | 18 | II.18 | TO KNOWE THE DEGREES OF THE … / Set the centre of the sterre | To find the mediation of stars |  |
| `p2-19` | 19 | II.19 | TO KNOWE WITH WHICH DEGREE OF … / Set the centre of the sterre | To find the ecliptic degree that |  |
| `p2-20` | 20 | II.20 | TO KNOWE THE DECLINACIOUN OF ANY … / Set the degree of any signe | To find the declination of any |  |
| `p2-21` | 21 | II.21 | TO KNOWE FOR WHAT LATITUDE IN … / Rikne how manye degrees of almikanteras, | To find the latitude for which |  |
| `p2-22` | 22 | II.22 | TO KNOWE IN SPECIAL THE LATITUDE … / Understond wel, that as fer is | To find the latitude of our |  |
| `p2-23` | 23 | II.23 | TO PROVE EVIDENTLY THE LATITUDE OF … / In some winters night, whan the | To use the previous article to | spot-checked |
| `p2-24` | 24 | II.24 | ANOTHER CONCLUSIOUN TO PROVE THE HEYGHTE … / Tak any sterre fixe that nevere | Another method of finding the altitude |  |
| `p2-25` | 25 | II.25 | A-NOTHER CONCLUSIOUN TO PROVE THE LATITUDE … / Understond wel that the latitude of | Another method of finding the latitude | spot-checked |
| `p2-26` | 26 | II.26 | DECLARACIOUN OF THE ASSENSIOUN OF SIGNES, … / The excellence of the spere solide, | Declaration on the ascension of signs. |  |
| `p2-27` | 27 | II.27 | THIS IS THE CONCLUSIOUN TO KNOWE … / Set the heved of what signe | The conclusion to determining the rising |  |
| `p2-28` | 28 | II.28 | TO KNOWE THE ASSENCIONS OF SIGNES … / Set the heved of the signe | To find the rising time of |  |
| `p2-29` | 29 | II.29 | TO KNOWE IUSTLY THE FOURE QUARTERS … / Take the altitude of thy sonne | The find the four cardinal directions; |  |
| `p2-30` | 30 | II.30 | TO KNOWE THE ALTITUDE OF PLANETES … / Lok whan that a planete is | To find the latitude of the | spot-checked |
| `p2-31` | 31 | II.31 | TO KNOWE THE SENITH OF THE … / Thou most first considere that the | To find the azimuth of the |  |
| `p2-32` | 32 | II.32 | TO KNOWE IN WHICH PARTIE OF … / Considere the tyme of the coniunccion | To find the direction of conjunction |  |
| `p2-33` | 33 | II.33 | TO KNOWE THE SENITH OF THE … / This is no more to seyn | To find the azimuth from the |  |
| `p2-34` | 34 | II.34 | TO KNOWE SOTHLY THE DEGREE OF … / Tak the altitude of the mone, | To find the longitude of the |  |
| `p2-35` | 35 | II.35 | THIS IS THE WORKINGE OF THE … / Tak the altitude of any sterre | The procedure to find if a |  |
| `p2-36` | 36 | II.36 | THE CONCLUSIOUNS OF EQUACIOUNS OF HOUSES, … / Set the by-ginning of the degree | Determining the houses using the astrolabe. | spot-checked |
| `p2-37` | 37 | II.37 | A-NOTHER MANERE OF EQUACIOUNS OF HOUSES … / Tak thyn assendent, and thanne hastow | Another method of determining the houses |  |
| `p2-38` | 38 | II.38 | TO FINDE THE LYNE MERYDIONAL TO … / Tak a rond plate of metal; | To find the meridian line for |  |
| `p2-39` | 39 | II.39 | DESCRIPCION OF THE MERIDIONAL LYNE, OF … / This lyne meridional is but a | Description of the meridian line and | spot-checked |
| `p2-40` | 40 | II.40 | TO KNOWE WITH WHICH DEGREE OF … / Knowe by thyn almenak the degree | To find the degree of the | spot-checked |
| `p2-41` | 41 | — | UMBRA RECTA. … / Yif it so be that thou | — | no counterpart; placeholder shown |
| `p2-42` | 42 | — | UMBRA VERSA. … / Another maner of werkinge, by vmbra | — | no counterpart; placeholder shown |
| `p2-43` | 43 | — | UMBRA RECTA. … / An-other maner of wyrking be umbra | — | no counterpart; placeholder shown |
| `p2-44` | 44 | — | ANOTHER MANER CONCLUSION, TO KNOWE THE … / In this maner shall thou worche: | — | no counterpart; placeholder shown |
| `p2-45` | 45 | — | ANOTHER MANERE TO KNOWE THE MENE … / Whan thou wolt make the mene | — | no counterpart; placeholder shown |
| `p2-46` | 46 | — | FOR TO KNOWE AT WHAT HOURE … / First wite thou certeinly, how that | — | no counterpart; placeholder shown |
| `p2-41a` | 41a | — | UMBRA RECTA. … / Yif thy rewle falle upon the | — | no counterpart; placeholder shown |
| `p2-41b` | 41b | — | UMBRA RECTA. … / An-other maner of werking upon the | — | no counterpart; placeholder shown |
| `p2-42a` | 42a | — | UMBRA VERSA. … / To knowe the heyghth by thy | — | no counterpart; placeholder shown |
| `p2-43a` | 43a | — | AD COGNOSCENDUM ALTITUDINEM ALICUIUS REI PER … / To knowe the heyghte of thinges, | — | no counterpart; placeholder shown |
| `p2-42b` | 42b | — | PER UMBRAM VERSAM. … / Furthermore, yif thou wilt knowe in | — | no counterpart; placeholder shown |
