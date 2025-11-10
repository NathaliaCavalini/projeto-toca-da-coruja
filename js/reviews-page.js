import { getCurrentUserReviews, saveReview } from './reviews-manager.js';
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
                <button class="submit-btn delete-review">🗑️ Deletar</button>
            </div>
        `;
        
        // Adiciona listener ao botão de deletar de forma segura (escopo do módulo)
        const deleteBtn = reviewCard.querySelector('.delete-review');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (!confirm('Tem certeza que deseja deletar esta review?')) return;
                try {
                    const module = await import('./reviews-manager.js');
                    // chama a função exportada para deletar
                    module.deleteReview(review.bookId, review.timestamp);
                    // re-renderiza a lista
                    renderUserReviews();
                } catch (err) {
                    console.error('Erro ao deletar review:', err);
                    alert(err.message || 'Erro ao deletar a review.');
                }
            });
        }

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

// Floating review card - cria um pequeno UI flutuante para adicionar uma review rápido
function createFloatingReviewCard() {
    // evita duplicar
    if (document.querySelector('.floating-review-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'floating-review-wrapper';

    const btn = document.createElement('button');
    btn.className = 'floating-btn';
    btn.type = 'button';
    btn.title = 'Escrever review';
    btn.innerHTML = '✍️';

    const card = document.createElement('div');
    card.className = 'floating-review-card';

    // constrói options do select a partir dos livros conhecidos
    const options = Object.keys(bookData).map(key => `<option value="${key}">${bookData[key].titulo}</option>`).join('');

    card.innerHTML = `
        <h4>Nova review</h4>
        <label for="fr-book">Livro</label>
        <select id="fr-book">${options}</select>
        <label for="fr-rating">Avaliação (1-5)</label>
        <input id="fr-rating" type="number" min="1" max="5" value="5" />
        <label for="fr-text">Comentário</label>
        <textarea id="fr-text" placeholder="Escreva sua opinião (opcional)"></textarea>
        <div class="actions">
            <button type="button" class="btn-cancel">Cancelar</button>
            <button type="button" class="btn-submit">Enviar</button>
        </div>
    `;

    wrapper.appendChild(card);
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);

    const openCard = () => card.classList.add('open');
    const closeCard = () => card.classList.remove('open');

    btn.addEventListener('click', () => {
        // Se usuário não estiver logado, redireciona para login
        if (!auth.currentUser) {
            if (confirm('Você precisa estar logado para adicionar uma review. Ir para login?')) {
                window.location.href = '/login.html';
            }
            return;
        }
        if (card.classList.contains('open')) {
            closeCard();
        } else {
            openCard();
            // pré-seleciona o primeiro livro (opcional)
            const sel = card.querySelector('#fr-book');
            if (sel) sel.selectedIndex = 0;
            card.querySelector('#fr-text').focus();
        }
    });

    card.querySelector('.btn-cancel').addEventListener('click', () => {
        closeCard();
    });

    card.querySelector('.btn-submit').addEventListener('click', async () => {
        const bookId = card.querySelector('#fr-book').value;
        const rating = Number(card.querySelector('#fr-rating').value) || 5;
        const text = card.querySelector('#fr-text').value.trim();

        try {
            // saveReview lançará se não estiver logado
            saveReview(bookId, { rating, text });
            // limpa e fecha
            card.querySelector('#fr-text').value = '';
            closeCard();
            // re-render
            renderUserReviews();
            alert('Review salva com sucesso!');
        } catch (err) {
            console.error('Erro ao salvar review:', err);
            alert(err.message || 'Erro ao salvar a review.');
            if (err.message && err.message.toLowerCase().includes('logado')) {
                window.location.href = '/login.html';
            }
        }
    });

    // fecha ao clicar fora
    document.addEventListener('click', (ev) => {
        if (!wrapper.contains(ev.target) && card.classList.contains('open')) {
            closeCard();
        }
    });
}

// inicializa componente flutuante imediatamente
document.addEventListener('DOMContentLoaded', () => createFloatingReviewCard());