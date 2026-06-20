"use client";

import React from "react";
import { Check } from "lucide-react";
import styles from "./BillingCard.module.css";
import { Button } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import type { BillingSubscriptionStatus } from "../../services/billingApi";
import {
  useBillingStatus,
  useCustomerPortal,
  useEarlyCommitment,
  useSubscriptionCheckout,
} from "../../hooks/useBilling";

const STATUS_LABELS: Record<BillingSubscriptionStatus, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Impayé",
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
  const earlyCommit = useEarlyCommitment();

  const subscription = data?.subscription ?? null;
  const status = subscription?.status ?? null;
  const isSubscribed = status === "active" || status === "trialing";
  const periodEnd = formatDate(subscription?.current_period_end ?? null);
  const commitmentEnd = formatDate(subscription?.commitment_ends_at ?? null);
  const minMonths = data?.min_commitment_months ?? 2;
  const trialDays = data?.trial_days ?? 7;
  const domainEligible = subscription?.domain_eligible ?? false;
  const canEarlyCommit = subscription?.can_early_commit ?? false;
  const canCancel = subscription?.can_cancel ?? false;
  const isTrialing = status === "trialing";
  const hasEarlyCommitment = Boolean(subscription?.early_commitment_at);
  const isBusy =
    checkout.isPending || portal.isPending || earlyCommit.isPending;

  return (
    <section className={styles.card} aria-labelledby="billing-heading">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.priceRow}>
            <h2 id="billing-heading" className={styles.title}>
              Abonnement
            </h2>
            <span className={styles.price}>12 €/mois</span>
          </div>
          <p className={styles.subtitle}>
            {trialDays > 0
              ? `${trialDays} jours d'essai · studio complet · domaine après engagement (${minMonths} mois min.)`
              : `Engagement ${minMonths} mois · domaine et hébergement inclus`}
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
          <Icon icon={Check} size="sm" className={styles.featureIcon} />
          Génération IA illimitée
        </li>
        <li className={styles.feature}>
          <Icon icon={Check} size="sm" className={styles.featureIcon} />
          Édition visuelle + Koala Codeur
        </li>
        <li className={styles.feature}>
          <Icon icon={Check} size="sm" className={styles.featureIcon} />
          <span>
            Domaine & hébergement
            {isTrialing && !domainEligible && (
              <span className={styles.featureNote}> · après essai</span>
            )}
            {isTrialing && domainEligible && (
              <span className={styles.featureNote}> · actif</span>
            )}
          </span>
        </li>
        <li className={styles.feature}>
          <Icon icon={Check} size="sm" className={styles.featureIcon} />
          Support sous 24 h
        </li>
      </ul>

      {isLoading && (
        <LoadingPanel
          variant="inline"
          message="Chargement du statut d'abonnement…"
        />
      )}

      {error && (
        <p className={styles.error}>
          Impossible de charger l&apos;abonnement.{" "}
          <button type="button" className={styles.retryLink} onClick={() => void refetch()}>
            Réessayer
          </button>
        </p>
      )}

      {!isLoading && !error && (
        <div className={styles.actions}>
          {!isSubscribed && (
            <Button
              size="sm"
              onClick={() => checkout.mutate()}
              disabled={isBusy}
              title="12 €/mois après la période d'essai"
            >
              {checkout.isPending ? "Redirection…" : "S'abonner"}
            </Button>
          )}
          {canEarlyCommit && (
            <Button
              size="sm"
              variant="cta"
              onClick={() => earlyCommit.mutate()}
              disabled={isBusy}
              title={`Engagement ${minMonths} mois · activation immédiate du domaine`}
            >
              {earlyCommit.isPending ? "Activation…" : "Activer le domaine"}
            </Button>
          )}
          {isSubscribed && subscription?.has_customer && canCancel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => portal.mutate()}
              disabled={isBusy}
              title={isTrialing ? "Annuler ou modifier l'essai" : "Portail client Stripe"}
            >
              {portal.isPending ? "Ouverture…" : "Gérer"}
            </Button>
          )}
          {status === "past_due" && (
            <Button size="sm" onClick={() => portal.mutate()} disabled={isBusy}>
              {portal.isPending ? "Ouverture…" : "Paiement"}
            </Button>
          )}
        </div>
      )}

      {isSubscribed && subscription?.has_customer && !canCancel && (
        <p className={styles.meta}>
          Engagement jusqu&apos;au {commitmentEnd ?? "—"}
          {!hasEarlyCommitment && isTrialing ? " si vous restez après l'essai" : ""}.
        </p>
      )}

      {periodEnd && isSubscribed && (
        <p className={styles.meta}>
          {isTrialing ? "Fin de l'essai" : "Prochaine échéance"} : {periodEnd}
          {isTrialing && !domainEligible && " · Domaine après engagement"}
          {isTrialing && domainEligible && " · Domaine actif"}
          {commitmentEnd && !isTrialing && !canCancel && (
            <> · Engagement jusqu&apos;au {commitmentEnd}</>
          )}
        </p>
      )}
    </section>
  );
};
