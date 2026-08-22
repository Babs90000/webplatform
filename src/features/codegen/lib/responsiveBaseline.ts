/**
 * Correctifs CSS appendus en fin de style.css.
 *
 * Trois couches, de la plus douce à la plus intrusive :
 *  1. baseline  — toujours injectée, spécificité nulle (`:where`) sauf pour
 *                 les bugs bloquants (nav desktop invisible, style inline).
 *  2. guard     — toujours injectée, empêche uniquement les débordements.
 *  3. rescue    — injectée SEULEMENT si la feuille générée n'a pas de vrais
 *                 points de rupture. Elle reconstruit un layout mobile de
 *                 secours et écrase donc beaucoup de règles : l'appliquer à
 *                 un site déjà responsive dégrade le design.
 *
 * La navigation mobile est gérée par css/wp-nav-runtime.css (fichier séparé).
 */

export const RESPONSIVE_BASELINE_MARKER = "wp-responsive-baseline";
export const MOBILE_GUARD_MARKER = "wp-mobile-guard";
export const MOBILE_RESCUE_MARKER = "wp-mobile-rescue";

const PLATFORM_MARKERS = [
  RESPONSIVE_BASELINE_MARKER,
  MOBILE_GUARD_MARKER,
  MOBILE_RESCUE_MARKER,
];

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
iframe,
canvas {
  max-width: 100%;
  height: auto;
}

svg {
  max-width: 100%;
}

h1,
h2,
h3,
h4 {
  overflow-wrap: break-word;
}

:where(.container) {
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

  /* Un drawer mobile laissé en place masque le menu sur desktop : on le
     ramène toujours en ligne. Seules les propriétés qui le cachent sont
     forcées — l'espacement reste au design (voir :where ci-dessous). */
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
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    transform: none !important;
    pointer-events: auto !important;
    background: none;
    box-shadow: none;
  }

  :where(.nav-menu, .nav-links, .navbar-menu, .main-nav, header nav, .header-nav) {
    gap: 1.5rem;
    padding: 0;
  }

  /* CTA de navbar : les styles de drawer (margin-top inline, largeur 100%)
     doivent disparaître, mais on garde le padding du design. */
  .nav-menu .btn,
  .nav-menu a.btn,
  .nav-links .btn,
  #nav-menu .btn,
  #nav-menu a.btn {
    margin-block: 0 !important;
    width: auto !important;
    max-width: none !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  :where(.nav-menu, #nav-menu) a:not(.btn) {
    border-bottom: none;
    padding-block: 0;
  }
}
`.trim();

/**
 * Garde-fou permanent : uniquement de l'anti-débordement.
 * Aucune règle ne change une mise en page choisie par le design.
 */
export const MOBILE_GUARD_CSS = `
/* ${MOBILE_GUARD_MARKER} */
@media (max-width: 1023px) {
  :where(main, section, article, header, footer, div) {
    max-width: 100%;
  }

  :where(.container, .wrapper, [class*="__container"], [class*="-container"]) {
    max-width: 100%;
  }

  :where(table, pre) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  :where(input:not([type="checkbox"]):not([type="radio"]), textarea, select) {
    max-width: 100%;
  }

  /* Un mot très long (URL, email) ne doit pas créer de scroll horizontal. */
  :where(p, li, td, dd, address, blockquote) {
    overflow-wrap: break-word;
  }
}
`.trim();

/**
 * Filet de secours — appliqué uniquement aux feuilles sans points de rupture.
 * Reconstruit un layout mobile lisible : 1 colonne, typo fluide, CTA empilés.
 */
export const MOBILE_RESCUE_CSS = `
/* ${MOBILE_RESCUE_MARKER} */
@media (max-width: 1023px) {
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

  [class*="hero"] img:not([class*="avatar"]),
  [class*="Hero"] img:not([class*="avatar"]),
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
  [class*="hero"] [class*="cta"] {
    justify-content: center !important;
    flex-wrap: wrap !important;
  }

  /* Tablette : footer en 2 colonnes côte à côte */
  .footer-grid,
  .footer-content,
  .footer-columns {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1.5rem !important;
    width: 100% !important;
    text-align: left !important;
  }

  .footer-brand,
  .footer-grid > :first-child {
    grid-column: 1 / -1 !important;
  }

  .reservation-form,
  [class*="form-grid"],
  form[class*="grid"] {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 767px) {
  /* Grilles de contenu — les avatars/auteurs ne sont jamais ciblés */
  .testimonials-grid,
  [class*="testimonials-grid"],
  [class*="testimonial-grid"],
  [class*="grid"]:not(.nav-menu):not(.nav-links):not(.navbar-menu):not(.mobile-menu):not(.mobile-nav):not([class*="icon"]):not([class*="avatar"]),
  [class*="cards"],
  [class*="Cards"],
  [class*="features"],
  [class*="Features"],
  [class*="services"],
  [class*="Services"],
  [class*="team"],
  [class*="Team"],
  [class*="gallery"],
  [class*="Gallery"],
  [class*="pricing"],
  [class*="Pricing"],
  .footer-grid,
  .footer-content,
  .footer-columns,
  .stats-grid,
  [class*="stats-row"],
  [class*="stats-grid"] {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Photos rondes : protégées des règles width:100% ci-dessus */
  img.avatar,
  img[class*="avatar"],
  .testimonial-avatar,
  [class*="testimonial-avatar"] {
    width: 48px !important;
    height: 48px !important;
    max-width: 48px !important;
    aspect-ratio: 1 / 1 !important;
    object-fit: cover !important;
    border-radius: 999px !important;
    flex-shrink: 0 !important;
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
    text-align: center !important;
  }

  h1,
  .hero-title,
  [class*="hero"] h1 {
    font-size: clamp(1.65rem, 7.5vw, 2.5rem) !important;
    line-height: 1.15 !important;
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
  }

  /* Le padding latéral revient au .container enfant : sinon il est doublé */
  section:has(> .container),
  .section:has(> .container) {
    padding-inline: 0 !important;
  }

  [class*="hero-cta"],
  [class*="btn-group"],
  [class*="hero-actions"],
  [class*="cta-actions"],
  .hero-actions,
  .cta-buttons {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    width: 100% !important;
  }

  /* Boutons pleine largeur seulement là où c'est attendu (hero, CTA, form) */
  :is([class*="hero"], [class*="cta"], [class*="actions"], [class*="btn-group"], form)
    :is(.btn, a.btn, a.button, button:not([aria-controls]), input[type="submit"]) {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* CTA dans le drawer mobile : pleine largeur OK */
  .nav-menu .btn,
  #nav-menu .btn {
    width: 100% !important;
    margin-top: 0.75rem !important;
    text-align: center !important;
  }

  footer {
    padding: 2rem 1rem !important;
    text-align: center !important;
  }

  .footer-grid,
  .footer-content,
  .footer-columns {
    grid-template-columns: 1fr !important;
    justify-items: center !important;
    text-align: center !important;
  }

  .footer-brand,
  .footer-grid > :first-child {
    grid-column: auto !important;
  }

  .footer-links,
  .social-links {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .footer-links {
    flex-direction: column !important;
    gap: 0.5rem !important;
  }

  form,
  input:not([type="checkbox"]):not([type="radio"]),
  textarea,
  select {
    max-width: 100% !important;
    width: 100% !important;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  [class*="grid"]:not(.nav-menu):not(.nav-links):not(.navbar-menu):not(.mobile-menu):not(.footer-grid):not(.about-grid):not([class*="avatar"]),
  [class*="cards"],
  [class*="features"],
  [class*="services"],
  .testimonials-grid,
  [class*="testimonials-grid"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .footer-grid,
  .footer-content,
  .footer-columns {
    grid-template-columns: 1fr 1fr !important;
    text-align: left !important;
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
  const nextMarkers = PLATFORM_MARKERS.filter((m) => m !== marker);

  let end = css.length;
  for (const m of nextMarkers) {
    const idx = css.indexOf(`/* ${m}`, start + 1);
    const idx2 = css.indexOf(`/*${m}`, start + 1);
    for (const i of [idx, idx2]) {
      if (i !== -1 && i < end) end = i;
    }
  }

  return `${css.slice(0, start).trimEnd()}\n${css.slice(end).trimStart()}`.trim();
};

/** Retire tous les blocs injectés par la plateforme (idempotence). */
export const stripPlatformBlocks = (css: string): string => {
  let out = css.trim();
  for (const marker of PLATFORM_MARKERS) {
    out = stripMarkedBlock(out, marker);
  }
  return out.trimEnd();
};

const MEDIA_BREAKPOINT_RE =
  /@media[^{]*\(\s*(min|max)-width\s*:\s*(\d+(?:\.\d+)?)\s*(px|rem|em)\s*\)/gi;

const toPx = (value: number, unit: string): number =>
  unit === "px" ? value : value * 16;

/**
 * Détecte si la feuille écrite par le générateur gère réellement le responsive.
 * Deux points de rupture distincts suffisent (mobile-first ou desktop-first) :
 * en dessous, le site est figé en largeur desktop et a besoin du filet de secours.
 */
export const hasAuthoredBreakpoints = (css: string): boolean => {
  const authored = stripPlatformBlocks(css);
  const breakpoints = new Set<number>();

  for (const match of authored.matchAll(MEDIA_BREAKPOINT_RE)) {
    const px = toPx(Number(match[2]), match[3].toLowerCase());
    if (px >= 320 && px <= 1600) breakpoints.add(px);
  }

  return breakpoints.size >= 2;
};

/**
 * Append (ou remplace) baseline + garde-fou, et n'ajoute le filet de secours
 * mobile que si la feuille n'a pas de points de rupture exploitables.
 */
export const appendResponsiveBaseline = (css: string): string => {
  const authored = stripPlatformBlocks(css);
  const layers = [RESPONSIVE_BASELINE_CSS, MOBILE_GUARD_CSS];

  if (!hasAuthoredBreakpoints(authored)) {
    layers.push(MOBILE_RESCUE_CSS);
  }

  return `${authored}\n\n${layers.join("\n\n")}\n`;
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
