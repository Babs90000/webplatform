"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  CheckCircle,
  Server,
  Info,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  Zap,
} from "lucide-react";
import styles from "./SiteSettingsModal.module.css";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Icon } from "@/shared/components/Icon";
import { projectsApi } from "@/features/projects/services/projectsApi";
import { toast } from "@/store/toast";
import { ApiError } from "@/lib/api";
import type { ProjectSettings } from "@/types";

interface SiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialSettings?: ProjectSettings | null;
  onSaved?: () => void;
}

type SmtpProvider = "gmail" | "outlook" | "custom";

interface SmtpPreset {
  label: string;
  subtitle: string;
  url: string;
  ctaLabel: string;
  steps: string[];
  host: string;
  port: number;
  secure: boolean;
  userHint: string;
  passHint: string;
  fromHint: string;
}

const SMTP_PRESETS: Record<SmtpProvider, SmtpPreset> = {
  gmail: {
    label: "Gmail",
    subtitle: "Compte Google / Workspace",
    url: "https://myaccount.google.com/apppasswords",
    ctaLabel: "Ouvrir les mots de passe d'applications",
    steps: [
      "Activez la validation en 2 étapes sur votre compte Google (obligatoire).",
      "Ouvrez myaccount.google.com → Sécurité → Mots de passe des applications.",
      "Choisissez « Autre (nom personnalisé) », tapez « WebPlatform », validez.",
      "Copiez le mot de passe à 16 caractères (sans espaces) dans le champ Mot de passe ci-dessous.",
      "Identifiant et expéditeur = votre adresse Gmail (ex. vous@gmail.com).",
    ],
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    userHint: "vous@gmail.com",
    passHint: "mot de passe d'application 16 caractères",
    fromHint: "vous@gmail.com",
  },
  outlook: {
    label: "Outlook",
    subtitle: "Hotmail / Outlook.com / Microsoft 365",
    url: "https://account.live.com/proofs/EnableTfa",
    ctaLabel: "Sécurité du compte Microsoft",
    steps: [
      "Activez la validation en deux étapes sur votre compte Microsoft.",
      "Créez un mot de passe d'application (Sécurité → Options de sécurité avancées).",
      "Serveur : smtp.office365.com, port 587 (STARTTLS).",
      "Identifiant = votre adresse Outlook / Microsoft 365 complète.",
      "Mot de passe = le mot de passe d'application (pas celui de connexion web).",
    ],
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    userHint: "vous@outlook.com",
    passHint: "mot de passe d'application Microsoft",
    fromHint: "vous@outlook.com",
  },
  custom: {
    label: "Domaine perso",
    subtitle: "OVH, IONOS, Infomaniak, cPanel…",
    url: "https://www.google.com/search?q=param%C3%A8tres+SMTP+messagerie+professionnelle",
    ctaLabel: "Chercher les paramètres SMTP de mon hébergeur",
    steps: [
      "Connectez-vous à l'espace client de votre hébergeur mail (OVH, IONOS, Infomaniak, etc.).",
      "Créez ou ouvrez la boîte mail liée à votre domaine (ex. contact@votredomaine.fr).",
      "Repérez la section « Paramètres SMTP / clients mail » : hôte, port (souvent 587 ou 465), identifiant.",
      "Identifiant = généralement l'adresse email complète. Mot de passe = celui de la boîte mail.",
      "Port 587 → laissez SSL/TLS décoché. Port 465 → cochez SSL/TLS.",
      "Expéditeur = une adresse autorisée sur ce serveur (souvent la même que l'identifiant).",
    ],
    host: "mail.votredomaine.fr",
    port: 587,
    secure: false,
    userHint: "contact@votredomaine.fr",
    passHint: "mot de passe de la boîte mail",
    fromHint: "contact@votredomaine.fr",
  },
};

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialSettings = null,
  onSaved,
}) => {
  const [contactEmail, setContactEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [activeProvider, setActiveProvider] = useState<SmtpProvider>("gmail");

  useEffect(() => {
    if (!isOpen) return;
    const s = initialSettings ?? {};
    setContactEmail(s.contact_email ?? "");
    setSmtpHost(s.smtp_host ?? "");
    setSmtpPort(String(s.smtp_port ?? 587));
    setSmtpUser(s.smtp_user ?? "");
    setSmtpPass("");
    setSmtpFrom(s.smtp_from ?? "");
    setSmtpSecure(s.smtp_secure === true || s.smtp_port === 465);
    setSmtpConfigured(s.smtp_configured === true);
    setShowGuide(!s.smtp_configured);
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const applyPreset = (key: SmtpProvider): void => {
    const p = SMTP_PRESETS[key];
    setActiveProvider(key);
    setSmtpHost(p.host);
    setSmtpPort(String(p.port));
    setSmtpSecure(p.secure);
    toast.success(
      `Serveur ${p.label} prérempli — complétez identifiant et mot de passe.`,
    );
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const port = Number.parseInt(smtpPort.trim(), 10);
      await projectsApi.updateSettings(projectId, {
        contact_email: contactEmail.trim(),
        smtp_host: smtpHost.trim(),
        smtp_port: Number.isFinite(port) ? port : 587,
        smtp_user: smtpUser.trim(),
        smtp_pass: smtpPass.trim() || undefined,
        smtp_from: smtpFrom.trim() || undefined,
        smtp_secure: smtpSecure || port === 465,
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

  const handleTest = async (): Promise<void> => {
    setIsTesting(true);
    try {
      const port = Number.parseInt(smtpPort.trim(), 10);
      await projectsApi.testSmtp(projectId, {
        smtp_host: smtpHost.trim() || undefined,
        smtp_port: Number.isFinite(port) ? port : undefined,
        smtp_user: smtpUser.trim() || undefined,
        smtp_pass: smtpPass.trim() || undefined,
        smtp_from: smtpFrom.trim() || undefined,
        smtp_secure: smtpSecure,
      });
      toast.success("Connexion SMTP réussie");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Test SMTP échoué";
      toast.error(message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearSmtp = async (): Promise<void> => {
    setIsClearing(true);
    try {
      await projectsApi.updateSettings(projectId, {
        contact_email: contactEmail.trim(),
        clear_smtp: true,
      });
      setSmtpHost("");
      setSmtpPort("587");
      setSmtpUser("");
      setSmtpPass("");
      setSmtpFrom("");
      setSmtpSecure(false);
      setSmtpConfigured(false);
      toast.success("Configuration SMTP effacée");
      onSaved?.();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Impossible d'effacer le SMTP";
      toast.error(message);
    } finally {
      setIsClearing(false);
    }
  };

  const preset = SMTP_PRESETS[activeProvider];
  const busy = isSaving || isTesting || isClearing;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-settings-title"
      >
        <header className={styles.header}>
          <h3 id="site-settings-title" className={styles.title}>
            Paramètres du site
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          {/* Email de réception */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Icon icon={Mail} size="sm" />
              </div>
              <div>
                <div className={styles.sectionTitle}>Formulaire de contact</div>
                <div className={styles.sectionDesc}>
                  Les messages envoyés depuis le site vous seront transmis par
                  email.
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

            {contactEmail.trim() ? (
              <div className={styles.statusOk}>
                <Icon icon={CheckCircle} size="sm" />
                Les messages seront transmis à{" "}
                <strong>{contactEmail.trim()}</strong>
              </div>
            ) : (
              <div className={styles.statusWarn}>
                <Icon icon={Info} size="sm" />
                Sans email, les messages sont uniquement enregistrés en base.
              </div>
            )}
          </div>

          {/* SMTP */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Icon icon={Server} size="sm" />
              </div>
              <div>
                <div className={styles.sectionTitle}>Envoi d&apos;emails (SMTP)</div>
                <div className={styles.sectionDesc}>
                  Configurez votre boîte mail ici — aucune variable serveur à
                  toucher.
                </div>
              </div>
            </div>

            {smtpConfigured ? (
              <div className={styles.statusOk}>
                <Icon icon={CheckCircle} size="sm" />
                SMTP configuré
                {smtpHost ? (
                  <>
                    {" "}
                    (<strong>{smtpHost}</strong>
                  </>
                ) : null}
              </div>
            ) : (
              <div className={styles.statusWarn}>
                <Icon icon={Info} size="sm" />
                Sans SMTP, les messages restent sauvegardés mais ne sont pas
                envoyés par email.
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <Input
                  label="Serveur SMTP (hôte)"
                  name="smtp_host"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
                <Input
                  label="Port"
                  name="smtp_port"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => {
                    setSmtpPort(e.target.value);
                    if (e.target.value === "465") setSmtpSecure(true);
                    if (e.target.value === "587") setSmtpSecure(false);
                  }}
                  placeholder="587"
                />
              </div>

              <Input
                label="Identifiant"
                name="smtp_user"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="vous@gmail.com"
                autoComplete="off"
              />

              <Input
                label="Mot de passe"
                name="smtp_pass"
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder={
                  smtpConfigured
                    ? "Laisser vide pour conserver le mot de passe actuel"
                    : "Mot de passe ou mot de passe d'application"
                }
                autoComplete="new-password"
              />

              <Input
                label="Adresse d'expédition (From)"
                name="smtp_from"
                type="email"
                value={smtpFrom}
                onChange={(e) => setSmtpFrom(e.target.value)}
                placeholder="no-reply@mon-entreprise.fr"
              />

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                />
                Connexion SSL/TLS directe (port 465)
              </label>
            </div>

            <div className={styles.smtpActions}>
              <Button
                variant="secondary"
                onClick={() => void handleTest()}
                isLoading={isTesting}
                disabled={busy}
              >
                <Icon icon={Zap} size="sm" />
                Tester la connexion
              </Button>
              {smtpConfigured && (
                <Button
                  variant="secondary"
                  onClick={() => void handleClearSmtp()}
                  isLoading={isClearing}
                  disabled={busy}
                >
                  <Icon icon={Trash2} size="sm" />
                  Effacer le SMTP
                </Button>
              )}
            </div>
          </div>

          {/* Guide */}
          <div className={styles.smtpSection}>
            <button
              type="button"
              className={styles.smtpToggle}
              onClick={() => setShowGuide((v) => !v)}
              aria-expanded={showGuide}
            >
              <Icon icon={Info} size="sm" />
              <span>Tutoriel : configurer Gmail, Outlook ou un domaine perso</span>
              <span className={styles.smtpChevron}>
                {showGuide ? "▲" : "▼"}
              </span>
            </button>

            {showGuide && (
              <div className={styles.smtpGuide}>
                <p className={styles.smtpIntro}>
                  Choisissez votre boîte mail, suivez les étapes, puis cliquez
                  sur <strong>Préremplir le formulaire</strong> pour reporter
                  hôte et port. Complétez ensuite identifiant et mot de passe,
                  testez, et enregistrez.
                </p>

                <div className={styles.providerTabs} role="tablist">
                  {(Object.keys(SMTP_PRESETS) as SmtpProvider[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeProvider === key}
                      className={`${styles.providerTab} ${
                        activeProvider === key ? styles.providerTabActive : ""
                      }`}
                      onClick={() => setActiveProvider(key)}
                    >
                      {SMTP_PRESETS[key].label}
                      <span className={styles.providerFree}>
                        {SMTP_PRESETS[key].subtitle}
                      </span>
                    </button>
                  ))}
                </div>

                <div className={styles.providerContent}>
                  <div className={styles.stepsSection}>
                    <div className={styles.stepsTitle}>
                      Étapes — {preset.label}
                    </div>
                    <ol className={styles.stepsList}>
                      {preset.steps.map((step, i) => (
                        <li key={i} className={styles.step}>
                          <span className={styles.stepNum}>{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>

                    <div className={styles.guideActions}>
                      <button
                        type="button"
                        className={styles.applyPresetBtn}
                        onClick={() => applyPreset(activeProvider)}
                      >
                        Préremplir le formulaire ({preset.host}:{preset.port})
                      </button>
                      <a
                        href={preset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.providerCta}
                      >
                        {preset.ctaLabel}
                        <Icon icon={ExternalLink} size="sm" />
                      </a>
                    </div>
                  </div>

                  <div className={styles.presetHints}>
                    <div className={styles.stepsTitle}>Valeurs typiques</div>
                    <ul className={styles.hintList}>
                      <li>
                        <span>Hôte</span> <code>{preset.host}</code>
                      </li>
                      <li>
                        <span>Port</span> <code>{preset.port}</code>
                      </li>
                      <li>
                        <span>Identifiant</span> <code>{preset.userHint}</code>
                      </li>
                      <li>
                        <span>Mot de passe</span> <code>{preset.passHint}</code>
                      </li>
                      <li>
                        <span>Expéditeur</span> <code>{preset.fromHint}</code>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className={styles.smtpNote}>
                  Les messages sont toujours sauvegardés même si l&apos;envoi
                  email échoue. Le mot de passe SMTP est stocké de façon sécurisée
                  côté serveur et n&apos;est jamais renvoyé à l&apos;interface.
                </div>
              </div>
            )}
          </div>

          <div className={styles.tip}>
            <Icon icon={ImageIcon} size="sm" />
            <span>
              <strong>Modifier les images du site</strong> — Activez l&apos;édition
              visuelle (icône crayon dans la barre d&apos;outils), puis cliquez
              directement sur une image dans l&apos;aperçu pour la remplacer.
            </span>
          </div>
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button onClick={() => void handleSave()} isLoading={isSaving} disabled={busy}>
            Enregistrer
          </Button>
        </footer>
      </div>
    </div>
  );
};
