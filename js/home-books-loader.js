// home-books-loader.js - Carrega livros do localStorage e ADICIONA aos hardcoded

// Carregar livros adicionados pelo admin (novo localStorage)
function getStorageBooks() {
    const stored = localStorage.getItem('admin-books');
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
}

// Utilitário simples para evitar XSS ao renderizar textos
function esc(html){
    return String(html)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#39;');
}

// Renderizar um livro no grid
function renderBookCard(id, book) {
    const article = document.createElement('article');
    article.className = 'book-item';
    article.setAttribute('data-title', book.titulo);
    article.setAttribute('data-genre', book.genero || '');
    article.setAttribute('data-id', id);

    // Preferir 'descricao' definida pelo admin; caso contrário, resumir a sinopse
    const MAX_DESC = 70; // limite baseado no maior resumo legacy medido nos HTML estáticos
    const baseDesc = (book.descricao && book.descricao.trim())
        ? book.descricao.trim()
        : (book.sinopse || '');
    const cleanDesc = baseDesc.replace(/\s+/g,' ').trim();
    const shortDesc = cleanDesc.length > MAX_DESC ? cleanDesc.substring(0, MAX_DESC) + '…' : (cleanDesc || 'Descrição não disponível');

    // Markup padronizado igual ao catálogo (single button + veja mais)
    article.innerHTML = `
        <div class="book-card">
            <img src="${esc(book.imagem)}" alt="Capa do livro ${esc(book.titulo)}">
        </div>
        <div class="book-title">
            <p>${esc(book.titulo)}<br><br>${esc(shortDesc)}</p>
            <div class="botao-quero-ler">
                <button class="action-btn btn-quer-ler" data-library-action="querLer">📖 Quero Ler</button>
            </div>
        </div>
        <div class="book-action"><a href="vejamais.html?id=${id}">Veja mais</a></div>
    `;

    return article;
}

// ADICIONAR livros do localStorage aos já existentes (não substituir)
function addStorageBooksToGrid() {
    const bookGrid = document.querySelector('.book-grid');
    if (!bookGrid) return;
    
    const storageBooks = getStorageBooks();
    const bookIds = Object.keys(storageBooks);
    
    if (bookIds.length === 0) {
        console.log('ℹ️ Nenhum livro no localStorage para adicionar');
        return;
    }
    
    // ADICIONAR cada livro do localStorage ao grid (não limpa os hardcoded)
    bookIds.forEach(id => {
        const book = storageBooks[id];
        const bookCard = renderBookCard(id, book);
        bookGrid.appendChild(bookCard); // Adiciona ao final
    });

    // Atualiza estados dos botões após inserir dinamicamente
    const tryRefresh = () => {
        if (window.__libraryActions && typeof window.__libraryActions.refreshAll === 'function') {
            window.__libraryActions.refreshAll();
        } else {
            setTimeout(tryRefresh, 60);
        }
    };
    tryRefresh();

    console.log(`✅ ${bookIds.length} livros do localStorage adicionados à home`);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    addStorageBooksToGrid();
});

// Exportar para uso em outros módulos
export { getStorageBooks, addStorageBooksToGrid };
