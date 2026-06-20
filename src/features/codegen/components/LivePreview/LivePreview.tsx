"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./LivePreview.module.css";
import { LoadingDots } from "@/shared/components/LoadingDots";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { injectVisualEditor, type VisualMovePosition } from "../../lib/visualEditor";
import { CreativeCommitteeStrip } from "../CreativeCommitteeStrip";
import type { ReviewExpertScores } from "../../lib/creativeCommittee";

interface LivePreviewProps {
  html: string;
  isLoading?: boolean;
  loadingMessage?: string;
  progressPercent?: number;
  progressDone?: string[];
  progressPending?: string[];
  committeeReviewActive?: boolean;
  expertScores?: ReviewExpertScores | null;
  editable?: boolean;
  onNavigate?: (path: string) => void;
  onEditText?: (path: string, value: string) => void;
  onEditImageRequest?: (path: string, current?: string) => void;
  onEditBgRequest?: (path: string) => void;
  onMoveElement?: (
    fromPath: string,
    toPath: string,
    position: VisualMovePosition,
  ) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  html,
  isLoading = false,
  loadingMessage = "Génération en cours…",
  progressPercent = 0,
  progressDone = [],
  progressPending = [],
  committeeReviewActive = false,
  expertScores = null,
  editable = false,
  onNavigate,
  onEditText,
  onEditImageRequest,
  onEditBgRequest,
  onMoveElement,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [throttledHtml, setThrottledHtml] = useState(html);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const delay = isLoading ? 2000 : 800;
    if (now - lastUpdate.current >= delay) {
      setThrottledHtml(html);
      lastUpdate.current = now;
      return;
    }
    const timer = window.setTimeout(() => {
      setThrottledHtml(html);
      lastUpdate.current = Date.now();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [html, isLoading]);

  const previewSrc = useMemo(
    () => (editable ? injectVisualEditor(throttledHtml) : throttledHtml),
    [editable, throttledHtml],
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data;
      if (typeof data !== "object" || data === null) return;

      if (data.type === "wp-preview-navigate" && typeof data.path === "string") {
        onNavigate?.(data.path);
      } else if (
        data.type === "wp-edit-text" &&
        typeof data.path === "string" &&
        typeof data.value === "string"
      ) {
        onEditText?.(data.path, data.value);
      } else if (
        data.type === "wp-edit-image-request" &&
        typeof data.path === "string"
      ) {
        onEditImageRequest?.(
          data.path,
          typeof data.current === "string" ? data.current : undefined,
        );
      } else if (
        data.type === "wp-edit-bg-request" &&
        typeof data.path === "string"
      ) {
        onEditBgRequest?.(data.path);
      } else if (
        data.type === "wp-edit-move" &&
        typeof data.fromPath === "string" &&
        typeof data.toPath === "string" &&
        (data.position === "before" ||
          data.position === "after" ||
          data.position === "append")
      ) {
        onMoveElement?.(data.fromPath, data.toPath, data.position);
      }
    },
    [onNavigate, onEditText, onEditImageRequest, onEditBgRequest, onMoveElement],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const showPlaceholder = !throttledHtml && !isLoading;
  const displayPercent = isLoading ? Math.max(progressPercent, 8) : 0;
  const committeeFooter =
    committeeReviewActive || expertScores ? (
      <CreativeCommitteeStrip
        scores={expertScores}
        active={committeeReviewActive && !expertScores}
        showLabel={false}
      />
    ) : null;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Aperçu live</span>
        {editable && (
          <span className={styles.editBadge}>Édition visuelle active</span>
        )}
        {isLoading && (
          <span className={styles.loadingBadge}>
            <LoadingDots size="sm" label={loadingMessage} />
            <span>{displayPercent}% — {loadingMessage}</span>
          </span>
        )}
      </div>
      <div className={styles.frameWrap}>
        {showPlaceholder ? (
          <div className={styles.placeholder}>
            L&apos;aperçu apparaîtra après la génération
          </div>
        ) : (
          <>
            {throttledHtml && (
              <iframe
                ref={iframeRef}
                title="Aperçu du site"
                className={styles.frame}
                sandbox="allow-scripts allow-same-origin"
                srcDoc={previewSrc}
              />
            )}
            {isLoading && (
              <div className={styles.overlay}>
                <LoadingPanel
                  variant="preview"
                  message={loadingMessage}
                  percent={displayPercent}
                  completedSteps={progressDone}
                  remainingSteps={progressPending}
                  footer={committeeFooter}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
