"use client";

import React from "react";
import styles from "./StudioShortcutsModal.module.css";
import { Modal } from "@/shared/components/Modal";
import {
  PREVIEW_VIEWPORT_OPTIONS,
  STUDIO_SHORTCUTS,
} from "../../lib/previewViewport";

interface StudioShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const markStudioShortcutsSeen = (): void => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem("wp-studio-shortcuts-seen", "1");
};

export const StudioShortcutsModal: React.FC<StudioShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleClose = (): void => {
    markStudioShortcutsSeen();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Guide du studio"
      size="md"
    >
      <p className={styles.intro}>
        Testez votre site sur mobile, tablette et grands écrans. Utilisez le menu
        déroulant <strong>Responsive</strong> dans la barre d&apos;outils ou les
        raccourcis clavier (inactifs pendant la saisie).
      </p>

      <h3 className={styles.sectionTitle}>Raccourcis clavier</h3>
      <ul className={styles.list}>
        {STUDIO_SHORTCUTS.map((shortcut) => (
          <li key={shortcut.label} className={styles.item}>
            <div className={styles.itemMain}>
              <span className={styles.itemLabel}>{shortcut.label}</span>
              <span className={styles.itemDescription}>
                {shortcut.description}
              </span>
            </div>
            <div className={styles.keys}>
              {shortcut.keys.map((key) => (
                <kbd key={key} className={styles.key}>
                  {key}
                </kbd>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <h3 className={styles.sectionTitle}>Tailles d&apos;aperçu</h3>
      <p className={styles.sectionIntro}>
        Touches <kbd className={styles.keyInline}>1</kbd> à{" "}
        <kbd className={styles.keyInline}>5</kbd> pour un saut direct, ou{" "}
        <kbd className={styles.keyInline}>M</kbd> pour cycler.
      </p>
      <ul className={styles.viewportList}>
        {PREVIEW_VIEWPORT_OPTIONS.map((opt) => (
          <li key={opt.id} className={styles.viewportItem}>
            <span className={styles.viewportName}>
              <kbd className={styles.keyInline}>{opt.shortcutKey}</kbd>{" "}
              {opt.label}
            </span>
            <span className={styles.viewportMeta}>
              {opt.width && opt.height
                ? `${opt.width} × ${opt.height}px`
                : "Adaptatif au panneau"}
              {opt.menuGroup === "desktop" ? " · QA grand écran" : ""}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.tip}>
        Les presets device activent l&apos;aperçu seul. Le zoom{" "}
        <strong>Ajuster</strong> réduit automatiquement les grands écrans.
        <kbd className={styles.keyInline}>Échap</kbd> ferme les menus, revient au
        plein écran, puis quitte l&apos;aperçu seul.
      </p>
    </Modal>
  );
};
