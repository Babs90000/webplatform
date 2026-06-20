"use client";

import React from "react";
import styles from "./StudioShortcutsModal.module.css";
import { Modal } from "@/shared/components/Modal";
import {
  PREVIEW_VIEWPORT_PRESETS,
  STUDIO_SHORTCUTS,
  STUDIO_SHORTCUTS_SEEN_KEY,
} from "../../lib/previewViewport";

interface StudioShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const markStudioShortcutsSeen = (): void => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STUDIO_SHORTCUTS_SEEN_KEY, "1");
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
        Raccourcis clavier et tailles d&apos;aperçu pour tester votre site sur
        mobile, tablette et grands écrans. Inactifs pendant la saisie dans le
        chat ou l&apos;éditeur.
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

      <h3 className={styles.sectionTitle}>Tailles d&apos;aperçu (touche M)</h3>
      <p className={styles.sectionIntro}>
        Le bouton <strong>Responsive</strong> ou la touche{" "}
        <kbd className={styles.keyInline}>M</kbd> cycle dans cet ordre :
      </p>
      <ol className={styles.viewportList}>
        <li className={styles.viewportItem}>
          <span className={styles.viewportName}>Plein écran</span>
          <span className={styles.viewportMeta}>Aperçu adaptatif du panneau</span>
        </li>
        {PREVIEW_VIEWPORT_PRESETS.map((preset) => (
          <li key={preset.id} className={styles.viewportItem}>
            <span className={styles.viewportName}>{preset.label}</span>
            <span className={styles.viewportMeta}>
              {preset.width} × {preset.height}px
              {preset.category === "desktop" ? " · QA grand écran" : ""}
            </span>
          </li>
        ))}
      </ol>

      <p className={styles.tip}>
        Les presets device activent automatiquement l&apos;aperçu seul.{" "}
        <kbd className={styles.keyInline}>Échap</kbd> revient au plein écran, puis
        quitte l&apos;aperçu seul.
      </p>
    </Modal>
  );
};
