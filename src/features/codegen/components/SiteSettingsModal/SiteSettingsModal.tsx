"use client";

import React, { useEffect, useState } from "react";
import { Mail, CheckCircle, Server, Info, ExternalLink, Copy, Check } from "lucide-react";
import styles from "./SiteSettingsModal.module.css";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Icon } from "@/shared/components/Icon";
import { projectsApi } from "@/features/projects/services/projectsApi";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialContactEmail?: string;
  onSaved?: () => void;
}

type SmtpProvider = "resend" | "brevo" | "gmail";

interface SmtpConfig {
  label: string;
  free: string;
  url: string;
  steps: string[];
  vars: { name: string; value: string; hint?: string }[];
}

const SMTP_PROVIDERS: Record<SmtpProvider, SmtpConfig> = {
  resend: {
    label: "Resend",
    free: "100 emails/jour gratuit",
    url: "https://resend.com/signup",
    steps: [
      "Créez un compte gratuit sur resend.com",
      "Dans le menu, allez dans « API Keys » → « Create API Key »",
      "Copiez la clé générée (commence par re_…)",
      "Collez-la comme valeur de SMTP_PASS ci-dessous",
    ],
    vars: [
      { name: "SMTP_HOST", value: "smtp.resend.com" },
      { name: "SMTP_PORT", value: "465" },
      { name: "SMTP_USER", value: "resend", hint: "toujours 'resend'" },
      { name: "SMTP_PASS", value: "re_votre_cle_api", hint: "clé copiée à l'étape 3" },
      { name: "SMTP_FROM", value: "no-reply@votredomaine.com", hint: "domaine vérifié dans Resend" },
    ],
  },
  brevo: {
    label: "Brevo",
    free: "300 emails/jour gratuit",
    url: "https://app.brevo.com/account/register",
    steps: [
      "Créez un compte gratuit sur brevo.com",
      "Allez dans « Paramètres » (roue dentée) → « SMTP & API »",
      "La section « Clés SMTP » affiche Login et Password",
      "Copiez Login → SMTP_USER et Password → SMTP_PASS",
    ],
    vars: [
      { name: "SMTP_HOST", value: "smtp-relay.brevo.com" },
      { name: "SMTP_PORT", value: "587" },
      { name: "SMTP_USER", value: "votre-email@brevo.com", hint: "affiché dans SMTP & API" },
      { name: "SMTP_PASS", value: "votre-cle-brevo", hint: "affiché dans SMTP & API" },
      { name: "SMTP_FROM", value: "no-reply@votredomaine.com", hint: "expéditeur validé dans Brevo" },
    ],
  },
  gmail: {
    label: "Gmail",
    free: "Votre compte Google",
    url: "https://myaccount.google.com/apppasswords",
    steps: [
      "Activez la « Validation en 2 étapes » dans votre compte Google",
      "Allez sur myaccount.google.com → Sécurité → Mots de passe des applications",
      "Choisissez « Autre (nom personnalisé) » → tapez « WebPlatform »",
      "Copiez le mot de passe à 16 caractères généré → SMTP_PASS",
    ],
    vars: [
      { name: "SMTP_HOST", value: "smtp.gmail.com" },
      { name: "SMTP_PORT", value: "587" },
      { name: "SMTP_USER", value: "vous@gmail.com", hint: "votre adresse Gmail" },
      { name: "SMTP_PASS", value: "xxxx xxxx xxxx xxxx", hint: "mot de passe app 16 cars" },
      { name: "SMTP_FROM", value: "vous@gmail.com", hint: "même adresse que SMTP_USER" },
    ],
  },
};

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialContactEmail = "",
  onSaved,
}) => {
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [showSmtpGuide, setShowSmtpGuide] = useState(false);
  const [activeProvider, setActiveProvider] = useState<SmtpProvider>("resend");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContactEmail(initialContactEmail);
      setShowSmtpGuide(false);
    }
  }, [isOpen, initialContactEmail]);

  const handleCopy = (varName: string, value: string): void => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 2000);
    });
  };

  if (!isOpen) return null;

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await projectsApi.updateSettings(projectId, {
        contact_email: contactEmail.trim(),
      });
      toast.success("Paramètres enregistrés");
      onSaved?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Échec de l'enregistrement";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Paramètres du site</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fermer">
            ×
          </button>
        </header>

        <div className={styles.body}>
          {/* Section email de contact */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Icon icon={Mail} size="sm" />
              </div>
              <div>
                <div className={styles.sectionTitle}>Formulaire de contact</div>
                <div className={styles.sectionDesc}>
                  Les messages envoyés depuis le site vous seront transmis par email.
                </div>
              </div>
            </div>

            <Input
              label="Email de réception"
              name="contact_email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@mon-entreprise.fr"
            />

            {/* Status indicator */}
            {contactEmail.trim() ? (
              <div className={styles.statusOk}>
                <Icon icon={CheckCircle} size="sm" />
                Les messages seront transmis à <strong>{contactEmail.trim()}</strong>
              </div>
            ) : (
              <div className={styles.statusWarn}>
                <Icon icon={Info} size="sm" />
                Sans email, les messages sont uniquement enregistrés en base de données.
              </div>
            )}
          </div>

          {/* Guide SMTP */}
          <div className={styles.smtpSection}>
            <button
              type="button"
              className={styles.smtpToggle}
              onClick={() => setShowSmtpGuide((v) => !v)}
              aria-expanded={showSmtpGuide}
            >
              <Icon icon={Server} size="sm" />
              <span>Comment configurer l&apos;envoi d&apos;email (SMTP) ?</span>
              <span className={styles.smtpChevron}>{showSmtpGuide ? "▲" : "▼"}</span>
            </button>

            {showSmtpGuide && (
              <div className={styles.smtpGuide}>
                <p className={styles.smtpIntro}>
                  Choisissez un fournisseur, suivez les étapes, puis copiez
                  les variables dans <strong>Coolify → votre app Node → Environment Variables</strong>.
                </p>

                {/* Sélecteur de fournisseur */}
                <div className={styles.providerTabs}>
                  {(Object.keys(SMTP_PROVIDERS) as SmtpProvider[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.providerTab} ${activeProvider === key ? styles.providerTabActive : ""}`}
                      onClick={() => setActiveProvider(key)}
                    >
                      {SMTP_PROVIDERS[key].label}
                      <span className={styles.providerFree}>{SMTP_PROVIDERS[key].free}</span>
                    </button>
                  ))}
                </div>

                {/* Contenu du fournisseur actif */}
                {(() => {
                  const p = SMTP_PROVIDERS[activeProvider];
                  return (
                    <div className={styles.providerContent}>
                      {/* Étapes */}
                      <div className={styles.stepsSection}>
                        <div className={styles.stepsTitle}>Étapes pour obtenir vos identifiants</div>
                        <ol className={styles.stepsList}>
                          {p.steps.map((step, i) => (
                            <li key={i} className={styles.step}>
                              <span className={styles.stepNum}>{i + 1}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.providerCta}
                        >
                          Créer un compte {p.label}
                          <Icon icon={ExternalLink} size="sm" />
                        </a>
                      </div>

                      {/* Variables à copier */}
                      <div className={styles.stepsTitle}>Variables à coller dans Coolify</div>
                      <div className={styles.smtpVars}>
                        {p.vars.map((v) => (
                          <div key={v.name} className={styles.smtpVar}>
                            <code className={styles.varName}>{v.name}</code>
                            <code className={styles.varValue}>{v.value}</code>
                            {v.hint && <span className={styles.varHint}>{v.hint}</span>}
                            <button
                              type="button"
                              className={styles.copyBtn}
                              onClick={() => handleCopy(v.name, v.value)}
                              aria-label={`Copier ${v.name}`}
                              title="Copier la valeur"
                            >
                              <Icon icon={copiedVar === v.name ? Check : Copy} size="sm" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className={styles.smtpNote}>
                  Sans SMTP configuré, les messages sont quand même sauvegardés
                  en base de données → Supabase → Table <code>contact_messages</code>.
                </div>
              </div>
            )}
          </div>

          {/* Tip images */}
          <div className={styles.tip}>
            <strong>Modifier les images du site</strong> — Activez l&apos;édition visuelle
            (icône crayon dans la barre d&apos;outils), puis cliquez directement sur une
            image dans l&apos;aperçu pour la remplacer.
          </div>
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={() => void handleSave()} isLoading={isSaving}>
            Enregistrer
          </Button>
        </footer>
      </div>
    </div>
  );
};
