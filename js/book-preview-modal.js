// Importar dados dos livros
import { livros } from './livros-data.js';

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

// Função para criar e exibir o modal
function showBookPreview(bookId) {
    const book = livros[bookId];
    if (!book) {
        console.warn(`Livro com ID "${bookId}" não encontrado em livros-data.js`);
        return;
    }

    // Remove modal anterior se existir
    const existingModal = document.querySelector('.book-preview-modal');
    if (existingModal) existingModal.remove();

    // Cria container do modal
    const modal = document.createElement('div');
    modal.className = 'book-preview-modal';

    modal.innerHTML = `
        <div class="book-preview-overlay"></div>
        <div class="book-preview-card">
            <button class="book-preview-close" aria-label="Fechar">&times;</button>
            <div class="book-preview-content">
                <h2 class="book-preview-title">${escapeHtml(book.titulo)}</h2>
                <p class="book-preview-author">por ${escapeHtml(book.autor)}</p>
                ${book.genero ? `<p class="book-preview-genre">${escapeHtml(book.genero)}</p>` : ''}
                <div class="book-preview-description">
                    ${escapeHtml(book.descricao)}
                </div>
                ${book.paginas || book.ano ? `<div class="book-preview-info">
                    ${book.paginas ? `<span>${book.paginas} páginas</span>` : ''}
                    ${book.ano ? `<span>• ${Math.abs(book.ano)} ${book.ano < 0 ? 'a.C.' : ''}</span>` : ''}
                </div>` : ''}
                <a href="vejamais.html?id=${bookId}" class="book-preview-button">Veja mais</a>
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
