/** Miroir frontend de node-apps/webplatform/src/lib/codegen/nav-mobile-baseline.ts */

export const NAV_MOBILE_FIX_MARKER = "wp-nav-mobile-fix";
export const UI_BASELINE_MARKER = "wp-generated-ui-baseline";
export const NAV_CANONICAL_MARKER = "wp-nav-canonical";

export const NAV_MOBILE_FIX_CSS = `
/* ${NAV_MOBILE_FIX_MARKER} — panneau nav au-dessus de l'overlay (<1024px) */
@media (max-width: 1023px) {
  body.nav-open .nav-menu,
  body.nav-open .nav-links,
  body.nav-open .navbar-menu,
  body.nav-open .mobile-nav,
  body.nav-open .mobile-menu,
  body.menu-open .nav-menu,
  body.menu-open .nav-links,
  body.menu-open .navbar-menu,
  body.menu-open .mobile-nav,
  body.menu-open .mobile-menu,
  body.mobile-nav-open .nav-menu,
  body.mobile-nav-open .nav-links,
  body.is-menu-open .nav-menu,
  body.is-menu-open .nav-links,
  .nav-menu.is-open,
  .nav-menu.open,
  .nav-menu.active,
  .nav-links.is-open,
  .nav-links.open,
  .mobile-menu.is-open,
  .mobile-menu.open,
  header nav.is-open,
  header nav.open,
  .wp-nav-revealed {
    display: flex !important;
    flex-direction: column !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateX(0) !important;
    translate: none !important;
    max-height: min(85vh, 100dvh) !important;
    overflow-y: auto !important;
    z-index: 1001 !important;
  }

  .nav-overlay,
  .mobile-nav-overlay,
  .menu-overlay,
  .nav-backdrop,
  .menu-backdrop,
  [class*="nav-overlay"],
  [class*="menu-overlay"],
  [class*="nav-backdrop"],
  [class*="menu-backdrop"] {
    z-index: 1000 !important;
  }
}
`.trim();

export const UI_BASELINE_CSS = `
/* ${UI_BASELINE_MARKER} — toggle visible, drawer fermé, boutons accessibles (<1024px) */
@media (max-width: 1023px) {
  .nav-toggle,
  .menu-toggle,
  .navbar-toggle,
  .mobile-menu-btn,
  .hamburger,
  [class*="hamburger"],
  [class*="menu-toggle"],
  header button[aria-controls],
  .nav-toggle-btn {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    cursor: pointer;
    z-index: 1002;
  }

  .nav-menu,
  .nav-links,
  .navbar-menu,
  .mobile-menu,
  .mobile-nav,
  header .main-nav,
  .header-nav,
  header nav {
    position: fixed;
    top: 0;
    right: 0;
    width: min(100vw - 3rem, 320px);
    max-width: 85vw;
    height: 100dvh;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 5rem 1.5rem 2rem;
    background: var(--surface, var(--color-bg, #ffffff));
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
    z-index: 1001;
    transform: translateX(100%);
    transition: transform 0.3s ease, visibility 0.3s ease;
    overflow-y: auto;
  }
}

.btn,
button:not(.nav-toggle):not(.menu-toggle):not(.hamburger):not(.navbar-toggle),
input[type="submit"],
a.btn,
a.button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.btn:focus-visible,
button:focus-visible,
input[type="submit"]:focus-visible,
a.btn:focus-visible,
a.button:focus-visible {
  outline: 2px solid var(--color-primary, var(--primary, #2563eb));
  outline-offset: 2px;
}

a:not(.btn):not(.button):focus-visible {
  outline: 2px solid var(--color-primary, var(--primary, #2563eb));
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .nav-menu,
  .nav-links,
  .navbar-menu,
  .mobile-menu,
  .mobile-nav,
  .btn,
  button,
  a.btn {
    transition: none !important;
  }
}
`.trim();

export const NAV_CANONICAL_JS = `
/* ${NAV_CANONICAL_MARKER} */
(function () {
  if (window.__wpNavCanonical) return;
  window.__wpNavCanonical = true;

  var TOGGLE =
    ".nav-toggle, .menu-toggle, .navbar-toggle, .mobile-menu-btn, .hamburger, .nav-toggle-btn, header button[aria-controls]";
  var PANEL =
    "#nav-menu, .nav-menu, .nav-links, .navbar-menu, .mobile-nav, .mobile-menu, header nav, .main-nav, .header-nav";
  var OVERLAY =
    ".nav-overlay, .mobile-nav-overlay, .menu-overlay, .nav-backdrop, .menu-backdrop";
  var BODY_OPEN = ["nav-open", "menu-open"];

  var isMobile = function () {
    return window.matchMedia("(max-width: 1023px)").matches;
  };

  var isOpen = function () {
    return BODY_OPEN.some(function (c) {
      return document.body.classList.contains(c);
    });
  };

  var setOpen = function (open) {
    BODY_OPEN.forEach(function (c) {
      document.body.classList.toggle(c, open);
    });
    document.querySelectorAll(TOGGLE).forEach(function (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  };

  var bind = function () {
    document.querySelectorAll(TOGGLE).forEach(function (btn) {
      if (btn.dataset.wpNavBound === "1") return;
      if (/@click|x-on:click/i.test(btn.outerHTML)) return;
      if (btn.closest("[x-data]")) return;

      btn.dataset.wpNavBound = "1";
      if (!btn.getAttribute("aria-expanded")) {
        btn.setAttribute("aria-expanded", "false");
      }

      btn.addEventListener("click", function (e) {
        if (!isMobile()) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(!isOpen());
      });
    });

    document.querySelectorAll(OVERLAY).forEach(function (el) {
      if (el.dataset.wpNavBound === "1") return;
      el.dataset.wpNavBound = "1";
      el.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.querySelectorAll(PANEL + " a[href]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (isMobile()) setOpen(false);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
`.trim();

export const NAV_MOBILE_FIX_JS = `
/* ${NAV_MOBILE_FIX_MARKER} */
(function () {
  var OPEN_BODY = ["nav-open", "menu-open", "mobile-nav-open", "nav-active", "is-menu-open"];
  var PANEL =
    ".nav-menu, .nav-links, .navbar-menu, .mobile-nav, .mobile-menu, header nav, .main-nav, .site-nav > ul, .header-nav";
  var OVERLAY =
    ".nav-overlay, .mobile-nav-overlay, .menu-overlay, .nav-backdrop, .menu-backdrop, [class*='nav-overlay'], [class*='menu-overlay']";

  var panels = function () {
    return document.querySelectorAll(PANEL);
  };

  var overlayVisible = function () {
    var list = document.querySelectorAll(OVERLAY);
    for (var i = 0; i < list.length; i++) {
      var s = window.getComputedStyle(list[i]);
      if (s.display === "none" || s.visibility === "hidden") continue;
      if (parseFloat(s.opacity || "1") > 0.05) return true;
    }
    return false;
  };

  var toggleOpen = function () {
    if (OPEN_BODY.some(function (c) { return document.body.classList.contains(c); })) return true;
    var toggles = document.querySelectorAll(
      "[aria-expanded='true'], .nav-toggle.active, .menu-toggle.active, .hamburger.active"
    );
    return toggles.length > 0;
  };

  var alpinePanelOpen = function () {
    var found = false;
    panels().forEach(function (el) {
      var st = el.getAttribute("style") || "";
      if (st.indexOf("display: none") !== -1 || st.indexOf("display:none") !== -1) return;
      if (window.getComputedStyle(el).display === "none") return;
      found = true;
    });
    return found;
  };

  var refresh = function () {
    var shouldReveal = overlayVisible() || toggleOpen() || alpinePanelOpen();
    panels().forEach(function (el) {
      if (shouldReveal) el.classList.add("wp-nav-revealed");
      else el.classList.remove("wp-nav-revealed");
    });
  };

  document.addEventListener("click", function () {
    requestAnimationFrame(refresh);
    setTimeout(refresh, 50);
    setTimeout(refresh, 280);
  });

  if (document.body) {
    new MutationObserver(refresh).observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }
})();
`.trim();

const NAV_TOGGLE_PATTERN =
  /nav-open|menu-open|mobile-nav-open|is-menu-open|aria-expanded|classList\.(toggle|add|remove).*?(nav|menu)|@click\s*=\s*["'][^"']*\bopen\b|x-data\s*=\s*["'{][^"']*\bopen\b/i;

export const hasNavToggleLogic = (
  js: string,
  htmlHints: string[] = [],
): boolean => NAV_TOGGLE_PATTERN.test([js, ...htmlHints].join("\n"));

export const appendNavMobileFixCss = (css: string): string => {
  let out = css.trim();
  if (!out.includes(NAV_MOBILE_FIX_MARKER)) {
    out = `${out}\n\n${NAV_MOBILE_FIX_CSS}\n`;
  }
  if (!out.includes(UI_BASELINE_MARKER)) {
    out = `${out}\n\n${UI_BASELINE_CSS}\n`;
  }
  return out;
};

export const appendNavMobileFixJs = (
  js: string,
  htmlHints: string[] = [],
): string => {
  let out = js.trim();
  if (!out.includes(NAV_CANONICAL_MARKER) && !hasNavToggleLogic(out, htmlHints)) {
    out = out ? `${out}\n\n${NAV_CANONICAL_JS}\n` : `${NAV_CANONICAL_JS}\n`;
  }
  if (!out.includes(NAV_MOBILE_FIX_MARKER)) {
    out = out ? `${out}\n\n${NAV_MOBILE_FIX_JS}\n` : `${NAV_MOBILE_FIX_JS}\n`;
  }
  return out;
};
