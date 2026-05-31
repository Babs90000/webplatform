import type { JwtUser } from "@/types";

const TOKEN_KEY = "webplatform_token";
const USER_KEY = "webplatform_user";
const COOKIE_MAX_AGE = 604800; // 7 jours

export const AUTH_EXPIRED_EVENT = "webplatform:auth-expired";

/** Token JWT lu depuis localStorage (source de vérité unique pour les appels API). */
export const getAuthToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token.length > 0 ? token : undefined;
};

/** Utilisateur sérialisé en localStorage (null si absent ou corrompu). */
export const getStoredUser = (): JwtUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JwtUser;
  } catch {
    return null;
  }
};

/**
 * Écrit la session (token + user) dans la SEULE source persistée :
 * localStorage + cookie miroir (utilisé par le middleware Next pour les
 * redirections côté serveur).
 */
export const setAuthToken = (token: string, user: JwtUser): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

/** Invalide la session locale (sans appeler l'API). */
export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
};

/** Vrai pour les chemins d'API d'authentification (login/register). */
export const isAuthRoute = (path: string): boolean =>
  path.startsWith("/auth/login") || path.startsWith("/auth/register");
