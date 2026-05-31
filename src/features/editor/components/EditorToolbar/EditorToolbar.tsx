"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useIsMutating } from "@tanstack/react-query";
import styles from "./EditorToolbar.module.css";
import { useEditorStore } from "@/store/editor";
import { Button } from "@/shared/components/Button";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { PublishModal } from "@/features/projects/components/PublishModal";

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
  } = useEditorStore();

  const [showPublish, setShowPublish] = useState(false);

  // Statut de sauvegarde dérivé de l'activité réelle des mutations
  // (création/màj/réordonnancement de blocs) si non fourni explicitement.
  const mutatingCount = useIsMutating();
  const effectiveStatus: "saved" | "saving" | "error" =
    saveStatus ?? (mutatingCount > 0 ? "saving" : "saved");

  const getStatusDotClass = () => {
    switch (effectiveStatus) {
      case "saving":
        return styles.statusSaving;
      case "error":
        return styles.statusError;
      default:
        return styles.statusSaved;
    }
  };

  const getStatusText = () => {
    switch (effectiveStatus) {
      case "saving":
        return "Enregistrement...";
      case "error":
        return "Échec de l'enregistrement";
      default:
        return "Toutes les modifications enregistrées";
    }
  };

  const handleToggleHermes = () => {
    if (isPropertiesCollapsed) {
      switchRightPanel("hermes");
    } else if (activeRightPanel === "properties") {
      switchRightPanel("hermes");
    } else {
      toggleProperties();
    }
  };

  const handleToggleProperties = () => {
    if (isPropertiesCollapsed) {
      switchRightPanel("properties");
    } else if (activeRightPanel === "hermes") {
      switchRightPanel("properties");
    } else {
      toggleProperties();
    }
  };

  return (
    <header className={styles.toolbar}>
      <div className={styles.left}>
        <Link href="/dashboard" aria-label="Back to dashboard">
          <Button variant="ghost" size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </Link>

        <button
          className={`${styles.iconButton} ${!isSidebarCollapsed ? styles.active : ""}`}
          onClick={toggleSidebar}
          aria-label="Toggle pages sidebar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.projectInfo}>
          <span className={styles.projectName}>{projectName}</span>
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${getStatusDotClass()}`} />
            <span>{getStatusText()}</span>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={`${styles.iconButton} ${!isPropertiesCollapsed && activeRightPanel === "hermes" ? styles.active : ""}`}
          onClick={handleToggleHermes}
          aria-label={`Assistant IA ${AI_ASSISTANT_NAME}`}
          title={`Assistant IA ${AI_ASSISTANT_NAME}`}
          style={{ marginRight: "var(--space-sm)", fontSize: "1.1rem" }}
        >
          ✨
        </button>

        <Link
          href={`/projects/${projectId}/preview`}
          target="_blank"
          style={{ marginRight: "var(--space-sm)" }}
        >
          <Button variant="secondary" size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "6px" }}
            >
              <path
                d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Preview
          </Button>
        </Link>

        <Button
          variant="cta"
          size="sm"
          onClick={() => setShowPublish(true)}
          style={{ marginRight: "var(--space-md)" }}
        >
          Publier
        </Button>

        <button
          className={`${styles.iconButton} ${!isPropertiesCollapsed && activeRightPanel === "properties" ? styles.active : ""}`}
          onClick={handleToggleProperties}
          aria-label="Toggle properties sidebar"
          title="Panneau de propriétés"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6V18M18 12H6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <PublishModal
        isOpen={showPublish}
        onClose={() => setShowPublish(false)}
        projectId={projectId}
      />
    </header>
  );
};
