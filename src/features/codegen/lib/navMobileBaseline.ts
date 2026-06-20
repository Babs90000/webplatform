/** @deprecated Utiliser wp-nav-runtime/ — fichiers css/js séparés. */
export {
  WP_NAV_RUNTIME_MARKER as NAV_MOBILE_FIX_MARKER,
} from "./wp-nav-runtime";

export const appendNavMobileFixCss = (css: string): string => css.trim();

export const appendNavMobileFixJs = (
  js: string,
  _htmlHints: string[] = [],
): string => js.trim();

export const hasNavToggleLogic = (
  js: string,
  htmlHints: string[] = [],
): boolean =>
  /nav-toggle|#nav-menu|wp-nav-open|aria-controls/i.test(
    [js, ...htmlHints].join("\n"),
  );
