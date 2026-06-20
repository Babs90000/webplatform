"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./LivePreview.module.css";
import { LoadingDots } from "@/shared/components/LoadingDots";
import { LoadingPanel } from "@/shared/components/LoadingPanel";
import { injectVisualEditor, type VisualMovePosition } from "../../lib/visualEditor";
import { CreativeCommitteeStrip } from "../CreativeCommitteeStrip";
import type { ReviewExpertScores } from "../../lib/creativeCommittee";
import {
  isDevicePreview,
  PREVIEW_VIEWPORT_CONFIG,
  STUDIO_SHORTCUTS_SEEN_KEY,
  type PreviewViewport,
} from "../../lib/previewViewport";
import { markStudioShortcutsSeen } from "../StudioShortcutsModal";

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
  previewViewport?: PreviewViewport;
  onOpenShortcuts?: () => void;
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

const LivePreviewComponent: React.FC<LivePreviewProps> = ({
  html,
  isLoading = false,
  loadingMessage = "Génération en cours…",
  progressPercent = 0,
  progressDone = [],
  progressPending = [],
  committeeReviewActive = false,
  expertScores = null,
  editable = false,
  previewViewport = "full",
  onOpenShortcuts,
  onNavigate,
  onEditText,
  onEditImageRequest,
  onEditBgRequest,
  onMoveElement,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const appliedSrcRef = useRef("");
  const [displayHtml, setDisplayHtml] = useState(html);
  const lastPushRef = useRef(0);
  const pendingHtmlRef = useRef(html);
  const [showShortcutsHint, setShowShortcutsHint] = useState(false);

  const devicePreview = isDevicePreview(previewViewport);
  const viewportConfig = PREVIEW_VIEWPORT_CONFIG[previewViewport];

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (!sessionStorage.getItem(STUDIO_SHORTCUTS_SEEN_KEY)) {
      setShowShortcutsHint(true);
    }
  }, []);

  useEffect(() => {
    pendingHtmlRef.current = html;
    if (html === displayHtml) return;

    const now = Date.now();
    const delay = isLoading ? 1200 : 500;

    const push = (): void => {
      const next = pendingHtmlRef.current;
      if (next === displayHtml) return;
      setDisplayHtml(next);
      lastPushRef.current = Date.now();
    };

    if (now - lastPushRef.current >= delay) {
      push();
      return;
    }

    const timer = window.setTimeout(push, delay);
    return () => window.clearTimeout(timer);
  }, [html, isLoading, displayHtml]);

  const previewSrc = useMemo(
    () => (editable ? injectVisualEditor(displayHtml) : displayHtml),
    [editable, displayHtml],
  );

  useEffect(() => {
    if (!previewSrc || previewSrc === appliedSrcRef.current) return;
    appliedSrcRef.current = previewSrc;
    const frame = iframeRef.current;
    if (frame) frame.srcdoc = previewSrc;
  }, [previewSrc]);

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

  const handleDismissHint = useCallback(() => {
    markStudioShortcutsSeen();
    setShowShortcutsHint(false);
  }, []);

  const handleOpenShortcutsFromHint = useCallback(() => {
    markStudioShortcutsSeen();
    setShowShortcutsHint(false);
    onOpenShortcuts?.();
  }, [onOpenShortcuts]);

  const deviceFrameStyle = viewportConfig
    ? ({
        "--preview-device-width": `${viewportConfig.width}px`,
        "--preview-device-height": `${viewportConfig.height}px`,
      } as React.CSSProperties)
    : undefined;

  const deviceFrameClass =
    previewViewport === "tablet"
      ? styles.deviceFrameTablet
      : previewViewport === "desktop1280" || previewViewport === "desktop1440"
        ? styles.deviceFrameDesktop
        : "";

  const showPlaceholder = !displayHtml && !isLoading;
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
        {devicePreview && viewportConfig && (
          <span className={styles.viewportBadge}>
            {viewportConfig.label}
          </span>
        )}
        {editable && (
          <span className={styles.editBadge}>Édition visuelle active</span>
        )}
        {showShortcutsHint && (
          <button
            type="button"
            className={styles.shortcutsHint}
            onClick={handleOpenShortcutsFromHint}
          >
            Touche <kbd className={styles.hintKey}>?</kbd> pour le guide
            · <kbd className={styles.hintKey}>M</kbd> tailles
            · <kbd className={styles.hintKey}>C</kbd> code
            <span
              className={styles.hintDismiss}
              onClick={(event) => {
                event.stopPropagation();
                handleDismissHint();
              }}
              aria-label="Masquer"
            >
              ×
            </span>
          </button>
        )}
        {isLoading && (
          <span className={styles.loadingBadge}>
            <LoadingDots size="sm" label={loadingMessage} />
            <span>{displayPercent}% — {loadingMessage}</span>
          </span>
        )}
      </div>
      <div
        className={`${styles.frameWrap} ${devicePreview ? styles.frameWrapDevice : ""}`}
      >
        {showPlaceholder ? (
          <div className={styles.placeholder}>
            L&apos;aperçu apparaîtra après la génération
          </div>
        ) : (
          <>
            {displayHtml &&
              (devicePreview && viewportConfig ? (
                <div
                  className={`${styles.deviceFrame} ${deviceFrameClass}`}
                  style={deviceFrameStyle}
                >
                  <div className={styles.deviceChrome}>
                    {previewViewport === "mobile" && (
                      <span className={styles.deviceNotch} />
                    )}
                    <span className={styles.deviceLabel}>
                      {viewportConfig.width} × {viewportConfig.height}
                    </span>
                  </div>
                  <iframe
                    ref={iframeRef}
                    title={`Aperçu ${viewportConfig.label}`}
                    className={styles.frameDevice}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  title="Aperçu du site"
                  className={styles.frame}
                  sandbox="allow-scripts allow-same-origin"
                />
              ))}
            {isLoading && (
              <div
                className={`${styles.overlay} ${devicePreview ? styles.overlayDevice : ""}`}
              >
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

export const LivePreview = memo(LivePreviewComponent);
