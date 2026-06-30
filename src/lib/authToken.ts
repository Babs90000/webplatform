import type { JwtUser } from "@/types";

const TOKEN_KEY = "webplatform_token";
const USER_KEY = "webplatform_user";
const COOKIE_MAX_AGE = 604800; // 7 jours

export const AUTH_EXPIRED_EVENT = "webplatform:auth-expired";

const isBrowser = (): boolean => typeof window !== "undefined";

const isSecureContext = (): boolean =>
  isBrowser() && window.location.protocol === "https:";

/** Token JWT lu depuis localStorage (source de vérité pour les appels API). */
export const getAuthToken = (): string | undefined => {
  if (!isBrowser()) return undefined;
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token.length > 0 && token !== "undefined" ? token : undefined;
};

/** Utilisateur sérialisé en localStorage (null si absent ou corrompu). */
export const getStoredUser = (): JwtUser | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JwtUser;
  } catch {
    return null;
  }
};

const buildSessionCookie = (token: string): string => {
  const secure = isSecureContext() ? "; Secure" : "";
  return `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

/** Réécrit le cookie miroir si le token est en localStorage mais pas côté edge. */
export const syncSessionCookie = (): void => {
  if (!isBrowser()) return;
  const token = getAuthToken();
  if (!token) return;

  const hasCookie = document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${TOKEN_KEY}=`));

  if (!hasCookie) {
    document.cookie = buildSessionCookie(token);
  }
};

/**
 * Écrit la session (token + user) dans localStorage + cookie miroir
 * (middleware Next pour les redirections côté serveur).
 */
export const setAuthToken = (token: string, user: JwtUser): void => {
  if (!isBrowser()) return;
  if (!token || token === "undefined") {
    throw new Error("Token de session invalide");
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = buildSessionCookie(token);
};

/** Invalide la session locale (sans appeler l'API). */
export const clearAuthToken = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
};

/** Vrai pour les chemins d'API d'authentification (login/register). */
export const isAuthRoute = (path: string): boolean =>
  path.startsWith("/auth/login") || path.startsWith("/auth/register");

export type AuthSessionPayload = {
  token: string;
  user: JwtUser;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

/** Normalise les réponses API login/register (formats backend variables). */
export const parseAuthSession = (raw: unknown): AuthSessionPayload => {
  if (!isRecord(raw)) {
    throw new Error("Réponse auth invalide");
  }

  const nested = isRecord(raw.data) ? raw.data : null;

  const token =
    readString(raw.token) ??
    readString(raw.access_token) ??
    readString(raw.accessToken) ??
    readString(nested?.token) ??
    readString(nested?.access_token) ??
    readString(nested?.accessToken);

  if (!token) {
    throw new Error("Token absent dans la réponse de connexion");
  }

  const userRaw =
    (isRecord(raw.user) ? raw.user : null) ??
    (nested && isRecord(nested.user) ? nested.user : null);

  const user: JwtUser = {
    id:
      readString(userRaw?.id) ??
      readString(userRaw?.sub) ??
      readString(userRaw?.user_id) ??
      "unknown",
    email: readString(userRaw?.email) ?? "",
    tenant_id:
      readString(userRaw?.tenant_id) ??
      readString(userRaw?.tenantId) ??
      "",
  };

  if (!user.email) {
    throw new Error("Utilisateur absent dans la réponse de connexion");
  }

  return { token, user };
};

/** Redirection post-login fiable (cookie pris en compte par le middleware). */
export const redirectAfterAuth = (targetPath: string): void => {
  if (!isBrowser()) return;
  syncSessionCookie();
  window.location.assign(targetPath);
};

const SAFE_REDIRECT = /^\/(?!\/)[^?#]*$/;

export const resolvePostLoginPath = (redirectParam: string | null): string => {
  if (redirectParam && SAFE_REDIRECT.test(redirectParam)) {
    return redirectParam;
  }
  return "/dashboard";
};
