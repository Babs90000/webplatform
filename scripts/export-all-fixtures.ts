/**
 * Exporte toutes les fixtures listées dans e2e/fixtures/projects/manifest.json
 * depuis l'API production (Coolify).
 *
 * Prérequis (.env.e2e.local) :
 *   E2E_PROD_API_URL=https://api.webplatform.kdevs.io/api/v1
 *   WEBPLATFORM_TOKEN=<jwt depuis https://webplatform.kdevs.io/login>
 *   — ou —
 *   E2E_FIXTURE_EMAIL=...  E2E_FIXTURE_PASSWORD=...
 *
 * IDs projet (optionnel si nameHint suffit) :
 *   E2E_DEFAULT_PROJECT_ID, E2E_RESTAURANT_PROJECT_ID, E2E_PORTFOLIO_PROJECT_ID
 *
 * Usage :
 *   pnpm export:all-fixtures
 *   pnpm export:all-fixtures -- --discover
 *   pnpm export:all-fixtures -- --slug=restaurant
 */
import fs from "node:fs";
import path from "node:path";
import {
  fixtureManifestSchema,
  type FixtureManifestEntry,
} from "../e2e/types/fixture-manifest";
import { loadE2EEnv } from "./lib/load-env-file";
import {
  exportProjectFixture,
  findProjectByHint,
  listProjects,
  resolveApiBase,
  resolveAuthToken,
} from "./lib/export-project-fixture-lib";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "e2e/fixtures/projects/manifest.json",
);

const readFlag = (name: string): string | undefined => {
  const entry = process.argv
    .slice(2)
    .find((arg) => arg.startsWith(`--${name}=`));
  return entry?.slice(name.length + 3);
};

const resolveProjectId = (
  entry: FixtureManifestEntry,
  projects: Awaited<ReturnType<typeof listProjects>>,
): string => {
  const fromEnv = process.env[entry.projectIdEnv]?.trim();
  if (fromEnv) return fromEnv;

  if (entry.nameHint) {
    return findProjectByHint(projects, entry.nameHint).id;
  }

  throw new Error(
    `Définissez ${entry.projectIdEnv} ou un nameHint pour ${entry.slug}`,
  );
};

const runDiscover = async (): Promise<void> => {
  const apiBase = resolveApiBase();
  const token = await resolveAuthToken(apiBase);
  const projects = await listProjects(apiBase, token);

  console.log(`API : ${apiBase}`);
  console.log(`Projets (${projects.length}) :\n`);

  if (projects.length === 0) {
    console.log("  (aucun — créez des projets sur production puis relancez)");
    return;
  }

  for (const project of projects) {
    console.log(`  ${project.name}`);
    console.log(`    id   : ${project.id}`);
    console.log(`    slug : ${project.slug}`);
    console.log(`    stat : ${project.status}\n`);
  }

  console.log("Copiez les UUID dans .env.e2e.local (E2E_*_PROJECT_ID).");
};

const runExport = async (): Promise<void> => {
  const onlySlug = readFlag("slug");
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as unknown;
  const manifest = fixtureManifestSchema.parse(raw);

  const entries = onlySlug
    ? manifest.fixtures.filter((entry) => entry.slug === onlySlug)
    : manifest.fixtures;

  if (entries.length === 0) {
    throw new Error(
      onlySlug
        ? `Slug inconnu dans manifest : ${onlySlug}`
        : "Manifest sans entrées",
    );
  }

  const apiBase = resolveApiBase();
  const token = await resolveAuthToken(apiBase);
  const projects = await listProjects(apiBase, token);

  console.log(`API : ${apiBase}`);
  console.log(`Export de ${entries.length} fixture(s)…\n`);

  for (const entry of entries) {
    const projectId = resolveProjectId(entry, projects);
    const out = path.join("e2e/fixtures/projects", entry.file);

    const fixture = await exportProjectFixture({
      projectId,
      token,
      apiBase,
      out,
    });

    console.log(`✓ ${entry.file}`);
    console.log(`  ${entry.label}`);
    console.log(`  ${fixture.project.name} (${fixture.project.id})`);
    console.log(`  ${fixture.files.length} fichier(s)\n`);
  }

  console.log("Prochaine étape : pnpm test:e2e");
  console.log("Smoke studio seul : pnpm test:e2e:smoke");
};

const main = async (): Promise<void> => {
  const loaded = loadE2EEnv();
  if (loaded.length > 0) {
    console.log(`Env chargé : ${loaded.join(", ")}\n`);
  }

  if (process.argv.includes("--discover")) {
    await runDiscover();
    return;
  }

  await runExport();
};

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  console.error("\nAide :");
  console.error("  1. Copiez .env.e2e.example → .env.e2e.local");
  console.error("  2. Remplissez WEBPLATFORM_TOKEN (ou email/mot de passe)");
  console.error("  3. pnpm export:all-fixtures -- --discover");
  console.error("  4. pnpm export:all-fixtures");
  process.exit(1);
});
