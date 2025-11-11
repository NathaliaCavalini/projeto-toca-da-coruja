// genre-page-loader.js - Carrega livros filtrados por gênero dinamicamente

// Obter gênero da URL
function getGenreFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('genero') || '';
}

// Carregar todos os livros do localStorage
function getAllBooks() {
    const stored = localStorage.getItem('books-data');
    if (stored) {
        return JSON.parse(stored);
    }
    return {};
}

// Obter todos os gêneros únicos dos livros (apenas fixos agora)
function getAllGenres() {
    // Apenas gêneros fixos, sem customizados
    return ['RPG', 'LGBTQIAPN+', 'Fantasia', 'Romance', 'Clássicos', 'Programação'];
}

// Mapeamento de gêneros para URLs de páginas existentes
const genrePageMap = {
    'RPG': 'rpg.html',
    'LGBTQIAPN+': 'gay.html',
    'Fantasia': 'fantasia.html',
    'Romance': 'romance.html',
    'Clássicos': 'classico.html',
    'Programação': 'programacao.html'
};

// Renderizar menu de gêneros
// Removido renderGenresMenu (menu dinâmico tratado por dynamic-genres-menu.js apenas com gêneros fixos)

// Renderizar card de livro
function renderBookCard(id, book) {
    const article = document.createElement('article');
    article.className = 'book-item';
    article.setAttribute('data-title', book.titulo);
    article.setAttribute('data-genre', book.genero);
    
    // Gerar descrição curta
    const shortDesc = book.sinopse && book.sinopse.length > 100 
        ? book.sinopse.substring(0, 100) + '...' 
        : (book.sinopse || 'Sem descrição disponível.');
    
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

// Filtrar livros por gênero
function filterBooksByGenre(genre) {
    const books = getAllBooks();
    const filtered = {};
    
    Object.keys(books).forEach(id => {
        const book = books[id];
        // Normalizar comparação (case-insensitive e remover espaços extras)
        const bookGenre = (book.genero || '').trim().toLowerCase();
        const targetGenre = genre.trim().toLowerCase();
        
        if (bookGenre === targetGenre) {
            filtered[id] = book;
        }
    });
    
    return filtered;
}

// Renderizar livros do gênero
function renderGenreBooks() {
    const genre = getGenreFromURL();
    const container = document.getElementById('books-container');
    
    if (!genre) {
        container.innerHTML = '<p style="text-align:center; padding:60px; color:var(--color-text); font-size:1.2rem;">Nenhum gênero especificado.</p>';
        return;
    }
    
    // Atualizar título da página
    const titleElement = document.getElementById('page-title');
    const genreTitleElement = document.getElementById('genre-title');
    const genreDescElement = document.getElementById('genre-description');
    
    if (titleElement) titleElement.textContent = `${genre} - Toca da Coruja`;
    if (genreTitleElement) genreTitleElement.textContent = genre;
    if (genreDescElement) genreDescElement.textContent = `Descubra nossa coleção de ${genre}`;
    
    // Filtrar e renderizar livros
    const books = filterBooksByGenre(genre);
    const bookIds = Object.keys(books);
    
    if (bookIds.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <p style="color:var(--color-text); font-size:1.2rem; margin-bottom:20px;">
                    Nenhum livro encontrado no gênero "${genre}".
                </p>
                <p style="color:var(--color-text); opacity:0.7;">
                    Adicione livros deste gênero pelo painel admin.
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    bookIds.forEach(id => {
        const book = books[id];
        const bookCard = renderBookCard(id, book);
        container.appendChild(bookCard);
    });
    
    console.log(`✅ ${bookIds.length} livros carregados para o gênero "${genre}"`);
}

// Busca de livros
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    function normalizeText(str) {
        if (!str) return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    
    function doSearch() {
        const term = normalizeText(searchInput.value.trim());
        const books = document.querySelectorAll('.book-item');
        
        if (term === '') {
            books.forEach(b => b.classList.remove('hidden'));
            return;
        }
        
        books.forEach(book => {
            const dataTitle = book.getAttribute('data-title') || '';
            const normalizedTitle = normalizeText(dataTitle);
            
            const match = normalizedTitle.includes(term);
            if (match) {
                book.classList.remove('hidden');
            } else {
                book.classList.add('hidden');
            }
        });
    }
    
    searchInput.addEventListener('input', doSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            doSearch();
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Não precisa mais renderizar menu aqui, o dynamic-genres-menu.js faz isso
    // renderGenresMenu();
    renderGenreBooks();
    setupSearch();
});
