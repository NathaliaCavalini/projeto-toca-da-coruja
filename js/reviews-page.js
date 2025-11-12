import { getCurrentUserReviews, saveReview } from './reviews-manager.js';
import { auth } from './firebase-config.js';

// ========================= Fallback de livros (se import falhar) =========================
const bookDataFallback = {
    "amor-obvio": { titulo: "O amor não é óbvio", autor: "Elayne Baeta", imagem: "/imagens/o_amor_nao_e_obvio.png" },
    "ela-fica": { titulo: "Ela fica com a garota", autor: "Rachael Lippincott", imagem: "/imagens/ela_fica_com_a_garota.png" },
    "algumas-garotas": { titulo: "Algumas garotas são assim", autor: "Jennifer Dugan", imagem: "/imagens/algumas_garotas_sao_assim.png" },
    "princesa-e-o-queijo-quente": { titulo: "Princesa e o Queijo Quente", autor: "Laura Pohl", imagem: "/imagens/a_princesa_e_o_queijo_quente.png" },
    "um-milhao-de-finais-felizes": { titulo: "Um Milhão de Finais Felizes", autor: "Vitor Martins", imagem: "/imagens/um_milhao_de_finais_felizes.png" },
    "coisas-obvias-sobre-o-amor": { titulo: "Coisas Óbvias Sobre o Amor", autor: "Clara Alves", imagem: "/imagens/coisas_obvias_sobre_o_amor.png" },
    "girls-like-girls": { titulo: "Girls Like Girls", autor: "Hayley Kiyoko", imagem: "/imagens/girls_like_girls.jpg" },
    "isso-nao-e-um-conto-de-fadas": { titulo: "Isso Não É um Conto de Fadas", autor: "Emeli J. Santos", imagem: "/imagens/isso-não-é-um-conto-de-fadas.jpg" },
    "lembre-se-de-nos": { titulo: "Lembre-se de Nós", autor: "Nina Lacour", imagem: "/imagens/lembre-se-de-nos.jpg" },
    "night-owls-and-summer-skies": { titulo: "Night Owls and Summer Skies (HQ)", autor: "Tara Frejas", imagem: "/imagens/night-owls-and-summer-skies.jpg" },
    "vermelho-branco-e-sangue-azul": { titulo: "Vermelho, Branco e Sangue Azul", autor: "Casey McQuiston", imagem: "/imagens/vermelho-branco-e-sangue-azul.jpg" }
};

// Cache dinâmico (livros originais + adicionados pelo admin)
let bookDataCache = null;

async function loadBooks() {
    if (bookDataCache) return bookDataCache;
    let base = {};
    try {
        const module = await import('./vejamais.js');
        base = { ...module.livros };
    } catch (err) {
        console.warn('Falha ao importar vejamais.js, usando fallback parcial.', err);
        base = { ...bookDataFallback };
    }
    const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
    bookDataCache = { ...base, ...adminBooks };
    return bookDataCache;
}

// Seção que receberá as reviews
const reviewsSection = document.querySelector('.book-grid');

// ========================= Renderizar reviews do usuário =========================
async function renderUserReviews() {
    reviewsSection.innerHTML = '';

    // Garantir que os livros estejam carregados antes de mapear IDs
    await loadBooks();

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

    const reviews = getCurrentUserReviews();

    if (reviews.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-reviews';
        emptyMessage.innerHTML = `
            <h2>✍️ Nenhuma review publicada ainda</h2>
            <p>Compartilhe suas opiniões sobre os livros que leu! Use o botão flutuante ✍️ ou visite as páginas dos livros para deixar suas avaliações.</p>
            <a href="/home.html" class="browse-books">Explorar Catálogo</a>
        `;
        reviewsSection.appendChild(emptyMessage);
        return;
    }

    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const container = document.createElement('div');
    container.className = 'reviews-container';

    reviews.forEach(review => {
        const bookInfo = bookDataCache[review.bookId] || bookDataFallback[review.bookId];
        // Se não encontrar livro, mostra card reduzido
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';

        const tituloLivro = bookInfo ? bookInfo.titulo : `Livro (ID: ${review.bookId})`;
        const autorLivro = bookInfo ? bookInfo.autor : 'Autor desconhecido';
    const imgLivro = bookInfo ? bookInfo.imagem : '/imagens/placeholder.svg';

        reviewCard.innerHTML = `
            <div class="review-book-info">
                <img src="${imgLivro}" alt="${tituloLivro}" class="review-book-cover" onerror="this.src='/imagens/placeholder.svg'">
                <div class="book-details">
                    <h3>${tituloLivro}</h3>
                    <p class="book-author">por ${autorLivro}</p>
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

        const deleteBtn = reviewCard.querySelector('.delete-review');
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja deletar esta review?')) return;
            try {
                const module = await import('./reviews-manager.js');
                module.deleteReview(review.bookId, review.timestamp);
                renderUserReviews();
            } catch (err) {
                console.error('Erro ao deletar review:', err);
                alert(err.message || 'Erro ao deletar a review.');
            }
        });

        container.appendChild(reviewCard);
    });

    reviewsSection.appendChild(container);
}

// ========================= Card flutuante para nova review =========================
async function createFloatingReviewCard() {
    if (document.querySelector('.floating-review-wrapper')) return;
    await loadBooks();

    const wrapper = document.createElement('div');
    wrapper.className = 'floating-review-wrapper';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'floating-btn';
    toggleBtn.type = 'button';
    toggleBtn.title = 'Escrever review';
    toggleBtn.innerHTML = '✍️';

    const card = document.createElement('div');
    card.className = 'floating-review-card';

    const options = Object.keys(bookDataCache).map(id => `<option value="${id}">${bookDataCache[id].titulo}</option>`).join('');

    card.innerHTML = `
        <h4>Nova review</h4>
        <label for="fr-book">Livro</label>
        <select id="fr-book">${options}</select>
        <label for="fr-rating">Avaliação</label>
        <select id="fr-rating">
            <option value="5">5 ★</option>
            <option value="4">4 ★</option>
            <option value="3">3 ★</option>
            <option value="2">2 ★</option>
            <option value="1">1 ★</option>
        </select>
        <label for="fr-text">Comentário</label>
        <textarea id="fr-text" placeholder="Escreva sua opinião (opcional)"></textarea>
        <div class="actions">
            <button type="button" class="btn-cancel">Cancelar</button>
            <button type="button" class="btn-submit">Enviar</button>
        </div>
    `;

    wrapper.appendChild(card);
    wrapper.appendChild(toggleBtn);
    document.body.appendChild(wrapper);

    const open = () => card.classList.add('open');
    const close = () => card.classList.remove('open');

    toggleBtn.addEventListener('click', () => {
        if (!auth.currentUser) {
            if (confirm('Você precisa estar logado para adicionar uma review. Ir para login?')) {
                window.location.href = '/login.html';
            }
            return;
        }
        if (card.classList.contains('open')) close(); else {
            open();
            const sel = card.querySelector('#fr-book');
            if (sel) sel.selectedIndex = 0;
            card.querySelector('#fr-text').focus();
        }
    });

    card.querySelector('.btn-cancel').addEventListener('click', close);

    card.querySelector('.btn-submit').addEventListener('click', () => {
        const bookSel = card.querySelector('#fr-book');
        const ratingSel = card.querySelector('#fr-rating');
        const textEl = card.querySelector('#fr-text');
        const bookId = bookSel.value;
        const rating = Number(ratingSel.value);
        const text = textEl.value.trim();
        try {
            saveReview(bookId, { rating, text });
            textEl.value = '';
            close();
            renderUserReviews();
            alert('Review salva com sucesso!');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Erro ao salvar a review.');
        }
    });

    document.addEventListener('click', ev => {
        if (!wrapper.contains(ev.target) && card.classList.contains('open')) close();
    });

    // Ajusta posição acima do footer se ele estiver visível
    const footer = document.querySelector('.footer');
    function adjust() {
        if (!footer) return; const r = footer.getBoundingClientRect(); const gap = 20;
        if (r.top < window.innerHeight) {
            const visible = window.innerHeight - r.top;
            wrapper.style.bottom = `${visible + gap}px`;
        } else wrapper.style.bottom = '24px';
    }
    window.addEventListener('scroll', adjust, { passive: true });
    window.addEventListener('resize', adjust);
    adjust();
}

// ========================= Inicialização =========================
document.addEventListener('DOMContentLoaded', async () => {
    await loadBooks();
    await renderUserReviews();
    await createFloatingReviewCard();
});

auth.onAuthStateChanged(async () => {
    await loadBooks();
    await renderUserReviews();
});