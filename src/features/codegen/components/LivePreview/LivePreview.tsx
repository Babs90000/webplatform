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
  computeDeviceScale,
  isDevicePreview,
  resolveViewportConfig,
  STUDIO_SHORTCUTS_SEEN_KEY,
  type PreviewViewport,
  type PreviewZoomMode,
} from "../../lib/previewViewport";
import type { CustomPreviewPreset } from "../../lib/customPreviewPresets";
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
  customPreset?: CustomPreviewPreset | null;
  previewZoom?: PreviewZoomMode;
  onPreviewZoomChange?: (zoom: PreviewZoomMode) => void;
  onOpenShortcuts?: () => void;
  onOpenViewportMenu?: () => void;
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
  customPreset = null,
  previewZoom = "fit",
  onPreviewZoomChange,
  onOpenShortcuts,
  onOpenViewportMenu,
  onNavigate,
  onEditText,
  onEditImageRequest,
  onEditBgRequest,
  onMoveElement,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const appliedSrcRef = useRef("");
  const [displayHtml, setDisplayHtml] = useState(html);
  const lastPushRef = useRef(0);
  const pendingHtmlRef = useRef(html);
  const [showShortcutsHint, setShowShortcutsHint] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const devicePreview = isDevicePreview(previewViewport);
  const viewportConfig = useMemo(
    () => resolveViewportConfig(previewViewport, customPreset),
    [previewViewport, customPreset],
  );

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (!sessionStorage.getItem(STUDIO_SHORTCUTS_SEEN_KEY)) {
      setShowShortcutsHint(true);
    }
  }, []);

  useEffect(() => {
    const el = frameWrapRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
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
    if (frame) {
      frame.srcdoc = previewSrc;
      frame.onload = () => {
        try {
          frame.contentWindow?.dispatchEvent(new Event("resize"));
        } catch {
          /* sandbox */
        }
      };
    }
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

  const deviceScale = useMemo(() => {
    if (!devicePreview || !viewportConfig.width) return 1;
    return computeDeviceScale(containerWidth, viewportConfig.width, previewZoom);
  }, [containerWidth, devicePreview, viewportConfig.width, previewZoom]);

  const scalePercent = Math.round(deviceScale * 100);

  const deviceFrameStyle = viewportConfig.width
    ? ({
        "--preview-device-width": `${viewportConfig.width}px`,
        "--preview-device-height": `${viewportConfig.height}px`,
        "--preview-device-scale": String(deviceScale),
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    try {
      frame.contentWindow.dispatchEvent(new Event("resize"));
    } catch {
      /* sandbox */
    }
  }, [previewViewport, customPreset, deviceScale]);

  const deviceFrameClass =
    previewViewport === "tablet"
      ? styles.deviceFrameTablet
      : previewViewport === "desktop1280" || previewViewport === "desktop1440"
        ? styles.deviceFrameDesktop
        : previewViewport === "custom" &&
            customPreset &&
            customPreset.width >= 1024
          ? styles.deviceFrameDesktop
          : previewViewport === "custom"
            ? styles.deviceFrameTablet
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

  const showNavMobileHint =
    previewViewport === "full" &&
    /nav-toggle|#nav-menu|\.nav-menu|hamburger|mobile-menu/i.test(displayHtml);

  const handleZoomFit = (): void => onPreviewZoomChange?.("fit");
  const handleZoom100 = (): void => onPreviewZoomChange?.(100);
  const handleZoomStep = (delta: number): void => {
    const base =
      previewZoom === "fit" ? scalePercent : previewZoom;
    const next = Math.min(150, Math.max(25, base + delta));
    onPreviewZoomChange?.(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Aperçu live</span>
        {devicePreview && viewportConfig && (
          <button
            type="button"
            className={styles.viewportBadge}
            onClick={onOpenViewportMenu}
            title="Changer la taille (menu ou 1-5)"
          >
            {viewportConfig.shortLabel}
            {scalePercent < 100 && ` @ ${scalePercent}%`}
          </button>
        )}
        {devicePreview && onPreviewZoomChange && (
          <div className={styles.zoomControls}>
            <button
              type="button"
              className={`${styles.zoomBtn} ${previewZoom === "fit" ? styles.zoomBtnActive : ""}`}
              onClick={handleZoomFit}
              title="Ajuster au panneau"
            >
              Ajuster
            </button>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => handleZoomStep(-10)}
              aria-label="Zoom arrière"
            >
              −
            </button>
            <button
              type="button"
              className={`${styles.zoomBtn} ${previewZoom === 100 ? styles.zoomBtnActive : ""}`}
              onClick={handleZoom100}
            >
              100%
            </button>
            <button
              type="button"
              className={styles.zoomBtn}
              onClick={() => handleZoomStep(10)}
              aria-label="Zoom avant"
            >
              +
            </button>
          </div>
        )}
        {showNavMobileHint && onOpenViewportMenu && (
          <button
            type="button"
            className={styles.navMobileHint}
            onClick={onOpenViewportMenu}
            title="Tester le menu burger en mode mobile ou tablette"
          >
            Menu mobile : touche <kbd>2</kbd> ou <kbd>3</kbd>
          </button>
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
            <kbd className={styles.hintKey}>1-5</kbd> tailles
            · <kbd className={styles.hintKey}>M</kbd> cycle
            · <kbd className={styles.hintKey}>C</kbd> code
            · <kbd className={styles.hintKey}>?</kbd> guide
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
        ref={frameWrapRef}
        className={`${styles.frameWrap} ${devicePreview ? styles.frameWrapDevice : ""}`}
      >
        {showPlaceholder ? (
          <div className={styles.placeholder}>
            L&apos;aperçu apparaîtra après la génération
          </div>
        ) : (
          <>
            {displayHtml &&
              (devicePreview && viewportConfig.width ? (
                <div
                  className={styles.deviceScaler}
                  style={{
                    width: viewportConfig.width * deviceScale,
                    height: viewportConfig.height * deviceScale + 32 * deviceScale,
                  }}
                >
                  <div
                    className={`${styles.deviceFrame} ${deviceFrameClass}`}
                    style={deviceFrameStyle}
                  >
                    <div className={styles.deviceChrome}>
                      {previewViewport === "mobile" ||
                      (previewViewport === "custom" &&
                        customPreset &&
                        customPreset.width < 500) ? (
                        <span className={styles.deviceNotch} />
                      ) : null}
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
