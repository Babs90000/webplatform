import {
  appendResponsiveBaseline,
  ensureViewportMeta,
} from "./responsiveBaseline";
import {
  stripUnusedCdnScripts,
  stripUnusedJs,
} from "./generatedSiteLight";
import {
  injectPreviewContextScript,
  injectWpNavRuntimeTags,
  WP_NAV_RUNTIME_MARKER,
} from "./wp-nav-runtime";

export interface PreviewFile {
  path: string;
  content: string;
}

const NAVIGATION_SCRIPT = `
<script>
(function(){
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    e.preventDefault();
    window.parent.postMessage({ type: 'wp-preview-navigate', path: href }, '*');
  });
})();
</script>`;

const ALPINE_CDN =
  '<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>';

const usesAlpine = (html: string): boolean =>
  /\b(x-data|x-show|x-if|x-for|x-bind|x-on:|@click|@submit|x-model|x-transition|x-text|x-html)\b/i.test(
    html,
  );

const hasAlpineScript = (html: string): boolean =>
  /alpinejs|alpine\.js/i.test(html);

export const normalizePreviewPath = (path: string): string =>
  path.replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();

const CONTACT_PLACEHOLDER = "__WP_CONTACT_API__";
const PROJECT_ID_PLACEHOLDER = "__WP_PROJECT_ID__";

export const patchHtmlForPreview = (
  content: string,
  projectId: string,
): string => {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const contactUrl = `${apiBase}/public/contact`;

  let html = content
    .replaceAll(CONTACT_PLACEHOLDER, contactUrl)
    .replaceAll(PROJECT_ID_PLACEHOLDER, projectId);

  if (
    html.includes('method="POST"') &&
    html.includes(contactUrl) &&
    !html.includes('name="project_id"')
  ) {
    html = html.replace(
      /(<form[^>]*method=["']POST["'][^>]*>)/i,
      `$1<input type="hidden" name="project_id" value="${projectId}">`,
    );
  }

  return html;
};

export const buildPreviewCssContent = (rawCss: string): string =>
  appendResponsiveBaseline(rawCss);

export const buildPreviewJsContent = (
  rawJs: string,
  htmlHints: string[],
): string => stripUnusedJs(rawJs, htmlHints.join("\n"));

export interface PreviewAssets {
  map: Map<string, string>;
  htmlHints: string[];
  rawCss: string;
  rawJs: string;
}

export const resolvePreviewAssets = (files: PreviewFile[]): PreviewAssets => {
  const map = new Map(files.map((f) => [normalizePreviewPath(f.path), f.content]));
  const htmlHints = [...map.entries()]
    .filter(([p]) => p.endsWith(".html"))
    .map(([, content]) => content);

  return {
    map,
    htmlHints,
    rawCss: map.get("css/style.css") ?? map.get("styles.css") ?? "",
    rawJs: map.get("js/app.js") ?? map.get("script.js") ?? "",
  };
};

export const resolvePageHtml = (
  map: Map<string, string>,
  pagePath: string,
): string =>
  map.get(normalizePreviewPath(pagePath)) ??
  map.get("index.html") ??
  [...map.entries()].find(([p]) => p.endsWith(".html"))?.[1] ??
  "";

export interface AssemblePreviewOptions {
  projectId?: string;
  emulatedWidth?: number | null;
}

/** Assemble un document iframe — nav runtime via fichiers publics, pas inline. */
export const assemblePreviewHtml = (
  pageHtml: string,
  cssContent: string,
  jsContent: string,
  htmlHints: string[],
  options: AssemblePreviewOptions = {},
): string => {
  if (!pageHtml) return "";

  const { projectId, emulatedWidth = null } = options;
  let html = projectId ? patchHtmlForPreview(pageHtml, projectId) : pageHtml;

  html = injectWpNavRuntimeTags(html, { preview: true });
  html = injectPreviewContextScript(html, emulatedWidth ?? null);

  if (cssContent) {
    html = html.replace(
      /<link[^>]+href=["']css\/style\.css["'][^>]*>/i,
      `<style>${cssContent}</style>`,
    );
    if (!html.includes("<style>")) {
      html = html.replace("</head>", `<style>${cssContent}</style></head>`);
    }
  }

  if (jsContent) {
    html = html.replace(
      /<script[^>]+src=["']js\/app\.js["'][^>]*><\/script>/i,
      `<script>${jsContent}</script>`,
    );
    if (!html.includes(`<script>${jsContent.slice(0, 20)}`)) {
      html = html.replace("</body>", `<script>${jsContent}</script></body>`);
    }
  }

  if (usesAlpine(html) && !hasAlpineScript(html)) {
    html = html.includes("</head>")
      ? html.replace("</head>", `${ALPINE_CDN}</head>`)
      : html.replace("</body>", `${ALPINE_CDN}</body>`);
  }

  if (!html.includes("wp-preview-navigate")) {
    html = html.replace("</body>", `${NAVIGATION_SCRIPT}</body>`);
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    html = ensureViewportMeta(html);
  }

  return stripUnusedCdnScripts(html, htmlHints);
};

export { WP_NAV_RUNTIME_MARKER };

/** Assemble HTML/CSS/JS en un document pour iframe srcDoc */
export const bundlePreviewHtml = (
  files: PreviewFile[],
  pagePath = "index.html",
  projectId?: string,
  emulatedWidth?: number | null,
): string => {
  if (files.length === 0) return "";

  const { map, htmlHints, rawCss, rawJs } = resolvePreviewAssets(files);
  const pageHtml = resolvePageHtml(map, pagePath);
  if (!pageHtml) return "";

  return assemblePreviewHtml(
    pageHtml,
    buildPreviewCssContent(rawCss),
    buildPreviewJsContent(rawJs, htmlHints),
    htmlHints,
    { projectId, emulatedWidth },
  );
};

export const listHtmlPages = (files: PreviewFile[]): string[] =>
  files
    .filter((f) => f.path.toLowerCase().endsWith(".html"))
    .map((f) => f.path)
    .sort((a, b) => {
      if (a === "index.html") return -1;
      if (b === "index.html") return 1;
      return a.localeCompare(b);
    });

export const resolveEmulatedPreviewWidth = (
  previewViewport: string,
  customWidth?: number | null,
): number | null => {
  switch (previewViewport) {
    case "mobile":
      return 375;
    case "tablet":
      return 768;
    case "desktop1280":
      return 1280;
    case "desktop1440":
      return 1440;
    case "custom":
      return customWidth ?? 390;
    default:
      return null;
  }
};
