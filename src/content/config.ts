import { defineCollection, z } from 'astro:content';

const ordinance = defineCollection({
  type: 'content',
  schema: z.object({
    article_number: z.string(),
    title: z.string(),
    effective_date: z.string(),
    tags: z.array(z.string()).optional(),
    summary: z.string().optional()
  })
});

const changes = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.string(),
    title: z.string(),
    summary: z.string().optional()
  })
});

export const collections = { ordinance, changes };
