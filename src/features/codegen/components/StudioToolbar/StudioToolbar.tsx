"use client";

import React from "react";
import {
  ArrowLeft,
  CircleHelp,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { LoadingDots } from "@/shared/components/LoadingDots";
import { Icon } from "@/shared/components/Icon";
import Link from "next/link";
import styles from "./StudioToolbar.module.css";
import { Button } from "@/shared/components/Button";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { getExportZipUrl } from "../../services/codegenApi";
import { getAuthToken } from "@/lib/authToken";
import { useExportCheckout } from "@/features/billing/hooks/useBilling";
import { CreativeCommitteeStrip } from "../CreativeCommitteeStrip";
import type { ReviewExpertScores } from "../../lib/creativeCommittee";
import {
  getPreviewViewportLabel,
  isDevicePreview,
  type PreviewViewport,
} from "../../lib/previewViewport";

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
  previewFocus: boolean;
  onTogglePreviewFocus: () => void;
  previewViewport: PreviewViewport;
  onCyclePreviewViewport: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenPublish: () => void;
  onAuditQuality: () => void;
  committeeReviewActive?: boolean;
  expertScores?: ReviewExpertScores | null;
}

const VIEWPORT_ICONS = {
  full: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  desktop1280: Monitor,
  desktop1440: Monitor,
} as const;

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
  previewFocus,
  onTogglePreviewFocus,
  previewViewport,
  onCyclePreviewViewport,
  onOpenShortcuts,
  onOpenSettings,
  onOpenPublish,
  onAuditQuality,
  committeeReviewActive = false,
  expertScores = null,
}) => {
  const exportCheckout = useExportCheckout(projectId);
  const ViewportIcon = VIEWPORT_ICONS[previewViewport];
  const deviceActive = isDevicePreview(previewViewport);

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
          <Button variant="ghost" size="sm" ariaLabel="Retour au tableau de bord">
            <Icon icon={ArrowLeft} size="sm" />
          </Button>
        </Link>
        <div className={styles.projectInfo}>
          <span className={styles.projectName}>{projectName}</span>
          <span
            className={`${styles.statusRow} ${isBusy ? styles.statusActive : ""}`}
          >
            {isBusy && <LoadingDots size="sm" label={statusMessage || "En cours"} />}
            <span className={styles.status}>
              {statusMessage || (isBusy ? "Traitement en cours…" : "Studio prêt")}
            </span>
          </span>
          {(committeeReviewActive || expertScores) && (
            <CreativeCommitteeStrip
              scores={expertScores}
              active={committeeReviewActive && !expertScores}
              align="start"
            />
          )}
        </div>
      </div>

      <div className={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenShortcuts}
          ariaLabel="Guide du studio et raccourcis (?)"
          title="Guide du studio (?)"
        >
          <Icon icon={CircleHelp} size="sm" />
        </Button>
        <Button
          variant={deviceActive ? "primary" : "secondary"}
          size="sm"
          onClick={onCyclePreviewViewport}
          disabled={!hasFiles}
          title="Cycle responsive (M) — mobile, tablette, desktop 1280/1440"
        >
          <Icon icon={ViewportIcon} size="sm" />
          {getPreviewViewportLabel(previewViewport)}
        </Button>
        <Button
          variant={previewFocus ? "primary" : "secondary"}
          size="sm"
          onClick={onTogglePreviewFocus}
          disabled={!hasFiles}
          title="Aperçu seul (F)"
        >
          {previewFocus ? "Quitter aperçu seul" : "Aperçu seul"}
        </Button>
        <Button
          variant={codeVisible ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleCode}
          disabled={!hasFiles || previewFocus}
          title={previewFocus ? undefined : "Afficher le code (C)"}
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
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSettings}
          disabled={!hasFiles}
        >
          Paramètres
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAuditQuality}
          disabled={!hasFiles || isBusy}
        >
          Auditer la qualité
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenPublish}
          disabled={!hasFiles || isBusy}
        >
          Publier
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportCheckout.mutate()}
          disabled={!hasFiles || exportCheckout.isPending}
        >
          {exportCheckout.isPending ? "Redirection…" : "Acheter l'export"}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={!hasFiles}>
          Export ZIP (dev)
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
