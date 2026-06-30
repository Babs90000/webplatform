/**
 * Exporte les fichiers d'un projet WebPlatform vers une fixture JSON pour les tests E2E/CI.
 *
 * Usage :
 *   pnpm export:project-fixture -- --project-id=<uuid> --token=<jwt>
 *   pnpm export:all-fixtures
 *
 * Variables d'environnement : voir .env.e2e.example
 */
import { loadE2EEnv } from "./lib/load-env-file";
import {
  exportProjectFixture,
  resolveApiBase,
  resolveAuthToken,
} from "./lib/export-project-fixture-lib";

const parseArgs = (): { projectId: string; out: string } => {
  const args = process.argv.slice(2);
  const read = (flag: string): string | undefined => {
    const entry = args.find((a) => a.startsWith(`${flag}=`));
    return entry?.slice(flag.length + 1);
  };

  const projectId =
    read("--project-id") ?? process.env.E2E_EXPORT_PROJECT_ID ?? "";
  const out =
    read("--out") ??
    process.env.E2E_PROJECT_FIXTURE ??
    "e2e/fixtures/projects/default.json";

  if (!projectId) {
    throw new Error(
      "project-id requis (--project-id= ou E2E_EXPORT_PROJECT_ID)",
    );
  }

  return { projectId, out };
};

const main = async (): Promise<void> => {
  loadE2EEnv();
  const { projectId, out } = parseArgs();
  const apiBase = resolveApiBase();
  const token = await resolveAuthToken(apiBase);

  const validated = await exportProjectFixture({
    projectId,
    token,
    apiBase,
    out,
  });

  console.log(`✓ Fixture exportée : ${out}`);
  console.log(`  Projet : ${validated.project.name} (${validated.project.id})`);
  console.log(`  Fichiers : ${validated.files.length}`);
  validated.files.forEach((file) => {
    console.log(`    - ${file.path} (${file.content.length} car.)`);
  });
};

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
