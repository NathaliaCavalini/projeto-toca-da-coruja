import { getCurrentUserReviews, saveReview } from './reviews-manager.js';
import { auth } from './firebase-config.js';
import { checkUserPenalty, showPenaltyWarning, blockActionIfPenalized } from './check-penalties.js';

// ========================= Função de escape HTML =========================
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========================= Funções de animação de café =========================
function createCoffeeDroplets(element, isAdding = true) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    if (isAdding) {
        // ADIÇÃO: Efeito de explosão/burst mais visível
        const dropletsConfig = [
            // Primeira camada: gotinhas grandes saindo rápido
            { count: 6, distance: 120, size: 'large', speed: 'fast', delay: 0 },
            // Segunda camada: gotinhas médias 
            { count: 8, distance: 100, size: 'medium', speed: 'medium', delay: 30 },
            // Terceira camada: gotinhas pequenas mais lentas
            { count: 10, distance: 80, size: 'small', speed: 'slow', delay: 60 }
        ];
        
        dropletsConfig.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                setTimeout(() => {
                    const droplet = document.createElement('div');
                    droplet.className = ['droplet', `size-${config.size}`, `burst-${config.speed}`].join(' ');
                    
                    // Ângulo distribuído em círculo com variação aleatória
                    const baseAngle = (i / config.count) * Math.PI * 2;
                    const angleVariation = (Math.random() - 0.5) * 0.5;
                    const angle = baseAngle + angleVariation;
                    const distance = config.distance + (Math.random() * 30 - 15); // ±15px de variação
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    
                    droplet.style.setProperty('--tx', `${tx}px`);
                    droplet.style.setProperty('--ty', `${ty}px`);
                    droplet.style.left = `${centerX - 3}px`;
                    droplet.style.top = `${centerY - 3}px`;
                    
                    document.body.appendChild(droplet);
                    droplet.addEventListener('animationend', () => droplet.remove(), { once: true });
                }, config.delay);
            }
        });
    } else {
        // DELEÇÃO: Efeito de convergência/retorno
        const dropletsConfig = [
            // Gotinhas voltando rapidamente
            { count: 6, distance: 120, size: 'large', speed: 'fast', delay: 0 },
            // Gotinhas voltando mais lentamente
            { count: 8, distance: 100, size: 'medium', speed: 'medium', delay: 20 },
            // Últimas gotinhas
            { count: 10, distance: 80, size: 'small', speed: 'slow', delay: 40 }
        ];
        
        dropletsConfig.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                setTimeout(() => {
                    const droplet = document.createElement('div');
                    droplet.className = ['droplet', `size-${config.size}`, `reverse-${config.speed}`].join(' ');
                    
                    // Ângulo distribuído em círculo com variação aleatória
                    const baseAngle = (i / config.count) * Math.PI * 2;
                    const angleVariation = (Math.random() - 0.5) * 0.5;
                    const angle = baseAngle + angleVariation;
                    const distance = config.distance + (Math.random() * 30 - 15);
                    const tx = Math.cos(angle) * distance;
                    const ty = Math.sin(angle) * distance;
                    
                    droplet.style.setProperty('--tx', `${tx}px`);
                    droplet.style.setProperty('--ty', `${ty}px`);
                    droplet.style.left = `${centerX - 3}px`;
                    droplet.style.top = `${centerY - 3}px`;
                    
                    document.body.appendChild(droplet);
                    droplet.addEventListener('animationend', () => droplet.remove(), { once: true });
                }, config.delay);
            }
        });
    }
}

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
let reviewsSection = document.querySelector('.book-grid');

// ========================= Renderizar reviews do usuário =========================
async function renderUserReviews() {
    reviewsSection = document.querySelector('.book-grid'); // Atualizar referência
    reviewsSection.innerHTML = '';

    // Garantir que os livros estejam carregados antes de mapear IDs
    await loadBooks();

    if (!auth.currentUser) {
        reviewsSection.innerHTML = `
            <div class="login-message" style="grid-column: 1/-1;">
                <h2>Faça login para ver suas reviews</h2>
                <p>Você precisa estar logado para ver e gerenciar suas reviews.</p>
                <a href="login.html" class="login-button">Fazer Login</a>
            </div>
        `;
        return;
    }

    const reviews = getCurrentUserReviews();

    if (reviews.length === 0) {
        reviewsSection.innerHTML = `
            <div class="empty-reviews" style="grid-column: 1/-1;">
                <h2>✍️ Nenhuma review publicada ainda</h2>
                <p>Compartilhe suas opiniões sobre os livros que leu! Use o botão flutuante ✍️ ou visite as páginas dos livros para deixar suas avaliações.</p>
                <a href="home.html" class="browse-books">Explorar Catálogo</a>
            </div>
        `;
        return;
    }

    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const cardsHTML = reviews.map(review => {
        const bookInfo = bookDataCache[review.bookId] || bookDataFallback[review.bookId];
        const tituloLivro = bookInfo ? bookInfo.titulo : `Livro (ID: ${review.bookId})`;
        const autorLivro = bookInfo ? bookInfo.autor : 'Autor desconhecido';
        const imgLivro = bookInfo ? bookInfo.imagem : '/imagens/placeholder.svg';
        const ratingStars = "★".repeat(Math.floor(review.rating)) + (review.rating % 1 ? "½" : "");
        const reviewDate = new Date(review.timestamp).toLocaleDateString();
        const shortComment = review.text.length > 100 ? review.text.slice(0, 100) + '…' : review.text;

        return `
<article class="book-item review-card" data-id="${esc(review.bookId)}" data-title="${esc(tituloLivro)}">
    <div class="book-card"><img src="${esc(imgLivro)}" alt="${esc(tituloLivro)}" onerror="this.src='/imagens/placeholder.svg'"></div>
    <div class="book-title">
        <p>${esc(tituloLivro)}</p>
        <div style="font-size: 0.9em; margin: 0px 0 0 0; text-align: center;">${ratingStars}</div>
        <div style="font-size: 0.85em; opacity: 0.7; margin-bottom: 4px; text-align: center;">${reviewDate}</div>
        <div class="book-comment-text">${esc(shortComment)}</div>
        <div class="botao-quero-ler">
            <button class="action-btn btn-remove" data-book-id="${esc(review.bookId)}" data-review-timestamp="${review.timestamp}">Deletar</button>
        </div>
    </div>
    <div class="book-action"><a href="vejamais.html?id=${encodeURIComponent(review.bookId)}&review=${encodeURIComponent(review.timestamp)}" class="review-link">Leia mais</a></div>
</article>`;
    }).join('');

    reviewsSection.innerHTML = cardsHTML;

    // Delegação de eventos para deletar
    reviewsSection.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.btn-remove');
        if (!deleteBtn) return;
        
        // Prevenir múltiplos cliques
        if (deleteBtn.disabled) return;
        deleteBtn.disabled = true;
        
        const { bookId, reviewTimestamp: timestamp } = deleteBtn.dataset;
        const cardElement = deleteBtn.closest('.book-item');
        
        if (!confirm('Tem certeza que deseja deletar esta review?')) {
            deleteBtn.disabled = false;
            return;
        }
        
        try {
            // Adiciona animação de delete
            createCoffeeDroplets(cardElement, false);
            cardElement.classList.add('coffee-delete');
            
            // Aguarda a animação terminar com timeout de segurança
            let animationFinished = false;
            const animationPromise = new Promise(resolve => {
                const handler = () => {
                    animationFinished = true;
                    cardElement.removeEventListener('animationend', handler);
                    resolve();
                };
                cardElement.addEventListener('animationend', handler, { once: true });
            });
            
            const timeoutPromise = new Promise(resolve => {
                setTimeout(() => resolve(), 1000); // Timeout de 1 segundo
            });
            
            await Promise.race([animationPromise, timeoutPromise]);
            
            cardElement.classList.remove('coffee-delete');
            const module = await import('./reviews-manager.js');
            module.deleteReview(bookId, timestamp);
            await renderUserReviews();
        } catch (err) {
            console.error('Erro ao deletar review:', err);
            alert(err.message || 'Erro ao deletar a review.');
            deleteBtn.disabled = false;
        }
    });
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
                window.location.href = 'login.html';
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

    card.querySelector('.btn-submit').addEventListener('click', async () => {
        // Verificar penalidades
        const penalty = await checkUserPenalty();
        if (!blockActionIfPenalized(penalty, 'write_review')) {
            return;
        }

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
            await renderUserReviews();
            
            // Localiza o card recém-adicionado e anima
            const newCard = reviewsSection.querySelector(`[data-id="${CSS.escape(bookId)}"]`);
            if (newCard) {
                createCoffeeDroplets(newCard, true);
                newCard.classList.add('coffee-add');
                
                // Remove a classe de animação após terminar
                await new Promise(resolve => {
                    const handler = () => {
                        newCard.classList.remove('coffee-add');
                        newCard.removeEventListener('animationend', handler);
                        resolve();
                    };
                    newCard.addEventListener('animationend', handler, { once: true });
                });
            }
            
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
    console.log('🚀 reviews-page.js DOMContentLoaded');
    
    // Verificar penalidades e mostrar aviso se necessário
    console.log('⏳ Verificando penalidades do usuário...');
    const penalty = await checkUserPenalty();
    
    console.log('📊 Penalidade detectada:', penalty);
    
    if (!penalty.isActive) {
        console.log('⚠️ Usuário possui penalidade:', penalty.status);
        showPenaltyWarning(penalty);
        
        // Se banido, desabilitar botão de adicionar review
        if (penalty.isBanned) {
            console.log('🚫 Desabilitando botão de review para usuário banido');
            const toggleBtn = document.getElementById('toggle-review-form');
            if (toggleBtn) {
                toggleBtn.disabled = true;
                toggleBtn.style.opacity = '0.5';
                toggleBtn.style.cursor = 'not-allowed';
                toggleBtn.title = 'Sua conta foi banida';
            }
        }
    } else {
        console.log('✅ Usuário ativo - sem penalidades');
    }

    await loadBooks();
    await renderUserReviews();
    await createFloatingReviewCard();
});

auth.onAuthStateChanged(async (user) => {
    console.log('🔄 Auth state changed:', user?.email || 'logout');
    await loadBooks();
    await renderUserReviews();
});