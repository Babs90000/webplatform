"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { PublishModal } from "@/features/projects/components/PublishModal";
import { getProjectStudioPath } from "@/lib/projectRoutes";
import styles from "./EditorToolbar.module.css";

interface EditorToolbarProps {
  projectName?: string;
  projectId: string;
  saveStatus?: "saved" | "saving" | "error";
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  projectName = "Chargement...",
  projectId,
  saveStatus,
}) => {
  const {
    isSidebarCollapsed,
    isPropertiesCollapsed,
    activeRightPanel,
    switchRightPanel,
    toggleSidebar,
    toggleProperties,
    setMobileView,
  } = useEditorStore();

  const [showPublish, setShowPublish] = useState(false);

  const mutatingCount = useIsMutating();
  const effectiveStatus: "saved" | "saving" | "error" =
    saveStatus ?? (mutatingCount > 0 ? "saving" : "saved");

  const handleToggleHermes = () => {
    if (window.innerWidth < 1024) {
      setMobileView("ai");
      return;
    }
    if (isPropertiesCollapsed) {
      switchRightPanel("hermes");
    } else if (activeRightPanel === "properties") {
      switchRightPanel("hermes");
    } else {
      toggleProperties();
    }
  };

  const handleToggleProperties = () => {
    if (window.innerWidth < 1024) {
      setMobileView("ai");
      return;
    }
    if (isPropertiesCollapsed) {
      switchRightPanel("properties");
    } else if (activeRightPanel === "hermes") {
      switchRightPanel("properties");
    } else {
      toggleProperties();
    }
  };

  const saveDotClass =
    effectiveStatus === "saving"
      ? styles.saveDotSaving
      : effectiveStatus === "error"
        ? styles.saveDotError
        : styles.saveDotSaved;

  return (
    <header className={styles.toolbar}>
      <div className={styles.left}>
        <Link href="/dashboard" aria-label="Retour au tableau de bord" className={styles.backLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <button
          type="button"
          className={`${styles.sidebarToggle} ${!isSidebarCollapsed ? styles.sidebarToggleActive : ""}`}
          onClick={toggleSidebar}
          aria-label="Afficher/masquer la sidebar pages"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.projectBlock}>
          <span className={styles.projectName}>{projectName}</span>
          <div className={styles.saveBadge}>
            <div className={`${styles.saveDot} ${saveDotClass}`} />
            <span className={styles.saveLabel}>
              {effectiveStatus === "saving"
                ? "Sauvegarde..."
                : effectiveStatus === "error"
                  ? "Erreur"
                  : "À jour"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.legacyBanner}>
          Éditeur blocs (legacy) —{" "}
          <Link href={getProjectStudioPath(projectId)}>Passer au Studio</Link>
        </span>

        <button
          type="button"
          className={`${styles.aiToggle} ${!isPropertiesCollapsed && activeRightPanel === "hermes" ? styles.aiToggleActive : ""}`}
          onClick={handleToggleHermes}
          title={`Assistant IA ${AI_ASSISTANT_NAME}`}
        >
          <span>✨</span>
          <span>Demander à l&apos;IA</span>
        </button>

        <div className={styles.divider} />

        <Link href={`/projects/${projectId}/preview`} target="_blank" className={styles.previewLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          Aperçu
        </Link>

        <button type="button" onClick={() => setShowPublish(true)} className={styles.publishBtn}>
          Publier
        </button>

        <button
          type="button"
          className={`${styles.propsToggle} ${!isPropertiesCollapsed && activeRightPanel === "properties" ? styles.propsToggleActive : ""}`}
          onClick={handleToggleProperties}
          title="Panneau de propriétés"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <PublishModal isOpen={showPublish} onClose={() => setShowPublish(false)} projectId={projectId} />
    </header>
  );
};
