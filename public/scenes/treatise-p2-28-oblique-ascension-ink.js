// A Treatise on the Astrolabe, Part II, 28: "Set the heved of the signe which as thee list to knowe his ascensioun
// up-on the est orisonte, and waite wher thyn almury toucheth the bordure, and set ther a prikke. Turne thanne thy riet
// upward til that the ende of the same signe sitte up-on the est orisonte, and waite eft-sones wher as thyn almury
// toucheth the bordure, and set ther a-nother prikke. Rikne thanne the noumbre of degrees in the bordure by-twixe bothe
// prikkes, and tak ther the assencioun of the signe in the embelif cercle ... every signe by-twixe the heved of
// Capricorne un-to the ende of Geminis aryseth on oure orisonte in lasse than two houres equales ... The signes of right
// assencioun ben fro the heved of Cancer to the ende of Sagittare ... and everich of hem aryseth in more space than in
// two houres."
// Scene contract (astrolabist, src/components/Scene.astro): mount(el) once, then start(el) / stop(el).
//
// v2, A LARGE WINDOW (3:2; 3:4 stacked on a phone), after II 4 v2 (jes tg 17908, 17914, 17917): Chaucer's five steps
// one at a time for Aries (12.3 degrees, 49 minutes: a crooked sign, well under two hours) and then Cancer (38.3, a sovereign sign,
// over two hours), listed beside the instrument, the step being done in red.  Replaces the woodcut v1 of the same name.
// Built by lib/ascension-steps.js (shared with II 27), solved for the plate's 52 degrees; COLOURED WOODCUT on vellum,
// lib/front-ink.js.  Nothing is traced.

import { ascensionScene } from "./lib/ascension-steps.js";

const scene = ascensionScene("oblique");
export const { mount, start, stop, seek } = scene;
