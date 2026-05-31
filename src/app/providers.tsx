"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthHydrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.setState({ isHydrated: true });
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.setState({ isHydrated: true });
    });

    return unsub;
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
