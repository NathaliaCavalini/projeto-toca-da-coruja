// js/library-actions.js
// Gerencia: "Quero Ler", "Já Li", "Favoritos" com persistência por usuário (localStorage).
// Importante: inclua este arquivo com <script type="module" src="..."></script> em todas as páginas relevantes.

// Tenta importar auth automaticamente se existir um arquivo firebase-config.js que exporte `auth`.
// Se não houver, continuamos sem autenticação (usamos 'guest').
let auth;
try {
    // ajuste o caminho se necessário (ex: './firebase-config.js' ou '../js/firebase-config.js')
    // o arquivo firebase-config.js deve exportar `auth` (Firebase Auth).
    // Ex.: export const auth = getAuth(app);
    // Se não usar Firebase, ignore — o código usa 'guest' como fallback.
    // eslint-disable-next-line
    import('./firebase-config.js').then(mod => { auth = mod.auth; }).catch(() => { auth = null; });
} catch (e) {
    auth = null;
}

/* ---------- Helpers de storage por usuário ---------- */
function getUserKey() {
    // se tiver auth e user logado, usa uid; senão fallback para 'guest'
    try {
        const user = auth && auth.currentUser ? auth.currentUser : null;
        if (user && user.uid) return `user-${user.uid}`;
    } catch (e) { /* ignore */ }
    return 'guest';
}

function getStorageKeyFor(listName) {
    return `${getUserKey()}::${listName}`;
}

function loadList(listName) {
    const raw = localStorage.getItem(getStorageKeyFor(listName));
    return raw ? JSON.parse(raw) : [];
}

function saveList(listName, arr) {
    localStorage.setItem(getStorageKeyFor(listName), JSON.stringify(arr));
}

function isInList(listName, bookId) {
    return loadList(listName).some(item => item.id === bookId);
}

function toggleInList(listName, bookObj) {
    const list = loadList(listName);
    const idx = list.findIndex(i => i.id === bookObj.id);
    if (idx > -1) {
        list.splice(idx, 1);
        saveList(listName, list);
        return false; // now removed
    } else {
        list.push(bookObj);
        saveList(listName, list);
        return true; // now added
    }
}

/* ---------- Utilitários DOM ---------- */
function normalizeTitleToId(title) {
    if (!title) return '';
    return title.toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
}

function buildBookObjectFromCard(cardEl) {
    const bookId = cardEl.dataset.id || cardEl.getAttribute('data-id') || normalizeTitleToId(cardEl.dataset.title || cardEl.querySelector('.book-title p')?.textContent);
    const title = cardEl.querySelector('.book-title p')?.textContent?.trim() || cardEl.dataset.title || 'Sem título';
    const img = cardEl.querySelector('img')?.getAttribute('src') || '';
    return { id: bookId, title, img, when: new Date().toISOString() };
}

function updateButtonStatesForCard(cardEl) {
    const bookId = cardEl.dataset.id || normalizeTitleToId(cardEl.dataset.title || cardEl.querySelector('.book-title p')?.textContent);
    const querBtn = cardEl.querySelector('.btn-quer-ler');
    const jaLiBtn = cardEl.querySelector('.btn-ja-li');
    const favBtn = cardEl.querySelector('.btn-favorito');

    if (!bookId) return;

    if (querBtn) querBtn.classList.toggle('active', isInList('querLer', bookId));
    if (jaLiBtn) jaLiBtn.classList.toggle('active', isInList('jaLi', bookId));
    if (favBtn) favBtn.classList.toggle('active', isInList('favoritos', bookId));
}

/* ---------- Inicialização e binding de eventos ---------- */
function initLibraryActions(root = document) {
    // 1) cards de listagem
    const bookCards = Array.from(root.querySelectorAll('.book-item'));
    bookCards.forEach(card => {
        // garante data-id (tenta inferir do título se faltar)
        if (!card.dataset.id) {
            const inferred = normalizeTitleToId(card.dataset.title || card.querySelector('.book-title p')?.textContent || '');
            if (inferred) card.dataset.id = inferred;
        }

        // atualiza estado visual
        updateButtonStatesForCard(card);

        // liga listeners nos botões dentro do card
        card.querySelectorAll('.btn-quer-ler, .btn-ja-li, .btn-favorito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const book = buildBookObjectFromCard(card);
                if (btn.classList.contains('btn-quer-ler')) {
                    const added = toggleInList('querLer', book);
                    btn.classList.toggle('active', added);
                } else if (btn.classList.contains('btn-ja-li')) {
                    const added = toggleInList('jaLi', book);
                    btn.classList.toggle('active', added);
                } else if (btn.classList.contains('btn-favorito')) {
                    const added = toggleInList('favoritos', book);
                    btn.classList.toggle('active', added);
                }
            });
        });
    });

    // 2) visão de detalhe (vejamais.html) - detecta botões por id ou por classe
    const detailButtons = root.querySelectorAll('#btn-quer-ler, #btn-ja-li, #btn-favorito, .btn-quer-ler, .btn-ja-li, .btn-favorito');
    if (detailButtons.length) {
        // tenta inferir id do livro por query param `id` ou pelo título da página
        const params = new URLSearchParams(window.location.search);
        const idFromUrl = params.get('id');
        const inferredId = idFromUrl || normalizeTitleToId(document.querySelector('.book-info h1')?.textContent || document.querySelector('h1')?.textContent || '');
        const bookObj = {
            id: inferredId,
            title: document.querySelector('.book-info h1')?.textContent?.trim() || document.title || 'Sem título',
            img: document.querySelector('.book-image img')?.src || ''
        };

        detailButtons.forEach(btn => {
            // estado inicial
            if (btn.classList.contains('btn-quer-ler') || btn.id === 'btn-quer-ler') btn.classList.toggle('active', isInList('querLer', bookObj.id));
            if (btn.classList.contains('btn-ja-li') || btn.id === 'btn-ja-li') btn.classList.toggle('active', isInList('jaLi', bookObj.id));
            if (btn.classList.contains('btn-favorito') || btn.id === 'btn-favorito') btn.classList.toggle('active', isInList('favoritos', bookObj.id));

            // clique
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (btn.classList.contains('btn-quer-ler') || btn.id === 'btn-quer-ler') {
                    const added = toggleInList('querLer', bookObj);
                    btn.classList.toggle('active', added);
                } else if (btn.classList.contains('btn-ja-li') || btn.id === 'btn-ja-li') {
                    const added = toggleInList('jaLi', bookObj);
                    btn.classList.toggle('active', added);
                } else if (btn.classList.contains('btn-favorito') || btn.id === 'btn-favorito') {
                    const added = toggleInList('favoritos', bookObj);
                    btn.classList.toggle('active', added);
                }
            });
        });
    }
}

/* ---------- API pública (importável) ---------- */
export function readLibraryList(listName) {
    // listName: 'querLer' | 'jaLi' | 'favoritos'
    return loadList(listName);
}

/* ---------- Auto-init quando DOM pronto ---------- */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLibraryActions());
} else {
    initLibraryActions();
}
