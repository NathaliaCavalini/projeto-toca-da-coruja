// Perf utilities - applied site-wide
(function () {
  "use strict";

  function setLazyLoadingForImages() {
    try {
      const imgs = document.querySelectorAll("img:not([loading])");
      const skipClasses = new Set([
        "logo-img",
        "livro-fechado",
        "lupa",
        "search-icon",
        "quer-ler",
        "ja-lido",
        "favoritos",
        "reviews",
        "admin-icon",
        "footer-img",
        "btn-logo",
      ]);

      imgs.forEach((img) => {
        const classes = img.className ? img.className.split(/\s+/) : [];
        if (classes.some((c) => skipClasses.has(c))) return;
        img.setAttribute("loading", "lazy");
      });
    } catch (e) {
      console.warn("perf:setLazyLoadingForImages failed", e);
    }
  }

  function shouldDisableParticles() {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const saveData = connection && connection.saveData;
    return prefersReducedMotion || saveData || window.innerWidth < 700;
  }

  function removeHeroCanvas() {
    try {
      const canvas = document.getElementById("hero-particles");
      if (!canvas) return;
      // Hide visually
      canvas.style.display = "none";
      // Remove from DOM to avoid further painting if possible
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      // Flag for other scripts
      window.__perf_particles_disabled = true;
    } catch (e) {
      console.warn("perf:removeHeroCanvas failed", e);
    }
  }

  function observeHeroCanvas() {
    // If canvas created later by inline scripts, observe and remove/hide it quickly
    const root = document.documentElement || document.body;
    if (!root) return;

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node && node.id === "hero-particles") {
            if (shouldDisableParticles()) removeHeroCanvas();
          }
        }
      }
    });

    mo.observe(root, { childList: true, subtree: true });

    // Stop observing after a short time to avoid overhead
    setTimeout(() => mo.disconnect(), 5000);
  }

  function init() {
    // Lazy load images after a short idle to avoid blocking critical path
    if ("requestIdleCallback" in window) {
      requestIdleCallback(setLazyLoadingForImages, { timeout: 1500 });
    } else {
      setTimeout(setLazyLoadingForImages, 800);
    }

    if (shouldDisableParticles()) {
      // remove or hide existing canvas
      removeHeroCanvas();
      // also observe in case created later
      observeHeroCanvas();
    }

    // Pause expensive work when tab not visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // dispatch a site-wide event so other scripts can respond
        window.dispatchEvent(new CustomEvent("perf:tab-hidden"));
      } else {
        window.dispatchEvent(new CustomEvent("perf:tab-visible"));
      }
    });
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
