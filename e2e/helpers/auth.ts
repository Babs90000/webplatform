import type { Page } from "@playwright/test";
import type { JwtUser } from "@/types";
import { isLiveMode, requireLiveCredentials } from "./e2e-mode";
import { getFixtureProjectId } from "./project-fixture";

export const E2E_ONBOARDING_SESSION_ID = "e2e-onboarding-session";
export const E2E_AUTH_TOKEN = "e2e-test-token";
export const TOKEN_COOKIE = "webplatform_token";
export const USER_STORAGE_KEY = "webplatform_user";

const parseMockUser = (): JwtUser => {
  const raw = process.env.E2E_MOCK_USER_JSON?.trim();
  if (raw) {
    return JSON.parse(raw) as JwtUser;
  }

  return {
    id: process.env.E2E_MOCK_USER_ID?.trim() ?? "e2e-user-id",
    email: process.env.E2E_MOCK_USER_EMAIL?.trim() ?? "e2e@webplatform.test",
    tenant_id: process.env.E2E_MOCK_TENANT_ID?.trim() ?? "e2e-tenant",
  };
};

const parseLiveUser = (token: string): JwtUser => {
  const raw = process.env.E2E_LIVE_USER_JSON?.trim();
  if (raw) {
    return JSON.parse(raw) as JwtUser;
  }

  try {
    const payload = token.split(".")[1];
    if (payload) {
      const decoded = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      ) as { sub?: string; email?: string; tenant_id?: string };
      if (decoded.sub && decoded.email && decoded.tenant_id) {
        return {
          id: decoded.sub,
          email: decoded.email,
          tenant_id: decoded.tenant_id,
        };
      }
    }
  } catch {
    /* JWT non décodable — utilisateur minimal ci-dessous */
  }

  return {
    id: "live-e2e-user",
    email: process.env.E2E_LIVE_USER_EMAIL?.trim() ?? "e2e-live@webplatform.test",
    tenant_id: process.env.E2E_MOCK_TENANT_ID?.trim() ?? "live-tenant",
  };
};

export const getSessionCredentials = (): { token: string; user: JwtUser } => {
  if (isLiveMode()) {
    const { token } = requireLiveCredentials();
    return { token, user: parseLiveUser(token) };
  }
  return { token: E2E_AUTH_TOKEN, user: parseMockUser() };
};

/** @deprecated Préférer getTargetProjectId() depuis e2e-mode.ts */
export const E2E_PROJECT_ID = getFixtureProjectId();

export const injectE2ESession = async (
  page: Page,
  baseURL?: string,
): Promise<void> => {
  const origin = (baseURL ?? "http://localhost:3000").replace(/\/$/, "");
  const { token, user } = getSessionCredentials();
  const isSecure = origin.startsWith("https://");

  await page.context().addCookies([
    {
      name: TOKEN_COOKIE,
      value: token,
      url: `${origin}/`,
      sameSite: "Lax",
      secure: isSecure,
    },
  ]);

  await page.addInitScript(
    ({ sessionToken, sessionUser, tokenKey, userKey, cookieName, secureOrigin }) => {
      localStorage.setItem(tokenKey, sessionToken);
      localStorage.setItem(userKey, JSON.stringify(sessionUser));
      const secureFlag = secureOrigin ? "; Secure" : "";
      document.cookie = `${cookieName}=${sessionToken}; path=/; SameSite=Lax${secureFlag}`;
    },
    {
      sessionToken: token,
      sessionUser: user,
      tokenKey: TOKEN_COOKIE,
      userKey: USER_STORAGE_KEY,
      cookieName: TOKEN_COOKIE,
      secureOrigin: isSecure,
    },
  );
};
