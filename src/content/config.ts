import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    blurb: z.string().optional(),
    pubDate: z.date(),
    imageUrl: z.string().optional(),
    imageAltText: z.string().optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    hideHeroImage: z.boolean().optional(),
    next: z
      .object({
        slug: z.string(),
        title: z.string(),
      })
      .optional(),
    previous: z
      .object({
        slug: z.string(),
        title: z.string(),
      })
      .optional(),
  }),
});

// Chaucer, A Treatise on the Astrolabe (Skeat's text). See treatise/_SOURCE.md.
const treatise = defineCollection({
  type: "content",
  schema: z.object({
    order: z.number(),
    part: z.enum(["Prologue", "Part I", "Part II"]),
    section: z.string(),
    heading: z.string().optional(),
    latin: z.string().optional(),
    scene: z.string().optional(),
    modern: z.string().optional(),
    // Skeat's own label for sections outside the main sequence
    // ("SUPPLEMENTARY PROPOSITIONS." / his note on the spurious sections).
    note: z.string().optional(),
    // Skeat's closing Latin colophon, carried by the last section it follows.
    colophon: z.string().optional(),
    // Extra sky windows set into the text: each after the paragraph of the
    // Middle English that contains `after` (the build fails if it is missing).
    inlineScenes: z
      .array(z.object({ name: z.string(), after: z.string(), label: z.string() }))
      .optional(),
    saintsTable: z.boolean().optional(),
    plates: z
      .array(z.object({ src: z.string(), button: z.string(), title: z.string(), caption: z.string().optional(), width: z.number(), height: z.number() }))
      .optional(),
  }),
});

export const collections = {
  posts,
  treatise,
};
