(function () {
  const config = window.TORTODOM_CONFIG;
  const data = window.TORTODOM_DATA;
  const THEME_KEY = "tortodom-theme";

  document.getElementById("brandName").textContent = config.brand;
  document.getElementById("footerBrand").textContent = config.brand;
  document.getElementById("heroTagline").textContent = config.tagline;
  document.getElementById("footerCity").textContent = config.city;
  document.getElementById("fillingsCount").textContent = config.fillingsCount;
  document.getElementById("questionsCount").textContent = config.questionsCount;

  const telegramUrl = `https://t.me/${config.telegramUsername}`;
  document.getElementById("headerTelegram").href = telegramUrl;
  document.getElementById("heroTelegram").href = telegramUrl;
  document.getElementById("footerTelegram").href = telegramUrl;

  const highlightsGrid = document.getElementById("highlightsGrid");
  if (highlightsGrid) {
    highlightsGrid.innerHTML = data.highlights
      .map(
        (item) => `
      <article class="highlight-card">
        <span class="highlight-card__emoji">${item.emoji}</span>
        <h3>${item.name}</h3>
        <p>${item.note}</p>
      </article>
    `
      )
      .join("");
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);
  document.getElementById("themeToggleFooter")?.addEventListener("click", toggleTheme);

  document.querySelectorAll("[data-scroll]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      const targetId = trigger.dataset.scroll;
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      if (trigger.dataset.startQuiz === "true") {
        setTimeout(() => window.TortodomQuiz.start(), 350);
      }
    });
  });

  const header = document.querySelector(".site-header");
  const toggleHeader = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 12);
  };

  toggleHeader();
  window.addEventListener("scroll", toggleHeader, { passive: true });
})();

