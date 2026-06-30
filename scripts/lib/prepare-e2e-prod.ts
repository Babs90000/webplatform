/**
 * Prépare WEBPLATFORM_TOKEN et E2E_LIVE_PROJECT_ID avant les tests prod.
 *
 * Priorité token :
 *   1. WEBPLATFORM_TOKEN (déjà défini)
 *   2. E2E_FIXTURE_EMAIL + E2E_FIXTURE_PASSWORD → POST /auth/login
 *
 * Priorité projet :
 *   1. E2E_LIVE_PROJECT_ID (déjà défini)
 *   2. E2E_PROJECT_NAME_HINT → premier projet dont le nom/slug contient le hint
 */
import { loadE2EEnv } from "./load-env-file";
import {
  findProjectByHint,
  listProjects,
  resolveAuthToken,
} from "./export-project-fixture-lib";
import { PROD_API_URL, PROD_APP_URL } from "../../e2e/helpers/production-env";

/** Specs compatibles mode live (pas de fixture mock requise). */
export const PROD_E2E_SPECS = [
  "e2e/app-a11y.spec.ts",
  "e2e/landing.spec.ts",
  "e2e/auth.spec.ts",
  "e2e/dashboard.spec.ts",
  "e2e/onboarding.spec.ts",
  "e2e/live-smoke.spec.ts",
  "e2e/generated-site-preview.spec.ts",
  "e2e/generated-site-a11y.spec.ts",
  "e2e/committee-quality.spec.ts",
  "e2e/studio-drawer.spec.ts",
] as const;

export type PreparedE2EEnv = {
  apiUrl: string;
  appUrl: string;
  token: string;
  projectId: string;
};

export const prepareE2EProdEnv = async (): Promise<PreparedE2EEnv> => {
  loadE2EEnv();

  const apiUrl =
    process.env.E2E_PROD_API_URL?.trim() ??
    process.env.NEXT_PUBLIC_API_URL?.trim() ??
    PROD_API_URL;

  const appUrl =
    process.env.E2E_PROD_APP_URL?.trim() ??
    process.env.PLAYWRIGHT_BASE_URL?.trim() ??
    PROD_APP_URL;

  const token = await resolveAuthToken(apiUrl);

  let projectId = process.env.E2E_LIVE_PROJECT_ID?.trim();
  if (!projectId) {
    const hint = process.env.E2E_PROJECT_NAME_HINT?.trim();
    if (!hint) {
      throw new Error(
        "Projet requis : définissez E2E_LIVE_PROJECT_ID ou E2E_PROJECT_NAME_HINT (ex. « e2e »).",
      );
    }
    const projects = await listProjects(apiUrl, token);
    projectId = findProjectByHint(projects, hint).id;
  }

  process.env.WEBPLATFORM_TOKEN = token;
  process.env.E2E_LIVE_PROJECT_ID = projectId;

  return { apiUrl, appUrl, token, projectId };
};

export const printE2ESetupHelp = (): void => {
  console.error("");
  console.error("Configuration automatisable (Coolify ou .env.e2e.local) :");
  console.error(`  E2E_PROD_APP_URL=${PROD_APP_URL}`);
  console.error(`  E2E_PROD_API_URL=${PROD_API_URL}`);
  console.error("  E2E_FIXTURE_EMAIL=e2e@votredomaine.com");
  console.error("  E2E_FIXTURE_PASSWORD=********");
  console.error("  E2E_PROJECT_NAME_HINT=e2e          # ou E2E_LIVE_PROJECT_ID=<uuid>");
  console.error("");
  console.error("Manuel : WEBPLATFORM_TOKEN + E2E_LIVE_PROJECT_ID depuis le navigateur.");
};
