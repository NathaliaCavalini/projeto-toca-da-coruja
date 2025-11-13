import { auth } from './firebase-config.js';

const container = document.getElementById('ja-li-container');
const emptyMsg = document.getElementById('empty-msg');

function getUserKey(){
    try { if(auth.currentUser && auth.currentUser.uid) return `user-${auth.currentUser.uid}`; } catch(e){}
    return 'guest';
}
function storageKey(){ return `${getUserKey()}::jaLi`; }
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
        console.log(`🧹 Removidos ${removed} livro(s) deletado(s) da lista Já Lidos`);
    }
    
    return validItems;
}

function shortDesc(txt, max=70){
    const t = String(txt||'').trim();
    if(!t) return '';
    if(t.length <= max) return t;
    const slice = t.slice(0, max);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 40 ? slice.slice(0,lastSpace) : slice).trim() + '…';
}

function buildCard(b){
    const img = esc(b.img || 'imagens/sem-capa.png');
    const desc = esc(shortDesc(b.desc || ''));
    return `
<article class="book-item" data-id="${esc(b.id)}" data-title="${esc(b.title)}">
    <div class="book-card"><img src="${img}" alt="${esc(b.title)}"></div>
    <div class="book-title">
        <p>${esc(b.title)}<br><br>${desc}</p>
        <div class="botao-quero-ler">
            <button class="action-btn btn-remove" data-book-id="${esc(b.id)}">Remover</button>
        </div>
    </div>
    <div class="book-action"><a href="vejamais.html?id=${encodeURIComponent(b.id)}">Veja mais</a></div>
</article>`;
}

async function renderJaLidos(){
    if(!container) return;
    if(!auth.currentUser){
        container.innerHTML = `
            <div class="login-message">
                <h2>Faça login para ver seus livros lidos</h2>
                <p>Você precisa estar logado para acessar sua lista de livros já lidos.</p>
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
                <h2>✅ Nenhum livro marcado como lido</h2>
                <p>Clique em "Já Li" nas páginas dos livros para mover suas leituras para esta lista.</p>
                <a href="home.html" class="browse-books">Explorar Catálogo</a>
            </div>`;
        return;
    }
    if(emptyMsg) emptyMsg.style.display='none';
    container.innerHTML = items.map(buildCard).join('');
    setTimeout(()=>{ try{ window.__libraryActions.refreshAll(); }catch(e){} }, 60);
}

container?.addEventListener('click', ev => {
    const rem = ev.target.closest('.btn-remove');
    if(!rem) return;
    const id = rem.dataset.bookId;
    if(!id) return;
    let arr = loadList();
    arr = arr.filter(x => x.id !== id);
    localStorage.setItem(storageKey(), JSON.stringify(arr));
    renderJaLidos();
});

// Não há outros botões para observar aqui

document.addEventListener('DOMContentLoaded', renderJaLidos);
auth.onAuthStateChanged(()=> renderJaLidos());
window.__jaLiPage = { render: renderJaLidos };
