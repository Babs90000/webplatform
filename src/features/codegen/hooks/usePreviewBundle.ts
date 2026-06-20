import { useEffect } from "react";
import { useStudioStore } from "../store/studioStore";
import {
  getCachedPreviewHtml,
  mergeFilesForPreview,
} from "../lib/previewBundleCache";

/** Rebundle l'aperçu uniquement quand les fichiers changent (debounce + cache). */
export const usePreviewBundle = (
  projectId: string,
  isBusy: boolean,
): void => {
  const files = useStudioStore((state) => state.files);
  const streamingPaths = useStudioStore((state) => state.streamingPaths);
  const previewPage = useStudioStore((state) => state.previewPage);
  const setPreviewHtml = useStudioStore((state) => state.setPreviewHtml);

  useEffect(() => {
    const merged = mergeFilesForPreview(files, streamingPaths);
    if (merged.length === 0) return;

    const delay = isBusy ? 700 : 120;
    const timer = window.setTimeout(() => {
      const html = getCachedPreviewHtml(merged, previewPage, projectId);
      if (html) setPreviewHtml(html);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    files,
    streamingPaths,
    previewPage,
    projectId,
    isBusy,
    setPreviewHtml,
  ]);
};
