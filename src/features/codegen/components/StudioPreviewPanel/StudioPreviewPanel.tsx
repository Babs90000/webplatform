"use client";

import React, { memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { LivePreview } from "../LivePreview";
import { useStudioStore } from "../../store/studioStore";
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
}

const StudioPreviewPanelComponent: React.FC<StudioPreviewPanelProps> = ({
  onNavigate,
  onEditText,
  onEditImageRequest,
  onEditBgRequest,
  onMoveElement,
}) => {
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
    })),
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
      onNavigate={onNavigate}
      onEditText={onEditText}
      onEditImageRequest={onEditImageRequest}
      onEditBgRequest={onEditBgRequest}
      onMoveElement={onMoveElement}
    />
  );
};

export const StudioPreviewPanel = memo(StudioPreviewPanelComponent);
