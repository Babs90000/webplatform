/** Miroir frontend de node-apps/webplatform/src/lib/codegen/nav-mobile-baseline.ts */

export const NAV_MOBILE_FIX_MARKER = "wp-nav-mobile-fix";

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

  header nav:not([style*="display: none"]):not([style*="display:none"]),
  .nav-menu:not([style*="display: none"]):not([style*="display:none"]),
  .nav-links:not([style*="display: none"]):not([style*="display:none"]),
  .mobile-menu:not([style*="display: none"]):not([style*="display:none"]),
  .mobile-nav:not([style*="display: none"]):not([style*="display:none"]) {
    z-index: 1001 !important;
    transform: translateX(0) !important;
    translate: none !important;
  }
}
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

export const appendNavMobileFixCss = (css: string): string => {
  if (css.includes(NAV_MOBILE_FIX_MARKER)) return css;
  return `${css.trim()}\n\n${NAV_MOBILE_FIX_CSS}\n`;
};

export const appendNavMobileFixJs = (js: string): string => {
  if (js.includes(NAV_MOBILE_FIX_MARKER)) return js;
  const trimmed = js.trim();
  return trimmed ? `${trimmed}\n\n${NAV_MOBILE_FIX_JS}\n` : `${NAV_MOBILE_FIX_JS}\n`;
};
