// genre-books-loader.js - Adiciona livros do localStorage às páginas de gêneros específicas

// Mapeamento de arquivos HTML para gêneros (apenas gêneros fixos)
const pageGenreMap = {
    'rpg.html': ['RPG'],
    'gay.html': ['LGBTQIAPN+'],
    'fantasia.html': ['Fantasia'],
    'romance.html': ['Romance'],
    'classico.html': ['Clássicos'],
    'programacao.html': ['Programação']
};

// Detectar qual página estamos
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename;
}

// Obter gêneros aceitos para a página atual
function getAcceptedGenres() {
    const currentPage = getCurrentPage();
    return pageGenreMap[currentPage] || [];
}

// Carregar livros adicionados pelo admin
function getStorageBooks() {
    const stored = localStorage.getItem('admin-books');
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
}

// Verificar se o gênero do livro corresponde à página
function matchesPageGenre(bookGenre) {
    const acceptedGenres = getAcceptedGenres();
    if (acceptedGenres.length === 0) return false;
    
    // Normalizar para comparação
    const normalizedBookGenre = bookGenre.toLowerCase().trim();
    
    return acceptedGenres.some(genre => {
        const normalizedGenre = genre.toLowerCase().trim();
        return normalizedBookGenre === normalizedGenre || 
               normalizedBookGenre.includes(normalizedGenre) ||
               normalizedGenre.includes(normalizedBookGenre);
    });
}

// Renderizar card de livro
function renderBookCard(id, book) {
    const article = document.createElement('article');
    article.className = 'book-item';
    article.setAttribute('data-title', book.titulo);
    
    // Gerar descrição curta
    const shortDesc = book.sinopse && book.sinopse.length > 80 
        ? book.sinopse.substring(0, 80) + '...' 
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

// Adicionar livros do localStorage à página
function addGenreBooks() {
    const bookGrid = document.querySelector('.book-grid');
    if (!bookGrid) return;
    
    const currentPage = getCurrentPage();
    if (!pageGenreMap[currentPage]) {
        console.log('ℹ️ Página não tem gêneros mapeados');
        return;
    }
    
    const storageBooks = getStorageBooks();
    const bookIds = Object.keys(storageBooks);
    
    if (bookIds.length === 0) {
        console.log('ℹ️ Nenhum livro no localStorage');
        return;
    }
    
    let addedCount = 0;
    
    // Filtrar e adicionar livros que correspondem aos gêneros da página
    bookIds.forEach(id => {
        const book = storageBooks[id];
        if (book.genero && matchesPageGenre(book.genero)) {
            const bookCard = renderBookCard(id, book);
            bookGrid.appendChild(bookCard);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        console.log(`✅ ${addedCount} livros adicionados à página ${currentPage}`);
    } else {
        console.log(`ℹ️ Nenhum livro do localStorage corresponde aos gêneros de ${currentPage}`);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    addGenreBooks();
});
