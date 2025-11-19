// Importar dados dos livros
import { livros } from './livros-data.js';

// Função para obter todos os livros (originais + adicionados pelo admin)
function getAllBooks() {
    // Livros originais
    let allBooks = { ...livros };
    
    // Livros adicionados pelo admin
    try {
        const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
        allBooks = { ...allBooks, ...adminBooks };
    } catch (e) {
        // Ignorar erro se localStorage tiver problema
    }
    
    return allBooks;
}

// Função para extrair o ID do livro do link "veja mais"
function getBookIdFromElement(element) {
    // Tenta pegar do link "veja mais" primeiro (mais confiável)
    const article = element.closest('article');
    if (!article) return null;
    
    const vejaLink = article.querySelector('.book-action a');
    if (vejaLink && vejaLink.href) {
        const match = vejaLink.href.match(/id=([^&]+)/);
        if (match) return match[1];
    }
    
    // Fallback: tenta extrair do data-title
    if (article.dataset.title) {
        return article.dataset.title.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/ã/g, 'a')
            .replace(/õ/g, 'o')
            .replace(/é/g, 'e');
    }
    
    return null;
}

// Importar autenticação
let auth;
import('./firebase-config.js').then(mod => { auth = mod.auth; }).catch(() => { auth = null; });

// Helpers de storage por usuário (mesmo de library-actions.js)
function getUserKey() {
    try {
        const user = auth && auth.currentUser ? auth.currentUser : null;
        if (user && user.uid) return `user-${user.uid}`;
    } catch (e) { /* ignore */ }
    return 'guest';
}

function getStorageKeyFor(listName) {
    return `${getUserKey()}::${listName}`;
}

function loadList(listName) {
    const raw = localStorage.getItem(getStorageKeyFor(listName));
    return raw ? JSON.parse(raw) : [];
}

function saveList(listName, arr) {
    localStorage.setItem(getStorageKeyFor(listName), JSON.stringify(arr));
}

function isInList(listName, bookId) {
    return loadList(listName).some(item => item.id === bookId);
}

function toggleInList(listName, bookObj) {
    const list = loadList(listName);
    const idx = list.findIndex(i => i.id === bookObj.id);
    if (idx > -1) {
        list.splice(idx, 1);
        saveList(listName, list);
        return false; // now removed
    } else {
        list.push(bookObj);
        saveList(listName, list);
        return true; // now added
    }
}

// Função para calcular a média de avaliações
function getAverageRating(bookId) {
    try {
        const ratingsJson = localStorage.getItem(`bookRating-${bookId}`);
        if (!ratingsJson) return 0;
        
        const ratings = JSON.parse(ratingsJson);
        const allValues = Object.values(ratings);
        
        if (allValues.length === 0) return 0;
        
        const avg = (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1);
        return parseFloat(avg);
    } catch (error) {
        return 0;
    }
}

// Função para criar e exibir o modal
function showBookPreview(bookId) {
    const allBooks = getAllBooks();
    const book = allBooks[bookId];
    if (!book) {
        console.warn(`Livro com ID "${bookId}" não encontrado em livros-data.js ou admin-books`);
        return;
    }

    // Remove modal anterior se existir
    const existingModal = document.querySelector('.book-preview-modal');
    if (existingModal) existingModal.remove();

    // Calcula a média de avaliação
    const avgRating = getAverageRating(bookId);

    // Cria container do modal
    const modal = document.createElement('div');
    modal.className = 'book-preview-modal';
    
    // Adiciona classe específica se for "Som das seis"
    if (bookId === 'som-das-seis') {
        modal.setAttribute('data-book-id', 'som-das-seis');
    }

    modal.innerHTML = `
        <div class="book-preview-overlay"></div>
        <div class="book-preview-card" ${bookId === 'som-das-seis' ? 'data-book-id="som-das-seis"' : ''}>
            <button class="book-preview-close" aria-label="Fechar">&times;</button>
            <div class="book-preview-image">
                <img src="${escapeHtml(book.imagem)}" alt="Capa do livro ${escapeHtml(book.titulo)}" />
            </div>
            <div class="book-preview-content">
                <h3 class="book-preview-title">${escapeHtml(book.titulo)}</h3>
                <p class="book-preview-description">${escapeHtml(book.descricao || book.sinopse || 'Descrição não disponível')}</p>
                <div class="book-preview-meta">
                    <p class="book-preview-author">Autor(a): ${escapeHtml(book.autor)}</p>
                    ${avgRating > 0 ? `<p class="book-preview-rating">★ ${avgRating} estrelas</p>` : `<p class="book-preview-no-rating">Seja o primeiro a avaliar</p>`}
                </div>
                <div class="book-preview-action-buttons">
                    <button class="action-btn btn-quer-ler" data-book-id="${bookId}">📖 Quero Ler</button>
                    <button class="action-btn btn-ja-li" data-book-id="${bookId}">✅ Já Li</button>
                    <button class="action-btn btn-favorito" data-book-id="${bookId}">⭐ Favorito</button>
                </div>
                <a href="vejamais.html?id=${bookId}" class="book-preview-button" style="color: #fff;">Veja mais</a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.book-preview-close');
    const overlay = modal.querySelector('.book-preview-overlay');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Fechar ao pressionar Escape
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    });

    // Adicionar listeners dos botões de ação (Quero Ler, Já Li, Favorito)
    const actionButtons = modal.querySelectorAll('.book-preview-action-buttons .action-btn');
    
    // Criar objeto do livro com os dados necessários
    const bookObj = {
        id: bookId,
        title: book.titulo,
        img: book.imagem,
        desc: book.descricao,
        when: new Date().toISOString()
    };
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (btn.classList.contains('btn-quer-ler')) {
                const added = toggleInList('querLer', bookObj);
                btn.classList.toggle('active', added);
            } else if (btn.classList.contains('btn-ja-li')) {
                const added = toggleInList('jaLi', bookObj);
                btn.classList.toggle('active', added);
            } else if (btn.classList.contains('btn-favorito')) {
                const added = toggleInList('favoritos', bookObj);
                btn.classList.toggle('active', added);
            }
        });
    });

    // Atualizar estado dos botões de ação
    modal.querySelector('.btn-quer-ler').classList.toggle('active', isInList('querLer', bookId));
    modal.querySelector('.btn-ja-li').classList.toggle('active', isInList('jaLi', bookId));
    modal.querySelector('.btn-favorito').classList.toggle('active', isInList('favoritos', bookId));
}

// Função para escapar HTML e evitar XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event delegation para todos os .book-title p
document.addEventListener('click', (e) => {
    const titleParagraph = e.target.closest('.book-title p');
    if (titleParagraph) {
        const bookId = getBookIdFromElement(titleParagraph);
        if (bookId) {
            showBookPreview(bookId);
        }
    }
});
