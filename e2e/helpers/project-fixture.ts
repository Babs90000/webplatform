import fs from "node:fs";
import path from "node:path";
import {
  projectFixtureSchema,
  type ProjectE2EFixture,
} from "../types/project-fixture";

const DEFAULT_FIXTURE_PATH = path.join(
  process.cwd(),
  "e2e/fixtures/projects/default.json",
);

let cachedFixture: ProjectE2EFixture | null = null;

export const resolveFixturePath = (): string => {
  const custom = process.env.E2E_PROJECT_FIXTURE?.trim();
  if (!custom) return DEFAULT_FIXTURE_PATH;
  return path.isAbsolute(custom)
    ? custom
    : path.join(process.cwd(), custom);
};

export const loadProjectFixture = (): ProjectE2EFixture => {
  if (cachedFixture) return cachedFixture;

  const filePath = resolveFixturePath();
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Fixture projet introuvable : ${filePath}. Lancez pnpm export:project-fixture ou vérifiez E2E_PROJECT_FIXTURE.`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  cachedFixture = projectFixtureSchema.parse(raw);
  return cachedFixture;
};

export const resetProjectFixtureCache = (): void => {
  cachedFixture = null;
};

export const getFixtureProjectId = (): string => loadProjectFixture().project.id;

export const getFixtureProjectName = (): string =>
  loadProjectFixture().project.name;

/** Slug pour snapshots multi-fixtures (`default` → chaîne vide). */
export const getFixtureSlug = (): string => {
  const base = path.basename(resolveFixturePath(), ".json");
  return base === "default" ? "" : `-${base}`;
};
