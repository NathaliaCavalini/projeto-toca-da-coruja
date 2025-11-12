import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Email do administrador
const ADMIN_EMAIL = 'tatacavalini@gmail.com';

// Verificar se usuário é admin
let isAdmin = false;

onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        isAdmin = true;
        console.log('✅ Admin autenticado:', user.email);
    } else {
        // Redirecionar para home se não for admin
        alert('Acesso negado. Esta página é apenas para administradores.');
        window.location.href = '/home.html';
    }
});

// ==================== GERENCIAMENTO DE LIVROS ====================

// Carregar livros: vejamais.js (base) + localStorage (adicionados pelo admin)
async function loadBooks() {
    const { livros } = await import('./vejamais.js');
    const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
    
    // Mesclar: livros do vejamais.js + livros adicionados pelo admin
    return { ...livros, ...adminBooks };
}

// Carregar apenas livros adicionados pelo admin
function loadAdminBooks() {
    return JSON.parse(localStorage.getItem('admin-books') || '{}');
}

// Salvar livros adicionados pelo admin (separado do vejamais.js)
function saveAdminBooks(books) {
    localStorage.setItem('admin-books', JSON.stringify(books));
    console.log('💾 Livros do admin salvos:', Object.keys(books).length);
}

// Renderizar lista de livros
async function renderBooksList() {
    const books = await loadBooks();
    const container = document.getElementById('books-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const bookIds = Object.keys(books);
    
    if (bookIds.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text); padding:40px;">Nenhum livro cadastrado ainda.</p>';
        return;
    }
    
    const adminBooks = loadAdminBooks();
    
    bookIds.forEach(id => {
        const book = books[id];
        const isAdminBook = adminBooks[id] !== undefined;
        const badge = isAdminBook ? '<span class="badge-custom">Adicionado pelo Admin</span>' : '<span class="badge-original">Original</span>';
        
        const card = document.createElement('div');
        card.className = 'book-admin-card';
        card.innerHTML = `
            <img src="${book.imagem}" alt="${book.titulo}" onerror="this.onerror=null;this.src='/imagens/placeholder.svg'">
            <div class="book-admin-info">
                <div>
                    <h3>${book.titulo} ${badge}</h3>
                    <p><strong>ID:</strong> <code>${id}</code></p>
                    <p><strong>Autor:</strong> ${book.autor}</p>
                    <p><strong>Gênero:</strong> ${book.genero}</p>
                    <p><strong>Ano:</strong> ${book.ano} | <strong>Páginas:</strong> ${book.paginas}</p>
                </div>
                <div class="book-admin-actions">
                    <a href="vejamais.html?id=${id}" target="_blank" class="btn-edit">Ver Página</a>
                    ${isAdminBook ? `
                        <button class="btn-secondary" onclick="window.editBook('${id}')">Editar</button>
                        <button class="btn-danger" onclick="window.deleteBook('${id}')">Deletar</button>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal
const modal = document.getElementById('modal-book');
const modalTitle = document.getElementById('modal-title');
const form = document.getElementById('form-book');
let editingBookId = null;

// Abrir modal para adicionar livro
document.getElementById('btn-add-book')?.addEventListener('click', () => {
    editingBookId = null;
    modalTitle.textContent = 'Adicionar Novo Livro';
    form.reset();
    document.getElementById('book-id').disabled = false;
    document.getElementById('image-preview').innerHTML = '';
    modal.classList.add('active');
});

// Fechar modais (X e Cancelar) de forma genérica para qualquer modal da página
document.querySelectorAll('.modal .modal-close, .modal .btn-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const m = btn.closest('.modal');
        if (m) m.classList.remove('active');
    });
});

// Editar livro (apenas livros adicionados pelo admin)
window.editBook = async function(id) {
    const adminBooks = loadAdminBooks();
    const book = adminBooks[id];
    
    if (!book) {
        alert('Apenas livros adicionados pelo admin podem ser editados.');
        return;
    }
    
    editingBookId = id;
    modalTitle.textContent = 'Editar Livro';
    
    document.getElementById('book-id').value = id;
    document.getElementById('book-id').disabled = true;
    document.getElementById('book-titulo').value = book.titulo;
    document.getElementById('book-autor').value = book.autor;
    
    // Configurar gênero
    const generoSelect = document.getElementById('book-genero-select');
    const generoHidden = document.getElementById('book-genero');
    const generoNovoInput = document.getElementById('book-genero-novo');
    
    // Verificar se é gênero fixo ou customizado
    const fixedGenres = ['RPG', 'LGBTQIAPN+', 'Fantasia', 'Romance', 'Clássicos', 'Programação'];
    if (fixedGenres.includes(book.genero)) {
        generoSelect.value = book.genero;
        generoHidden.value = book.genero;
        generoNovoInput.classList.add('hidden');
    } else {
        generoSelect.value = 'novo';
        generoNovoInput.value = book.genero;
        generoHidden.value = book.genero;
        generoNovoInput.classList.remove('hidden');
    }
    
    document.getElementById('book-paginas').value = book.paginas;
    document.getElementById('book-ano').value = book.ano;
    document.getElementById('book-sinopse').value = book.sinopse;
    
    // Descrição é obrigatória, sempre deve estar presente
    const descEl = document.getElementById('book-descricao');
    if (descEl) {
        descEl.value = book.descricao || '';
    }
    
    document.getElementById('book-imagem-url').value = book.imagem;
    
    // Preview da imagem
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `<img src="${book.imagem}" alt="Preview">`;
    
    modal.classList.add('active');
};

// Deletar livro (apenas livros adicionados pelo admin)
window.deleteBook = function(id) {
    const adminBooks = loadAdminBooks();
    
    if (!adminBooks[id]) {
        alert('Apenas livros adicionados pelo admin podem ser deletados.\n\nLivros originais do vejamais.js são permanentes.');
        return;
    }
    
    if (!confirm('Tem certeza que deseja deletar este livro?\n\nEle será removido de todas as listas de usuários (Quero Ler, Já Lidos, Favoritos).')) {
        return;
    }
    
    // Remover o livro do admin-books
    delete adminBooks[id];
    saveAdminBooks(adminBooks);
    
    // Limpar o livro de TODAS as listas de usuários no localStorage
    cleanBookFromUserLists(id);
    
    renderBooksList();
    alert('Livro deletado com sucesso!\n\nFoi removido de todas as listas de usuários.');
};

// Limpar livro deletado de todas as listas de usuários
function cleanBookFromUserLists(bookId) {
    // Lista de chaves localStorage que podem conter referências ao livro
    const listKeys = [
        'quer-ler',
        'ja-lidos', 
        'favoritos'
    ];
    
    let totalRemoved = 0;
    
    listKeys.forEach(key => {
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const before = list.length;
        const filtered = list.filter(id => id !== bookId);
        const removed = before - filtered.length;
        
        if (removed > 0) {
            localStorage.setItem(key, JSON.stringify(filtered));
            totalRemoved += removed;
            console.log(`🧹 Removido "${bookId}" de ${key}`);
        }
    });
    
    if (totalRemoved > 0) {
        console.log(`✅ Total: livro removido de ${totalRemoved} lista(s)`);
    }
}

// ==================== SELETOR DE GÊNEROS ====================

// Alternador para criar novo gênero
// Alternador de novo gênero (reativado)
document.getElementById('new-genre-btn')?.addEventListener('click', () => {
    const generoSelect = document.getElementById('book-genero-select');
    const generoNovoInput = document.getElementById('book-genero-novo');
    const generoHidden = document.getElementById('book-genero');
    if (generoNovoInput.classList.contains('hidden')) {
        generoNovoInput.classList.remove('hidden');
        generoSelect.disabled = true;
        generoSelect.value = ''; generoHidden.value='';
        generoNovoInput.focus();
        document.getElementById('new-genre-btn').textContent='Cancelar';
    } else {
        generoNovoInput.classList.add('hidden');
        generoSelect.disabled = false;
        generoNovoInput.value=''; generoHidden.value='';
        document.getElementById('new-genre-btn').textContent='+ Novo Gênero';
    }
});

// Atualizar campo hidden quando select mudar
document.getElementById('book-genero-select')?.addEventListener('change', (e) => {
    const generoHidden = document.getElementById('book-genero');
    const generoNovoInput = document.getElementById('book-genero-novo');
    if (e.target.value === 'novo') {
        generoNovoInput.classList.remove('hidden');
        generoHidden.value='';
        generoNovoInput.focus();
    } else {
        generoHidden.value = e.target.value;
        generoNovoInput.classList.add('hidden');
        generoNovoInput.value='';
    }
});

// Atualizar campo hidden quando digitar novo gênero
document.getElementById('book-genero-novo')?.addEventListener('input', (e) => {
    document.getElementById('book-genero').value = e.target.value;
});

// Alternar tipo de input de imagem
document.querySelectorAll('input[name="image-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const urlInput = document.getElementById('book-imagem-url');
        const fileInput = document.getElementById('book-imagem-file');
        
        if (e.target.value === 'url') {
            urlInput.classList.remove('hidden');
            fileInput.classList.add('hidden');
            fileInput.value = '';
        } else {
            urlInput.classList.add('hidden');
            fileInput.classList.remove('hidden');
        }
    });
});

// Preview de imagem URL
document.getElementById('book-imagem-url')?.addEventListener('input', (e) => {
    const preview = document.getElementById('image-preview');
    if (e.target.value) {
        preview.innerHTML = `<img src="${e.target.value}" alt="Preview" onerror="this.src='/imagens/placeholder.png'">`;
    } else {
        preview.innerHTML = '';
    }
});

// Preview de imagem de arquivo
document.getElementById('book-imagem-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

// ==================== CONTADOR DE DESCRIÇÃO ====================

// Contador de caracteres em tempo real para descrição curta
const descricaoInput = document.getElementById('book-descricao');
const descCounter = document.getElementById('desc-counter');
const MAX_DESC = 70; // Limite baseado na maior descrição legacy (70 chars)

if (descricaoInput && descCounter) {
    const updateCounter = () => {
        const cleanText = descricaoInput.value.replace(/\s+/g, ' ').trim();
        const len = cleanText.length;
        const remaining = MAX_DESC - len;
        
        descCounter.textContent = `${len}/${MAX_DESC}`;
        
        // Mudar cor: verde se OK, laranja perto do limite, vermelho se ultrapassou
        if (len > MAX_DESC) {
            descCounter.style.color = '#d32f2f'; // vermelho
            descCounter.style.fontWeight = '700';
        } else if (len > MAX_DESC - 10) {
            descCounter.style.color = '#f57c00'; // laranja
            descCounter.style.fontWeight = '600';
        } else {
            descCounter.style.color = 'var(--color-accent)';
            descCounter.style.fontWeight = '600';
        }
    };
    
    descricaoInput.addEventListener('input', updateCounter);
    descricaoInput.addEventListener('change', updateCounter);
    
    // Inicializar contador quando modal abrir
    const observer = new MutationObserver(() => {
        if (modal.classList.contains('active')) {
            updateCounter();
        }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
}

// Salvar livro (adicionar ou editar)
form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('book-id').value.trim();
    const titulo = document.getElementById('book-titulo').value.trim();
    const autor = document.getElementById('book-autor').value.trim();
    const genero = document.getElementById('book-genero').value.trim();
    const paginas = parseInt(document.getElementById('book-paginas').value);
    const ano = parseInt(document.getElementById('book-ano').value);
    const sinopse = document.getElementById('book-sinopse').value.trim();
    const descricaoCurtaInput = document.getElementById('book-descricao');
    const descricaoCurta = descricaoCurtaInput ? descricaoCurtaInput.value.trim() : '';
    
    if (!genero) {
        alert('Por favor, selecione ou digite um gênero');
        return;
    }
    
    // Validar descrição curta (OBRIGATÓRIO e não pode exceder 74)
    if (!descricaoCurta) {
        alert('A descrição curta é obrigatória!\n\nEla aparecerá no card do livro no catálogo.');
        document.getElementById('book-descricao').focus();
        return;
    }
    
    const cleanDesc = descricaoCurta.replace(/\s+/g, ' ').trim();
    if (cleanDesc.length > MAX_DESC) {
        const excesso = cleanDesc.length - MAX_DESC;
        alert(`❌ Descrição muito longa!\n\nA descrição tem ${cleanDesc.length} caracteres.\nLimite máximo: ${MAX_DESC} caracteres.\nExcesso: ${excesso} caracteres.\n\nPor favor, reduza o texto para manter o visual padronizado dos cards.`);
        document.getElementById('book-descricao').focus();
        return;
    }
    
    if (cleanDesc.length === 0) {
        alert('A descrição curta não pode estar vazia ou conter apenas espaços.');
        document.getElementById('book-descricao').focus();
        return;
    }
    
    // Pegar imagem (URL ou arquivo)
    const imageType = document.querySelector('input[name="image-type"]:checked').value;
    let imagem = '';
    
    if (imageType === 'url') {
        imagem = document.getElementById('book-imagem-url').value.trim();
    } else {
        const previewImg = document.querySelector('#image-preview img');
        if (previewImg) {
            imagem = previewImg.src;
        }
    }
    
    if (!imagem) {
        alert('Por favor, forneça uma imagem (URL ou arquivo)');
        return;
    }
    
    // Verificar se ID já existe
    const allBooks = await loadBooks();
    const adminBooks = loadAdminBooks();
    
    if (!editingBookId && allBooks[id]) {
        alert('Já existe um livro com este ID. Por favor, escolha outro.');
        return;
    }
    
    // Criar objeto do livro (descricao sempre presente, validada acima)
    const book = {
        titulo,
        autor,
        imagem,
        genero,
        paginas,
        ano,
        sinopse,
        descricao: cleanDesc // usar versão normalizada
    };
    
    // Salvar no localStorage do admin
    adminBooks[id] = book;
    saveAdminBooks(adminBooks);
    
    console.log(`📚 Livro "${titulo}" salvo com gênero "${genero}"`);
    
    // Se gênero não for fixo, criar página de gênero
    const fixedGenres = ['RPG', 'LGBTQIAPN+', 'Fantasia', 'Romance', 'Clássicos', 'Programação'];
    if (!fixedGenres.includes(genero)) {
        const generoSelect = document.getElementById('book-genero-select');
        let exists = false;
        for (let opt of generoSelect.options) {
            if (opt.value === genero) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const newOpt = document.createElement('option');
            newOpt.value = genero;
            newOpt.textContent = genero;
            const beforeOpt = Array.from(generoSelect.options).find(o => o.value === 'novo');
            generoSelect.insertBefore(newOpt, beforeOpt || null);
        }
        
        const customGenres = JSON.parse(localStorage.getItem('custom-genres') || '[]');
        if (!customGenres.includes(genero)) {
            customGenres.push(genero);
            localStorage.setItem('custom-genres', JSON.stringify(customGenres));
            createGenrePage(genero);
        }
    }
    
    // Fechar modal e atualizar lista
    modal.classList.remove('active');
    await renderBooksList();
    
    alert(editingBookId ? 'Livro atualizado com sucesso!' : 'Livro adicionado com sucesso!');
    
    // Resetar form
    form.reset();
    document.getElementById('book-genero-novo').classList.add('hidden');
    document.getElementById('book-genero-select').disabled = false;
    const btn = document.getElementById('new-genre-btn');
    if (btn) btn.textContent = '+ Novo Gênero';
    editingBookId = null;
});

// ==================== GERENCIAMENTO DE REVIEWS ====================

// Carregar todas as reviews do localStorage
function loadAllReviews() {
    // Admin lê todas as reviews salvas no array unificado
    return JSON.parse(localStorage.getItem('all_reviews') || '[]');
}

// Renderizar lista de reviews
async function renderReviewsList() {
    const reviews = loadAllReviews();
    const books = await loadBooks();
    const container = document.getElementById('reviews-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text); padding:40px;">Nenhuma review encontrada.</p>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-admin-card';
        
        const date = new Date(review.timestamp).toLocaleDateString('pt-BR');
        const book = books[review.bookId];
        const userLabel = (review.username && review.username !== 'Usuário Anônimo')
            ? review.username
            : (review.userEmail || 'Usuário');
        
        card.innerHTML = `
            <div class="review-admin-info">
                <h4>${book ? `Livro: ${book.titulo}` : `Livro ID: ${review.bookId}`}</h4>
                <div class="review-admin-meta">
                    <span class="review-rating">${'★'.repeat(Math.floor(review.rating))}${review.rating % 1 ? '½' : ''}</span>
                    <span class="review-user" title="${review.userEmail || ''}">Usuário: ${userLabel}</span>
                    <span>Data: ${date}</span>
                </div>
                <div class="review-admin-text">${review.text || '<em>Sem comentário</em>'}</div>
            </div>
            <button class="btn-danger" onclick="window.deleteReviewAdmin('${review.bookId}', '${review.timestamp}')">Deletar</button>
        `;
        
        container.appendChild(card);
    });
}

// Deletar review
window.deleteReviewAdmin = function(bookId, timestamp) {
    if (!confirm('Tem certeza que deseja deletar esta review?')) return;
    let all = JSON.parse(localStorage.getItem('all_reviews') || '[]');
    const before = all.length;
    all = all.filter(r => !(r.bookId === bookId && r.timestamp === timestamp));
    localStorage.setItem('all_reviews', JSON.stringify(all));
    renderReviewsList();
    alert(before !== all.length ? 'Review deletada com sucesso!' : 'Review não encontrada.');
};

// ==================== GERENCIAMENTO DE GÊNEROS ====================

// Renderizar lista de gêneros customizados
async function renderGenresList() {
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    const books = await loadBooks();
    const container = document.getElementById('genres-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const genreNames = Object.keys(genrePages);
    
    if (genreNames.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum gênero customizado criado ainda.</p>
                <p style="font-size:0.9rem;">Crie gêneros adicionando livros com novos gêneros.</p>
            </div>
        `;
        return;
    }
    
    genreNames.forEach(genreName => {
        const genre = genrePages[genreName];
        
        // Contar quantos livros têm este gênero
        let bookCount = 0;
        Object.values(books).forEach(book => {
            if (book.genero === genreName) {
                bookCount++;
            }
        });
        
        const card = document.createElement('div');
        card.className = 'genre-card';
        
        card.innerHTML = `
            <div class="genre-info">
                <h3>${genre.name}</h3>
                <p>📚 ${bookCount} livro${bookCount !== 1 ? 's' : ''}</p>
                <p style="font-size:0.8rem; opacity:0.6;">📍 <a href="${genre.url}" target="_blank" style="color:inherit;">Ver página</a></p>
                <span class="genre-badge">Customizado</span>
            </div>
            <button class="btn-danger" onclick="window.deleteGenre('${genreName.replace(/'/g, "\\'")}')">Deletar</button>
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${genreNames.length} gêneros customizados listados`);
}

// Deletar gênero customizado
window.deleteGenre = function(genreName) {
    if (!confirm(`Tem certeza que deseja deletar o gênero "${genreName}"?\n\nOs livros deste gênero NÃO serão deletados, mas o gênero não aparecerá mais no menu.`)) {
        return;
    }
    
    // Remover de genre-pages
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    delete genrePages[genreName];
    localStorage.setItem('genre-pages', JSON.stringify(genrePages));
    
    // Remover de custom-genres
    const customGenres = JSON.parse(localStorage.getItem('custom-genres') || '[]');
    const updatedGenres = customGenres.filter(g => g !== genreName);
    localStorage.setItem('custom-genres', JSON.stringify(updatedGenres));
    
    // Remover do select
    const generoSelect = document.getElementById('book-genero-select');
    if (generoSelect) {
        for (let i = 0; i < generoSelect.options.length; i++) {
            if (generoSelect.options[i].value === genreName) {
                generoSelect.remove(i);
                break;
            }
        }
    }
    
    // Atualizar lista
    renderGenresList();
    
    alert(`Gênero "${genreName}" deletado com sucesso!\n\nRecarregue as páginas para atualizar os menus.`);
    console.log(`🗑️ Gênero "${genreName}" deletado`);
};

// ==================== NAVEGAÇÃO ENTRE TABS ====================

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = e.currentTarget.dataset.tab;
        
        // Esconder todas as tabs
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Mostrar a tab selecionada
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        
        // Renderizar conteúdo
        if (tabName === 'books') {
            renderBooksList();
        } else if (tabName === 'reviews') {
            renderReviewsList();
        } else if (tabName === 'genres') {
            renderGenresList();
        }
    });
});

// ==================== CRIAÇÃO DE PÁGINAS DE GÊNEROS ====================

// Criar entrada de gênero (salva info para renderização dinâmica nos menus)
function createGenrePage(genero) {
    // Gêneros fixos que já têm páginas HTML (não precisam ser criados)
    const fixedGenres = ['RPG', 'LGBTQIAPN+', 'Fantasia', 'Romance', 'Clássicos', 'Programação'];
    
    // Se já é um gênero fixo, não faz nada
    if (fixedGenres.includes(genero)) {
        console.log(`ℹ️ Gênero "${genero}" é fixo, não precisa criar página`);
        return;
    }
    
    // Salvar informações do gênero customizado
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    
    // Gerar slug para URL (ex: "Ficção Científica" -> "ficcao-cientifica")
    const slug = genero
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-'); // Substitui espaços por hífens
    
    if (!genrePages[genero]) {
        genrePages[genero] = {
            name: genero,
            slug: slug,
            url: `genero.html?genero=${encodeURIComponent(genero)}`,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('genre-pages', JSON.stringify(genrePages));
        console.log(`✅ Página de gênero criada para "${genero}"`);
        console.log(`📍 URL: ${genrePages[genero].url}`);
        console.log(`💾 Salvo em localStorage['genre-pages']`);
    } else {
        console.log(`ℹ️ Gênero "${genero}" já existe em genre-pages`);
    }
}

// ==================== ADICIONAR NOVO GÊNERO ====================

// Botão para adicionar gênero
document.getElementById('btn-add-genre')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-genre');
    document.getElementById('form-genre').reset();
    modal.classList.add('active');
});

// Salvar novo gênero
document.getElementById('form-genre')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const genreName = document.getElementById('genre-name').value.trim();
    
    if (!genreName) {
        alert('Por favor, digite um nome para o gênero');
        return;
    }
    
    // Verificar se já existe
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    if (genrePages[genreName]) {
        alert('Este gênero já existe!');
        return;
    }
    
    // Verificar se é gênero fixo
    const fixedGenres = ['RPG', 'LGBTQIAPN+', 'Fantasia', 'Romance', 'Clássicos', 'Programação'];
    if (fixedGenres.includes(genreName)) {
        alert('Este é um gênero fixo. Escolha outro nome.');
        return;
    }
    
    // Criar página de gênero
    createGenrePage(genreName);
    
    // Adicionar à lista de gêneros customizados
    const customGenres = JSON.parse(localStorage.getItem('custom-genres') || '[]');
    if (!customGenres.includes(genreName)) {
        customGenres.push(genreName);
        localStorage.setItem('custom-genres', JSON.stringify(customGenres));
    }
    
    // Adicionar ao select de livros
    const generoSelect = document.getElementById('book-genero-select');
    if (generoSelect) {
        const newOpt = document.createElement('option');
        newOpt.value = genreName;
        newOpt.textContent = genreName;
        const beforeOpt = Array.from(generoSelect.options).find(o => o.value === 'novo');
        generoSelect.insertBefore(newOpt, beforeOpt || null);
    }
    
    // Fechar modal e atualizar lista
    document.getElementById('modal-genre').classList.remove('active');
    renderGenresList();
    
    alert(`Gênero "${genreName}" criado com sucesso!\n\nAgora você pode adicionar livros neste gênero.`);
    console.log(`✅ Novo gênero criado: "${genreName}"`);
});

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Limpar localStorage antigo (não é mais usado)
    localStorage.removeItem('books-data');
    localStorage.removeItem('books-imported');
    localStorage.removeItem('books-reset-2025-11-11');
    
    console.log('✅ Admin carregado');
    console.log('📚 Livros originais: vejamais.js');
    console.log('➕ Livros adicionados: localStorage[admin-books]');
    
    // Carregar gêneros customizados no select
    loadCustomGenres();
    
    // Renderizar lista inicial de livros
    await renderBooksList();
});

// Carregar gêneros customizados no select do formulário
function loadCustomGenres() {
    const customGenres = JSON.parse(localStorage.getItem('custom-genres') || '[]');
    const generoSelect = document.getElementById('book-genero-select');
    if (!generoSelect) return;
    
    customGenres.forEach(genre => {
        let exists = false;
        for (let option of generoSelect.options) {
            if (option.value === genre) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const newOption = document.createElement('option');
            newOption.value = genre;
            newOption.textContent = genre;
            const last = Array.from(generoSelect.options).find(o => o.value === 'novo');
            generoSelect.insertBefore(newOption, last || null);
        }
    });
}
