import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { DashboardContent } from "./DashboardContent";
import { getServerToken, getServerProjects, getServerBilling } from "@/lib/server/dal";
import { BILLING_QUERY_KEY } from "@/features/billing/hooks/useBilling";

/**
 * Server Component : données préchargées côté serveur, HTML complet livré
 * au premier byte. Aucun waterfall client, aucun LoadingPanel visible.
 */
export default async function DashboardPage() {
  const token = await getServerToken();

  // Le middleware gère déjà la redirection — double vérification côté serveur.
  if (!token) {
    redirect("/login?redirect=/dashboard");
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
      },
    },
  });

  // Préchargement parallèle — aucun waterfall réseau.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["projects", "active"],
      queryFn: () => getServerProjects("active"),
    }),
    queryClient.prefetchQuery({
      queryKey: BILLING_QUERY_KEY,
      queryFn: () => getServerBilling(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={null}>
        <DashboardContent />
      </Suspense>
    </HydrationBoundary>
  );
}
