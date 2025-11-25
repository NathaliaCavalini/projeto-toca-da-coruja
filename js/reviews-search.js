// reviews-search.js — Busca avançada para a página de reviews
// Permite buscar por: nome do livro, data, e rating (ex: "5 estrelas", "★★★★★")

function normalizeText(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  function doSearch() {
    const term = normalizeText(searchInput.value.trim());
    // Hide/show floating widgets (same behavior as universal-search)
    const floatingEls = document.querySelectorAll(
      ".floating-review-wrapper, .floating-review-card, .hero-section, .floating-info-wrapper, .floating-info-card"
    );
    if (floatingEls && floatingEls.length) {
      if (term === "") {
        floatingEls.forEach((el) => (el.style.display = ""));
      } else {
        floatingEls.forEach((el) => (el.style.display = "none"));
      }
    }
    const reviewCards = document.querySelectorAll(".book-item.review-card");

    if (term === "") {
      reviewCards.forEach((card) => card.classList.remove("hidden"));
      return;
    }

    reviewCards.forEach((card) => {
      // Extrair informações da review
      const titleElement = card.querySelector(".book-title p");
      const ratingElement = card.querySelector(".book-title div:nth-child(2)");
      const dateElement = card.querySelector(".book-title div:nth-child(3)");
      const commentElement = card.querySelector(".book-comment-text");

      const title = normalizeText(titleElement?.textContent || "");
      const rating = ratingElement?.textContent || "";
      const date = normalizeText(dateElement?.textContent || "");
      const comment = normalizeText(commentElement?.textContent || "");

      // Normalizar busca por estrelas
      let normalizedRating = rating;
      if (term.includes("estrela")) {
        // Contar quantas estrelas o usuário procura (ex: "5 estrelas" → conta ★★★★★)
        const match = term.match(/(\d+)\s*estrela/);
        if (match) {
          const starCount = parseInt(match[1]);
          normalizedRating = normalizeText("★".repeat(starCount));
        }
      } else {
        normalizedRating = normalizeText(rating);
      }

      // Buscar em: título, data, comentário, ou rating
      const matches =
        title.includes(term) ||
        date.includes(term) ||
        comment.includes(term) ||
        normalizedRating.includes(term);

      if (matches) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  }

  searchInput.addEventListener("input", doSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      doSearch();
    }
  });
});
