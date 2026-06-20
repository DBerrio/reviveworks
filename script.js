(function () {
  const views = document.querySelectorAll("[data-view]");
  const navLinks = document.querySelectorAll(".nav__link");
  const heroMedia = document.querySelector("[data-hero-media]");
  const heroVideo = heroMedia?.querySelector(".hero__video");

  function initHeroVideo() {
    if (!heroMedia || !heroVideo) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;

    function useStaticFallback() {
      heroMedia.classList.add("hero__media--static");
      heroVideo.pause();
    }

    if (prefersReduced || saveData) {
      useStaticFallback();
      return;
    }

    heroVideo.addEventListener("error", useStaticFallback);

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedQuery.addEventListener("change", (e) => {
      if (e.matches) useStaticFallback();
    });
  }

  function setHeroVideoPlaying(active) {
    if (!heroVideo || heroMedia?.classList.contains("hero__media--static")) return;
    if (active) {
      heroVideo.play().catch(() => {});
    } else {
      heroVideo.pause();
    }
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

  // Intercept any in-page link that points to a view
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        e.preventDefault();
        activate(href.slice(1));
      }
    });
  });

  // Honor deep links / refreshes
  const initial = (location.hash || "#home").slice(1);
  activate(document.getElementById(initial) ? initial : "home");

  window.addEventListener("hashchange", () => {
    const id = (location.hash || "#home").slice(1);
    if (document.getElementById(id)) activate(id);
  });
})();
