// dynamic-genres-menu.js - Atualiza menus laterais com gêneros customizados

// Gêneros fixos com suas páginas (ordem fixa, sempre visíveis)
const FIXED_GENRES = [
    { name: 'RPG', url: 'rpg.html', order: 1 },
    { name: 'LGBTQIAPN+', url: 'gay.html', order: 2 },
    { name: 'Fantasia', url: 'fantasia.html', order: 3 },
    { name: 'Romance', url: 'romance.html', order: 4 },
    { name: 'Clássicos', url: 'classico.html', order: 5 },
    { name: 'Programação', url: 'programacao.html', order: 6 }
];

// Obter página atual
function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'home.html';
}

// Obter todos os gêneros (fixos + customizados)
function getAllGenres() {
    const genres = [];
    // Fixos
    FIXED_GENRES.forEach(g => genres.push({ ...g }));
    // Customizados
    const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
    let order = 7;
    Object.values(genrePages).forEach(g => {
        genres.push({ name: g.name, url: g.url, order: order++, isCustom: true });
    });
    return genres.sort((a,b)=>a.order-b.order);
}

// Detectar se estamos em uma página de gênero
function detectCurrentGenre() {
    const currentPage = getCurrentPage();
    
    // Verificar se é página fixa de gênero
    for (const genre of FIXED_GENRES) {
        if (genre.url === currentPage) {
            return genre.name;
        }
    }
    
    // Verificar se é genero.html com parâmetro
    if (currentPage === 'genero.html' || currentPage.startsWith('genero.html?')) {
        const params = new URLSearchParams(window.location.search);
        return params.get('genero');
    }
    
    return null;
}

// Atualizar menu lateral
function updateGenresMenu() {
    const menuList = document.querySelector('.menu-section .menu-list');
    if (!menuList) return;
    const currentGenre = detectCurrentGenre();
    const currentPage = getCurrentPage();
    menuList.innerHTML='';
    getAllGenres().forEach(genre => {
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href=genre.url;
        const isCurrent = currentGenre===genre.name || genre.url===currentPage;
        const icon=isCurrent?'livro_aberto.png':'livro_fechado.png';
        a.innerHTML=`<img src="../imagens/${icon}" width="20" height="20" alt="">${genre.name}` + (genre.isCustom? ' ⭐':'' );
        if(isCurrent) a.classList.add('genre-selected');
        li.appendChild(a);
        menuList.appendChild(li);
    });
    console.log('✅ Menu atualizado com fixos + customizados');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    updateGenresMenu();
});

// Exportar para uso em outros módulos
export { updateGenresMenu, getAllGenres, detectCurrentGenre };
