import {
  assemblePreviewHtml,
  buildPreviewCssContent,
  buildPreviewJsContent,
  normalizePreviewPath,
  resolvePageHtml,
  resolvePreviewAssets,
  type PreviewFile,
} from "./previewBundler";

const CACHE_MAX = 24;
const PATCH_CACHE_MAX = 32;

const CSS_PATHS = ["css/style.css", "styles.css"] as const;
const JS_PATHS = ["js/app.js", "script.js"] as const;

/** djb2 xor — rapide, suffisant pour clé de cache locale. */
const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
};

const contentAt = (
  map: Map<string, string>,
  paths: readonly string[],
): string => {
  for (const path of paths) {
    const content = map.get(normalizePreviewPath(path));
    if (content !== undefined) return content;
  }
  return "";
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

/**
 * Fingerprint limité aux fichiers qui impactent l'aperçu courant :
 * page affichée + CSS + JS (ignore les chunks vers d'autres pages HTML).
 */
export const fingerprintPreviewRelevant = (
  files: Array<{ path: string; content: string }>,
  streamingPaths: Record<string, string>,
  previewPage: string,
  projectId?: string,
): string => {
  const merged = mergeFilesForPreview(files, streamingPaths);
  const map = new Map(merged.map((f) => [normalizePreviewPath(f.path), f.content]));

  let digest = hashString(
    `${normalizePreviewPath(previewPage)}\0${projectId ?? ""}`,
  );
  digest = hashString(
    `${digest}\0page\0${resolvePageHtml(map, previewPage)}`,
  );
  digest = hashString(`${digest}\0css\0${contentAt(map, CSS_PATHS)}`);
  digest = hashString(`${digest}\0js\0${contentAt(map, JS_PATHS)}`);

  return String(digest);
};

const htmlCache = new Map<string, string>();
const cacheOrder: string[] = [];

const rememberHtml = (key: string, html: string): string => {
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

const patchedCssCache = new Map<number, string>();
const patchedJsCache = new Map<number, string>();

const getCachedPatchedCss = (rawCss: string): string => {
  const key = hashString(rawCss);
  const hit = patchedCssCache.get(key);
  if (hit !== undefined) return hit;
  const out = buildPreviewCssContent(rawCss);
  patchedCssCache.set(key, out);
  if (patchedCssCache.size > PATCH_CACHE_MAX) {
    const oldest = patchedCssCache.keys().next().value;
    if (oldest !== undefined) patchedCssCache.delete(oldest);
  }
  return out;
};

const getCachedPatchedJs = (rawJs: string, htmlHints: string[]): string => {
  const corpus = htmlHints.join("\n");
  const key = hashString(`${rawJs}\0${corpus}`);
  const hit = patchedJsCache.get(key);
  if (hit !== undefined) return hit;
  const out = buildPreviewJsContent(rawJs, htmlHints);
  patchedJsCache.set(key, out);
  if (patchedJsCache.size > PATCH_CACHE_MAX) {
    const oldest = patchedJsCache.keys().next().value;
    if (oldest !== undefined) patchedJsCache.delete(oldest);
  }
  return out;
};

/** @deprecated Utiliser fingerprintPreviewRelevant. */
export const fingerprintPreviewInputs = (
  files: PreviewFile[],
  pagePath: string,
  projectId?: string,
): string => fingerprintPreviewRelevant(files, {}, pagePath, projectId);

/** Force la mise à jour iframe (ex. file_saved) — bypass le debounce busy. */
export const applyPreviewHtml = (
  files: PreviewFile[],
  pagePath: string,
  projectId: string | undefined,
  setPreviewHtml: (html: string) => void,
): void => {
  const html = getCachedPreviewHtml(files, pagePath, projectId);
  if (html) setPreviewHtml(html);
};

/** Bundle mémorisé — CSS/JS patchés en cache séparé. */
export const getCachedPreviewHtml = (
  files: PreviewFile[],
  pagePath: string,
  projectId?: string,
): string => {
  if (files.length === 0) return "";

  const key = fingerprintPreviewRelevant(files, {}, pagePath, projectId);
  const cached = htmlCache.get(key);
  if (cached !== undefined) return cached;

  const { map, htmlHints, rawCss, rawJs } = resolvePreviewAssets(files);
  const pageHtml = resolvePageHtml(map, pagePath);
  if (!pageHtml) return "";

  const html = assemblePreviewHtml(
    pageHtml,
    getCachedPatchedCss(rawCss),
    getCachedPatchedJs(rawJs, htmlHints),
    htmlHints,
    projectId,
  );

  return rememberHtml(key, html);
};
