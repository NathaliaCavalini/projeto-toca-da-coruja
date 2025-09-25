
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
        imagem: "../imagens/o_amor_nao_e_obvio.png",
        genero: "Literatura lésbica",
        paginas: 342,
        ano: 2022,
        sinopse: "Hanna sempre acreditou que o amor verdadeiro só existia nos livros e filmes, até que descobertas, amizades e paixões inesperadas mostram que o amor pode surgir de formas nada óbvias."
    },
    "jogada-amor": {
        titulo: "A jogada do amor",
        autor: "Kelly Quindlen",
        imagem: "../imagens/a_jogada_do_amor.png",
        genero: "Romance LGBTQIA+",
        paginas: 310,
        ano: 2021,
        sinopse: "Uma história sobre paixão, esportes e a descoberta do amor verdadeiro."
    },
    "ela-fica": {
        titulo: "Ela fica com a garota",
        autor: "Rachael Lippincott",
        imagem: "../imagens/ela_fica_com_a_garota.png",
        genero: "Romance",
        paginas: 298,
        ano: 2020,
        sinopse: "Ela Fica com a Garota, de Rachel Lippincott e Alyson Derrick, é sobre Alex, uma garota que sabe muito bem como flertar, mas não consegue manter relacionamentos, e Molly, que é desajeitada socialmente, mas está apaixonada pela colega de classe Cora Myers. Alex oferece ajuda a Molly para conquistar Cora, com o objetivo de provar que ela pode se comprometer. No entanto, à medida que as duas trabalham juntas num plano de cinco etapas, elas começam a desenvolver sentimentos uma pela outra, transformando a amizade em um romance com final feliz."
    },
    "algumas-garotas": {
        titulo: "Algumas garotas são assim",
        autor: "Jennifer Dugan",
        imagem: "../imagens/algumas_garotas_sao_assim.png",
        genero: "Romance",
        paginas: 336,
        ano: 2023,
        sinopse: "Morgan, uma jovem atleta de corrida, é forçada a mudar de escola no meio do semestre do último ano do ensino médio. Isso porque ela descobriu que ser lésbica é contra o código de conduta da conservadora escola católica em que estudava.No novo colégio, ela conhece Ruby, que passa a maior parte dos fins de semana participando de concursos de beleza para satisfazer os sonhos frustrados de sua mãe narcisista. Porém, na verdade, a jovem gosta mesmo é de consertar carros e tem grande fascínio pelo seu Ford Torino azul-bebê dos anos 1970."
    },
    "princesa-e-o-queijo-quente": {
        titulo: "Princesa e o Queijo Quente",
        autor: "Laura Pohl",
        imagem: "../imagens/a_princesa_e_o_queijo_quente.png",
        genero: "Romance",
        paginas: 280,
        ano: 2022,
        sinopse: "Clara, uma jovem confeiteira em uma pequena cidade, sonha em abrir sua própria padaria. Quando uma misteriosa cliente, apelidada de 'Princesa' pelos locais, começa a frequentar seu café e pedir sempre o mesmo sanduíche de queijo quente, uma conexão inesperada floresce. Entre receitas secretas e segredos do passado, Clara descobre que o amor pode surgir nos momentos mais simples, mas também trazer desafios dignos de um conto de fadas moderno."
    },
    "um-milhao-de-finais-felizes": {
        titulo: "Um Milhão de Finais Felizes",
        autor: "Vitor Martins",
        imagem: "../imagens/um_milhao_de_finais_felizes.png",
        genero: "Romance",
        paginas: 320,
        ano: 2021,
        sinopse: "Jonas, um romântico incorrigível, trabalha em uma livraria e acredita que cada pessoa tem direito a incontáveis finais felizes. Quando conhece Ananda, uma artista de rua com um passado complicado, ele se propõe a ajudá-la a reescrever sua história. Entre poesias rabiscadas em guardanapos e noites sob as estrelas, os dois aprendem que o amor verdadeiro exige coragem para enfrentar finais nem tão felizes assim."
    },
    "coisas-obvias-sobre-o-amor": {
        titulo: "Coisas Óbvias Sobre o Amor",
        autor: "Clara Alves",
        imagem: "../imagens/coisas_obvias_sobre_o_amor.png",
        genero: "Romance",
        paginas: 264,
        ano: 2024,
        sinopse: "Lívia, uma estudante de psicologia, acha que sabe tudo sobre o amor — até que sua melhor amiga, Sofia, confessa estar apaixonada por ela. Dividida entre o medo de mudar a amizade e a curiosidade sobre seus próprios sentimentos, Lívia embarca em uma jornada de autodescoberta. Com a ajuda de um diário e conversas sinceras, ela percebe que as coisas mais óbvias sobre o amor são, na verdade, as mais difíceis de aceitar."
    },
    "girls-like-girls": {
        titulo: "Girls Like Girls",
        autor: "Hayley Kiyoko",
        imagem: "../imagens/girls_like_girls.jpg",
        genero: "Romance",
        paginas: 352,
        ano: 2023,
        sinopse: "Cole, uma adolescente queer recém-chegada a uma cidade pequena, tenta se adaptar após uma mudança abrupta. Quando conhece Eden, uma música talentosa com um estilo rebelde, as duas formam uma conexão instantânea. Entre shows de bandas locais e noites roubadas na praia, Cole descobre que ser fiel a si mesma é o primeiro passo para viver um amor sem medo, mesmo quando o mundo parece estar contra."
    },
    "isso-nao-e-um-conto-de-fadas": {
        titulo: "Isso Não É um Conto de Fadas",
        autor: "Emeli J. Santos",
        imagem: "../imagens/isso-não-é-um-conto-de-fadas.jpg",
        genero: "Romance",
        paginas: 296,
        ano: 2022,
        sinopse: "Beatriz, uma roteirista de comédias românticas, não acredita em finais felizes. Sua vida vira de cabeça para baixo quando ela conhece Luana, uma barista com um sorriso capaz de derreter qualquer ceticismo. Enquanto tentam navegar por um romance cheio de mal-entendidos e momentos cômicos, Beatriz precisa decidir se está pronta para reescrever seu próprio roteiro e dar uma chance ao amor."
    },
    "lembre-se-de-nos": {
        titulo: "Lembre-se de Nós",
        autor: "Nina Lacour",
        imagem: "../imagens/lembre-se-de-nos.jpg",
        genero: "Romance",
        paginas: 304,
        ano: 2021,
        sinopse: "Mila retorna à sua cidade natal para resolver assuntos pendentes após anos afastada. Lá, ela reencontra June, sua primeira paixão, agora dona de uma floricultura. Enquanto desenterram memórias de um verão inesquecível, as duas enfrentam as dores do passado e a possibilidade de um futuro juntas. Uma história sobre segundas chances e a força de lembrar quem realmente somos."
    },
    "night-owls-and-summer-skies": {
        titulo: "Night Owls and Summer Skies (HQ)",
        autor: "Tara Frejas",
        imagem: "../imagens/night-owls-and-summer-skies.jpg",
        genero: "Romance",
        paginas: 128,
        ano: 2023,
        sinopse: "Nesta adaptação em quadrinhos, Emma, uma jovem artista, passa o verão em um acampamento onde conhece Riley, uma astrônoma amadora que adora observar as estrelas. Entre noites de fogueira e conversas sob o céu estrelado, as duas descobrem que o amor pode surgir nos lugares mais inesperados. Com ilustrações vibrantes, esta história captura a magia de um romance de verão."
    },
    "vermelho-branco-e-sangue-azul": {
        titulo: "Vermelho, Branco e Sangue Azul",
        autor: "Casey McQuiston",
        imagem: "../imagens/vermelho-branco-e-sangue-azul.jpg",
        genero: "Romance",
        paginas: 400,
        ano: 2019,
        sinopse: "Alex Claremont-Diaz, o carismático filho da presidenta dos Estados Unidos, e Henry, o príncipe da Inglaterra, têm tudo para serem inimigos. Mas após um incidente diplomático forçar os dois a fingirem uma amizade, algo inesperado acontece: uma conexão genuína. Entre e-mails secretos e encontros furtivos, eles precisam decidir se estão prontos para desafiar as regras do mundo para viver um amor que pode mudar a história."
    }
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
