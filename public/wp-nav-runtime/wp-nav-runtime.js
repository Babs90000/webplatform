/* wp-nav-runtime — navigation mobile/tablette (WebPlatform) */
(function () {
  if (window.__wpNavRuntime) return;
  window.__wpNavRuntime = true;

  var MQ = "(max-width: 1023px)";
  var LEGACY_BODY = ["nav-open", "menu-open", "mobile-nav-open", "is-menu-open"];
  var TOGGLE_SEL =
    "#nav-toggle, .nav-toggle, .menu-toggle, .navbar-toggle, .mobile-menu-btn, .hamburger, .nav-toggle-btn, header button[aria-controls]";
  var PANEL_SEL =
    "#nav-menu, .nav-menu, .nav-links, .navbar-menu, .mobile-nav, .mobile-menu, .main-nav, .header-nav";
  var OVERLAY_SEL =
    "#nav-overlay, .nav-overlay, .mobile-nav-overlay, .menu-overlay, .nav-backdrop, .menu-backdrop";

  var isMobile = function () {
    return window.matchMedia(MQ).matches;
  };

  var isOpen = function () {
    return document.body.classList.contains("wp-nav-open");
  };

  var setOpen = function (open) {
    document.body.classList.toggle("wp-nav-open", open);
    LEGACY_BODY.forEach(function (c) {
      document.body.classList.toggle(c, open);
    });
    document.querySelectorAll(TOGGLE_SEL + ', [data-wp-nav="toggle"]').forEach(function (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(OVERLAY_SEL + ', [data-wp-nav="overlay"]').forEach(function (el) {
      el.setAttribute("aria-hidden", open ? "false" : "true");
    });
  };

  var forceClosed = function () {
    if (!isMobile()) {
      setOpen(false);
      return;
    }
    setOpen(false);
  };

  var hasAlpineClick = function (el) {
    return /@click|x-on:click/i.test(el.outerHTML);
  };

  var tagLegacy = function () {
    var toggle = document.querySelector(TOGGLE_SEL);
    if (toggle && !toggle.hasAttribute("data-wp-nav")) {
      toggle.setAttribute("data-wp-nav", "toggle");
    }

    var panel =
      document.getElementById("nav-menu") ||
      document.querySelector(PANEL_SEL);
    if (panel && !panel.hasAttribute("data-wp-nav")) {
      panel.setAttribute("data-wp-nav", "panel");
    }

    var overlay =
      document.getElementById("nav-overlay") ||
      document.querySelector(OVERLAY_SEL);
    if (overlay && !overlay.hasAttribute("data-wp-nav")) {
      overlay.setAttribute("data-wp-nav", "overlay");
    }
  };

  var bindToggle = function (btn) {
    if (btn.dataset.wpNavBound === "1") return;
    if (hasAlpineClick(btn)) return;
    if (btn.closest("[x-data]") && hasAlpineClick(btn)) return;

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
  };

  var bindOverlay = function (el) {
    if (el.dataset.wpNavBound === "1") return;
    el.dataset.wpNavBound = "1";
    el.addEventListener("click", function () {
      setOpen(false);
    });
  };

  var bindPanelLinks = function () {
    document.querySelectorAll(PANEL_SEL + ' a[href], [data-wp-nav="panel"] a[href]').forEach(function (link) {
      if (link.dataset.wpNavBound === "1") return;
      link.dataset.wpNavBound = "1";
      link.addEventListener("click", function () {
        if (isMobile()) setOpen(false);
      });
    });
  };

  var bindAll = function () {
    tagLegacy();
    document.querySelectorAll(TOGGLE_SEL + ', [data-wp-nav="toggle"]').forEach(bindToggle);
    document.querySelectorAll(OVERLAY_SEL + ', [data-wp-nav="overlay"]').forEach(bindOverlay);
    bindPanelLinks();
    forceClosed();
  };

  var bridgeAlpine = function () {
    if (!window.Alpine) return;
    document.querySelectorAll("[x-data]").forEach(function (root) {
      if (root.dataset.wpNavAlpine === "1") return;
      var html = root.outerHTML;
      if (!/\bopen\s*:/i.test(html) && !/@click[^"']*\bopen\b/i.test(html)) return;
      root.dataset.wpNavAlpine = "1";
      root.addEventListener("click", function () {
        window.setTimeout(function () {
          var open =
            LEGACY_BODY.some(function (c) {
              return document.body.classList.contains(c);
            }) || document.body.classList.contains("wp-nav-open");
          document.body.classList.toggle("wp-nav-open", open);
        }, 0);
      });
    });
  };

  var onReady = function () {
    bindAll();
    bridgeAlpine();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  document.addEventListener("alpine:init", function () {
    window.setTimeout(function () {
      bindAll();
      bridgeAlpine();
    }, 0);
  });

  var lastMobile = isMobile();
  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var nowMobile = isMobile();
      if (nowMobile !== lastMobile) {
        forceClosed();
        lastMobile = nowMobile;
      }
      if (window.__WP_PREVIEW__) {
        forceClosed();
        bindAll();
      }
    }, 120);
  });
})();
