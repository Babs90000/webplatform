/**
 * Suite E2E contre le frontend + API production (Coolify).
 *
 * Auth automatique (recommandé pour Coolify) :
 *   E2E_FIXTURE_EMAIL + E2E_FIXTURE_PASSWORD
 *   E2E_PROJECT_NAME_HINT=e2e  (ou E2E_LIVE_PROJECT_ID)
 *
 * Auth manuelle :
 *   WEBPLATFORM_TOKEN + E2E_LIVE_PROJECT_ID
 */
import { spawnSync } from "node:child_process";
import {
  prepareE2EProdEnv,
  printE2ESetupHelp,
  PROD_E2E_SPECS,
} from "./lib/prepare-e2e-prod";

export { PROD_E2E_SPECS };

const main = async (): Promise<void> => {
  let prepared;
  try {
    prepared = await prepareE2EProdEnv();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    printE2ESetupHelp();
    process.exit(1);
  }

  const { apiUrl, appUrl, projectId } = prepared;

  console.log("E2E production");
  console.log(`  Frontend : ${appUrl}`);
  console.log(`  API      : ${apiUrl}`);
  console.log(`  Projet   : ${projectId}\n`);

  const userArgs = process.argv.slice(2);
  const specFiles = userArgs.filter((arg) => arg.endsWith(".spec.ts"));
  const specs = specFiles.length > 0 ? specFiles : [...PROD_E2E_SPECS];
  const passthrough = specFiles.length > 0
    ? userArgs.filter((arg) => !arg.endsWith(".spec.ts"))
    : userArgs;

  const result = spawnSync(
    "pnpm",
    ["exec", "playwright", "test", ...specs, "--workers=1", ...passthrough],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        E2E_TARGET: "production",
        E2E_MODE: "live",
        PLAYWRIGHT_SKIP_WEBSERVER: "1",
        PLAYWRIGHT_BASE_URL: appUrl,
        E2E_LIVE_API_URL: apiUrl,
        E2E_PROD_API_URL: apiUrl,
        NEXT_PUBLIC_API_URL: apiUrl,
      },
      shell: true,
    },
  );

  process.exit(result.status ?? 1);
};

main();
