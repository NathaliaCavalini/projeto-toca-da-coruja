// genre-page-loader.js - Carrega livros filtrados por gênero dinamicamente

// Obter gênero da URL
function getGenreFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('genero') || '';
}

// Carregar todos os livros (vejamais.js + admin-books)
async function getAllBooks() {
    // Importar livros do vejamais.js
    let baseBooks = {};
    try {
        const module = await import('./vejamais.js');
        baseBooks = module.livros || {};
    } catch (error) {
        console.warn('Não foi possível importar vejamais.js, usando apenas localStorage');
    }
    
    // Adicionar livros do admin
    const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
    
    return { ...baseBooks, ...adminBooks };
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
    article.setAttribute('data-id', id);
    article.setAttribute('data-genre', book.genero);
    
    // Descrição curta: prioriza campo "descricao" (padronizado nos cards), fallback para sinopse
    let baseDesc = (book.descricao && String(book.descricao).trim()) || (book.sinopse && String(book.sinopse).trim()) || '';
    if (!baseDesc) baseDesc = 'Sem descrição disponível.';
    const shortDesc = baseDesc.length > 100 ? baseDesc.substring(0, 100) + '...' : baseDesc;
    
    article.innerHTML = `
        <div class="book-card">
            <img src="${book.imagem}" alt="Capa do livro ${book.titulo}" onerror="this.onerror=null;this.src='/imagens/placeholder.svg'">
        </div>
        <div class="book-title">
            <p>${book.titulo}<br><br>${shortDesc}</p>
            <div class="botao-quero-ler">
                <button class="action-btn btn-quer-ler" data-book-id="${id}">📖 Quero Ler</button>
            </div>
        </div>
        <div class="book-action"><a href="vejamais.html?id=${id}">Veja mais</a></div>
    `;
    
    return article;
}

// Filtrar livros por gênero
function filterBooksByGenre(genre, books) {
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
async function renderGenreBooks() {
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
    
    // Filtrar e renderizar livros (aguardar carregar todos os livros)
    const allBooks = await getAllBooks();
    const books = filterBooksByGenre(genre, allBooks);
    const bookIds = Object.keys(books);
    
    if (bookIds.length === 0) {
        container.classList.add('is-empty');
        container.innerHTML = `
            <div class="empty-state-box" role="status">
                <div class="owl" aria-hidden="true" style="font-size:3.2rem; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.15));">🦉</div>
                <h3>Nenhum livro encontrado no gênero "${genre}".</h3>
                <p class="hint">Adicione livros deste gênero pelo painel admin.</p>
            </div>
        `;
        return;
    }
    
    container.classList.remove('is-empty');
    container.innerHTML = '';
    
    bookIds.forEach(id => {
        const book = books[id];
        const bookCard = renderBookCard(id, book);
        container.appendChild(bookCard);
    });
    
    try { if (window.__libraryActions && typeof window.__libraryActions.refreshAll === 'function') { window.__libraryActions.refreshAll(); } } catch(e) { }
    
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
