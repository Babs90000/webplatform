/** URLs production Coolify (front + API). */
export const PROD_APP_URL = "https://webplatform.kdevs.io";
export const PROD_API_URL = "https://api.webplatform.kdevs.io/api/v1";

export const isProductionTarget = (): boolean =>
  process.env.E2E_TARGET?.trim().toLowerCase() === "production";

export const resolvePlaywrightBaseUrl = (): string => {
  if (isProductionTarget()) {
    return (
      process.env.PLAYWRIGHT_BASE_URL?.trim() ??
      process.env.E2E_PROD_APP_URL?.trim() ??
      PROD_APP_URL
    );
  }
  const port = process.env.PLAYWRIGHT_PORT ?? "3000";
  return process.env.PLAYWRIGHT_BASE_URL?.trim() ?? `http://localhost:${port}`;
};

export const resolveProductionApiUrl = (): string =>
  process.env.E2E_PROD_API_URL?.trim() ??
  process.env.E2E_LIVE_API_URL?.trim() ??
  process.env.E2E_FIXTURE_API_URL?.trim() ??
  process.env.NEXT_PUBLIC_API_URL?.trim() ??
  PROD_API_URL;
