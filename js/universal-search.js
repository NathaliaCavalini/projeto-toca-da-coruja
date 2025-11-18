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
        // floating review card — some pages include a floating widget
        // toggle visibility for any floating card variant present
    const floatingEls = document.querySelectorAll('.floating-review-wrapper, .floating-review-card, .hero-section, .floating-info-wrapper, .floating-info-card');
        if(floatingEls && floatingEls.length){
            // Immediately hide/show the elements by toggling inline display (no transition)
            floatingEls.forEach(el => {
                if(term === '') {
                    // remove inline override so stylesheet rules apply again
                    el.style.display = '';
                } else {
                    // hide immediately
                    el.style.display = 'none';
                }
            });
        }

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
