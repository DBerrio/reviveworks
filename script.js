(function () {
  const views = document.querySelectorAll("[data-view]");
  const navLinks = document.querySelectorAll(".nav__link");

  function activate(id) {
    const target = document.getElementById(id);
    if (!target) return;

    views.forEach((v) => v.classList.toggle("is-active", v.id === id));
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + id)
    );

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
