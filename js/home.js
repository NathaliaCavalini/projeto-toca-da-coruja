// home.js — busca de títulos (filtra os .book-item pelo título)

// util: normaliza texto (remove acentos e transforma minúsculas)
function normalizeText(str){
    if(!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    // BUSCA DE LIVROS
    const searchInput = document.querySelector('#search-input');
    const books = Array.from(document.querySelectorAll('.book-item'));

    if(searchInput){
        function doSearch(){
            const term = normalizeText(searchInput.value.trim());
            if(term === ''){
                books.forEach(b => b.classList.remove('hidden'));
                return;
            }

            books.forEach(book => {
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
    }

    // MODO ESCURO - ADICIONE ESTA PARTE DENTRO DO DOMContentLoaded
    const darkModeBtn = document.querySelector('.icon-btn[title="Modo escuro"]');
    const body = document.body;

    if(darkModeBtn) {
        // alterna modo escuro ao clicar
        darkModeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');

            // salvar preferência no localStorage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });

        // aplica o tema salvo ao carregar a página
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
        }
    }
});
