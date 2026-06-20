import { bundlePreviewHtml, type PreviewFile } from "./previewBundler";

const CACHE_MAX = 24;

/** djb2 xor — rapide, suffisant pour clé de cache locale. */
const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
};

export const fingerprintPreviewInputs = (
  files: PreviewFile[],
  pagePath: string,
  projectId?: string,
): string => {
  let digest = hashString(`${pagePath}\0${projectId ?? ""}`);
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  for (const file of sorted) {
    digest = hashString(`${digest}\0${file.path}\0${file.content.length}\0${file.content}`);
  }
  return String(digest);
};

const htmlCache = new Map<string, string>();
const cacheOrder: string[] = [];

const remember = (key: string, html: string): string => {
  if (htmlCache.has(key)) {
    const idx = cacheOrder.indexOf(key);
    if (idx >= 0) cacheOrder.splice(idx, 1);
    cacheOrder.push(key);
    return htmlCache.get(key) ?? html;
  }
  htmlCache.set(key, html);
  cacheOrder.push(key);
  while (cacheOrder.length > CACHE_MAX) {
    const oldest = cacheOrder.shift();
    if (oldest) htmlCache.delete(oldest);
  }
  return html;
};

/** Bundle mémorisé — recalcule uniquement si le fingerprint change. */
export const getCachedPreviewHtml = (
  files: PreviewFile[],
  pagePath: string,
  projectId?: string,
): string => {
  if (files.length === 0) return "";
  const key = fingerprintPreviewInputs(files, pagePath, projectId);
  const cached = htmlCache.get(key);
  if (cached !== undefined) return cached;
  const html = bundlePreviewHtml(files, pagePath, projectId);
  return remember(key, html);
};

export const mergeFilesForPreview = (
  files: Array<{ path: string; content: string }>,
  streamingPaths: Record<string, string>,
): PreviewFile[] => {
  if (Object.keys(streamingPaths).length === 0) {
    return files.map((f) => ({ path: f.path, content: f.content }));
  }
  const map = new Map(files.map((f) => [f.path, f.content]));
  for (const [path, content] of Object.entries(streamingPaths)) {
    map.set(path, content);
  }
  return [...map.entries()].map(([path, content]) => ({ path, content }));
};
