// js/library-actions-delegated.js
// Versão compatível com botões que usam classes OU ids que começam com "btn-quer-ler*", "btn-ja-li*", "btn-favorito*"
// Persistência: localStorage por usuário (usa Firebase se disponível).

// ----- Configuração / fallback para Firebase -----
let auth = null;
try {
    import('./firebase-config.js').then(mod => { auth = mod.auth; }).catch(() => { auth = null; });
} catch (e) {
    auth = null;
}

// ----- Storage helpers -----
function getUserKey() {
    try { if (auth && auth.currentUser && auth.currentUser.uid) return `user-${auth.currentUser.uid}`; } catch (e) { }
    return 'guest';
}
function sKey(listName) { return `${getUserKey()}::${listName}`; }
function load(listName) { const r = localStorage.getItem(sKey(listName)); return r ? JSON.parse(r) : []; }
function save(listName, arr) { localStorage.setItem(sKey(listName), JSON.stringify(arr)); }
function inList(listName, id) { if (!id) return false; return load(listName).some(i => i.id === id); }
function toggle(listName, book) {
    const arr = load(listName);
    const idx = arr.findIndex(i => i.id === book.id);
    if (idx > -1) { arr.splice(idx, 1); save(listName, arr); return false; }
    arr.push(book); save(listName, arr); return true;
}

// ----- utils -----
function normalizeToId(v) { return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''); }
function findClosestBookCard(el) { return el.closest('.book-item') || el.closest('[data-id]') || document.querySelector('.book-detail') || null; }
function buildBookFromEl(el) {
    const card = findClosestBookCard(el);
    const id = card?.dataset?.id || card?.getAttribute('data-id') || normalizeToId(card?.dataset?.title || card?.querySelector?.('.book-title p')?.textContent || document.querySelector('.book-info h1')?.textContent || document.title);
    const title = card?.dataset?.title || card?.querySelector?.('.book-title p')?.textContent?.trim?.() || document.querySelector('.book-info h1')?.textContent || document.title || 'Sem título';
    const img = card?.querySelector?.('img')?.src || '';
    return { id, title, img, when: new Date().toISOString() };
}

// ----- selectors compatíveis -----
// CSS selector que encontra botões por classe OU por id prefixado
const BUTTON_SELECTOR = [
    '.btn-quer-ler', '[id^="btn-quer-ler"]',
    '.btn-ja-li', '[id^="btn-ja-li"]',
    '.btn-favorito', '[id^="btn-favorito"]'
].join(', ');

// helper para detectar tipo de ação a partir do elemento encontrado
function detectActionFromElement(el) {
    if (!el) return null;
    if (el.matches('.btn-quer-ler') || (el.id && el.id.startsWith('btn-quer-ler'))) return 'querLer';
    if (el.matches('.btn-ja-li') || (el.id && el.id.startsWith('btn-ja-li'))) return 'jaLi';
    if (el.matches('.btn-favorito') || (el.id && el.id.startsWith('btn-favorito'))) return 'favoritos';
    return null;
}

// ----- atualização visual dos botões de um card -----
function refreshButtonState(card) {
    if (!card) return;
    // determina id do livro
    const id = card.dataset?.id || normalizeToId(card.dataset?.title || card.querySelector?.('.book-title p')?.textContent || '');
    if (!id) return;
    // encontra os botões (por classe ou id prefix)
    const q = card.querySelector('.btn-quer-ler, [id^="btn-quer-ler"]');
    const j = card.querySelector('.btn-ja-li, [id^="btn-ja-li"]');
    const f = card.querySelector('.btn-favorito, [id^="btn-favorito"]');
    if (q) q.classList.toggle('active', inList('querLer', id));
    if (j) j.classList.toggle('active', inList('jaLi', id));
    if (f) f.classList.toggle('active', inList('favoritos', id));
}

// ----- redirecionamento (mantém compatibilidade com estrutura /html/) -----
function goToListPage(action) {
    const map = { querLer: 'quer_ler.html', jaLi: 'ja_lidos.html', favoritos: 'favoritos.html' };
    let target = map[action];
    if (!target) return;
    // Se a página atual está dentro de /html/ (ex: /html/vejamais.html), navegar relativo, senão usar /html/ prefixado
    const inHtmlDir = window.location.pathname.includes('/html/');
    if (inHtmlDir) target = `./${target}`;
    else target = `/html/${target}`;
    setTimeout(() => { window.location.href = target; }, 200);
}

// ----- delegação de clique (captura botões mesmo que tenham id específico) -----
document.addEventListener('click', (ev) => {
    const clicked = ev.target;
    // busca o botão mais próximo que corresponda ao selector compatível
    const btn = clicked.closest && clicked.closest(BUTTON_SELECTOR);
    if (!btn) return;
    ev.preventDefault();

    const action = detectActionFromElement(btn);
    if (!action) return;

    // constroi book object e alterna na lista
    const book = buildBookFromEl(btn);
    if (!book?.id) { console.warn('[Library] não foi possível inferir id do livro para o botão:', btn); return; }
    const added = toggle(action, book);

    // atualiza estado visual do card (todos os botões no card)
    const card = findClosestBookCard(btn);
    refreshButtonState(card);

    console.log(`[Library] ${added ? 'Adicionado' : 'Removido'} "${book.title}" em ${action}`);

    // redireciona para página correspondente
    goToListPage(action);
});

// ----- init visual para botões já existentes -----
function initVisual() {
    document.querySelectorAll('.book-item, [data-id], .book-detail').forEach(c => refreshButtonState(c));
}
// inicializa quando DOM pronto
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVisual);
else initVisual();

// ---- interface de debug (opcional) ----
window.__libraryActions = {
    status: () => {
        console.log('userKey:', getUserKey());
        console.log('querLer:', load('querLer'));
        console.log('jaLi:', load('jaLi'));
        console.log('favoritos:', load('favoritos'));
        console.log('botões correspondentes na página (BUTTON_SELECTOR):', document.querySelectorAll(BUTTON_SELECTOR).length);
    },
    refreshAll: () => initVisual()
};
