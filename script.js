(function () {
  const views = document.querySelectorAll("[data-view]");
  const navLinks = document.querySelectorAll(".nav__link");
  const heroMedia = document.querySelector("[data-hero-media]");
  const heroVideos = heroMedia
    ? Array.from(heroMedia.querySelectorAll(".hero__video"))
    : [];
  const desktopVideo = heroMedia?.querySelector(".hero__video--desktop");
  const mobileVideo = heroMedia?.querySelector(".hero__video--mobile");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let homeIsActive = true;

  function getActiveVideo() {
    if (mobileQuery.matches && mobileVideo) return mobileVideo;
    if (desktopVideo) return desktopVideo;
    return heroVideos[0] || null;
  }

  function initHeroVideo() {
    if (!heroMedia || heroVideos.length === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;

    function useStaticFallback() {
      heroMedia.classList.add("hero__media--static");
      heroVideos.forEach((video) => video.pause());
    }

    if (prefersReduced || saveData) {
      useStaticFallback();
      return;
    }

    heroVideos.forEach((video) => {
      video.addEventListener("error", () => {
        if (video === getActiveVideo()) useStaticFallback();
      });
    });

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      if (e.matches) useStaticFallback();
    });

    mobileQuery.addEventListener("change", () => syncHeroVideos(homeIsActive));
    syncHeroVideos(homeIsActive);
  }

  function syncHeroVideos(shouldPlay) {
    if (!heroMedia || heroMedia.classList.contains("hero__media--static")) return;

    const activeVideo = getActiveVideo();
    if (!activeVideo) return;

    heroVideos.forEach((video) => {
      const isActive = video === activeVideo;

      if (isActive) {
        if (video.preload === "none") video.preload = "auto";
        if (shouldPlay) video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
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
