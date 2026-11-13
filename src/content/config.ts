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
  }),
});

export const collections = {
  posts,
  treatise,
};
