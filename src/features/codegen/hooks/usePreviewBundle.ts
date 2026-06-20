import { useEffect, useMemo, useRef } from "react";
import { useStudioStore } from "../store/studioStore";
import {
  fingerprintPreviewRelevant,
  getCachedPreviewHtml,
  mergeFilesForPreview,
} from "../lib/previewBundleCache";

const BUSY_PREVIEW_MS = 2_000;
const IDLE_PREVIEW_MS = 120;

/**
 * Rebundle l'aperçu uniquement quand la page courante, le CSS ou le JS changent.
 * Pendant la génération, debounce 2 s pour limiter les reloads iframe.
 */
export const usePreviewBundle = (
  projectId: string,
  isBusy: boolean,
): void => {
  const files = useStudioStore((state) => state.files);
  const streamingPaths = useStudioStore((state) => state.streamingPaths);
  const previewPage = useStudioStore((state) => state.previewPage);
  const setPreviewHtml = useStudioStore((state) => state.setPreviewHtml);

  const relevantKey = useMemo(
    () =>
      fingerprintPreviewRelevant(
        files,
        streamingPaths,
        previewPage,
        projectId,
      ),
    [files, streamingPaths, previewPage, projectId],
  );

  const lastAppliedKeyRef = useRef("");

  useEffect(() => {
    const merged = mergeFilesForPreview(files, streamingPaths);
    if (merged.length === 0) return;

    if (isBusy && relevantKey === lastAppliedKeyRef.current) return;

    const delay = isBusy ? BUSY_PREVIEW_MS : IDLE_PREVIEW_MS;
    const timer = window.setTimeout(() => {
      if (isBusy && relevantKey === lastAppliedKeyRef.current) return;

      const state = useStudioStore.getState();
      const nextMerged = mergeFilesForPreview(
        state.files,
        state.streamingPaths,
      );
      const html = getCachedPreviewHtml(
        nextMerged,
        state.previewPage,
        projectId,
      );
      if (html) {
        lastAppliedKeyRef.current = relevantKey;
        setPreviewHtml(html);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    relevantKey,
    isBusy,
    files,
    streamingPaths,
    previewPage,
    projectId,
    setPreviewHtml,
  ]);
};
