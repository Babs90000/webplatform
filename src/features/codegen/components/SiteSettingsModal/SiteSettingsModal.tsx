"use client";

import React, { useEffect, useState } from "react";
import { Mail, CheckCircle, Server, Info } from "lucide-react";
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

const SMTP_VARS = [
  { name: "SMTP_HOST", example: "smtp.gmail.com", desc: "Serveur SMTP" },
  { name: "SMTP_PORT", example: "587", desc: "Port (587 = TLS, 465 = SSL)" },
  { name: "SMTP_USER", example: "vous@gmail.com", desc: "Identifiant" },
  { name: "SMTP_PASS", example: "mot-de-passe-app", desc: "Mot de passe ou clé app" },
  { name: "SMTP_FROM", example: '"WebPlatform" <no-reply@kdevs.io>', desc: "Expéditeur affiché" },
];

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

  useEffect(() => {
    if (isOpen) {
      setContactEmail(initialContactEmail);
      setShowSmtpGuide(false);
    }
  }, [isOpen, initialContactEmail]);

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
            >
              <Icon icon={Server} size="sm" />
              <span>Comment configurer l&apos;envoi d&apos;email (SMTP) ?</span>
              <span className={styles.smtpChevron}>{showSmtpGuide ? "▲" : "▼"}</span>
            </button>

            {showSmtpGuide && (
              <div className={styles.smtpGuide}>
                <p className={styles.smtpIntro}>
                  Pour recevoir les emails, configurez ces variables d&apos;environnement
                  dans <strong>Coolify → Node App → Environment Variables</strong> :
                </p>

                <div className={styles.smtpVars}>
                  {SMTP_VARS.map((v) => (
                    <div key={v.name} className={styles.smtpVar}>
                      <code className={styles.varName}>{v.name}</code>
                      <span className={styles.varDesc}>{v.desc}</span>
                      <code className={styles.varExample}>{v.example}</code>
                    </div>
                  ))}
                </div>

                <div className={styles.smtpProviders}>
                  <div className={styles.providersTitle}>Fournisseurs recommandés :</div>
                  <div className={styles.providersList}>
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerLink}
                    >
                      Resend <span>(SMTP_HOST=smtp.resend.com)</span>
                    </a>
                    <a
                      href="https://brevo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerLink}
                    >
                      Brevo (ex-Sendinblue) <span>(SMTP_HOST=smtp-relay.brevo.com)</span>
                    </a>
                    <a
                      href="https://support.google.com/mail/answer/185833"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.providerLink}
                    >
                      Gmail (mot de passe app) <span>(SMTP_HOST=smtp.gmail.com)</span>
                    </a>
                  </div>
                </div>

                <div className={styles.smtpNote}>
                  💡 Sans SMTP configuré, les messages sont quand même sauvegardés en base de données.
                  Vous pouvez les consulter dans Supabase → Table <code>contact_messages</code>.
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
