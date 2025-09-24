
// home.js — busca de títulos (filtra os .book-item pelo título)

// util: normaliza texto (remove acentos e transforma minúsculas)
function normalizeText(str) {
    if (!str) return "";
    // NFD + remoção de diacríticos
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    const books = Array.from(document.querySelectorAll('.book-item'));

    if (!searchInput) return;

    function doSearch() {
        const term = normalizeText(searchInput.value.trim());
        if (term === '') {
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
            if (match) book.classList.remove('hidden');
            else book.classList.add('hidden');
        });
    }

    // evento de input (busca em tempo real)
    searchInput.addEventListener('input', doSearch);

    // opcional: permite Enter para focar apenas — já retornamos false no form
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
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




// vejamais.js

// 1️ Lista de livros (você cadastra todos aqui)
const livros = {
    "amor-obvio": {
        titulo: "O amor não é óbvio",
        autor: "Elayne Baeta",
        imagem: "./imagens/o_amor_nao_e_obvio.png",
        genero: "Literatura lésbica",
        paginas: 342,
        ano: 2022,
        sinopse: "Hanna sempre acreditou que o amor verdadeiro só existia nos livros e filmes, até que descobertas, amizades e paixões inesperadas mostram que o amor pode surgir de formas nada óbvias."
    },
    "jogada-amor": {
        titulo: "A jogada do amor",
        autor: "Kelly Quindlen",
        imagem: "./imagens/a_jogada_do_amor.png",
        genero: "Romance LGBTQIA+",
        paginas: 310,
        ano: 2021,
        sinopse: "Uma história sobre paixão, esportes e a descoberta do amor verdadeiro."
    },
    "ela-fica": {
        titulo: "Ela fica com a garota",
        autor: "Rachael Lippincott",
        imagem: "./imagens/ela_fica_com_a_garota.png",
        genero: "Romance",
        paginas: 298,
        ano: 2020,
        sinopse: "Ela Fica com a Garota, de Rachel Lippincott e Alyson Derrick, é sobre Alex, uma garota que sabe muito bem como flertar, mas não consegue manter relacionamentos, e Molly, que é desajeitada socialmente, mas está apaixonada pela colega de classe Cora Myers. Alex oferece ajuda a Molly para conquistar Cora, com o objetivo de provar que ela pode se comprometer. No entanto, à medida que as duas trabalham juntas num plano de cinco etapas, elas começam a desenvolver sentimentos uma pela outra, transformando a amizade em um romance com final feliz."
    },
    "algumas-garotas": {
        titulo: "Algumas garotas são assim",
        autor: "Jennifer Dugan",
        imagem: "./imagens/algumas_garotas_sao_assim.png",
        genero: "Romance",
        paginas: 336,
        ano: 2023,
        sinopse: "Morgan, uma jovem atleta de corrida, é forçada a mudar de escola no meio do semestre do último ano do ensino médio. Isso porque ela descobriu que ser lésbica é contra o código de conduta da conservadora escola católica em que estudava.No novo colégio, ela conhece Ruby, que passa a maior parte dos fins de semana participando de concursos de beleza para satisfazer os sonhos frustrados de sua mãe narcisista. Porém, na verdade, a jovem gosta mesmo é de consertar carros e tem grande fascínio pelo seu Ford Torino azul-bebê dos anos 1970."
    },

};

// 2️ Ler ID da URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const livro = livros[id];

// 3 Montar o card dinamicamente
const container = document.getElementById("book-detail");

if (livro) {
    container.innerHTML = `
    <div class="book-detail-card">
    <div class="book-image">
        <img src="${livro.imagem}" alt="Capa do livro ${livro.titulo}">
    </div>
    <div class="book-info">
        <h1>${livro.titulo}</h1>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Gênero:</strong> ${livro.genero}</p>
        <p><strong>Páginas:</strong> ${livro.paginas}</p>
        <p><strong>Ano:</strong> ${livro.ano}</p>
        <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
        <button class="download-btn">Download</button>
    </div>
    </div>
`;
} else {
    container.innerHTML = `<p>Livro não encontrado 😕</p>`;
}
