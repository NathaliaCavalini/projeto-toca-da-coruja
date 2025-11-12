import { auth } from './firebase-config.js';

// Container específico da lista
const container = document.getElementById('quer-ler-container');
const emptyMsg = document.getElementById('empty-msg');

// Funções utilitárias para padronizar chave igual ao library-actions-delegated.js
function getUserKey(){
    try { if(auth.currentUser && auth.currentUser.uid) return `user-${auth.currentUser.uid}`; } catch(e){}
    return 'guest';
}
function storageKey(){ return `${getUserKey()}::querLer`; }
function loadList(){
    try { return JSON.parse(localStorage.getItem(storageKey())) || []; } catch(e){ return []; }
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Carregar todos os livros disponíveis (vejamais.js + admin-books)
async function getAllBooks() {
    try {
        const { livros } = await import('./vejamais.js');
        const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
        return { ...livros, ...adminBooks };
    } catch (e) {
        console.warn('Erro ao carregar livros:', e);
        return JSON.parse(localStorage.getItem('admin-books') || '{}');
    }
}

// Validar e limpar lista removendo livros deletados
async function validateAndCleanList() {
    const items = loadList();
    const allBooks = await getAllBooks();
    const validItems = items.filter(item => allBooks[item.id]);
    
    // Se encontrou itens inválidos, limpar do localStorage
    if (validItems.length !== items.length) {
        const removed = items.length - validItems.length;
        localStorage.setItem(storageKey(), JSON.stringify(validItems));
        console.log(`🧹 Removidos ${removed} livro(s) deletado(s) da lista Quero Ler`);
    }
    
    return validItems;
}

function buildCard(b){
    const img = esc(b.img || 'imagens/sem-capa.png');
    return `
<article class="book-item" data-id="${esc(b.id)}" data-title="${esc(b.title)}">
    <div class="book-card"><img src="${img}" alt="${esc(b.title)}"></div>
    <div class="book-title">
        <p>${esc(b.title)}</p>
        <div class="book-actions">
            <button class="action-btn btn-remove" data-book-id="${esc(b.id)}">Remover</button>
        </div>
    </div>
    <div class="book-action"><a class="action-link" href="vejamais.html?id=${encodeURIComponent(b.id)}">Veja mais</a></div>
</article>`;
}

async function renderQuerLer(){
    if(!container) return;
    // estado de login
    if(!auth.currentUser){
        container.innerHTML = `
            <div class="login-message">
                <h2>Faça login para ver sua lista de leitura</h2>
                <p>Você precisa estar logado para acessar sua lista de livros que quer ler.</p>
                <a href="login.html" class="login-button">Fazer Login</a>
            </div>`;
        if(emptyMsg) emptyMsg.style.display='none';
        return;
    }
    
    // Validar e limpar lista antes de renderizar
    const items = await validateAndCleanList();
    
    if(!items.length){
        emptyMsg.style.display='none';
        container.innerHTML = `
            <div class="empty-reviews" style="grid-column:1/-1; text-align:center;">
                <h2>📖 Nenhum livro na lista "Quero Ler"</h2>
                <p>Adicione livros clicando em "Quero Ler" nas páginas ou no catálogo principal.</p>
                <a href="home.html" class="browse-books">Explorar Catálogo</a>
            </div>`;
        return;
    }
    if(emptyMsg) emptyMsg.style.display='none';
    container.innerHTML = items.map(buildCard).join('');
    // Atualiza estado dos botões depois da renderização
    setTimeout(()=>{ try{ window.__libraryActions.refreshAll(); }catch(e){} }, 60);
}

// Remoção de item
container?.addEventListener('click', ev => {
    const rem = ev.target.closest('.btn-remove');
    if(!rem) return;
    const id = rem.dataset.bookId;
    if(!id) return;
    let arr = loadList();
    arr = arr.filter(x => x.id !== id);
    localStorage.setItem(storageKey(), JSON.stringify(arr));
    renderQuerLer();
});

// Re-render após cliques de ação dentro da lista
// Não precisamos mais monitorar cliques nos outros botões (removidos)

document.addEventListener('DOMContentLoaded', renderQuerLer);
auth.onAuthStateChanged(()=> renderQuerLer());
window.__querLerPage = { render: renderQuerLer };
