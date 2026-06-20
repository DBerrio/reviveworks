(function () {
  const views = document.querySelectorAll("[data-view]");
  const navLinks = document.querySelectorAll(".nav__link");
  const heroMedia = document.querySelector("[data-hero-media]");
  const desktopVideo = heroMedia?.querySelector(".hero__video--desktop");
  const mobileVideo = heroMedia?.querySelector(".hero__video--mobile");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let homeIsActive = true;

  function isMobileViewport() {
    return mobileQuery.matches;
  }

  function getActiveVideo() {
    if (isMobileViewport() && mobileVideo?.getAttribute("src")) return mobileVideo;
    if (desktopVideo) return desktopVideo;
    return null;
  }

  function loadMobileVideo() {
    if (!mobileVideo || mobileVideo.getAttribute("src")) return;
    mobileVideo.setAttribute("src", mobileVideo.dataset.src || "");
    mobileVideo.load();
  }

  function unloadMobileVideo() {
    if (!mobileVideo || !mobileVideo.getAttribute("src")) return;
    mobileVideo.pause();
    mobileVideo.removeAttribute("src");
    mobileVideo.load();
  }

  function initHeroVideo() {
    if (!heroMedia || (!desktopVideo && !mobileVideo)) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;

    function useStaticFallback() {
      heroMedia.classList.add("hero__media--static");
      desktopVideo?.pause();
      unloadMobileVideo();
    }

    if (prefersReduced || saveData) {
      useStaticFallback();
      return;
    }

    desktopVideo?.addEventListener("error", () => {
      if (!isMobileViewport()) useStaticFallback();
    });

    mobileVideo?.addEventListener("error", () => {
      if (isMobileViewport()) useStaticFallback();
    });

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      if (e.matches) useStaticFallback();
    });

    mobileQuery.addEventListener("change", () => syncHeroVideos(homeIsActive));
    syncHeroVideos(homeIsActive);
  }

  function syncHeroVideos(shouldPlay) {
    if (!heroMedia || heroMedia.classList.contains("hero__media--static")) return;

    if (isMobileViewport()) {
      loadMobileVideo();
      desktopVideo?.pause();
    } else {
      unloadMobileVideo();
    }

    const activeVideo = getActiveVideo();
    if (!activeVideo) return;

    if (activeVideo === desktopVideo) {
      desktopVideo?.pause();
      if (shouldPlay) desktopVideo?.play().catch(() => {});
    } else if (activeVideo === mobileVideo) {
      mobileVideo?.pause();
      if (shouldPlay) mobileVideo?.play().catch(() => {});
    }
  }

  function setHeroVideoPlaying(active) {
    homeIsActive = active;
    syncHeroVideos(active);
  }

  initHeroVideo();

  function activate(id) {
    const target = document.getElementById(id);
    if (!target) return;

    views.forEach((v) => v.classList.toggle("is-active", v.id === id));
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
    );

    setHeroVideoPlaying(id === "home");

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
  }

  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        e.preventDefault();
        activate(href.slice(1));
      }
    });
  });

  const initial = (location.hash || "#home").slice(1);
  activate(document.getElementById(initial) ? initial : "home");

  window.addEventListener("hashchange", () => {
    const id = (location.hash || "#home").slice(1);
    if (document.getElementById(id)) activate(id);
  });
})();
