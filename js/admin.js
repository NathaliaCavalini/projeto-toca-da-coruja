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

// Carregar livros do localStorage
function loadBooks() {
    const stored = localStorage.getItem('books-data');
    if (stored) {
        return JSON.parse(stored);
    }
    // Se não houver dados, inicializar com dados vazios
    return {};
}

// Salvar livros no localStorage
function saveBooks(books) {
    localStorage.setItem('books-data', JSON.stringify(books));
}

// Renderizar lista de livros
function renderBooksList() {
    const books = loadBooks();
    const container = document.getElementById('books-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const bookIds = Object.keys(books);
    
    if (bookIds.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text); padding:40px;">Nenhum livro cadastrado ainda.</p>';
        return;
    }
    
    bookIds.forEach(id => {
        const book = books[id];
        const card = document.createElement('div');
        card.className = 'book-admin-card';
        card.innerHTML = `
            <img src="${book.imagem}" alt="${book.titulo}" onerror="this.onerror=null;this.src='imagens/placeholder.png'">
            <div class="book-admin-info">
                <div>
                    <h3>${book.titulo}</h3>
                    <p><strong>Autor:</strong> ${book.autor}</p>
                    <p><strong>Gênero:</strong> ${book.genero}</p>
                    <p><strong>Ano:</strong> ${book.ano} | <strong>Páginas:</strong> ${book.paginas}</p>
                </div>
                <div class="book-admin-actions">
                    <button class="btn-edit" onclick="window.editBook('${id}')">Editar</button>
                    <button class="btn-danger" onclick="window.deleteBook('${id}')">Deletar</button>
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
    modalTitle.textContent = 'Adicionar Livro';
    form.reset();
    document.getElementById('book-id').disabled = false;
    modal.classList.add('active');
});

// Fechar modal
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

// Editar livro
window.editBook = function(id) {
    const books = loadBooks();
    const book = books[id];
    
    if (!book) return;
    
    editingBookId = id;
    modalTitle.textContent = 'Editar Livro';
    
    document.getElementById('book-id').value = id;
    document.getElementById('book-id').disabled = true; // Não permitir alterar o ID
    document.getElementById('book-titulo').value = book.titulo;
    document.getElementById('book-autor').value = book.autor;
    
    // Configurar gênero
    const generoSelect = document.getElementById('book-genero-select');
    const generoHidden = document.getElementById('book-genero');
    
    // Selecionar o gênero no dropdown (deve ser um dos 6 fixos)
    generoSelect.value = book.genero;
    generoHidden.value = book.genero;
    
    document.getElementById('book-paginas').value = book.paginas;
    document.getElementById('book-ano').value = book.ano;
    document.getElementById('book-sinopse').value = book.sinopse;
    document.getElementById('book-imagem-url').value = book.imagem;
    
    // Preview da imagem
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `<img src="${book.imagem}" alt="Preview">`;
    
    modal.classList.add('active');
};

// Deletar livro
window.deleteBook = function(id) {
    if (!confirm('Tem certeza que deseja deletar este livro? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    const books = loadBooks();
    delete books[id];
    saveBooks(books);
    renderBooksList();
    alert('Livro deletado com sucesso!');
};

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

// Salvar livro (adicionar ou editar)
form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('book-id').value.trim();
    const titulo = document.getElementById('book-titulo').value.trim();
    const autor = document.getElementById('book-autor').value.trim();
    const genero = document.getElementById('book-genero').value.trim();
    const paginas = parseInt(document.getElementById('book-paginas').value);
    const ano = parseInt(document.getElementById('book-ano').value);
    const sinopse = document.getElementById('book-sinopse').value.trim();
    
    if (!genero) {
        alert('Por favor, selecione ou digite um gênero');
        return;
    }
    
    // Pegar imagem (URL ou arquivo)
    const imageType = document.querySelector('input[name="image-type"]:checked').value;
    let imagem = '';
    
    if (imageType === 'url') {
        imagem = document.getElementById('book-imagem-url').value.trim();
    } else {
        // Para arquivo, usamos o data URL já carregado no preview
        const previewImg = document.querySelector('#image-preview img');
        if (previewImg) {
            imagem = previewImg.src;
        }
    }
    
    if (!imagem) {
        alert('Por favor, forneça uma imagem (URL ou arquivo)');
        return;
    }
    
    const books = loadBooks();
    
    // Verificar se o ID já existe (apenas ao adicionar novo)
    if (!editingBookId && books[id]) {
        alert('Já existe um livro com este ID. Por favor, escolha outro.');
        return;
    }
    
    // Criar objeto do livro
    const book = {
        titulo,
        autor,
        imagem,
        genero,
        paginas,
        ano,
        sinopse
    };
    
    // Salvar
    books[id] = book;
    saveBooks(books);
    
    console.log(`📚 Livro "${titulo}" salvo com gênero "${genero}"`);
    // Se gênero não for fixo, registrar como customizado e criar página
    const fixedGenres=['RPG','LGBTQIAPN+','Fantasia','Romance','Clássicos','Programação'];
    if (!fixedGenres.includes(genero)) {
        const generoSelect=document.getElementById('book-genero-select');
        let exists=false;
        for (let opt of generoSelect.options) { if (opt.value===genero) { exists=true; break; } }
        if(!exists){
            const newOpt=document.createElement('option');
            newOpt.value=genero; newOpt.textContent=genero;
            const beforeOpt=Array.from(generoSelect.options).find(o=>o.value==='novo');
            generoSelect.insertBefore(newOpt,beforeOpt||null);
        }
        const customGenres=JSON.parse(localStorage.getItem('custom-genres')||'[]');
        if(!customGenres.includes(genero)){
            customGenres.push(genero);
            localStorage.setItem('custom-genres', JSON.stringify(customGenres));
            createGenrePage(genero);
        }
    }
    
    // Fechar modal e atualizar lista
    modal.classList.remove('active');
    renderBooksList();
    
    alert(editingBookId ? 'Livro atualizado com sucesso!' : 'Livro adicionado com sucesso!');
    
    // Resetar form
    form.reset();
    document.getElementById('book-genero-novo').classList.add('hidden');
    document.getElementById('book-genero-select').disabled=false;
    const btn=document.getElementById('new-genre-btn'); if(btn) btn.textContent='+ Novo Gênero';
});

// ==================== GERENCIAMENTO DE REVIEWS ====================

// Carregar todas as reviews do localStorage
function loadAllReviews() {
    // Admin lê todas as reviews salvas no array unificado
    return JSON.parse(localStorage.getItem('all_reviews') || '[]');
}

// Renderizar lista de reviews
function renderReviewsList() {
    const reviews = loadAllReviews();
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
        
        card.innerHTML = `
            <div class="review-admin-info">
                <h4>Livro ID: ${review.bookId}</h4>
                <div class="review-admin-meta">
                    <span class="review-rating">${'★'.repeat(Math.floor(review.rating))}${review.rating % 1 ? '½' : ''}</span>
                    <span>Usuário: ${review.userId}</span>
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
function renderGenresList() {
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    const books = loadBooks();
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

// ==================== IMPORTAR LIVROS EXISTENTES ====================

// Importar todos os livros do vejamais.js para o localStorage
async function importExistingBooks(showAlert = false) {
    // Verificar se já foi importado (apenas para importação automática)
    const imported = localStorage.getItem('books-imported');
    if (imported === 'true' && !showAlert) {
        console.log('ℹ️ Livros já foram importados anteriormente');
        return false;
    }
    
    try {
        console.log('🔄 Iniciando importação de livros...');
        
        // Importar apenas o objeto livros do vejamais.js
        const { livros } = await import('./vejamais.js');
        
        // Carregar livros existentes do localStorage
        const existingBooks = loadBooks();
        
        // NÃO mesclar - usar APENAS os livros do vejamais.js como estão
        // Isso evita duplicação e mantém os dados originais intactos
        const finalBooks = { ...livros };
        
        // Salvar no localStorage (substitui completamente)
        saveBooks(finalBooks);
        
        // Limpar gêneros customizados
        localStorage.setItem('custom-genres', JSON.stringify([]));
        localStorage.setItem('genre-pages', JSON.stringify({}));
        localStorage.setItem('books-imported', 'true');
        
        console.log(`✅ ${Object.keys(finalBooks).length} livros importados exatamente como estão no vejamais.js`);        if (showAlert) {
            alert(`Importação concluída!\n\n${Object.keys(finalBooks).length} livros importados do vejamais.js\nDados mantidos exatamente como no original.\n\nA página será recarregada.`);
            location.reload();
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao importar livros:', error);
        if (showAlert) {
            alert('Erro ao importar livros. Verifique o console para mais detalhes.');
        }
        return false;
    }
}

// ==================== INICIALIZAÇÃO ====================

// Carregar gêneros customizados salvos no select
function loadCustomGenres() {
    const customGenres = JSON.parse(localStorage.getItem('custom-genres') || '[]');
    const generoSelect = document.getElementById('book-genero-select');
    if (!generoSelect) return;
    customGenres.forEach(genre => {
        let exists=false;
        for (let option of generoSelect.options) { if (option.value===genre) { exists=true; break; } }
        if(!exists){
            const newOption=document.createElement('option');
            newOption.value=genre; newOption.textContent=genre;
            // Inserir antes da opção "novo"
            const last = Array.from(generoSelect.options).find(o=>o.value==='novo');
            generoSelect.insertBefore(newOption, last||null);
        }
    });
}

// Botão de reimportação manual
document.getElementById('btn-reimport-books')?.addEventListener('click', async () => {
    if (!confirm('Deseja reimportar todos os livros do site?\n\nIsso irá:\n✅ Substituir todos os livros pelos do vejamais.js\n✅ Manter dados exatamente como no original\n\n⚠️ ATENÇÃO: Livros adicionados manualmente SERÃO PERDIDOS!')) {
        return;
    }
    
    try {
        // Forçar reimportação com alerta
        localStorage.removeItem('books-imported');
        await importExistingBooks(true); // showAlert = true para reimportação manual
    } catch (error) {
        console.error('❌ Erro ao reimportar:', error);
        alert('Erro ao reimportar livros. Verifique o console.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Forçar uma reimportação única para alinhar com o catálogo original do vejamais.js
    const resetStampKey = 'books-reset-2025-11-11';
    if (!localStorage.getItem(resetStampKey)) {
        localStorage.setItem(resetStampKey, 'true');
        localStorage.removeItem('books-imported'); // garante substituição completa
    }

    // Importar livros existentes (substitui por vejamais.js quando necessário)
    const imported = await importExistingBooks(false);
    
    // Se houve importação, recarregar a página
    if (imported) {
        console.log('🔄 Primeira importação concluída, recarregando...');
        location.reload();
        return;
    }
    
    // Carregar gêneros customizados
    loadCustomGenres();
    
    // Renderizar lista inicial de livros
    renderBooksList();

    // Após renderização inicial, purgar livros não canônicos que possam ter sido adicionados manualmente
    // sem querer (ex: 'A Arte de Jogar', 'Iliada', 'Jogador Número 1') mantendo apenas os do vejamais.js.
    try {
        await purgeNonCanonicalBooks();
        // Re-renderizar caso algo tenha sido removido
        renderBooksList();
    } catch(err) {
        console.warn('⚠️ Falha ao purgar livros não canônicos:', err);
    }
});

// ==================== PURGA DE LIVROS NÃO CANÔNICOS ====================
// Remove livros que não existem no objeto livros original do vejamais.js
async function purgeNonCanonicalBooks() {
    const { livros } = await import('./vejamais.js');
    const canonicalIds = new Set(Object.keys(livros));
    const existing = loadBooks();
    let removed = [];
    Object.keys(existing).forEach(id => {
        if (!canonicalIds.has(id)) {
            removed.push(id);
            delete existing[id];
        }
    });
    if (removed.length) {
        saveBooks(existing);
        console.log(`🧹 Purga concluída. Removidos ${removed.length} livro(s) não canônico(s):`, removed);
    } else {
        console.log('✅ Nenhum livro não canônico para remover.');
    }
}
