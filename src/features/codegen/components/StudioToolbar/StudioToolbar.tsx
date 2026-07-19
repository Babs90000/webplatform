"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, CircleHelp, MoreHorizontal } from "lucide-react";
import { LoadingDots } from "@/shared/components/LoadingDots";
import { Icon } from "@/shared/components/Icon";
import Link from "next/link";
import styles from "./StudioToolbar.module.css";
import { Button } from "@/shared/components/Button";
import { toast } from "@/store/toast";
import { AI_ASSISTANT_NAME } from "@/lib/branding";
import { getExportZipUrl } from "../../services/codegenApi";
import { getAuthToken } from "@/lib/authToken";
import { useExportCheckout } from "@/features/billing/hooks/useBilling";
import { CreativeCommitteeStrip } from "../CreativeCommitteeStrip";
import { PreviewViewportMenu } from "../PreviewViewportMenu";
import type { ReviewExpertScores } from "../../lib/creativeCommittee";
import type { PreviewViewport } from "../../lib/previewViewport";
import type { CustomPreviewPreset } from "../../lib/customPreviewPresets";

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
  viewportMenuOpen: boolean;
  customPresets?: CustomPreviewPreset[];
  activeCustomPresetId?: string | null;
  onSelectPreviewViewport: (viewport: PreviewViewport) => void;
  onSelectCustomPreset?: (preset: CustomPreviewPreset) => void;
  onOpenCustomViewportModal?: () => void;
  onViewportMenuOpenChange: (open: boolean) => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenPublish: () => void;
  onAuditQuality: () => void;
  committeeReviewActive?: boolean;
  expertScores?: ReviewExpertScores | null;
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
  previewFocus,
  onTogglePreviewFocus,
  previewViewport,
  viewportMenuOpen,
  customPresets = [],
  activeCustomPresetId = null,
  onSelectPreviewViewport,
  onSelectCustomPreset,
  onOpenCustomViewportModal,
  onViewportMenuOpenChange,
  onOpenShortcuts,
  onOpenSettings,
  onOpenPublish,
  onAuditQuality,
  committeeReviewActive = false,
  expertScores = null,
}) => {
  const exportCheckout = useExportCheckout(projectId);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePos, setMorePos] = useState({ top: 0, left: 0 });

  const handleExport = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(getExportZipUrl(projectId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        toast.error("Échec de l'export ZIP. Réessayez.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de contacter le serveur pour l'export.");
    }
  };

  const updateMorePosition = useCallback(() => {
    const el = moreRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMorePos({ top: rect.bottom + 6, left: rect.right - 200 });
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    updateMorePosition();
    const onDocClick = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (moreRef.current?.contains(target)) return;
      if (moreMenuRef.current?.contains(target)) return;
      setMoreOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [moreOpen, updateMorePosition]);

  const moreMenu =
    moreOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={moreMenuRef}
            className={styles.moreMenu}
            style={{ top: morePos.top, left: morePos.left }}
            role="menu"
          >
            <button type="button" className={styles.moreItem} onClick={() => { onToggleVisualEdit(); setMoreOpen(false); }} disabled={!hasFiles}>
              {visualEditMode ? "Terminer l'édition" : "Édition visuelle"}
            </button>
            <button type="button" className={styles.moreItem} onClick={() => { void onRefreshPreview(); setMoreOpen(false); }} disabled={!hasFiles}>
              Actualiser l&apos;aperçu
            </button>
            <button type="button" className={styles.moreItem} onClick={() => { onOpenSettings(); setMoreOpen(false); }} disabled={!hasFiles}>
              Paramètres
            </button>
            <button type="button" className={styles.moreItem} onClick={() => { void onAuditQuality(); setMoreOpen(false); }} disabled={!hasFiles || isBusy}>
              Auditer la qualité
            </button>
            <button type="button" className={styles.moreItem} onClick={() => { void exportCheckout.mutate(); setMoreOpen(false); }} disabled={!hasFiles || exportCheckout.isPending}>
              {exportCheckout.isPending ? "Redirection…" : "Acheter l'export"}
            </button>
            <button type="button" className={styles.moreItem} onClick={() => { void handleExport(); setMoreOpen(false); }} disabled={!hasFiles}>
              Export ZIP (dev)
            </button>
          </div>,
          document.body,
        )
      : null;

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

        <PreviewViewportMenu
          value={previewViewport}
          onChange={onSelectPreviewViewport}
          customPresets={customPresets}
          activeCustomPresetId={activeCustomPresetId}
          onSelectCustomPreset={onSelectCustomPreset}
          onOpenCustomModal={onOpenCustomViewportModal}
          disabled={!hasFiles}
          open={viewportMenuOpen}
          onOpenChange={onViewportMenuOpenChange}
        />

        <Button
          variant={previewFocus ? "primary" : "secondary"}
          size="sm"
          onClick={onTogglePreviewFocus}
          disabled={!hasFiles}
          title="Aperçu seul (F)"
        >
          {previewFocus ? "Quitter aperçu seul" : "Aperçu seul"}
        </Button>

        <div className={styles.primaryActions}>
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
            className={styles.hideNarrow}
          >
            {visualEditMode ? "Terminer l'édition" : "Édition visuelle"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onRefreshPreview} disabled={!hasFiles} className={styles.hideNarrow}>
            Actualiser l&apos;aperçu
          </Button>
          <Button variant="secondary" size="sm" onClick={onOpenSettings} disabled={!hasFiles} className={styles.hideNarrow}>
            Paramètres
          </Button>
          <Button variant="secondary" size="sm" onClick={onAuditQuality} disabled={!hasFiles || isBusy} className={styles.hideNarrow}>
            Auditer la qualité
          </Button>
          <Button variant="secondary" size="sm" onClick={onOpenPublish} disabled={!hasFiles || isBusy}>
            Publier
          </Button>
          <Button variant="primary" size="sm" onClick={onGenerate} disabled={isBusy}>
            {hasFiles ? "Régénérer" : `Générer avec ${AI_ASSISTANT_NAME}`}
          </Button>
          <Link href={`/projects/${projectId}/preview`} target="_blank" className={styles.hideNarrow}>
            <Button variant="secondary" size="sm">Plein écran</Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void exportCheckout.mutate()}
            disabled={!hasFiles || exportCheckout.isPending}
            className={styles.hideWide}
          >
            {exportCheckout.isPending ? "Redirection…" : "Acheter l'export"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void handleExport()} disabled={!hasFiles} className={styles.hideWide}>
            Export ZIP
          </Button>
        </div>

        <div className={styles.moreWrap} ref={moreRef}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMoreOpen((o) => !o)}
            ariaLabel="Plus d'actions"
            className={styles.showNarrow}
          >
            <Icon icon={MoreHorizontal} size="sm" />
            Plus
          </Button>
        </div>
        {moreMenu}
      </div>
    </header>
  );
};
