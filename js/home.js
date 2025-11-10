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

    // Theme is handled centrally by /js/theme.js

    // ===== GÊNEROS: trocar ícone de livro quando selecionado =====
    try {
        const genreLinks = Array.from(document.querySelectorAll('.menu-list a'));
        const currentFile = window.location.pathname.split('/').filter(Boolean).pop() || '';

        genreLinks.forEach(link => {
            const img = link.querySelector('img');
            if (!img) return;

            // Se o href corresponder ao arquivo atual, mostra o livro aberto
            const href = link.getAttribute('href') || '';
            const hrefFile = href.split('/').filter(Boolean).pop() || '';
            if (hrefFile && currentFile && hrefFile === currentFile) {
                img.src = img.src.replace('livro_fechado', 'livro_aberto');
                link.classList.add('genre-selected');
            }

            // Animação ao clicar antes da navegação: troca icone e faz um pequeno "pop"
            link.addEventListener('click', (ev) => {
                // se é um link que navega pra outra página, animamos antes
                const targetImg = link.querySelector('img');
                if (targetImg) {
                    // troca visual para aberto
                    targetImg.src = targetImg.src.replace('livro_fechado', 'livro_aberto');
                    targetImg.classList.add('icon-animate');
                    // pausa curta para a animação, depois segue para o href normalmente
                    ev.preventDefault();
                    setTimeout(() => {
                        // navegar para o destino
                        window.location.href = link.href;
                    }, 140);
                }
            });
        });
    } catch (e) {
        console.warn('Erro ao inicializar ícones de gênero', e);
    }
});

// Theme visuals are initialized by /js/theme.js (imported in HTML)
