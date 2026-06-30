import { getFixtureProjectId } from "./project-fixture";

export type E2EMode = "mock" | "live";

export const getE2EMode = (): E2EMode =>
  process.env.E2E_MODE?.trim().toLowerCase() === "live" ? "live" : "mock";

export const isMockMode = (): boolean => getE2EMode() === "mock";

export const isLiveMode = (): boolean => getE2EMode() === "live";

/** ID projet cible : fixture (mock) ou E2E_LIVE_PROJECT_ID (live). */
export const getTargetProjectId = (): string => {
  if (isLiveMode()) {
    const liveId = process.env.E2E_LIVE_PROJECT_ID?.trim();
    if (!liveId) {
      throw new Error(
        "E2E_MODE=live requiert E2E_LIVE_PROJECT_ID (UUID du projet sur l’API réelle).",
      );
    }
    return liveId;
  }
  return getFixtureProjectId();
};

/** URL API pour le frontend en mode live (production Coolify ou local). */
export const getLiveApiBase = (): string => {
  const url =
    process.env.E2E_PROD_API_URL?.trim() ??
    process.env.E2E_LIVE_API_URL?.trim() ??
    process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error(
      "E2E_MODE=live requiert E2E_PROD_API_URL, E2E_LIVE_API_URL ou NEXT_PUBLIC_API_URL.",
    );
  }
  return url.replace(/\/$/, "");
};

export const requireLiveCredentials = (): { token: string } => {
  const token = process.env.WEBPLATFORM_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "E2E_MODE=live requiert WEBPLATFORM_TOKEN (JWT d’un utilisateur de test).",
    );
  }
  return { token };
};
