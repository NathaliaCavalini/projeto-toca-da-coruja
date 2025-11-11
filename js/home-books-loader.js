// home-books-loader.js - Carrega livros do localStorage e ADICIONA aos hardcoded

// Carregar livros adicionados pelo admin (novo localStorage)
function getStorageBooks() {
    const stored = localStorage.getItem('admin-books');
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
}

// Renderizar um livro no grid
function renderBookCard(id, book) {
    const article = document.createElement('article');
    article.className = 'book-item';
    article.setAttribute('data-title', book.titulo);
    article.setAttribute('data-genre', book.genero);
    
    // Gerar descrição curta (primeiras 100 caracteres da sinopse)
    const shortDesc = book.sinopse && book.sinopse.length > 100 
        ? book.sinopse.substring(0, 100) + '...' 
        : (book.sinopse || 'Descrição não disponível');
    
    article.innerHTML = `
        <div class="book-card">
            <img src="${book.imagem}" alt="Capa do livro ${book.titulo}">
        </div>
        <div class="book-title">
            <p>${book.titulo}<br><br>${shortDesc}</p>
            <div class="botao-quero-ler">
                <button class="action-btn" data-book-id="${id}">Quero Ler</button>
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
    
    console.log(`✅ ${bookIds.length} livros do localStorage adicionados à home`);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    addStorageBooksToGrid();
});

// Exportar para uso em outros módulos
export { getStorageBooks, addStorageBooksToGrid };
