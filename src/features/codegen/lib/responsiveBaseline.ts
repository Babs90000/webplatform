/** Baseline responsive injectée dans css/style.css des sites générés. */

export const RESPONSIVE_BASELINE_MARKER = "wp-responsive-baseline";
export const MOBILE_RESCUE_MARKER = "wp-mobile-rescue";

export const RESPONSIVE_BASELINE_CSS = `
/* ${RESPONSIVE_BASELINE_MARKER} */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  overflow-x: clip;
  -webkit-text-size-adjust: 100%;
}

body {
  overflow-x: clip;
  max-width: 100%;
  margin: 0;
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

/** Filet de sécurité mobile — rattrape les grilles/flex oubliés par l'IA. */
export const MOBILE_RESCUE_CSS = `
/* ${MOBILE_RESCUE_MARKER} */
@media (max-width: 767px) {
  main,
  section,
  article,
  footer,
  header {
    max-width: 100%;
  }

  .container,
  .wrapper,
  [class*="wrapper"]:not(.icon-wrap),
  [class*="__container"],
  [class*="-container"]:not(.nav-menu):not(.navbar):not(.icon-wrap) {
    width: 100% !important;
    max-width: 100% !important;
    padding-inline: 1rem !important;
    margin-inline: auto !important;
  }

  [class*="grid"]:not(.nav-menu):not(.nav-links):not(.navbar-menu):not(.mobile-menu):not(.mobile-nav):not([class*="icon"]),
  [class*="cards"],
  [class*="Cards"],
  [class*="features"],
  [class*="Features"],
  [class*="services"],
  [class*="Services"],
  [class*="testimonial"],
  [class*="Testimonial"],
  [class*="team"],
  [class*="Team"],
  [class*="gallery"],
  [class*="Gallery"],
  [class*="pricing"],
  [class*="Pricing"],
  .footer-grid,
  .footer-content,
  .footer-columns,
  footer [class*="col"] {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  [class*="hero"],
  [class*="Hero"],
  [class*="split"],
  [class*="Split"],
  [class*="two-col"],
  [class*="two_col"],
  [class*="about-content"],
  [class*="contact-wrap"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 1.25rem !important;
    min-height: auto !important;
    padding: clamp(2.5rem, 10vw, 4rem) 1rem !important;
    text-align: center !important;
  }

  [class*="hero"] img,
  [class*="Hero"] img {
    width: 100% !important;
    max-width: 100% !important;
    object-fit: cover;
  }

  h1,
  .hero-title,
  [class*="hero"] h1 {
    font-size: clamp(1.65rem, 7.5vw, 2.5rem) !important;
    line-height: 1.15 !important;
    word-break: break-word;
  }

  h2,
  [class*="section-title"],
  [class*="section"] h2 {
    font-size: clamp(1.35rem, 5.5vw, 2rem) !important;
    line-height: 1.2 !important;
  }

  h3 {
    font-size: clamp(1.1rem, 4.5vw, 1.45rem) !important;
  }

  p,
  .lead,
  [class*="subtitle"],
  [class*="description"] {
    font-size: clamp(0.95rem, 3.8vw, 1.125rem) !important;
    line-height: 1.55 !important;
  }

  section,
  .section {
    padding-block: clamp(2.5rem, 8vw, 4rem) !important;
    padding-inline: 0 !important;
  }

  [class*="cta"],
  [class*="buttons"],
  [class*="btn-group"],
  [class*="actions"],
  [class*="hero"] [class*="btn"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    width: 100% !important;
  }

  main .btn,
  main a.btn,
  main a.button,
  main button:not(.nav-toggle):not(.menu-toggle):not(.hamburger):not(.navbar-toggle):not(.mobile-menu-btn),
  main input[type="submit"],
  footer .btn,
  footer a.btn {
    width: 100% !important;
    max-width: 100% !important;
  }

  footer {
    padding: 2rem 1rem !important;
  }

  footer > div,
  footer .container,
  footer .container > div {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1.5rem !important;
    width: 100% !important;
  }

  form,
  input:not([type="checkbox"]):not([type="radio"]),
  textarea,
  select {
    max-width: 100% !important;
    width: 100% !important;
  }

  table,
  pre {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  [class*="grid"]:not(.nav-menu):not(.nav-links):not(.navbar-menu):not(.mobile-menu),
  [class*="cards"],
  [class*="features"],
  [class*="services"],
  .footer-grid,
  .footer-content {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
`.trim();

export const appendResponsiveBaseline = (css: string): string => {
  let out = css.trim();
  if (!out.includes(RESPONSIVE_BASELINE_MARKER)) {
    out = `${out}\n\n${RESPONSIVE_BASELINE_CSS}\n`;
  }
  if (!out.includes(MOBILE_RESCUE_MARKER)) {
    out = `${out}\n\n${MOBILE_RESCUE_CSS}\n`;
  }
  return out;
};

const VIEWPORT_CONTENT =
  "width=device-width, initial-scale=1, viewport-fit=cover";

export const ensureViewportMeta = (html: string): string => {
  const viewportTag = `<meta name="viewport" content="${VIEWPORT_CONTENT}">`;

  if (/<meta[^>]+name=["']viewport["']/i.test(html)) {
    return html.replace(
      /<meta[^>]+name=["']viewport["'][^>]*>/i,
      viewportTag,
    );
  }

  return html.includes("<head>")
    ? html.replace(/<head([^>]*)>/i, `<head$1>${viewportTag}`)
    : `<head>${viewportTag}</head>${html}`;
};
