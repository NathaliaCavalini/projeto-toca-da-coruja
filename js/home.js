// home.js — busca de títulos (filtra os .book-item pelo título)

// util: normaliza texto (remove acentos e transforma minúsculas)
function normalizeText(str){
    if(!str) return "";
    // NFD + remoção de diacríticos
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    const books = Array.from(document.querySelectorAll('.book-item'));

    if(!searchInput) return;

    function doSearch(){
        const term = normalizeText(searchInput.value.trim());
        if(term === ''){
            // mostra todos
            books.forEach(b => b.classList.remove('hidden'));
            return;
        }

        books.forEach(book => {
            // prefere data-title (se existir), senão usa texto do p
            const dataTitle = book.getAttribute('data-title') || '';
            const titleText = dataTitle || (book.querySelector('.book-title p')?.textContent || '');
            const normalizedTitle = normalizeText(titleText);

            const match = normalizedTitle.includes(term);
            if(match) book.classList.remove('hidden');
            else book.classList.add('hidden');
        });
    }

    // evento de input (busca em tempo real)
    searchInput.addEventListener('input', doSearch);

    // opcional: permite Enter para focar apenas — já retornamos false no form
    searchInput.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            searchInput.value = '';
            doSearch();
        }
    });
});

// seleciona o botão do modo escuro
const darkModeBtn = document.querySelector('.icon-btn[title="Modo escuro"]');
const body = document.body;

// alterna modo escuro ao clicar
darkModeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // opcional: salvar preferência no localStorage
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


