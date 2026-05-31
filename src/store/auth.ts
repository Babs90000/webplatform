"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { api, ApiError } from "@/lib/api";
import {
  clearAuthToken,
  getAuthToken,
  getStoredUser,
  setAuthToken,
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
  token: string;
  user: JwtUser;
}

/**
 * Persistance unique : localStorage + cookie via `authToken.ts`.
 * (Plus de middleware `persist` zustand pour éviter une double source de
 * vérité en localStorage.)
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      token: null,
      user: null,
      isHydrated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post<AuthResponse>("/auth/login", { email, password });
          setAuthToken(data.token, data.user);
          set({ token: data.token, user: data.user, isLoading: false });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Échec de la connexion";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (email: string, password: string, name: string, ref?: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post<AuthResponse>("/auth/register", {
            email,
            password,
            name,
            ref,
          });
          setAuthToken(data.token, data.user);
          set({ token: data.token, user: data.user, isLoading: false });
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
        set({
          token: getAuthToken() ?? null,
          user: getStoredUser(),
          isHydrated: true,
        });
      },

      clearError: (): void => {
        set({ error: null });
      },
    }),
    { name: "AuthStore" },
  ),
);
