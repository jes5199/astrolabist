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

export const collections = {
  posts,
};
