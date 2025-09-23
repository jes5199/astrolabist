import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    blurb: z.string().optional(),
    pubDate: z.date(),
    imageUrl: z.string().optional(),
    imageAltText: z.string().optional(),
    categories: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
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
  blog
};
