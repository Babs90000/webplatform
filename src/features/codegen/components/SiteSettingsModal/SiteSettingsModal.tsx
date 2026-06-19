"use client";

import React, { useEffect, useState } from "react";
import styles from "./SiteSettingsModal.module.css";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
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

export const SiteSettingsModal: React.FC<SiteSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialContactEmail = "",
  onSaved,
}) => {
  const [contactEmail, setContactEmail] = useState(initialContactEmail);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setContactEmail(initialContactEmail);
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
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          <Input
            label="Email de réception (formulaire de contact)"
            name="contact_email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@mon-entreprise.fr"
          />
          <p className={styles.hint}>
            Les messages du formulaire de contact seront envoyés à cette adresse.
          </p>

          <div className={styles.tip}>
            <strong>Images</strong> — activez l&apos;édition visuelle, cliquez sur
            une image dans l&apos;aperçu, puis importez ou collez une URL.
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
