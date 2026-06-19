import {
  appendResponsiveBaseline,
  ensureViewportMeta,
} from "./responsiveBaseline";
import {
  appendNavMobileFixCss,
  appendNavMobileFixJs,
} from "./navMobileBaseline";

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

const normalizePath = (path: string): string =>
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

/** Assemble HTML/CSS/JS en un document pour iframe srcDoc */
export const bundlePreviewHtml = (
  files: PreviewFile[],
  pagePath = "index.html",
  projectId?: string,
): string => {
  if (files.length === 0) {
    return "";
  }

  const map = new Map(files.map((f) => [normalizePath(f.path), f.content]));
  const pageKey = normalizePath(pagePath);

  let html =
    map.get(pageKey) ??
    map.get("index.html") ??
    [...map.entries()].find(([p]) => p.endsWith(".html"))?.[1] ??
    "";

  if (!html) {
    return "";
  }

  if (projectId) {
    html = patchHtmlForPreview(html, projectId);
  }

  const cssContent = appendNavMobileFixCss(
    appendResponsiveBaseline(
      map.get("css/style.css") ?? map.get("styles.css") ?? "",
    ),
  );
  const jsContent = appendNavMobileFixJs(
    map.get("js/app.js") ?? map.get("script.js") ?? "",
  );

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

  return html;
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
