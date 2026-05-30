import { useAuthStore } from "@/store/auth";

/**
 * Feature-level wrapper for auth store to isolate store dependency
 */
export const useAuth = () => {
  const { user, token, isHydrated, login, register, logout, isLoading, error, clearError } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated: !!token,
    isHydrated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};
