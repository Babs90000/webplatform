"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./LivePreview.module.css";
import { injectVisualEditor } from "../../lib/visualEditor";

interface LivePreviewProps {
  html: string;
  isLoading?: boolean;
  editable?: boolean;
  onNavigate?: (path: string) => void;
  onEditText?: (selector: string, value: string) => void;
  onEditImageRequest?: (selector: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  html,
  isLoading = false,
  editable = false,
  onNavigate,
  onEditText,
  onEditImageRequest,
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
        typeof data.selector === "string" &&
        typeof data.value === "string"
      ) {
        onEditText?.(data.selector, data.value);
      } else if (
        data.type === "wp-edit-image-request" &&
        typeof data.selector === "string"
      ) {
        onEditImageRequest?.(data.selector);
      }
    },
    [onNavigate, onEditText, onEditImageRequest],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.label}>Aperçu live</span>
        {editable && (
          <span className={styles.editBadge}>Édition visuelle active</span>
        )}
        {isLoading && <span className={styles.loading}>Génération…</span>}
      </div>
      <div className={styles.frameWrap}>
        {throttledHtml ? (
          <iframe
            ref={iframeRef}
            title="Aperçu du site"
            className={styles.frame}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={previewSrc}
          />
        ) : (
          <div className={styles.placeholder}>
            L&apos;aperçu apparaîtra après la génération
          </div>
        )}
      </div>
    </div>
  );
};
