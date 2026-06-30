import { defineConfig } from "@playwright/test";
import { MOCK_API_ORIGIN } from "./e2e/helpers/constants";
import {
  isProductionTarget,
  resolvePlaywrightBaseUrl,
  resolveProductionApiUrl,
} from "./e2e/helpers/production-env";

const baseURL = resolvePlaywrightBaseUrl();
const isLiveMode = process.env.E2E_MODE?.trim().toLowerCase() === "live";
const skipWebServer = isProductionTarget() || process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

const resolveApiUrlForWebServer = (): string => {
  if (isLiveMode || isProductionTarget()) {
    return resolveProductionApiUrl().replace(/\/$/, "");
  }
  return `${MOCK_API_ORIGIN}/api/v1`;
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
    ...(process.env.CI ? ([["github"]] as const) : []),
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  outputDir: "test-results/e2e",
  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: "pnpm dev",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            NEXT_PUBLIC_API_URL: resolveApiUrlForWebServer(),
          },
        },
      }),
  projects: [
    {
      name: "mobile",
      use: {
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
