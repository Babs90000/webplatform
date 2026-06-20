"use client";

import React, { memo, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { LivePreview } from "../LivePreview";
import { useStudioStore } from "../../store/studioStore";
import { useCustomPreviewPresets } from "../../hooks/useCustomPreviewPresets";
import type { VisualMovePosition } from "../../lib/visualEditor";

interface StudioPreviewPanelProps {
  onNavigate: (path: string) => void;
  onEditText: (path: string, value: string) => void;
  onEditImageRequest: (path: string, current?: string) => void;
  onEditBgRequest: (path: string) => void;
  onMoveElement: (
    fromPath: string,
    toPath: string,
    position: VisualMovePosition,
  ) => void;
  onOpenShortcuts?: () => void;
  onOpenViewportMenu?: () => void;
}

const StudioPreviewPanelComponent: React.FC<StudioPreviewPanelProps> = ({
  onNavigate,
  onEditText,
  onEditImageRequest,
  onEditBgRequest,
  onMoveElement,
  onOpenShortcuts,
  onOpenViewportMenu,
}) => {
  const { presets: customPresets } = useCustomPreviewPresets();

  const {
    previewHtml,
    phase,
    statusMessage,
    progressPercent,
    progressDone,
    progressPending,
    committeeReviewActive,
    expertScores,
    visualEditMode,
    previewViewport,
    previewZoom,
    activeCustomPresetId,
    setPreviewZoom,
  } = useStudioStore(
    useShallow((state) => ({
      previewHtml: state.previewHtml,
      phase: state.phase,
      statusMessage: state.statusMessage,
      progressPercent: state.progressPercent,
      progressDone: state.progressDone,
      progressPending: state.progressPending,
      committeeReviewActive: state.committeeReviewActive,
      expertScores: state.expertScores,
      visualEditMode: state.visualEditMode,
      previewViewport: state.previewViewport,
      previewZoom: state.previewZoom,
      activeCustomPresetId: state.activeCustomPresetId,
      setPreviewZoom: state.setPreviewZoom,
    })),
  );

  const customPreset = useMemo(
    () =>
      activeCustomPresetId
        ? customPresets.find((p) => p.id === activeCustomPresetId) ?? null
        : null,
    [activeCustomPresetId, customPresets],
  );

  const isLoading =
    phase === "generating" || phase === "architect" || phase === "editing";

  return (
    <LivePreview
      html={previewHtml}
      isLoading={isLoading}
      loadingMessage={statusMessage || "Génération en cours…"}
      progressPercent={progressPercent}
      progressDone={progressDone}
      progressPending={progressPending}
      committeeReviewActive={committeeReviewActive}
      expertScores={expertScores}
      editable={visualEditMode}
      previewViewport={previewViewport}
      customPreset={customPreset}
      previewZoom={previewZoom}
      onPreviewZoomChange={setPreviewZoom}
      onOpenShortcuts={onOpenShortcuts}
      onOpenViewportMenu={onOpenViewportMenu}
      onNavigate={onNavigate}
      onEditText={onEditText}
      onEditImageRequest={onEditImageRequest}
      onEditBgRequest={onEditBgRequest}
      onMoveElement={onMoveElement}
    />
  );
};

export const StudioPreviewPanel = memo(StudioPreviewPanelComponent);
