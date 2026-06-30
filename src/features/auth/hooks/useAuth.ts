import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/auth";

/**
 * Feature-level wrapper for auth store.
 * useShallow prevents re-renders when unrelated store slices change.
 */
export const useAuth = () => {
  const state = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      token: s.token,
      isHydrated: s.isHydrated,
      isLoading: s.isLoading,
      error: s.error,
      login: s.login,
      register: s.register,
      logout: s.logout,
      clearError: s.clearError,
    })),
  );

  return {
    ...state,
    isAuthenticated: !!state.token,
  };
};
