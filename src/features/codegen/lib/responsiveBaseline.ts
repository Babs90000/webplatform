/** Miroir frontend de node-apps/webplatform/src/lib/codegen/responsive-baseline.ts */

export const RESPONSIVE_BASELINE_MARKER = "wp-responsive-baseline";

export const RESPONSIVE_BASELINE_CSS = `
/* ${RESPONSIVE_BASELINE_MARKER} */
html {
  overflow-x: clip;
  -webkit-text-size-adjust: 100%;
}

body {
  overflow-x: clip;
  max-width: 100%;
}

img,
picture,
video,
iframe {
  max-width: 100%;
  height: auto;
}

.container {
  width: min(100% - 2rem, var(--container-max, 1200px));
  margin-inline: auto;
  padding-inline: 1rem;
}

@media (max-width: 767px) {
  .container,
  .wrapper,
  [class*="__container"],
  [class*="-container"]:not(.nav-menu):not(.navbar) {
    width: min(100% - 1.25rem, 100%) !important;
    max-width: 100% !important;
    padding-inline: 0.75rem;
  }

  .grid,
  [class*="grid"]:not([class*="icon"]),
  .features-grid,
  .cards-grid,
  .card-grid,
  .services-grid {
    grid-template-columns: 1fr !important;
  }

  section,
  .section {
    padding-block: clamp(2.5rem, 8vw, 4rem);
  }

  h1,
  .hero-title {
    font-size: clamp(1.75rem, 7vw, 2.75rem) !important;
    line-height: 1.15 !important;
  }

  .hero,
  [class*="hero"] {
    padding-inline: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .nav-toggle,
  .menu-toggle,
  .navbar-toggle,
  .mobile-menu-btn,
  .hamburger,
  [class*="hamburger"],
  [class*="menu-toggle"],
  header button[aria-expanded][aria-controls],
  .nav-toggle-btn {
    display: none !important;
  }

  .nav-menu,
  .nav-links,
  .navbar-menu,
  .site-nav > ul,
  .main-nav,
  header nav,
  .header-nav {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    position: static !important;
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
    pointer-events: auto !important;
  }
}
`.trim();

export const appendResponsiveBaseline = (css: string): string => {
  if (css.includes(RESPONSIVE_BASELINE_MARKER)) return css;
  return `${css.trim()}\n\n${RESPONSIVE_BASELINE_CSS}\n`;
};

export const ensureViewportMeta = (html: string): string => {
  if (/<meta[^>]+name=["']viewport["']/i.test(html)) return html;
  const viewport =
    '<meta name="viewport" content="width=device-width, initial-scale=1">';
  return html.includes("<head>")
    ? html.replace(/<head([^>]*)>/i, `<head$1>${viewport}`)
    : `<head>${viewport}</head>${html}`;
};
