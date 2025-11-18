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
    const parts = path.split('/');
    return parts[parts.length - 1] || 'home.html';
}

// Detectar o caminho correto para imagens
function getImagePath() {
    const currentPage = getCurrentPage();
    // Páginas que estão no root do projeto (não em subpasta)
    const rootPages = ['pages/home.html', 'pages/reviews.html', 'pages/ja_lidos.html', 'pages/quer_ler.html', 'pages/favoritos.html', 'pages/login.html', 'pages/cadastro.html', 'pages/perfil.html', 'pages/contato.html', 'pages/sobre.html', 'pages/vejamais.html', 'pages/programacao.html', 'pages/romance.html', 'pages/classico.html', 'pages/fantasia.html', 'pages/rpg.html', 'pages/gay.html', 'pages/admin.html'];
    
    if (rootPages.includes(currentPage)) {
        return 'imagens/';
    }
    return '../imagens/';
}

// Obter todos os gêneros (fixos + customizados)
function getAllGenres() {
    const genres = [];
    // Fixos
    FIXED_GENRES.forEach(g => genres.push({ ...g }));
    // Customizados
    try {
        const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
        let order = 7;
        Object.values(genrePages).forEach(g => {
            if (g && g.name && g.url) {
                genres.push({ name: g.name, url: g.url, order: order++, isCustom: true });
            }
        });
    } catch (e) {
        console.warn('Erro ao carregar gêneros customizados:', e);
    }
    return genres.sort((a, b) => a.order - b.order);
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
    
    // Verificar gêneros customizados
    try {
        const genrePages = JSON.parse(localStorage.getItem('genre-pages') || '{}');
        for (const g of Object.values(genrePages)) {
            if (g && g.url === currentPage) {
                return g.name;
            }
        }
    } catch (e) {
        console.warn('Erro ao detectar gênero customizado:', e);
    }
    
    return null;
}

// Atualizar menu lateral
function updateGenresMenu() {
    const menuList = document.querySelector('.menu-section .menu-list');
    if (!menuList) {
        console.warn('❌ .menu-section .menu-list não encontrado');
        return;
    }
    
    try {
        const currentGenre = detectCurrentGenre();
        const currentPage = getCurrentPage();
        const imagePath = getImagePath();
        
        menuList.innerHTML = '';
        
        getAllGenres().forEach(genre => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = genre.url;
            
            const isCurrent = currentGenre === genre.name || genre.url === currentPage;
            const icon = isCurrent ? 'livro_aberto.png' : 'livro_fechado.png';
            
            a.innerHTML = `<img src="${imagePath}${icon}" width="20" height="20" alt=""> ${genre.name}`;
            
            if (isCurrent) {
                a.classList.add('genre-selected');
            }
            
            li.appendChild(a);
            menuList.appendChild(li);
        });
        
        console.log('✅ Menu de gêneros atualizado');
    } catch (err) {
        console.error('❌ Erro ao atualizar menu de gêneros:', err);
    }
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGenresMenu);
} else {
    // DOM já está pronto
    updateGenresMenu();
}

// Também tenta atualizar quando a página fica visível novamente
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        updateGenresMenu();
    }
});

// Exportar para uso em outros módulos
export { updateGenresMenu, getAllGenres, detectCurrentGenre };
