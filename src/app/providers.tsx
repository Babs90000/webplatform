"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { AUTH_EXPIRED_EVENT } from "@/lib/authToken";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthHydrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Réinitialise l'état (sans re-nettoyer le stockage : clearAuthToken l'a
    // déjà fait avant d'émettre l'évènement) — évite toute boucle de logout.
    const syncExpiredSession = (): void => {
      useAuthStore.setState({ token: null, user: null });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, syncExpiredSession);

    // Hydratation depuis localStorage (source unique).
    useAuthStore.getState().hydrate();

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, syncExpiredSession);
    };
  }, []);

  return <>{children}</>;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator>{children}</AuthHydrator>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
