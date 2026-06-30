"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import {
  clearAuthToken,
  getAuthToken,
  getStoredUser,
  parseAuthSession,
  setAuthToken,
  syncSessionCookie,
} from "@/lib/authToken";
import type { JwtUser } from "@/types";

interface AuthState {
  token: string | null;
  user: JwtUser | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, ref?: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  clearError: () => void;
}

interface AuthResponse {
  token?: string;
  access_token?: string;
  user?: JwtUser;
  data?: { token?: string; user?: JwtUser };
}

/**
 * Persistance unique : localStorage + cookie via `authToken.ts`.
 * (Plus de middleware `persist` zustand pour éviter une double source de
 * vérité en localStorage.)
 */
export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const raw = await api.post<AuthResponse>("/auth/login", { email, password });
      const session = parseAuthSession(raw);
      setAuthToken(session.token, session.user);
      set({ token: session.token, user: session.user, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Échec de la connexion";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (email: string, password: string, name: string, ref?: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const raw = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        name,
        ref,
      });
      const session = parseAuthSession(raw);
      setAuthToken(session.token, session.user);
      set({ token: session.token, user: session.user, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Échec de l'inscription";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: (): void => {
    clearAuthToken();
    set({ token: null, user: null, error: null });
  },

  hydrate: (): void => {
    if (get().isHydrated) return;
    syncSessionCookie();
    set({
      token: getAuthToken() ?? null,
      user: getStoredUser(),
      isHydrated: true,
    });
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
