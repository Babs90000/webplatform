import { z } from "zod";

export const projectFixtureFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const projectFixtureSchema = z.object({
  version: z.literal(1),
  exported_at: z.string().min(1),
  source: z.object({
    api_base: z.string().url(),
    project_id: z.string().min(1),
  }),
  project: z.object({
    id: z.string().min(1),
    tenant_id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    subdomain: z.string().nullable().optional(),
    custom_domain: z.string().nullable().optional(),
    status: z.enum(["draft", "published", "archived"]),
    published_url: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  files: z.array(projectFixtureFileSchema).min(1),
});

export type ProjectE2EFixture = z.infer<typeof projectFixtureSchema>;
export type ProjectFixtureFile = z.infer<typeof projectFixtureFileSchema>;
