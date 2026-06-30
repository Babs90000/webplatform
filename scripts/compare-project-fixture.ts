/**
 * Compare une fixture commitée à une export fraîche (ignore exported_at et api_base).
 *
 * Usage :
 *   pnpm compare:project-fixture -- e2e/fixtures/projects/default.json /tmp/default.fresh.json
 */
import fs from "node:fs";
import path from "node:path";
import type { ProjectE2EFixture } from "../e2e/types/project-fixture";
import { projectFixtureSchema } from "../e2e/types/project-fixture";

type NormalizedFixture = Omit<ProjectE2EFixture, "exported_at" | "source"> & {
  source: { project_id: string };
};

const readFixture = (filePath: string): ProjectE2EFixture => {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const raw = JSON.parse(fs.readFileSync(absolute, "utf8")) as unknown;
  return projectFixtureSchema.parse(raw);
};

const normalize = (fixture: ProjectE2EFixture): NormalizedFixture => ({
  version: fixture.version,
  source: { project_id: fixture.source.project_id },
  project: fixture.project,
  files: [...fixture.files].sort((a, b) => a.path.localeCompare(b.path)),
});

const main = (): void => {
  const [committedPath, freshPath] = process.argv.slice(2);

  if (!committedPath || !freshPath) {
    console.error(
      "Usage: pnpm compare:project-fixture -- <committed.json> <fresh.json>",
    );
    process.exit(1);
  }

  const committed = normalize(readFixture(committedPath));
  const fresh = normalize(readFixture(freshPath));

  const committedJson = JSON.stringify(committed, null, 2);
  const freshJson = JSON.stringify(fresh, null, 2);

  if (committedJson === freshJson) {
    console.log("✓ Fixtures identiques (hors exported_at / api_base)");
    return;
  }

  console.error("✗ Dérive détectée entre la fixture commitée et l’export staging");
  console.error(`  Commitée : ${committedPath}`);
  console.error(`  Fraîche  : ${freshPath}`);
  console.error("");
  console.error("Regénérez la fixture puis committez :");
  console.error(`  pnpm export:project-fixture -- --out=${committedPath}`);
  process.exit(1);
};

main();
