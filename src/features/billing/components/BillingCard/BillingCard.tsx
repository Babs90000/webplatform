"use client";

import React from "react";
import styles from "./BillingCard.module.css";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";
import type { BillingSubscriptionStatus } from "../../services/billingApi";
import {
  useBillingStatus,
  useCustomerPortal,
  useSubscriptionCheckout,
} from "../../hooks/useBilling";

const STATUS_LABELS: Record<BillingSubscriptionStatus, string> = {
  active: "Actif",
  trialing: "Essai gratuit",
  past_due: "Paiement en retard",
  canceled: "Résilié",
};

const badgeClass = (status: BillingSubscriptionStatus | null): string => {
  if (!status) return styles.badgeInactive;
  if (status === "active") return styles.badgeActive;
  if (status === "trialing") return styles.badgeTrial;
  if (status === "past_due") return styles.badgeWarning;
  return styles.badgeInactive;
};

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const BillingCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useBillingStatus();
  const checkout = useSubscriptionCheckout();
  const portal = useCustomerPortal();

  const subscription = data?.subscription ?? null;
  const status = subscription?.status ?? null;
  const isSubscribed = status === "active" || status === "trialing";
  const periodEnd = formatDate(subscription?.current_period_end ?? null);
  const commitmentEnd = formatDate(subscription?.commitment_ends_at ?? null);
  const minMonths = data?.min_commitment_months ?? 2;
  const canCancel = subscription?.can_cancel ?? false;
  const isBusy = checkout.isPending || portal.isPending;

  return (
    <section className={styles.card} aria-labelledby="billing-heading">
      <div className={styles.header}>
        <div>
          <h2 id="billing-heading" className={styles.title}>
            Abonnement — 12 €/mois
          </h2>
          <p className={styles.subtitle}>
            Nom de domaine, hébergement et support inclus. Engagement minimum{" "}
            {minMonths} mois — facturation dès le premier mois.
          </p>
        </div>
        {status && (
          <span className={`${styles.badge} ${badgeClass(status)}`}>
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      <ul className={styles.features}>
        <li className={styles.feature}>
          <span className={styles.featureIcon} aria-hidden="true">✓</span>
          Génération IA illimitée
        </li>
        <li className={styles.feature}>
          <span className={styles.featureIcon} aria-hidden="true">✓</span>
          Édition visuelle + KoalaCoder
        </li>
        <li className={styles.feature}>
          <span className={styles.featureIcon} aria-hidden="true">✓</span>
          Nom de domaine & hébergement
        </li>
        <li className={styles.feature}>
          <span className={styles.featureIcon} aria-hidden="true">✓</span>
          Support sous 24 h
        </li>
      </ul>

      {isLoading && (
        <p className={styles.loading}>
          <Spinner size="sm" /> Chargement du statut…
        </p>
      )}

      {error && (
        <p className={styles.error}>
          Impossible de charger l&apos;abonnement.{" "}
          <button type="button" onClick={() => void refetch()}>
            Réessayer
          </button>
        </p>
      )}

      {!isLoading && !error && (
        <div className={styles.actions}>
          {!isSubscribed && (
            <Button
              onClick={() => checkout.mutate()}
              disabled={isBusy}
            >
              {checkout.isPending ? "Redirection…" : "S'abonner — 12 €/mois"}
            </Button>
          )}
          {isSubscribed && subscription?.has_customer && canCancel && (
            <Button
              variant="secondary"
              onClick={() => portal.mutate()}
              disabled={isBusy}
            >
              {portal.isPending ? "Ouverture…" : "Gérer mon abonnement"}
            </Button>
          )}
          {isSubscribed && subscription?.has_customer && !canCancel && (
            <p className={styles.meta}>
              Résiliation possible à partir du {commitmentEnd ?? "—"} (engagement{" "}
              {minMonths} mois).
            </p>
          )}
          {status === "past_due" && (
            <Button onClick={() => portal.mutate()} disabled={isBusy}>
              Mettre à jour le paiement
            </Button>
          )}
        </div>
      )}

      {periodEnd && isSubscribed && (
        <p className={styles.meta}>
          Prochaine échéance : {periodEnd}
          {commitmentEnd && !canCancel && (
            <> · Engagement jusqu&apos;au {commitmentEnd}</>
          )}
        </p>
      )}
    </section>
  );
};
