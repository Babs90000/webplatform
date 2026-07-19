/**
 * Correctifs CSS appendus en fin de style.css pour éviter les régressions desktop
 * (débordements horizontaux, images non contraintes).
 * La navigation mobile est gérée par css/wp-nav-runtime.css (fichier séparé).
 */

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

/**
 * Filet de sécurité — tablette + mobile.
 * Couvre max-width 1023px pour les layouts 2-col (hero/about/footer),
 * puis renforce typo/boutons/forms sous 767px.
 */
export const MOBILE_RESCUE_CSS = `
/* ${MOBILE_RESCUE_MARKER} */
@media (max-width: 1023px) {
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

  /* Hero / about / split : toujours 1 colonne sous desktop */
  .hero .container,
  [class*="hero"] .container,
  [class*="Hero"] .container,
  .about-grid,
  [class*="about-grid"],
  [class*="about"] > .container,
  [class*="split"],
  [class*="Split"],
  [class*="two-col"],
  [class*="two_col"] {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1.5rem !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
  }

  [class*="hero"],
  [class*="Hero"] {
    min-height: auto !important;
  }

  [class*="hero"] img,
  [class*="Hero"] img,
  .hero-image,
  .about-image {
    width: 100% !important;
    max-width: 100% !important;
    object-fit: cover;
  }

  .hero-content,
  .about-content,
  [class*="hero-content"],
  [class*="about-content"] {
    align-items: center !important;
    text-align: center !important;
  }

  .hero-cta,
  [class*="hero-cta"],
  [class*="hero"] [class*="cta"],
  [class*="hero"] [class*="btn"] {
    justify-content: center !important;
    flex-wrap: wrap !important;
  }

  .footer-grid,
  .footer-content,
  .footer-columns {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1.5rem !important;
    width: 100% !important;
  }

  .footer-brand {
    grid-column: 1 / -1 !important;
  }

  /* Formulaires 2 colonnes → 1 colonne */
  .reservation-form,
  [class*="form-grid"],
  form[class*="grid"] {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 767px) {
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
  footer [class*="col"],
  .stats-grid,
  [class*="stats"] {
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

  .footer-grid,
  .footer-content,
  .footer-columns {
    grid-template-columns: 1fr !important;
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
  [class*="grid"]:not(.nav-menu):not(.nav-links):not(.navbar-menu):not(.mobile-menu):not(.footer-grid):not(.about-grid),
  [class*="cards"],
  [class*="features"],
  [class*="services"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
`.trim();

const VIEWPORT_CONTENT =
  "width=device-width, initial-scale=1, viewport-fit=cover";

/**
 * Garantit un meta viewport correct, placé juste après <head>.
 * Remplace toute variante existante (y compris mal formées).
 */
export const ensureViewportMeta = (html: string): string => {
  const viewportTag = `<meta name="viewport" content="${VIEWPORT_CONTENT}">`;

  // Retire toutes les balises viewport existantes (y compris variants)
  let out = html.replace(/<meta[^>]*name\s*=\s*["']viewport["'][^>]*>\s*/gi, "");

  if (/<head[^>]*>/i.test(out)) {
    // Insère immédiatement après <head> (avant charset éventuel ok — viewport early)
    out = out.replace(/<head([^>]*)>/i, `<head$1>\n  ${viewportTag}`);
    return out;
  }

  if (/<html[^>]*>/i.test(out)) {
    return out.replace(
      /<html([^>]*)>/i,
      `<html$1><head>${viewportTag}</head>`,
    );
  }

  return `<!DOCTYPE html><html><head>${viewportTag}</head>${out}`;
};

/** Retire un bloc CSS délimité par un marqueur commentaire jusqu'au prochain marqueur ou EOF. */
const stripMarkedBlock = (css: string, marker: string): string => {
  const start = css.indexOf(`/* ${marker}`);
  if (start === -1) {
    // Ancien format possible : /* marker */ sans espace après /*
    const alt = css.indexOf(`/*${marker}`);
    if (alt === -1) return css;
    return stripFrom(css, alt, marker);
  }
  return stripFrom(css, start, marker);
};

const stripFrom = (css: string, start: number, marker: string): string => {
  const afterStart = css.slice(start + 3);
  // Cherche le prochain marqueur wp- ou fin de fichier
  const nextMarkers = [
    RESPONSIVE_BASELINE_MARKER,
    MOBILE_RESCUE_MARKER,
  ].filter((m) => m !== marker);

  let end = css.length;
  for (const m of nextMarkers) {
    const idx = css.indexOf(`/* ${m}`, start + 1);
    const idx2 = css.indexOf(`/*${m}`, start + 1);
    for (const i of [idx, idx2]) {
      if (i !== -1 && i < end) end = i;
    }
  }

  // Si le marqueur est suivi d'un autre bloc non-wp, on coupe à la fin
  // du contenu typique : on garde jusqu'à end
  void afterStart;
  return `${css.slice(0, start).trimEnd()}\n${css.slice(end).trimStart()}`.trim();
};

/**
 * Append (ou remplace) baseline + mobile-rescue.
 * Les sites déjà patchés reçoivent le nouveau rescue au prochain deploy/serve.
 */
export const appendResponsiveBaseline = (css: string): string => {
  let out = css.trim();
  out = stripMarkedBlock(out, RESPONSIVE_BASELINE_MARKER);
  out = stripMarkedBlock(out, MOBILE_RESCUE_MARKER);
  out = out.trimEnd();
  return `${out}\n\n${RESPONSIVE_BASELINE_CSS}\n\n${MOBILE_RESCUE_CSS}\n`;
};

export const isMainStylesheetPath = (filePath: string): boolean => {
  const lower = filePath.toLowerCase().replace(/\\/g, "/").replace(/^\/+/, "");
  return (
    lower === "css/style.css" ||
    lower === "styles.css" ||
    lower === "style.css" ||
    lower.endsWith("/style.css") ||
    lower.endsWith("/styles.css")
  );
};

export const patchCssFile = (content: string): string =>
  appendResponsiveBaseline(content);

export const patchHtmlFile = (content: string): string =>
  ensureViewportMeta(content);
