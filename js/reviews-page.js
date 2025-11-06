import { getCurrentUserReviews } from './reviews-manager.js';
import { auth } from './firebase-config.js';

// Importa os dados dos livros do vejamais.js
const bookData = {
    "amor-obvio": {
        titulo: "O amor não é óbvio",
        autor: "Elayne Baeta",
        imagem: "/imagens/o_amor_nao_e_obvio.png"
    },
    "jogada-amor": {
        titulo: "A jogada do amor",
        autor: "Kelly Quindlen",
        imagem: "/imagens/a_jogada_do_amor.png"
    },
    "ela-fica": {
        titulo: "Ela fica com a garota",
        autor: "Rachael Lippincott",
        imagem: "/imagens/ela_fica_com_a_garota.png"
    },
    "algumas-garotas": {
        titulo: "Algumas garotas são assim",
        autor: "Jennifer Dugan",
        imagem: "/imagens/algumas_garotas_sao_assim.png"
    },
    "um-milhao-de-finais-felizes": {
        titulo: "Um Milhão de Finais Felizes",
        autor: "Vitor Martins",
        imagem: "/imagens/um_milhao_de_finais_felizes.png"
    },
    "coisas-obvias-sobre-o-amor": {
        titulo: "Coisas Óbvias Sobre o Amor",
        autor: "Clara Alves",
        imagem: "/imagens/coisas_obvias_sobre_o_amor.png"
    },
    "girls-like-girls": {
        titulo: "Girls Like Girls",
        autor: "Hayley Kiyoko",
        imagem: "/imagens/girls_like_girls.jpg"
    },
    "isso-nao-e-um-conto-de-fadas": {
        titulo: "Isso Não É um Conto de Fadas",
        autor: "Emeli J. Santos",
        imagem: "/imagens/isso-não-é-um-conto-de-fadas.jpg"
    },
    "lembre-se-de-nos": {
        titulo: "Lembre-se de Nós",
        autor: "Nina Lacour",
        imagem: "/imagens/lembre-se-de-nos.jpg"
    },
    // ... (todos os outros livros)
};

// Referência para a seção de reviews
const reviewsSection = document.querySelector('.book-grid');

// Função para renderizar as reviews do usuário atual
function renderUserReviews() {
    reviewsSection.innerHTML = ''; // Limpa a seção

    // Se não estiver logado, mostra mensagem
    if (!auth.currentUser) {
        const loginMessage = document.createElement('div');
        loginMessage.className = 'login-message';
        loginMessage.innerHTML = `
            <h2>Faça login para ver suas reviews</h2>
            <p>Você precisa estar logado para ver e gerenciar suas reviews.</p>
            <a href="/login.html" class="login-button">Fazer Login</a>
        `;
        reviewsSection.appendChild(loginMessage);
        return;
    }

    // Carrega as reviews do usuário atual
    const reviews = getCurrentUserReviews();

    if (reviews.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-reviews';
        emptyMessage.innerHTML = `
            <p>Você ainda não fez nenhuma review.</p>
            <a href="/home.html" class="browse-books">Explorar Livros</a>
        `;
        reviewsSection.appendChild(emptyMessage);
        return;
    }

    // Cria container para as reviews
    const reviewsContainer = document.createElement('div');
    reviewsContainer.className = 'reviews-container';

    // Ordenar reviews por data (mais recentes primeiro)
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Renderiza cada review com informações do livro
    reviews.forEach(review => {
        const bookInfo = bookData[review.bookId];
        if (!bookInfo) return; // Pula se não encontrar informações do livro

        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        reviewCard.innerHTML = `
            <div class="review-book-info">
                <img src="${bookInfo.imagem}" alt="${bookInfo.titulo}" class="review-book-cover">
                <div class="book-details">
                    <h3>${bookInfo.titulo}</h3>
                    <p class="book-author">por ${bookInfo.autor}</p>
                </div>
            </div>
            <div class="review-content">
                <div class="review-meta">
                    <span class="review-rating">${"★".repeat(Math.floor(review.rating))}${review.rating % 1 ? "½" : ""}</span>
                    <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
                </div>
                <p class="review-text">${review.text}</p>
                <button class="delete-review" onclick="if(confirm('Tem certeza que deseja deletar esta review?')) { 
                    import('./reviews-manager.js').then(module => {
                        module.deleteReview('${review.bookId}', '${review.timestamp}');
                        renderUserReviews();
                    });
                }">🗑️ Deletar</button>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });

    reviewsSection.appendChild(reviewsContainer);
}

// Renderiza as reviews quando a página carrega
document.addEventListener('DOMContentLoaded', renderUserReviews);

// Atualiza quando o usuário faz login/logout
auth.onAuthStateChanged(() => {
    renderUserReviews();
});