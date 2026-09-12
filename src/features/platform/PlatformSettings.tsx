"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import styles from "./PlatformSettings.module.css";
import { AppNavbar } from "@/shared/components/AppNavbar";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { useZodForm } from "@/shared/hooks/useZodForm";
import { ApiError } from "@/lib/api";
import { toast } from "@/store/toast";
import {
  platformApi,
  type ApiKeyRecord,
  type DomainVerifyResponse,
  type PlatformQuotaResponse,
} from "./services/platformApi";

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domaine requis")
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "Domaine invalide"),
});

const keySchema = z.object({
  name: z.string().max(80, "Nom trop long").optional(),
});

type DomainFormData = z.infer<typeof domainSchema>;
type KeyFormData = z.infer<typeof keySchema>;

export const PlatformSettings: React.FC = () => {
  const [quota, setQuota] = useState<PlatformQuotaResponse | null>(null);
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<DomainVerifyResponse | null>(
    null,
  );
  const [creatingKey, setCreatingKey] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const domainForm = useZodForm({
    schema: domainSchema,
    defaultValues: { domain: "" },
  });

  const keyForm = useZodForm({
    schema: keySchema,
    defaultValues: { name: "" },
  });

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [quotaRes, keysRes] = await Promise.all([
        platformApi.getQuota(),
        platformApi.listApiKeys(),
      ]);
      setQuota(quotaRes);
      setKeys(keysRes.keys.filter((k) => !k.revoked_at));
      if (keysRes.warning) {
        toast.error(keysRes.warning);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Impossible de charger les paramètres.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onVerifyDomain = async (data: DomainFormData): Promise<void> => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await platformApi.verifyDomain(data.domain);
      setVerifyResult(res);
      if (res.ok) {
        toast.success("CNAME valide");
      } else {
        toast.error("CNAME non conforme");
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Vérification impossible.";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const onCreateKey = async (data: KeyFormData): Promise<void> => {
    setCreatingKey(true);
    setNewSecret(null);
    try {
      const res = await platformApi.createApiKey(data.name || undefined);
      setNewSecret(res.secret);
      toast.success("Clé API créée — copiez-la maintenant");
      keyForm.reset({ name: "" });
      await load();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Création impossible.";
      toast.error(message);
    } finally {
      setCreatingKey(false);
    }
  };

  const onRevokeKey = async (key: ApiKeyRecord): Promise<void> => {
    if (!window.confirm(`Révoquer la clé « ${key.name} » ?`)) return;
    setRevokingId(key.id);
    try {
      await platformApi.revokeApiKey(key.id);
      toast.success("Clé révoquée");
      await load();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Révocation impossible.";
      toast.error(message);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className={styles.page} data-testid="platform-settings-page">
      <AppNavbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Paramètres</h1>
        <p className={styles.subtitle}>
          Quota, domaines et clés API de votre espace.
        </p>

        <nav className={styles.navLinks} aria-label="Paramètres">
          <Link href="/settings/team" className={styles.navLink}>
            Équipe
          </Link>
          <Link href="/dashboard#billing" className={styles.navLink}>
            Abonnement
          </Link>
        </nav>

        {isLoading && (
          <LoadingPanel variant="inline" message="Chargement des paramètres…" />
        )}

        {loadError && (
          <p className={styles.error}>
            {loadError}{" "}
            <button type="button" className={styles.navLink} onClick={() => void load()}>
              Réessayer
            </button>
          </p>
        )}

        {!isLoading && !loadError && quota && (
          <section className={styles.card} aria-labelledby="quota-heading">
            <h2 id="quota-heading" className={styles.cardTitle}>
              Quota
            </h2>
            <p className={styles.cardHint}>
              Plan <strong>{quota.quota.plan}</strong> — sites actifs et
              consommation LLM du mois.
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Sites</span>
                <span className={styles.statValue}>
                  {quota.quota.sites_count}/{quota.quota.sites_limit}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Création</span>
                <span className={styles.statValue}>
                  {quota.quota.can_create_site ? "Oui" : "Non"}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tokens LLM (mois)</span>
                <span className={styles.statValue}>
                  {quota.llm_tokens_month.toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className={styles.card} aria-labelledby="domain-heading">
          <h2 id="domain-heading" className={styles.cardTitle}>
            Vérifier un domaine
          </h2>
          <p className={styles.cardHint}>
            Contrôlez que le CNAME pointe vers l&apos;hébergement WebPlatform
            avant publication.
          </p>
          <form
            onSubmit={domainForm.handleSubmit(onVerifyDomain)}
            className={styles.formRow}
            noValidate
          >
            <div className={styles.fieldGrow}>
              <Input
                label="Domaine"
                type="text"
                placeholder="www.exemple.com"
                aria-invalid={!!domainForm.formState.errors.domain}
                {...domainForm.register("domain")}
              />
              {domainForm.formState.errors.domain && (
                <span className={styles.fieldError} role="alert">
                  {domainForm.formState.errors.domain.message}
                </span>
              )}
            </div>
            <Button type="submit" size="sm" isLoading={verifying}>
              Vérifier
            </Button>
          </form>

          {verifyResult && (
            <div
              className={`${styles.verifyResult} ${verifyResult.ok ? styles.verifyOk : styles.verifyFail}`}
              role="status"
            >
              <strong>
                {verifyResult.ok ? "CNAME valide" : "CNAME à corriger"} —{" "}
                {verifyResult.domain}
              </strong>
              <ul className={styles.instructions}>
                {verifyResult.instructions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className={styles.card} aria-labelledby="apikeys-heading">
          <h2 id="apikeys-heading" className={styles.cardTitle}>
            Clés API
          </h2>
          <p className={styles.cardHint}>
            Pour intégrations et webhooks. La clé secrète n&apos;est affichée
            qu&apos;une seule fois à la création.
          </p>

          <form
            onSubmit={keyForm.handleSubmit(onCreateKey)}
            className={styles.formRow}
            noValidate
          >
            <div className={styles.fieldGrow}>
              <Input
                label="Nom (optionnel)"
                type="text"
                placeholder="Clé production"
                {...keyForm.register("name")}
              />
            </div>
            <Button type="submit" size="sm" isLoading={creatingKey}>
              Créer
            </Button>
          </form>

          {newSecret && (
            <div className={styles.secretBox} role="status">
              Copiez cette clé maintenant — elle ne sera plus affichée.
              <code className={styles.secretValue}>{newSecret}</code>
            </div>
          )}

          {!isLoading && keys.length === 0 && (
            <p className={styles.empty}>Aucune clé API active.</p>
          )}

          {keys.length > 0 && (
            <ul className={styles.keyList}>
              {keys.map((key) => (
                <li key={key.id} className={styles.keyRow}>
                  <div className={styles.keyMeta}>
                    <div className={styles.keyName}>{key.name}</div>
                    <div className={styles.keyPrefix}>{key.key_prefix}…</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void onRevokeKey(key)}
                    disabled={revokingId === key.id}
                  >
                    {revokingId === key.id ? "…" : "Révoquer"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card} aria-labelledby="platform-ext-heading">
          <h2 id="platform-ext-heading" className={styles.cardTitle}>
            CMS &amp; e-commerce
          </h2>
          <p className={styles.cardHint}>
            APIs disponibles : CMS léger (
            <code>/api/v1/platform/cms/:projectId</code>) et catalogue produits
            Stripe (
            <code>/api/v1/platform/commerce/:projectId/products</code>). Exécutez{" "}
            <code>sql/add_saas_platform.sql</code> sur Supabase pour créer les
            tables.
          </p>
        </section>
      </div>
    </div>
  );
};
