export const WP_NAV_RUNTIME_MARKER = "wp-nav-runtime";

export const WP_NAV_CSS_PATH = "css/wp-nav-runtime.css";
export const WP_NAV_JS_PATH = "js/wp-nav-runtime.js";

/** Servis depuis public/wp-nav-runtime/ pour l’aperçu studio (iframe srcdoc). */
export const WP_NAV_PREVIEW_CSS_URL = "/wp-nav-runtime/wp-nav-runtime.css";
export const WP_NAV_PREVIEW_JS_URL = "/wp-nav-runtime/wp-nav-runtime.js";

export interface SiteFile {
  path: string;
  content: string;
}

const normalizePath = (path: string): string =>
  path.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();

export const hasWpNavRuntimeAssets = (files: SiteFile[]): boolean => {
  const paths = new Set(files.map((f) => normalizePath(f.path)));
  return (
    paths.has(normalizePath(WP_NAV_CSS_PATH)) &&
    paths.has(normalizePath(WP_NAV_JS_PATH))
  );
};

/** Ajoute les chemins runtime au bundle (contenu fourni par le caller si besoin). */
export const ensureWpNavRuntimeFiles = (
  files: SiteFile[],
  runtimeContent?: { css: string; js: string },
): SiteFile[] => {
  if (!runtimeContent) return files;
  const map = new Map(files.map((f) => [normalizePath(f.path), f]));
  if (!map.has(normalizePath(WP_NAV_CSS_PATH))) {
    map.set(normalizePath(WP_NAV_CSS_PATH), {
      path: WP_NAV_CSS_PATH,
      content: runtimeContent.css,
    });
  }
  if (!map.has(normalizePath(WP_NAV_JS_PATH))) {
    map.set(normalizePath(WP_NAV_JS_PATH), {
      path: WP_NAV_JS_PATH,
      content: runtimeContent.js,
    });
  }
  return [...map.values()];
};

const hasNavInHtml = (html: string): boolean =>
  /nav-toggle|#nav-menu|\.nav-menu|aria-controls|hamburger|mobile-menu/i.test(
    html,
  );

export const injectWpNavRuntimeTags = (
  html: string,
  options: { preview?: boolean } = {},
): string => {
  if (!hasNavInHtml(html)) return html;
  if (html.includes(WP_NAV_RUNTIME_MARKER)) return html;

  const cssHref = options.preview ? WP_NAV_PREVIEW_CSS_URL : WP_NAV_CSS_PATH;
  const jsSrc = options.preview ? WP_NAV_PREVIEW_JS_URL : WP_NAV_JS_PATH;

  let out = html;

  const linkTag = `<link rel="stylesheet" href="${cssHref}" data-wp="${WP_NAV_RUNTIME_MARKER}">`;
  if (!out.includes(cssHref) && !out.includes("wp-nav-runtime.css")) {
    out = out.includes("</head>")
      ? out.replace("</head>", `  ${linkTag}\n</head>`)
      : `${linkTag}\n${out}`;
  }

  const scriptTag = `<script src="${jsSrc}" defer data-wp="${WP_NAV_RUNTIME_MARKER}"></script>`;
  if (!out.includes(jsSrc) && !out.includes("wp-nav-runtime.js")) {
    out = out.includes("</body>")
      ? out.replace("</body>", `  ${scriptTag}\n</body>`)
      : `${out}\n${scriptTag}`;
  }

  return out;
};

export const injectPreviewContextScript = (
  html: string,
  emulatedWidth: number | null,
): string => {
  if (!emulatedWidth || emulatedWidth <= 0) return html;
  if (html.includes("__WP_PREVIEW__")) return html;

  const script = `<script>window.__WP_PREVIEW__={emulatedWidth:${emulatedWidth}};</script>`;
  return html.includes("</head>")
    ? html.replace("</head>", `  ${script}\n</head>`)
    : `${script}\n${html}`;
};

export const patchSiteFilesWithWpNav = (
  files: SiteFile[],
  options: { preview?: boolean; emulatedWidth?: number | null } = {},
): SiteFile[] => {
  return files.map((file) => {
    if (!file.path.toLowerCase().endsWith(".html")) return file;
    let content = injectWpNavRuntimeTags(file.content, {
      preview: options.preview,
    });
    if (options.preview && options.emulatedWidth) {
      content = injectPreviewContextScript(content, options.emulatedWidth);
    }
    return { ...file, content };
  });
};
