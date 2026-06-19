"use client";

import React from "react";
import styles from "./BillingCard.module.css";
import { Button } from "@/shared/components/Button";
import { Spinner } from "@/shared/components/Spinner";
import type { BillingSubscriptionStatus } from "../../services/billingApi";
import {
  useBillingStatus,
  useCustomerPortal,
  useEarlyCommitment,
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
        <div>
          <h2 id="billing-heading" className={styles.title}>
            Abonnement — 12 €/mois
          </h2>
          <p className={styles.subtitle}>
            {trialDays > 0
              ? `${trialDays} jours d'essai gratuits (studio complet, sans nom de domaine). Vous pouvez vous engager pendant l'essai pour activer votre domaine tout de suite — sans perdre vos jours gratuits. Puis 12 €/mois avec engagement ${minMonths} mois.`
              : `12 €/mois, engagement ${minMonths} mois. Nom de domaine et hébergement inclus.`}
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
          {isTrialing && !domainEligible && (
            <span className={styles.featureNote}> (dès la fin de l&apos;essai ou engagement anticipé)</span>
          )}
          {isTrialing && domainEligible && (
            <span className={styles.featureNote}> (activé)</span>
          )}
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
          {canEarlyCommit && (
            <Button
              onClick={() => earlyCommit.mutate()}
              disabled={isBusy}
            >
              {earlyCommit.isPending
                ? "Activation…"
                : `Activer mon domaine — engagement ${minMonths} mois`}
            </Button>
          )}
          {isSubscribed && subscription?.has_customer && canCancel && (
            <Button
              variant="secondary"
              onClick={() => portal.mutate()}
              disabled={isBusy}
            >
              {portal.isPending
                ? "Ouverture…"
                : isTrialing
                  ? "Gérer / annuler l'essai"
                  : "Gérer mon abonnement"}
            </Button>
          )}
          {isSubscribed && subscription?.has_customer && !canCancel && (
            <p className={styles.meta}>
              Engagement actif jusqu&apos;au {commitmentEnd ?? "—"} ({minMonths}{" "}
              mois minimum
              {hasEarlyCommitment ? "" : " si vous restez après l&apos;essai"}).
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
          {isTrialing ? "Fin de l'essai gratuit" : "Prochaine échéance"} : {periodEnd}
          {isTrialing && !domainEligible && (
            <> · Pas de nom de domaine tant que vous n&apos;êtes pas engagé</>
          )}
          {isTrialing && domainEligible && (
            <> · Essai gratuit maintenu · Domaine activé</>
          )}
          {commitmentEnd && !isTrialing && !canCancel && (
            <> · Engagement jusqu&apos;au {commitmentEnd}</>
          )}
          {commitmentEnd && isTrialing && hasEarlyCommitment && !canCancel && (
            <> · Engagement jusqu&apos;au {commitmentEnd}</>
          )}
          {commitmentEnd && isTrialing && !hasEarlyCommitment && (
            <> · Si vous restez : engagement jusqu&apos;au {commitmentEnd}</>
          )}
        </p>
      )}
    </section>
  );
};
