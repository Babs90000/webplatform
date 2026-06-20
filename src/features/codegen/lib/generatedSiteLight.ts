/** Miroir frontend de node-apps/webplatform/src/lib/codegen/generated-site-light.ts */

export const LUCIDE_SCRIPT_RE =
  /<script[^>]*\bsrc=["'][^"']*lucide[^"']*["'][^>]*>\s*<\/script>\s*/gi;

export const ALPINE_SCRIPT_RE =
  /<script[^>]*\bsrc=["'][^"']*alpinejs[^"']*["'][^>]*>\s*<\/script>\s*/gi;

export const usesLucideMarkup = (corpus: string): boolean =>
  /data-lucide\s*=|lucide\.createIcons/i.test(corpus);

export const usesAlpineMarkup = (corpus: string): boolean =>
  /\b(x-data|x-show|x-if|x-for|x-bind|x-on:|@click|@submit|x-model)\b/i.test(
    corpus,
  );

export const optimizeGoogleFontsLink = (html: string): string =>
  html.replace(
    /href=(["'])(https:\/\/fonts\.googleapis\.com\/css2[^"']*)\1/gi,
    (_match, quote: string, url: string) => {
      let next = url;
      if (!/display=swap/i.test(next)) {
        next += next.includes("?") ? "&display=swap" : "?display=swap";
      }
      return `href=${quote}${next}${quote}`;
    },
  );

export const stripUnusedCdnScripts = (
  html: string,
  htmlCorpus: string[],
): string => {
  const corpus = [html, ...htmlCorpus].join("\n");
  let out = optimizeGoogleFontsLink(html);
  if (!usesLucideMarkup(corpus)) {
    out = out.replace(LUCIDE_SCRIPT_RE, "");
  }
  if (!usesAlpineMarkup(corpus)) {
    out = out.replace(ALPINE_SCRIPT_RE, "");
  }
  return out;
};

export const stripUnusedJs = (js: string, htmlCorpus: string): string => {
  if (usesLucideMarkup(htmlCorpus)) return js;
  return js
    .replace(
      /\n?if\s*\(\s*typeof\s+lucide[\s\S]*?lucide\.createIcons\(\)\s*;?\s*/gi,
      "\n",
    )
    .replace(/\n?lucide\.createIcons\(\)\s*;?\s*/gi, "\n");
};
