// js/library-actions-delegated.js
// Versão robusta — extrai título e imagem de várias fontes, normaliza id,
// salva img como URL absoluta sempre que possível, aceita vários formatos de botão,
// e redireciona corretamente para as páginas de lista.

// Auth será acessado via window se disponível (evita conflitos de declaração)
function getAuth() {
  try {
    // Tenta pegar auth do window.__fb (definido por firebase-config.js)
    if (window.__fb && window.__fb.auth) return window.__fb.auth;
    // Fallback para window.auth direto
    if (window.auth) return window.auth;
    // Último fallback: firebase global
    if (typeof firebase !== 'undefined' && firebase.auth) return firebase.auth();
  } catch(e) {}
  return null;
}

function getUserKey(){
  try { 
    const auth = getAuth();
    if(auth && auth.currentUser && auth.currentUser.uid) return `user-${auth.currentUser.uid}`; 
  } catch(e){}
  return 'guest';
}
function sKey(listName){ return `${getUserKey()}::${listName}`; }
function load(listName){ const raw = localStorage.getItem(sKey(listName)); return raw ? JSON.parse(raw) : []; }
function save(listName, arr){ localStorage.setItem(sKey(listName), JSON.stringify(arr)); }
function inList(listName, id){ return load(listName).some(i => i.id === id); }

function normalizeToId(v){
  return String(v||'').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'').replace(/\-+/g,'-').replace(/^\-+|\-+$/g,'');
}
function absoluteUrl(url){
  if(!url) return '';
  try { return new URL(url, window.location.origin).href; } catch(e){ return url; }
}

// heurísticas para extrair título e imagem
function findClosestBookCard(el){
  return el.closest('.book-item') || el.closest('[data-id]') || el.closest('.book-detail') || el.closest('.book-detail-card') || null;
}
function findTitleFromCard(card){
  if(!card) return '';
  if(card.dataset && card.dataset.title) return card.dataset.title.trim();
  const p = card.querySelector && card.querySelector('.book-title p');
  if(p && p.textContent.trim()) return p.textContent.trim();
  const h1 = card.querySelector && card.querySelector('.book-info h1');
  if(h1 && h1.textContent.trim()) return h1.textContent.trim();
  const pageH1 = document.querySelector('.book-info h1') || document.querySelector('h1');
  if(pageH1 && pageH1.textContent.trim()) return pageH1.textContent.trim();
  const og = document.querySelector('meta[property="og:title"]');
  if(og && og.content) return og.content.trim();
  return (document.title || '').trim() || '';
}
function findImageFromCard(card){
  try {
    if(card){
      const candidate = card.querySelector && (card.querySelector('img[data-src], img[src], img'));
      if(candidate){
        const s = candidate.getAttribute('src') || candidate.getAttribute('data-src') || candidate.src;
        if(s) return absoluteUrl(s);
      }
      const fig = card.querySelector && card.querySelector('figure img');
      if(fig){
        const s = fig.getAttribute('src') || fig.src;
        if(s) return absoluteUrl(s);
      }
    }
    const detailImg = document.querySelector('.book-info img, .book-detail img, #book-detail img');
    if(detailImg){
      const s = detailImg.getAttribute('src') || detailImg.src;
      if(s) return absoluteUrl(s);
    }
    const og = document.querySelector('meta[property="og:image"]');
    if(og && og.content) return absoluteUrl(og.content);
    const imgs = Array.from(document.images || []);
    if(imgs.length){
      let best = imgs[0];
      imgs.forEach(i => {
        try {
          const area = (i.naturalWidth||0)*(i.naturalHeight||0);
          const bestArea = (best.naturalWidth||0)*(best.naturalHeight||0);
          if(area > bestArea) best = i;
        } catch(e){}
      });
      const s = best.getAttribute('src') || best.src;
      if(s) return absoluteUrl(s);
    }
  } catch(e){}
  return '';
}

function buildBookFromEl(el){
  const card = findClosestBookCard(el);
  const rawTitle = findTitleFromCard(card) || 'Sem título';
  let id = (card && (card.dataset && card.dataset.id)) || (card && card.getAttribute && card.getAttribute('data-id')) || '';
  if(!id) id = normalizeToId(rawTitle);
  const img = findImageFromCard(card) || '';
  return { id: normalizeToId(id), title: rawTitle.trim(), img: img, when: new Date().toISOString() };
}

function toggle(listName, book){
  book.id = normalizeToId(book.id || book.title);
  const arr = load(listName);
  const idx = arr.findIndex(i => i.id === book.id);
  if(idx > -1){ arr.splice(idx,1); save(listName, arr); return false; }
  const toSave = { id: book.id, title: book.title, img: book.img || '', when: book.when || new Date().toISOString() };
  arr.push(toSave);
  save(listName, arr);
  return true;
}

function refreshButtonState(card){
  if(!card) return;
  const id = normalizeToId(card.dataset?.id || card.dataset?.title || card.querySelector?.('.book-title p')?.textContent || '');
  if(!id) return;
  const q = card.querySelector('.btn-quer-ler, #btn-quer-ler, .action-btn.btn-quer-ler') || card.querySelector('[id^="btn-quer-ler-"]');
  const j = card.querySelector('.btn-ja-li, #btn-ja-li, .action-btn.btn-ja-li') || card.querySelector('[id^="btn-ja-li-"]');
  const f = card.querySelector('.btn-favorito, #btn-favorito, .action-btn.btn-favorito') || card.querySelector('[id^="btn-favorito-"], [id^="btn-favoritos-"]');
  if(q) q.classList.toggle('active', inList('querLer', id));
  if(j) j.classList.toggle('active', inList('jaLi', id));
  if(f) f.classList.toggle('active', inList('favoritos', id));
}

function refreshAllButtons(){ document.querySelectorAll('.book-item, .book-detail').forEach(c => refreshButtonState(c)); }
window.__libraryActions = window.__libraryActions || {};
window.__libraryActions.refreshAll = refreshAllButtons;

function goToListPage(action){
  const map = { querLer: 'quer_ler.html', jaLi: 'ja_lidos.html', favoritos: 'favoritos.html' };
  const filename = map[action];
  if(!filename) return;
  try {
    const url = new URL(filename, window.location.origin + '/');
    setTimeout(()=> { window.location.href = url.href; }, 140);
  } catch(e){
    setTimeout(()=> { window.location.href = filename.replace(/^\/+/, ''); }, 140);
  }
}

const delegateSelector = [
  '.btn-quer-ler',
  '#btn-quer-ler',
  '.btn-ja-li',
  '#btn-ja-li',
  '.btn-favorito',
  '#btn-favorito',
  '.action-btn.btn-quer-ler',
  '.action-btn.btn-ja-li',
  '.action-btn.btn-favorito'
].join(',');

// Previne múltiplos event listeners
if (!window.__libraryActionsListenerAdded) {
  window.__libraryActionsListenerAdded = true;
  
document.addEventListener('click', (e) => {
  // Ignore clicks that happen inside the site footer (social / contact links)
  const inFooter = e.target && e.target.closest && e.target.closest('.footer');
  if (inFooter) {
    return;
  }

  let btn = e.target.closest && e.target.closest(delegateSelector);

  if(!btn){
    let p = e.target;
    while(p && p !== document){
      if(p.id && (p.id.startsWith('btn-quer-ler-') || p.id.startsWith('btn-querler-') || p.id.startsWith('btn-ja-li-') || p.id.startsWith('btn-jali-') || p.id.startsWith('btn-favorito-') || p.id.startsWith('btn-fav-'))){
        btn = p; break;
      }
      p = p.parentElement;
    }
  }
  
  if(!btn) return;

  e.preventDefault();

  const idLower = (btn.id || '').toLowerCase();
  let action = null;
  if(btn.classList.contains('btn-quer-ler') || btn.id === 'btn-quer-ler' || idLower.startsWith('btn-quer-ler-') || idLower.startsWith('btn-querler-') || (btn.classList.contains('action-btn') && btn.classList.contains('btn-quer-ler'))){
    action = 'querLer';
  } else if(btn.classList.contains('btn-ja-li') || btn.id === 'btn-ja-li' || idLower.startsWith('btn-ja-li-') || idLower.startsWith('btn-jali-') || (btn.classList.contains('action-btn') && btn.classList.contains('btn-ja-li'))){
    action = 'jaLi';
  } else {
    action = 'favoritos';
  }

  const book = buildBookFromEl(btn);
  console.log('📚 Livro extraído:', { id: book.id, title: book.title, img: book.img?.substring(0, 50) + '...' });
  
  const added = toggle(action, book);
  
  // Debug: verificar o que foi salvo
  const storageKey = sKey(action);
  const savedData = load(action);
  console.log('💾 Chave de storage:', storageKey);
  console.log('💾 Dados salvos agora:', savedData);
  
  const card = findClosestBookCard(btn);
  refreshButtonState(card);

  console.log(`[Library] ${added ? 'ADICIONADO' : 'REMOVIDO'} "${book.title}" -> ${action}`);

  // Mostra notificação toast com nome do livro
  const actionNames = { querLer: 'Quero Ler', jaLi: 'Já Li', favoritos: 'Favoritos' };
  const actionName = actionNames[action] || action;
  if (typeof window.showToast === 'function') {
    const message = added 
      ? `"${book.title}" adicionado a ${actionName}` 
      : `"${book.title}" removido de ${actionName}`;
    window.showToast(message, 'success', 2500);
  }

  const isInsideListPage = !!btn.closest('#quer-ler-container, #ja-li-container, #favoritos-container');
  if(isInsideListPage){
    setTimeout(()=> { try{ window.__libraryActions.refreshAll(); }catch(e){} }, 120);
    return;
  }

  goToListPage(action);
});

} // Fim do if que previne múltiplos listeners

document.addEventListener('DOMContentLoaded', () => { refreshAllButtons(); });
