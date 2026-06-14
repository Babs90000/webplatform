"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/store/toast";
import { useRefreshBilling } from "@/features/billing/hooks/useBilling";

/** Affiche un toast après retour Stripe Checkout et nettoie l'URL */
export const useCheckoutReturnToast = (): void => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refreshBilling = useRefreshBilling();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const checkout = searchParams.get("checkout");
    if (!checkout) return;

    handled.current = true;

    if (checkout === "success") {
      toast.success("Paiement réussi — votre abonnement sera actif sous peu.");
      void refreshBilling();
    } else if (checkout === "cancel") {
      toast.info("Paiement annulé.");
    }

    router.replace("/dashboard", { scroll: false });
  }, [searchParams, router, refreshBilling]);
};
