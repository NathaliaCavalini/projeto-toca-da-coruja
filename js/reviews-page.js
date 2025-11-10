import { getCurrentUserReviews, saveReview } from './reviews-manager.js';
import { auth } from './firebase-config.js';

// Importa os dados dos livros do vejamais.js
const bookData = {
    "amor-obvio": { titulo: "O amor não é óbvio", autor: "Elayne Baeta", imagem: "/imagens/o_amor_nao_e_obvio.png" },
    "jogada-amor": { titulo: "A jogada do amor", autor: "Kelly Quindlen", imagem: "/imagens/a_jogada_do_amor.png" },
    "ela-fica": { titulo: "Ela fica com a garota", autor: "Rachael Lippincott", imagem: "/imagens/ela_fica_com_a_garota.png" },
    "algumas-garotas": { titulo: "Algumas garotas são assim", autor: "Jennifer Dugan", imagem: "/imagens/algumas_garotas_sao_assim.png" },
    "princesa-e-o-queijo-quente": { titulo: "Princesa e o Queijo Quente", autor: "Laura Pohl", imagem: "/imagens/a_princesa_e_o_queijo_quente.png" },
    "um-milhao-de-finais-felizes": { titulo: "Um Milhão de Finais Felizes", autor: "Vitor Martins", imagem: "/imagens/um_milhao_de_finais_felizes.png" },
    "coisas-obvias-sobre-o-amor": { titulo: "Coisas Óbvias Sobre o Amor", autor: "Clara Alves", imagem: "/imagens/coisas_obvias_sobre_o_amor.png" },
    "girls-like-girls": { titulo: "Girls Like Girls", autor: "Hayley Kiyoko", imagem: "/imagens/girls_like_girls.jpg" },
    "isso-nao-e-um-conto-de-fadas": { titulo: "Isso Não É um Conto de Fadas", autor: "Emeli J. Santos", imagem: "/imagens/isso-não-é-um-conto-de-fadas.jpg" },
    "lembre-se-de-nos": { titulo: "Lembre-se de Nós", autor: "Nina Lacour", imagem: "/imagens/lembre-se-de-nos.jpg" },
    "night-owls-and-summer-skies": { titulo: "Night Owls and Summer Skies (HQ)", autor: "Tara Frejas", imagem: "/imagens/night-owls-and-summer-skies.jpg" },
    "vermelho-branco-e-sangue-azul": { titulo: "Vermelho, Branco e Sangue Azul", autor: "Casey McQuiston", imagem: "/imagens/vermelho-branco-e-sangue-azul.jpg" },
    "a-arte-da-guerra": { titulo: "A Arte da Guerra", autor: "Sun Tzu", imagem: "/imagens/a-arte-da-guerra.jpg" },
    "a-divina-comedia": { titulo: "A Divina Comédia", autor: "Dante Alighieri", imagem: "/imagens/a-divina-comedia.jpg" },
    "fahrenheit-451": { titulo: "Fahrenheit 451", autor: "Ray Bradbury", imagem: "/imagens/fahrenheit-451.jpg" },
    "meridiano-de-sangue": { titulo: "Meridiano de Sangue", autor: "Cormac McCarthy", imagem: "/imagens/meridiano-de-sangue.jpg" },
    "os-irmaos-karamazov": { titulo: "Os Irmãos Karamázov", autor: "Fiódor Dostoiévski", imagem: "/imagens/os-irmaos-karamazov.jpg" },
    "sql-em-10-minutos": { titulo: "SQL em 10 Minutos, Sams Teach Yourself", autor: "Ben Forta", imagem: "/imagens/sql-em-10-minutos.png" },
    "use-a-cabeca": { titulo: "Use a Cabeça! Java", autor: "Lynn Beighley", imagem: "/imagens/use a cabeça java.jpg" },
    "javascript-guia-definitivo": { titulo: "JavaScript: O Guia Definitivo", autor: "David Flanagan", imagem: "/imagens/javascript guia definitivo.png" },
    "html-e-css": { titulo: "HTML e CSS: Desenhe e Construa Websites", autor: "Jon Duckett", imagem: "/imagens/html e css.png" },
    "fluente-python": { titulo: "Python Fluente", autor: "Luciano Ramalho", imagem: "/imagens/fluente python.png" },
    "dndE5-livro-do-jogador": { titulo: "D&D 5e Livro do Jogador", autor: "Wizards of the Coast", imagem: "/imagens/dnd e5 livro do jogador.png" },
    "o-um-anel-livro-do-aventureiro": { titulo: "O Um Anel - Livro do Aventureiro", autor: "Francesco Nepitello", imagem: "/imagens/um anel o livro do aventureiro.jpg" },
    "blades-in-the-dark": { titulo: "Blades in the Dark", autor: "John Harper", imagem: "/imagens/blades in the dark.png" },
    "som-das-seis": { titulo: "O Som das Seis", autor: "Gael Pereira", imagem: "/imagens/o som das seis.png" },
    "paranoia": { titulo: "Paranoia", autor: "Allen Varney", imagem: "/imagens/paranoia.jpg" },
    "tormenta-modulo-basico": { titulo: "Tormenta RPG - Módulo Básico", autor: "Jambô Editora", imagem: "/imagens/tormenta.jpg" },
    "a-biblioteca-da-meia-noite": { titulo: "A Biblioteca da Meia-Noite", autor: "Matt Haig", imagem: "/imagens/biblioteca da meia noite.jpg" },
    "caninos-brancos": { titulo: "Caninos Brancos", autor: "Jack London", imagem: "/imagens/caninos brancos.jpg" },
    "o-impulso": { titulo: "O Impulso", autor: "Ashley Audrain", imagem: "/imagens/o impulso.jpg" },
    "walden": { titulo: "Walden", autor: "Henry David Thoreau", imagem: "/imagens/walden.jpg" },
    "legend-of-the-guardians-collection": { titulo: "The Legend of the Guardians Collection", autor: "Kathryn Lasky", imagem: "/imagens/lenda dos guardiões.jpg" },
    "arvore-dos-desejos": { titulo: "Árvore dos Desejos", autor: "Katherine Applegate", imagem: "/imagens/árvore dos desejos.jpg" },
    "flores-para-algernon": { titulo: "Flores para Algernon", autor: "Daniel Keyes", imagem: "/imagens/flores para algernon.jpg" }
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

    btn.addEventListener('mousedown', () => {
        // Não precisa fazer nada aqui
    });

    btn.addEventListener('mouseup', () => {
        // Não precisa fazer nada aqui
    });

    btn.addEventListener('mouseleave', () => {
        // Não precisa fazer nada aqui
    });

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

    // Manter o wrapper acima do footer: calcular a posição baseado na altura do footer visível
    const footer = document.querySelector('.footer');
    
    function adjustWrapperPosition() {
        if (!footer) return;
        
        const footerRect = footer.getBoundingClientRect();
        const gap = 20;
        
        // Se o footer está visível na tela, calcular quanto dele é visível
        if (footerRect.top < window.innerHeight) {
            // Calcular quantos pixels do footer estão visíveis
            const visibleFooterHeight = window.innerHeight - footerRect.top;
            wrapper.style.bottom = `${visibleFooterHeight + gap}px`;
        } else {
            // Footer não está visível, posição padrão
            wrapper.style.bottom = '24px';
        }
    }
    
    // Ajustar quando a página rola ou redimensiona
    window.addEventListener('scroll', adjustWrapperPosition, { passive: true });
    window.addEventListener('resize', adjustWrapperPosition);
    
    // Ajuste inicial
    adjustWrapperPosition();
}

// inicializa componente flutuante imediatamente
document.addEventListener('DOMContentLoaded', () => createFloatingReviewCard());