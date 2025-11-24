// ==================== IMPORTS ====================
import '/js/theme.js';
import { saveReview, getBookReviews, createReviewElement } from './reviews-manager.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ==================== 1) Banco de livros ====================
// Aqui poderia vir de um backend futuramente, mas por enquanto fica mockado
export const livros = {
    "amor-obvio": {
        titulo: "O amor não é óbvio",
        autor: "Elayne Baeta",
        imagem: "/imagens/o_amor_nao_e_obvio.png",
        genero: "Literatura lésbica",
        paginas: 342,
        ano: 2022,
        descricaoCurta: "Amigos de infância percebem que o amor estava ali o tempo todo.",
        sinopse: "Hanna sempre acreditou que o amor verdadeiro só existia nos livros e filmes, até que descobertas, amizades e paixões inesperadas mostram que o amor pode surgir de formas nada óbvias."
    },
    "jogada-amor": {
        titulo: "A jogada do amor",
        autor: "Kelly Quindlen",
        imagem: "/imagens/a_jogada_do_amor.png",
        genero: "Romance LGBTQIA+",
        paginas: 310,
        ano: 2021,
        descricaoCurta: "Um romance esportivo onde o amor entra em campo entre rivais.",
        sinopse: "é um romance sobre Alex, que não tem problemas em paquerar, e Molly, que tem dificuldades sociais mas é apaixonada por Cora. Alex decide ajudar Molly a conquistar Cora, com o objetivo de provar à sua ex que consegue se comprometer e construir vínculos. No entanto, ao longo do plano de cinco passos, ambas percebem que podem estar se apaixonando uma pela outra. "
    },
    "ela-fica": {
        titulo: "Ela fica com a garota",
        autor: "Rachael Lippincott",
        imagem: "/imagens/ela_fica_com_a_garota.png",
        genero: "Romance",
        paginas: 298,
        ano: 2020,
        descricaoCurta: "Duas ex-colegas de escola se reencontram e o amor floresce.",
        sinopse: "Ela Fica com a Garota, de Rachel Lippincott e Alyson Derrick, é sobre Alex, uma garota que sabe muito bem como flertar, mas não consegue manter relacionamentos, e Molly, que é desajeitada socialmente, mas está apaixonada pela colega de classe Cora Myers. Alex oferece ajuda a Molly para conquistar Cora, com o objetivo de provar que ela pode se comprometer. No entanto, à medida que as duas trabalham juntas num plano de cinco etapas, elas começam a desenvolver sentimentos uma pela outra, transformando a amizade em um romance com final feliz."
    },
    "algumas-garotas": {
        titulo: "Algumas garotas são assim",
        autor: "Jennifer Dugan",
        imagem: "/imagens/algumas_garotas_sao_assim.png",
        genero: "Romance",
        paginas: 336,
        ano: 2023,
        descricaoCurta: "Comédia romântica sobre identidade e autodescoberta.",
        sinopse: "Morgan, uma jovem atleta de corrida, é forçada a mudar de escola no meio do semestre do último ano do ensino médio. Isso porque ela descobriu que ser lésbica é contra o código de conduta da conservadora escola católica em que estudava.No novo colégio, ela conhece Ruby, que passa a maior parte dos fins de semana participando de concursos de beleza para satisfazer os sonhos frustrados de sua mãe narcisista. Porém, na verdade, a jovem gosta mesmo é de consertar carros e tem grande fascínio pelo seu Ford Torino azul-bebê dos anos 1970."
    },
    "princesa-e-o-queijo-quente": {
        titulo: "Princesa e o Queijo Quente",
        autor: "Laura Pohl",
        imagem: "/imagens/a_princesa_e_o_queijo_quente.png",
        genero: "Romance",
        paginas: 280,
        ano: 2022,
        descricaoCurta: "Uma fábula divertida sobre uma princesa e seu lanche favorito.",
        sinopse: "Clara, uma jovem confeiteira em uma pequena cidade, sonha em abrir sua própria padaria. Quando uma misteriosa cliente, apelidada de 'Princesa' pelos locais, começa a frequentar seu café e pedir sempre o mesmo sanduíche de queijo quente, uma conexão inesperada floresce. Entre receitas secretas e segredos do passado, Clara descobre que o amor pode surgir nos momentos mais simples, mas também trazer desafios dignos de um conto de fadas moderno."
    },
    "um-milhao-de-finais-felizes": {
        titulo: "Um Milhão de Finais Felizes",
        autor: "Vitor Martins",
        imagem: "/imagens/um_milhao_de_finais_felizes.png",
        genero: "Romance",
        paginas: 320,
        ano: 2021,
        descricaoCurta: "Histórias interativas com múltiplos desfechos românticos.",
        sinopse: "Jonas, um romântico incorrigível, trabalha em uma livraria e acredita que cada pessoa tem direito a incontáveis finais felizes. Quando conhece Ananda, uma artista de rua com um passado complicado, ele se propõe a ajudá-la a reescrever sua história. Entre poesias rabiscadas em guardanapos e noites sob as estrelas, os dois aprendem que o amor verdadeiro exige coragem para enfrentar finais nem tão felizes assim."
    },
    "coisas-obvias-sobre-o-amor": {
        titulo: "Coisas Óbvias Sobre o Amor",
        autor: "Clara Alves",
        imagem: "/imagens/coisas_obvias_sobre_o_amor.png",
        genero: "Romance",
        paginas: 264,
        ano: 2024,
        descricaoCurta: "Crônicas leves e reais sobre relacionamentos do dia a dia.",
        sinopse: "Lívia, uma estudante de psicologia, acha que sabe tudo sobre o amor — até que sua melhor amiga, Sofia, confessa estar apaixonada por ela. Dividida entre o medo de mudar a amizade e a curiosidade sobre seus próprios sentimentos, Lívia embarca em uma jornada de autodescoberta. Com a ajuda de um diário e conversas sinceras, ela percebe que as coisas mais óbvias sobre o amor são, na verdade, as mais difíceis de aceitar."
    },
    "girls-like-girls": {
        titulo: "Girls Like Girls",
        autor: "Hayley Kiyoko",
        imagem: "/imagens/girls_like_girls.jpg",
        genero: "Romance",
        paginas: 352,
        ano: 2023,
        descricaoCurta: "Baseado na música de Hayley Kiyoko: um amor jovem e intenso.",
        sinopse: "Cole, uma adolescente queer recém-chegada a uma cidade pequena, tenta se adaptar após uma mudança abrupta. Quando conhece Eden, uma música talentosa com um estilo rebelde, as duas formam uma conexão instantânea. Entre shows de bandas locais e noites roubadas na praia, Cole descobre que ser fiel a si mesma é o primeiro passo para viver um amor sem medo, mesmo quando o mundo parece estar contra."
    },
    "isso-nao-e-um-conto-de-fadas": {
        titulo: "Isso Não É um Conto de Fadas",
        autor: "Emeli J. Santos",
        imagem: "../imagens/isso-não-é-um-conto-de-fadas.jpg",
        genero: "Romance",
        paginas: 296,
        ano: 2022,
        descricaoCurta: "Releitura sombria e realista dos contos clássicos.",
        sinopse: "Beatriz, uma roteirista de comédias românticas, não acredita em finais felizes. Sua vida vira de cabeça para baixo quando ela conhece Luana, uma barista com um sorriso capaz de derreter qualquer ceticismo. Enquanto tentam navegar por um romance cheio de mal-entendidos e momentos cômicos, Beatriz precisa decidir se está pronta para reescrever seu próprio roteiro e dar uma chance ao amor."
    },
    "lembre-se-de-nos": {
        titulo: "Lembre-se de Nós",
        autor: "Nina Lacour",
        imagem: "/imagens/lembre-se-de-nos.jpg",
        genero: "Romance",
        paginas: 304,
        ano: 2021,
        descricaoCurta: "Um romance sobre memória, perda e o poder do reencontro.",
        sinopse: "Mila retorna à sua cidade natal para resolver assuntos pendentes após anos afastada. Lá, ela reencontra June, sua primeira paixão, agora dona de uma floricultura. Enquanto desenterram memórias de um verão inesquecível, as duas enfrentam as dores do passado e a possibilidade de um futuro juntas. Uma história sobre segundas chances e a força de lembrar quem realmente somos."
    },
    "night-owls-and-summer-skies": {
        titulo: "Night Owls and Summer Skies (HQ)",
        autor: "Tara Frejas",
        imagem: "/imagens/night-owls-and-summer-skies.jpg",
        genero: "Romance",
        paginas: 128,
        ano: 2023,
        descricaoCurta: "Um verão mágico entre duas corujas da noite.",
        sinopse: "Emma Lane, uma adolescente de 17 anos, é forçada a passar o verão no Acampamento Mapplewood. Planejando ser expulsa, ela se envolve com Vivian, uma misteriosa conselheira. Entre amizades inesperadas e um romance sapphic, Emma descobre que o acampamento pode ser mais do que mosquitos e dramas. Adaptação em webtoon com 50 episódios, cheia de humor e momentos fofos!"
    },
    "vermelho-branco-e-sangue-azul": {
        titulo: "Vermelho, Branco e Sangue Azul",
        autor: "Casey McQuiston",
        imagem: "/imagens/vermelho-branco-e-sangue-azul.jpg",
        genero: "Romance",
        paginas: 400,
        ano: 2019,
        descricaoCurta: "O príncipe da Inglaterra e o filho da presidente dos EUA se apaixonam.",
        sinopse: "Alex Claremont-Diaz, o carismático filho da presidenta dos Estados Unidos, e Henry, o príncipe da Inglaterra, têm tudo para serem inimigos. Mas após um incidente diplomático forçar os dois a fingirem uma amizade, algo inesperado acontece: uma conexão genuína. Entre e-mails secretos e encontros furtivos, eles precisam decidir se estão prontos para desafiar as regras do mundo para viver um amor que pode mudar a história."
    },
    "a-arte-da-guerra": {
        titulo: "A Arte da Guerra",
        autor: "Sun Tzu",
        imagem: "/imagens/a-arte-da-guerra.jpg",
        genero: "Estratégia",
        paginas: 160,
        ano: -500,
        descricaoCurta: "Clássico chinês de estratégia militar e filosofia.",
        sinopse: "Escrito por Sun Tzu, um lendário estrategista militar chinês, este clássico atemporal oferece lições sobre táticas, planejamento e liderança. Usado não apenas na guerra, mas também em negócios e na vida, o livro explora como vencer conflitos com inteligência, paciência e estratégia, influenciando líderes e pensadores por séculos."
    },
    "a-divina-comedia": {
        titulo: "A Divina Comédia",
        autor: "Dante Alighieri",
        imagem: "/imagens/a-divina-comedia.jpg",
        genero: "Poesia Épica",
        paginas: 624,
        ano: 1320,
        descricaoCurta: "Jornada de Dante pelo Inferno, Purgatório e Paraíso.",
        sinopse: "Nesta obra-prima da literatura medieval, Dante Alighieri narra sua jornada épica pelos reinos do Inferno, Purgatório e Paraíso. Guiado por Virgílio e Beatriz, ele enfrenta pecadores, almas em redenção e a visão divina, explorando temas de pecado, redenção e a busca pela salvação eterna."
    },
    "fahrenheit-451": {
        titulo: "Fahrenheit 451",
        autor: "Ray Bradbury",
        imagem: "/imagens/fahrenheit-451.jpg",
        genero: "Ficção Científica",
        paginas: 256,
        ano: 1953,
        descricaoCurta: "Distopia onde livros são proibidos e queimados.",
        sinopse: "Em um futuro distópico onde livros são proibidos e queimados por 'bombeiros', Guy Montag, um desses agentes, começa a questionar sua função e a sociedade opressiva em que vive. Movido pela curiosidade e por encontros transformadores, ele embarca em uma jornada perigosa em busca de liberdade e conhecimento."
    },
    "meridiano-de-sangue": {
        titulo: "Meridiano de Sangue",
        autor: "Cormac McCarthy",
        imagem: "/imagens/meridiano-de-sangue.jpg",
        genero: "Ficção Histórica",
        paginas: 336,
        ano: 1985,
        descricaoCurta: "Uma odisseia brutal pelo Velho Oeste americano.",
        sinopse: "Ambientado na violenta fronteira entre Estados Unidos e México no século XIX, o romance segue um jovem conhecido apenas como 'o garoto', que se junta a um grupo de mercenários sanguínários. Liderados pelo enigmático Juiz Holden, eles mergulham em um ciclo brutal de violência, desafiando as noções de moralidade e humanidade."
    },
    "os-irmaos-karamazov": {
        titulo: "Os Irmãos Karamázov",
        autor: "Fiódor Dostoiévski",
        imagem: "/imagens/os-irmaos-karamazov.jpg",
        genero: "Romance Filosófico",
        paginas: 824,
        ano: 1880,
        descricaoCurta: "Drama familiar, fé e moral no clássico de Dostoiévski.",
        sinopse: "Nesta obra-prima de Dostoiévski, a história dos irmãos Karamázov — Dmitri, Ivan e Aliocha — explora conflitos familiares, paixão, fé e dúvida. Após o assassinato de seu pai, Fiódor, os irmãos enfrentam um julgamento que revela tensões morais e filosóficas, questionando o sentido da vida, da justiça e da existência de Deus."
    },
    "sql-em-10-minutos": {
        titulo: "SQL em 10 Minutos, Sams Teach Yourself",
        autor: "Ben Forta",
        imagem: "/imagens/sql-em-10-minutos.png",
        genero: "Banco de Dados",
        paginas: 240,
        ano: 2004,
        descricaoCurta: "Lições rápidas para dominar consultas SQL.",
        sinopse: "Este guia prático e conciso ensina os fundamentos da linguagem SQL de forma rápida e acessível, com lições curtas que cobrem consultas, joins, subconsultas e gerenciamento de dados. Ideal para iniciantes, o livro usa exemplos reais para ajudar programadores e analistas a dominarem bancos de dados relacionais em pouco tempo."
    },
    "use-a-cabeca": {
        titulo: "Use a Cabeça! Java",
        autor: "Lynn Beighley",
        imagem: "../imagens/use a cabeça java.jpg",
        genero: "Programação",
        paginas: 576,
        ano: 2008,
        descricaoCurta: "Aprendizado visual e interativo da linguagem Java.",
        sinopse: "Parte da série Head First, este livro adota uma abordagem visual e interativa para ensinar SQL, misturando quebra-cabeças, histórias e exercícios práticos. Ele explora desde conceitos básicos de bancos de dados até consultas avançadas, joins e normalização, tornando o aprendizado divertido e memorável para desenvolvedores novatos."
    },
    "javascript-guia-definitivo": {
        titulo: "JavaScript: O Guia Definitivo",
        autor: "David Flanagan",
        imagem: "../imagens/javascript guia definitivo.png",
        genero: "Desenvolvimento Web",
        paginas: 704,
        ano: 2011,
        descricaoCurta: "Referência completa da linguagem, do básico ao avançado.",
        sinopse: "Uma referência completa e exaustiva sobre JavaScript, cobrindo desde sintaxe básica e objetos até programação assíncrona, APIs do navegador e Node.js. Escrito por um especialista, o livro serve tanto para iniciantes quanto para profissionais avançados, com exemplos práticos e explicações detalhadas sobre o ecossistema ECMAScript."
    },
    "html-e-css": {
        titulo: "HTML e CSS: Desenhe e Construa Websites",
        autor: "Jon Duckett",
        imagem: "../imagens/html e css.png",
        genero: "Desenvolvimento Web",
        paginas: 480,
        ano: 2011,
        descricaoCurta: "Guia prático para criar sites modernos e responsivos.",
        sinopse: "Com design visual atraente e explicações claras, este livro guia o leitor na criação de sites modernos usando HTML5 e CSS3. Ele aborda estrutura de páginas, estilos, layouts responsivos e animações, com projetos práticos que transformam conceitos teóricos em sites funcionais, perfeito para designers e desenvolvedores iniciantes."
    },
    "fluente-python": {
        titulo: "Python Fluente",
        autor: "Luciano Ramalho",
        imagem: "../imagens/fluente python.png",
        genero: "Programação",
        paginas: 976,
        ano: 2015,
        descricaoCurta: "Boas práticas e padrões para programar como um profissional.",
        sinopse: "Explorando as nuances da linguagem Python de forma profunda, este livro foca em programação idiomática, estruturas de dados avançadas, metaprogramação e concorrência. Escrito por um expert brasileiro, ele ajuda programadores experientes a escreverem código mais eficiente e 'pythonico', com exemplos reais e insights sobre o CPython."
    },
    "dndE5-livro-do-jogador": {
        titulo: "D&D 5e Livro do Jogador",
        autor: "Wizards of the Coast",
        imagem: "../imagens/dnd e5 livro do jogador.png",
        genero: "RPG de Fantasia",
        paginas: 320,
        ano: 2014,
        descricaoCurta: "Regras para criar personagens em Dungeons & Dragons 5ª edição.",
        sinopse: "O Livro do Jogador é o guia essencial para jogadores de Dungeons & Dragons 5ª edição, contendo regras completas para criação e avanço de personagens, incluindo raças, classes, magias, equipamentos e mecânicas de combate e exploração. Com foco em imaginação e diversão, ele permite que heróis embarquem em aventuras épicas em mundos de fantasia, combatendo monstros e desvendando mistérios ao lado de aliados improváveis."
    },
    "o-um-anel-livro-do-aventureiro": {
        titulo: "O Um Anel - Livro do Aventureiro",
        autor: "Francesco Nepitello",
        imagem: "../imagens/um anel o livro do aventureiro.jpg",
        genero: "RPG de Fantasia",
        paginas: 193,
        ano: 2021,
        descricaoCurta: "RPG oficial na Terra-média de Tolkien: regras narrativas e viagens épicas.",
        sinopse: "Baseado no universo de J.R.R. Tolkien, este livro guia aventureiros pela Terra-média na Terceira Era, antes da Guerra do Anel. Com regras para criação de heróis como bardos, elfos e anões, ele explora jornadas perigosas, combates contra a Sombra crescente e dilemas morais, enfatizando coragem, astúcia e a beleza sombria do mundo de O Hobbit e O Senhor dos Anéis."
    },
    "blades-in-the-dark": {
        titulo: "Blades in the Dark",
        autor: "John Harper",
        descricaoCurta: "RPG de ladrões em uma cidade gótica e mágica.",
        imagem: "../imagens/blades in the dark.png",
        genero: "RPG de Fantasia Industrial",
        paginas: 328,
        ano: 2017,
        sinopse: "Em Doskvol, uma cidade assombrada por fantasmas e impulsionada por máquinas a vapor, jogadores assumem o papel de uma gangue de criminosos audaciosos. O livro apresenta mecânicas inovadoras para assaltos, intrigas e downtime, onde falhas geram complicações dramáticas, misturando steampunk, horror sobrenatural e crime organizado em uma narrativa impulsionada pela ficção e pela sorte dos dados."
    },
    "som-das-seis": {
        titulo: "O Som das Seis",
        autor: "Gael Pereira",
        imagem: "../imagens/o som das seis.png",
        genero: "RPG de Faroeste",
        paginas: 124,
        ano: 2021,
        sinopse: "Inspirado em clássicos do western como Red Dead Redemption e filmes de Clint Eastwood, este RPG simples transporta jogadores para a selvageria da Fronteira Americana. Como xerifes, caçadores de recompensas ou nativos vingativos, os heróis enfrentam duelos ao pôr do sol, buscas por ouro e dilemas morais sob o sol impiedoso, com regras ágeis que priorizam narrativa e diversão em sessões rápidas e intensas."
    },
    "paranoia": {
        titulo: "Paranoia",
        autor: "Allen Varney",
        imagem: "/imagens/paranoia.jpg",
        genero: "RPG de Ficção Científica Satírica",
        paginas: 256,
        ano: 2017,
        sinopse: "No complexo Alpha de um futuro distópico, clones de clearance vermelho servem ao Computador onipresente, mas a paranoia reina: amigos são traidores potenciais e a lealdade é questionada a cada passo. Este livro cômico e caótico oferece regras para missões absurdas cheias de burocracia, mutações secretas e traições hilárias, satirizando RPGs tradicionais em um mundo onde a diversão vem da desconfiança e do caos hilariante."
    },
    "tormenta-modulo-basico": {
        titulo: "Tormenta RPG - Módulo Básico",
        autor: "Jambô Editora",
        imagem: "/imagens/tormenta.jpg",
        genero: "RPG de Fantasia Épica",
        paginas: 200,
        ano: 2018,
        sinopse: "No mundo de Arton, ameaçado pela Tormenta — uma chuva mágica que corrompe a realidade —, heróis de diversas raças e classes lutam contra deuses caídos, monstros aberrantes e intrigas políticas. Este módulo básico fornece regras essenciais para criação de personagens, combates dinâmicos e aventuras épicas, convidando jogadores a forjar lendas em um cenário brasileiro rico em mitos, com influências de animes e quadrinhos."
    },
    "a-biblioteca-da-meia-noite": {
        titulo: "A Biblioteca da Meia-Noite",
        autor: "Matt Haig",
        imagem: "../imagens/biblioteca da meia noite.jpg",
        genero: "Romance",
        paginas: 308,
        ano: 2020,
        sinopse: "Nora Seed, em meio a uma crise existencial, encontra-se na misteriosa Biblioteca da Meia-Noite, onde cada livro oferece uma vida alternativa que ela poderia ter vivido. Ao explorar diferentes caminhos, ela enfrenta escolhas, arrependimentos e possibilidades, descobrindo o que realmente faz uma vida valer a pena em uma narrativa emocionante sobre segundas chances e autodescoberta."
    },
    "caninos-brancos": {
        titulo: "Caninos Brancos",
        autor: "Jack London",
        imagem: "../imagens/caninos brancos.jpg",
        genero: "Romance",
        paginas: 272,
        ano: 1906,
        sinopse: "Ambientado no selvagem território do Yukon durante a Corrida do Ouro, este clássico acompanha Caninos Brancos, um lobo-cão que enfrenta a brutalidade da natureza e dos homens. Passando por donos cruéis e bondosos, sua jornada explora a luta entre instinto selvagem e domesticação, revelando temas de sobrevivência, lealdade e redenção."
    },
    "o-impulso": {
        titulo: "O Impulso",
        autor: "Ashley Audrain",
        imagem: "../imagens/o impulso.jpg",
        genero: "Romance",
        paginas: 320,
        ano: 2021,
        sinopse: "Blythe Connor deseja ser a mãe perfeita, mas sua filha, Violet, desperta nela dúvidas e temores profundos. Conforme comportamentos perturbadores emergem, Blythe questiona se é paranoia ou algo mais sombrio. Este thriller psicológico intenso explora maternidade, trauma geracional e os limites do instinto maternal em uma narrativa que prende até a última página."
    },
    "walden": {
        titulo: "Walden",
        autor: "Henry David Thoreau",
        imagem: "/imagens/walden.jpg",
        genero: "Romance",
        paginas: 352,
        ano: 1854,
        sinopse: "Relato da experiência de Thoreau vivendo por dois anos em uma cabana isolada às margens do lago Walden, este livro é uma reflexão profunda sobre simplicidade, autossuficiência e conexão com a natureza. Combinando observações naturalistas e crítica social, ele questiona o materialismo e inspira uma vida mais consciente e essencial."
    },
    "legend-of-the-guardians-collection": {
        titulo: "The Legend of the Guardians Collection",
        autor: "Kathryn Lasky",
        imagem: "../imagens/lenda dos guardiões.jpg",
        genero: "Fantasia",
        paginas: 1200,
        ano: 2010,
        sinopse: "Esta coleção reúne os livros da série 'Guardians of Ga'Hoole', uma saga épica sobre corujas heroicas em um mundo de fantasia. Lideradas por Soren, uma jovem coruja, elas lutam contra forças malignas que ameaçam o reino de Ga'Hoole. Com temas de coragem, amizade e destino, a série combina aventura e mitologia, cativando leitores com suas batalhas aéreas e intrigas."
    },
    "arvore-dos-desejos": {
        titulo: "Árvore dos Desejos",
        autor: "Katherine Applegate",
        imagem: "../imagens/árvore dos desejos.jpg",
        genero: "Fantasia",
        paginas: 224,
        ano: 2017,
        sinopse: "Red, uma árvore centenária, narra esta história comovente sobre uma comunidade e seus desejos mais profundos. Como uma 'árvore dos desejos', Red testemunha esperanças, sonhos e preconceitos dos humanos ao seu redor, enquanto reflete sobre amizade, aceitação e o impacto de pequenas ações, em um conto delicado e poético que encanta leitores de todas as idades."
    },
    "flores-para-algernon": {
        titulo: "Flores para Algernon",
        autor: "Daniel Keyes",
        imagem: "../imagens/flores para algernon.jpg",
        genero: "Fantasia",
        paginas: 336,
        ano: 1966,
        sinopse: "Charlie Gordon, um homem com deficiência intelectual, participa de um experimento que aumenta sua inteligência, assim como a do rato Algernon. Narrado por meio de relatórios de progresso, o livro acompanha sua transformação, revelando alegrias, descobertas e tragédias. Uma história comovente que explora ética científica, humanidade e o desejo de aceitação em um mundo que nem sempre acolhe diferenças."
    },
};

// ==================== 2) Pega ID do livro da URL ====================

// Função para obter todos os livros (originais + adicionados pelo admin)
function getAllBooks() {
    const adminBooks = JSON.parse(localStorage.getItem('admin-books') || '{}');
    return { ...livros, ...adminBooks };
}

// Apenas executar código DOM se o elemento existir (não quando importado pelo admin)
const container = document.getElementById("book-detail");

if (!container) {
    // Sendo importado como módulo (admin.js) - não executar código DOM
    console.log('📚 Módulo vejamais.js carregado (apenas dados exportados)');
} else {
    // Executar código normal da página vejamais.html
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const allBooks = getAllBooks();
    const livro = allBooks[id];

// ==================== 3) Monta card de detalhes ====================

if (livro) {
    // Usa descricaoCurta (ou descricao do admin); senão trunca a sinopse
    const makeShortDesc = (text, max = 70) => {
        const t = String(text || '').trim();
        if (!t || t.length <= max) return t;
        const slice = t.slice(0, max);
        const lastSpace = slice.lastIndexOf(' ');
        return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim() + '…';
    };
    const miniDesc = (livro.descricaoCurta || livro.descricao || makeShortDesc(livro.sinopse || ''));

    container.innerHTML = `
    <div class="book-detail-card" data-id="${id}" data-title="${livro.titulo}">
      <div class="book-image">
        <img src="${livro.imagem}" alt="Capa do livro ${livro.titulo}">
      </div>
      <div class="book-info">
        <h1>${livro.titulo}</h1>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Gênero:</strong> ${livro.genero}</p>
        <p><strong>Páginas:</strong> ${livro.paginas}</p>
        <p><strong>Ano:</strong> ${livro.ano}</p>
        <!-- Mini-descrição oculta para extração pelo library-actions -->
        <p class="book-mini-desc" style="display:none;" data-short-desc="${miniDesc.replace(/"/g, '&quot;')}"></p>
        <p class="sinopse"><strong>Sinopse:</strong> ${livro.sinopse}</p>

        <!-- Avaliação geral -->
        <div class="rating-container">
          <div class="rating-stars"></div>
          <div class="rating-average">Média: 0 ★</div>
        </div>

        <div class="action-buttons">
          <button class="action-btn btn-quer-ler" id="btn-quer-ler">📖 Quero Ler</button>
          <button class="action-btn btn-ja-li" id="btn-ja-li">✅ Já Li</button>
          <button class="action-btn btn-favorito" id="btn-favorito">⭐ Favorito</button>
        </div>

        
      </div>
    </div>

    <!-- Review -->
    <div class="review-section">
      <h2>Deixe sua review</h2>
      <div class="review-stars"></div>
      <textarea id="review-text" placeholder="Escreva sua opinião..."></textarea>
      <button id="submit-review" class="submit-btn">Enviar Review</button>
    </div>

    <!-- Lista de reviews -->
    <div class="reviews">
      <h2>Reviews</h2>
      <div id="review-list" class="review-list"></div>
    </div>
  `;
} else {
    container.innerHTML = `<p class="not-found">Livro não encontrado 😕</p>`;
}

// ==================== 4) Função genérica de estrelinhas ====================
function initStarRating(container, initialValue = 0, onChange) {
    let currentRating = initialValue;

    // Cria 5 estrelinhas dinamicamente
    container.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.classList.add("star");
        span.dataset.value = i;
        span.innerHTML = "★";
        container.appendChild(span);
    }

    const stars = Array.from(container.querySelectorAll(".star"));

    function paint(rating) {
        stars.forEach((star) => {
            const val = Number(star.dataset.value);
            star.classList.remove("full", "half");
            if (rating >= val) star.classList.add("full");
            else if (rating >= val - 0.5) star.classList.add("half");
        });
    }

    paint(currentRating);

    stars.forEach((star) => {
        star.addEventListener("mousemove", (e) => {
            const rect = star.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const hoverRating =
                Number(star.dataset.value) - (mouseX < rect.width / 2 ? 0.5 : 0);
            paint(hoverRating);
        });

        star.addEventListener("click", (e) => {
            const rect = star.getBoundingClientRect();
            currentRating =
                Number(star.dataset.value) - (e.clientX - rect.left < rect.width / 2 ? 0.5 : 0);
            paint(currentRating);
            if (onChange) onChange(currentRating);
        });

        star.addEventListener("mouseleave", () => paint(currentRating));
    });

    return {
        getRating: () => currentRating,
        setRating: (val) => {
            currentRating = val;
            paint(currentRating);
        },
    };
}

// ==================== 5) Avaliação geral ====================
const ratingContainer = document.querySelector(".rating-stars");
const averageEl = document.querySelector(".rating-average");
const userId = "user-123"; // simulação de login

let ratings = JSON.parse(localStorage.getItem(`bookRating-${id}`));
if (!ratings) {
    ratings = {};
}
let currentRating = 0;
if (ratings[userId] !== undefined) {
    currentRating = ratings[userId];
}

const mainStars = initStarRating(ratingContainer, currentRating, (newRating) => {
    ratings[userId] = newRating;
    localStorage.setItem(`bookRating-${id}`, JSON.stringify(ratings));
    updateAverage();
});

function updateAverage() {
    const allValues = Object.values(ratings);
    if (allValues.length === 0) {
        averageEl.textContent = "Média: 0 ★";
        return;
    }
    const avg = (
        allValues.reduce((a, b) => a + b, 0) / allValues.length
    ).toFixed(1);
    averageEl.textContent = `Média: ${avg} ★`;
}
updateAverage();

// ==================== 6) Sistema de reviews ====================

const reviewStarsEl = document.querySelector(".review-stars");
const reviewTextEl = document.getElementById("review-text");
const submitBtn = document.getElementById("submit-review");
const reviewList = document.getElementById("review-list");

let reviewStars = initStarRating(reviewStarsEl, 0, (rating) => {
    reviewStars.setRating(rating);
});

function renderReviews() {
    reviewList.innerHTML = "";
    const reviews = getBookReviews(id);
    
    if (reviews.length === 0) {
        reviewList.innerHTML = `
            <div class="review-empty-state">
                <p>Nenhuma review foi feita ainda.</p>
                <p>Seja o(a) primeiro(a)!</p>
            </div>
        `;
        return;
    }
    
    reviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewList.appendChild(reviewElement);
    });
}

submitBtn.addEventListener("click", () => {
    try {
        const text = reviewTextEl.value.trim();
        const rating = reviewStars.getRating();

        if (!text || rating === 0) {
            alert("Dê uma nota e escreva algo!");
            return;
        }

        saveReview(id, { rating, text });
        
        reviewTextEl.value = "";
        reviewStars.setRating(0);
        renderReviews();
    } catch (error) {
        alert(error.message);
    }
});

// Renderiza inicialmente e também quando o estado de autenticação mudar.
renderReviews();

// Se o Firebase ainda não tiver definido `auth.currentUser` no primeiro carregamento,
// garante que re-renderizaremos (o que faz com que o botão de deletar apareça quando
// o usuário estiver disponível).
onAuthStateChanged(auth, () => {
    renderReviews();
});

// Scroll automático para review específica quando chamado de reviews.html
setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    const reviewTimestamp = params.get("review");
    
    if (reviewTimestamp) {
        const reviewElement = document.querySelector(`[data-timestamp="${reviewTimestamp}"]`);
        if (reviewElement) {
            // Scroll suave com duração maior (2 segundos) para simular scroll natural
            const targetPosition = reviewElement.offsetTop - window.innerHeight / 2;
            const startPosition = window.scrollY;
            const distance = targetPosition - startPosition;
            const duration = 2000; // 2 segundos
            let start = null;
            
            function ease(t) {
                // Easing function suave (easeInOutCubic)
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            
            function scroll(currentTime) {
                if (start === null) start = currentTime;
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                window.scrollTo(0, startPosition + distance * ease(progress));
                
                if (progress < 1) {
                    requestAnimationFrame(scroll);
                } else {
                    // Quando o scroll terminar, adicionar animação na caixa
                    reviewElement.classList.add('review-highlight');
                    setTimeout(() => {
                        reviewElement.classList.remove('review-highlight');
                    }, 2000);
                }
            }
            
            requestAnimationFrame(scroll);
        }
    }
}, 500); // Esperar para garantir renderização

} // Fim do bloco if (container)

// Theme handled by /js/theme.js (import above)


