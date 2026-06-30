import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fixtureManifestSchema } from "../e2e/types/fixture-manifest";

/** @deprecated Préférer pnpm test:e2e (production). Mock local sans API. */
const fixturesDir = path.join(process.cwd(), "e2e/fixtures/projects");
const manifestPath = path.join(fixturesDir, "manifest.json");

if (!fs.existsSync(fixturesDir)) {
  console.error(`Dossier introuvable : ${fixturesDir}`);
  process.exit(1);
}

const manifest = fixtureManifestSchema.parse(
  JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown,
);

console.warn("Mode mock (legacy) — les tests E2E officiels sont en production : pnpm test:e2e\n");
console.log(
  `Fixtures (manifest) : ${manifest.fixtures.map((entry) => entry.file).join(", ")}\n`,
);

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "e2e/all-project-fixtures.spec.ts",
    "--workers=1",
    ...process.argv.slice(2),
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      E2E_MODE: "mock",
    },
    shell: true,
  },
);

process.exit(result.status ?? 1);
