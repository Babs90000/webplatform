import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  billingApi,
  redirectToPaymentUrl,
} from "../services/billingApi";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export const BILLING_QUERY_KEY = ["billing", "status"] as const;

export const useBillingStatus = () => {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  return useQuery({
    queryKey: BILLING_QUERY_KEY,
    queryFn: billingApi.getStatus,
    enabled: isHydrated && !!token,
    retry: 1,
  });
};

const handleBillingError = (error: unknown, fallback: string): void => {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
};

export const useSubscriptionCheckout = () =>
  useMutation({
    mutationFn: billingApi.createSubscriptionCheckout,
    onSuccess: (data) => redirectToPaymentUrl(data.checkout_url),
    onError: (error) =>
      handleBillingError(error, "Impossible de lancer l'abonnement"),
  });

export const useCustomerPortal = () =>
  useMutation({
    mutationFn: billingApi.createCustomerPortal,
    onSuccess: (data) => redirectToPaymentUrl(data.portal_url),
    onError: (error) =>
      handleBillingError(error, "Impossible d'ouvrir le portail client"),
  });

export const useExportCheckout = (projectId: string) => {
  return useMutation({
    mutationFn: async () => {
      const estimate = await billingApi.estimateExport(projectId);
      const checkout = await billingApi.createExportCheckout(
        projectId,
        estimate.export_id,
      );
      return { estimate, checkout };
    },
    onSuccess: ({ checkout }) => redirectToPaymentUrl(checkout.checkout_url),
    onError: (error) =>
      handleBillingError(error, "Impossible de lancer le paiement export"),
  });
};

export const useRefreshBilling = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
};
