import { z } from "zod";

export const fixtureManifestEntrySchema = z.object({
  slug: z.string().min(1),
  file: z.string().min(1),
  label: z.string().min(1),
  projectIdEnv: z.string().min(1),
  /** Recherche par nom/slug si projectIdEnv absent (insensible à la casse). */
  nameHint: z.string().min(1).optional(),
});

export const fixtureManifestSchema = z.object({
  version: z.literal(1),
  fixtures: z.array(fixtureManifestEntrySchema).min(1),
});

export type FixtureManifest = z.infer<typeof fixtureManifestSchema>;
export type FixtureManifestEntry = z.infer<typeof fixtureManifestEntrySchema>;
