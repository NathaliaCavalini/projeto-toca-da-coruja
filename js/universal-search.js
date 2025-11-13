// universal-search.js — Busca universal para todas as páginas com #search-input

// util: normaliza texto (remove acentos e transforma minúsculas)
function normalizeText(str){
    if(!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if(!searchInput) return; // se não há input de busca, sai

    function doSearch(){
        const term = normalizeText(searchInput.value.trim());
        const books = document.querySelectorAll('.book-item');
        
        if(term === ''){
            books.forEach(b => b.classList.remove('hidden'));
            return;
        }

        books.forEach(book => {
            // Prioriza data-title se existir, senão pega o texto do título
            const dataTitle = book.getAttribute('data-title') || '';
            const titleText = dataTitle || (book.querySelector('.book-title p')?.textContent || '');
            const normalizedTitle = normalizeText(titleText);

            const match = normalizedTitle.includes(term);
            if(match) book.classList.remove('hidden');
            else book.classList.add('hidden');
        });
    }

    searchInput.addEventListener('input', doSearch);
    searchInput.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            searchInput.value = '';
            doSearch();
        }
    });
});
