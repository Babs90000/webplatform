"use client";

import React from "react";
import Link from "next/link";
import styles from "./StudioToolbar.module.css";
import { Button } from "@/shared/components/Button";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { getExportZipUrl } from "../../services/codegenApi";
import { getAuthToken } from "@/lib/authToken";

interface StudioToolbarProps {
  projectId: string;
  projectName: string;
  statusMessage: string;
  isBusy: boolean;
  onGenerate: () => void;
  onRefreshPreview: () => void;
  hasFiles: boolean;
  visualEditMode: boolean;
  onToggleVisualEdit: () => void;
  codeVisible: boolean;
  onToggleCode: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
  projectId,
  projectName,
  statusMessage,
  isBusy,
  onGenerate,
  onRefreshPreview,
  hasFiles,
  visualEditMode,
  onToggleVisualEdit,
  codeVisible,
  onToggleCode,
}) => {
  const handleExport = async () => {
    const token = getAuthToken();
    const res = await fetch(getExportZipUrl(projectId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className={styles.toolbar}>
      <div className={styles.left}>
        <Link href="/dashboard" aria-label="Retour au tableau de bord">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <div className={styles.projectInfo}>
          <span className={styles.projectName}>{projectName}</span>
          <span className={styles.status}>{statusMessage || "Studio prêt"}</span>
        </div>
      </div>

      <div className={styles.right}>
        <Button
          variant={codeVisible ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleCode}
          disabled={!hasFiles}
        >
          {codeVisible ? "Masquer le code" : "Afficher le code"}
        </Button>
        <Button
          variant={visualEditMode ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleVisualEdit}
          disabled={!hasFiles}
        >
          {visualEditMode ? "Terminer l'édition" : "Édition visuelle"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onRefreshPreview} disabled={!hasFiles}>
          Actualiser l&apos;aperçu
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={!hasFiles}>
          Export ZIP
        </Button>
        <Button variant="primary" size="sm" onClick={onGenerate} disabled={isBusy}>
          {hasFiles ? "Régénérer" : `Générer avec ${AI_ASSISTANT_NAME}`}
        </Button>
        <Link href={`/projects/${projectId}/preview`} target="_blank">
          <Button variant="secondary" size="sm">Plein écran</Button>
        </Link>
      </div>
    </header>
  );
};
