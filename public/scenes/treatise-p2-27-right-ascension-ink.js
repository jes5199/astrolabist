// A Treatise on the Astrolabe, Part II, 27: "Set the heved of what signe thee liste to knowe his assending in the right
// cercle up-on the lyne meridional; and waite wher thyn almury toucheth the bordure, and set ther a prikke. Turne thanne
// thy riet westward til that the ende of the forseide signe sitte up-on the meridional lyne; and eft-sones waite wher
// thyn almury toucheth the bordure, and set ther another prikke. Rikne thanne the nombre of degrees in the bordure
// by-twixe bothe prikkes, and tak the assencioun of the signe in the right cercle."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone), after II 4 v2 (jes tg 17908, 17914, 17917): Chaucer's five steps
// one at a time for Aries (27.8 degrees of the border, less than its thirty) and then Cancer (32.3, more), listed
// beside the instrument, the step being done in red.  Replaces the woodcut v1 of the same name.  The scene is built by
// lib/ascension-steps.js (shared with II 28); COLOURED WOODCUT on vellum, lib/front-ink.js.  Nothing is traced.

import { ascensionScene } from "./lib/ascension-steps.js";

const scene = ascensionScene("right");
export const { mount, start, stop, seek } = scene;
