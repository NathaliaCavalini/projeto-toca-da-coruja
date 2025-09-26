// ==================== 1) Banco de livros ====================
// Aqui poderia vir de um backend futuramente, mas por enquanto fica mockado
const livros = {
    "amor-obvio": {
        titulo: "O amor não é óbvio",
        autor: "Elayne Baeta",
        imagem: "../imagens/o_amor_nao_e_obvio.png",
        genero: "Literatura lésbica",
        paginas: 342,
        ano: 2022,
        sinopse: "Hanna sempre acreditou que o amor verdadeiro só existia nos livros e filmes..."
    },
    "jogada-amor": {
        titulo: "A jogada do amor",
        autor: "Kelly Quindlen",
        imagem: "../imagens/a_jogada_do_amor.png",
        genero: "Romance LGBTQIA+",
        paginas: 310,
        ano: 2021,
        sinopse: "Uma história sobre paixão, esportes e a descoberta do amor verdadeiro."
    },
    // ...demais livros (mantém os outros que você já tem)
};

// ==================== 2) Pega ID do livro da URL ====================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const livro = livros[id];

// ==================== 3) Monta card de detalhes ====================
const container = document.getElementById("book-detail");

if (livro) {
    container.innerHTML = `
    <div class="book-detail-card">
      <div class="book-image">
        <img src="${livro.imagem}" alt="Capa do livro ${livro.titulo}">
      </div>
      <div class="book-info">
        <h1>${livro.titulo}</h1>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Gênero:</strong> ${livro.genero}</p>
        <p><strong>Páginas:</strong> ${livro.paginas}</p>
        <p><strong>Ano:</strong> ${livro.ano}</p>
        <p class="sinopse"><strong>Sinopse:</strong> ${livro.sinopse}</p>

        <!-- Avaliação geral -->
        <div class="rating-container">
          <div class="rating-stars"></div>
          <div class="rating-average">Média: 0 ★</div>
        </div>

        <div class="action-buttons">
          <button class="action-btn" id="btn-quer-ler">📖 Quero Ler</button>
          <button class="action-btn" id="btn-ja-li">✅ Já Li</button>
          <button class="action-btn" id="btn-favorito">⭐ Favorito</button>
        </div>

        <button class="download-btn">⬇️ Download</button>
      </div>
    </div>

    <!-- Review -->
    <div class="review-section">
      <h2>Deixe sua review</h2>
      <div class="review-stars"></div>
      <textarea id="review-text" placeholder="Escreva sua opinião..."></textarea>
      <button id="submit-review" class="submit-btn">Enviar Review</button>
    </div>

    <!-- Lista de reviews -->
    <div class="reviews">
      <h2>Reviews</h2>
      <div id="review-list" class="review-list"></div>
    </div>
  `;
} else {
    container.innerHTML = `<p class="not-found">Livro não encontrado 😕</p>`;
}

// ==================== 4) Função genérica de estrelinhas ====================
function initStarRating(container, initialValue = 0, onChange) {
    let currentRating = initialValue;

    // Cria 5 estrelinhas dinamicamente
    container.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.classList.add("star");
        span.dataset.value = i;
        span.innerHTML = "★";
        container.appendChild(span);
    }

    const stars = Array.from(container.querySelectorAll(".star"));

    function paint(rating) {
        stars.forEach((star) => {
            const val = Number(star.dataset.value);
            star.classList.remove("full", "half");
            if (rating >= val) star.classList.add("full");
            else if (rating >= val - 0.5) star.classList.add("half");
        });
    }

    paint(currentRating);

    stars.forEach((star) => {
        star.addEventListener("mousemove", (e) => {
            const rect = star.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const hoverRating =
                Number(star.dataset.value) - (mouseX < rect.width / 2 ? 0.5 : 0);
            paint(hoverRating);
        });

        star.addEventListener("click", (e) => {
            const rect = star.getBoundingClientRect();
            currentRating =
                Number(star.dataset.value) - (e.clientX - rect.left < rect.width / 2 ? 0.5 : 0);
            paint(currentRating);
            if (onChange) onChange(currentRating);
        });

        star.addEventListener("mouseleave", () => paint(currentRating));
    });

    return {
        getRating: () => currentRating,
        setRating: (val) => {
            currentRating = val;
            paint(currentRating);
        },
    };
}

// ==================== 5) Avaliação geral ====================
const ratingContainer = document.querySelector(".rating-stars");
const averageEl = document.querySelector(".rating-average");
const userId = "user-123"; // simulação de login

let ratings = JSON.parse(localStorage.getItem(`bookRating-${id}`)) || {};
let currentRating = ratings[userId] || 0;

const mainStars = initStarRating(ratingContainer, currentRating, (newRating) => {
    ratings[userId] = newRating;
    localStorage.setItem(`bookRating-${id}`, JSON.stringify(ratings));
    updateAverage();
});

function updateAverage() {
    const allValues = Object.values(ratings);
    if (allValues.length === 0) {
        averageEl.textContent = "Média: 0 ★";
        return;
    }
    const avg = (
        allValues.reduce((a, b) => a + b, 0) / allValues.length
    ).toFixed(1);
    averageEl.textContent = `Média: ${avg} ★`;
}
updateAverage();

// ==================== 6) Sistema de reviews ====================
let reviews = JSON.parse(localStorage.getItem(`reviews-${id}`)) || [];

const reviewStarsEl = document.querySelector(".review-stars");
const reviewTextEl = document.getElementById("review-text");
const submitBtn = document.getElementById("submit-review");
const reviewList = document.getElementById("review-list");

let reviewStars = initStarRating(reviewStarsEl, 0, (rating) => {
    reviewStars.setRating(rating);
});

function renderReviews() {
    reviewList.innerHTML = "";
    reviews.forEach((r) => {
        const div = document.createElement("div");
        div.classList.add("review-item");
        div.innerHTML = `
      <div class="review-meta">
        <span class="review-rating">${"★".repeat(Math.floor(r.rating))}${r.rating % 1 ? "½" : ""
            }</span>
      </div>
      <p class="review-text">${r.text}</p>
    `;
        reviewList.appendChild(div);
    });
}

submitBtn.addEventListener("click", () => {
    const text = reviewTextEl.value.trim();
    const rating = reviewStars.getRating();

    if (!text || rating === 0) return alert("Dê uma nota e escreva algo!");

    reviews.unshift({ rating, text }); // adiciona em cima
    localStorage.setItem(`reviews-${id}`, JSON.stringify(reviews));
    reviewTextEl.value = "";
    reviewStars.setRating(0);
    renderReviews();
});

renderReviews();
