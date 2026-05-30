"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { JwtUser } from "@/types";

const TOKEN_KEY = "webplatform_token";
const USER_KEY = "webplatform_user";

interface AuthState {
  token: string | null;
  user: JwtUser | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  clearError: () => void;
}

interface AuthResponse {
  token: string;
  user: JwtUser;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<AuthResponse>("/auth/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      // Mirror token in cookie for SSR-aware redirects
      document.cookie = `${TOKEN_KEY}=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (email: string, password: string, name: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        name,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      document.cookie = `${TOKEN_KEY}=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      set({ token: data.token, user: data.user, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
    set({ token: null, user: null, error: null });
  },

  hydrate: (): void => {
    if (get().isHydrated) return;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      const user = userStr ? (JSON.parse(userStr) as JwtUser) : null;
      set({ token, user, isHydrated: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isHydrated: true });
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
