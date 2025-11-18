# 📁 Estrutura do Projeto - Toca da Coruja

## Organização de Arquivos

Após reorganização para o Vercel, a estrutura ficou assim:

```
projeto-toca-da-coruja/
├── index.html              # Página de boas-vindas (RAIZ - necessário para Vercel)
├── pages/                  # Pasta com todas as páginas HTML
│   ├── home.html
│   ├── login.html
│   ├── cadastro.html
│   ├── perfil.html
│   ├── contato.html
│   ├── sobre.html
│   ├── reviews.html
│   ├── favoritos.html
│   ├── ja_lidos.html
│   ├── quer_ler.html
│   ├── rpg.html
│   ├── gay.html
│   ├── fantasia.html
│   ├── romance.html
│   ├── classico.html
│   ├── programacao.html
│   ├── vejamais.html
│   ├── genero.html
│   ├── colecao.html
│   └── admin.html
├── css/                    # Arquivos de estilo
│   ├── home.css
│   ├── style.css
│   ├── reset.css
│   ├── global.css
│   └── ...
├── js/                     # Arquivos JavaScript
│   ├── firebase-config.js
│   ├── auth.js
│   ├── help-modal.js
│   └── ...
├── imagens/                # Recursos de imagem
│   ├── logo.png
│   ├── favicon.png
│   └── ...
└── vercel.json            # Configuração de deploy no Vercel
```

## 🔗 Como os Links Funcionam

### Dentro da pasta `pages/`
- Links entre páginas HTML usam nomes diretos: `href="home.html"`, `href="contato.html"`
- Todos os caminhos para CSS, imagens e JS usam `../`: 
  - `href="../css/home.css"`
  - `src="../imagens/logo.png"`
  - `src="../js/firebase-config.js"`

### Index.html (raiz)
- Aponta para a pasta pages: `href="pages/home.html"`
- Importa CSS e imagens da raiz: `href="/css/style.css"`, `src="/imagens/logo.png"`

### Redirecionamentos (em scripts JS)
- De scripts JS externos: `window.location.href = "pages/home.html"`
- De HTML inline (em pages/): `window.location.href = "pages/home.html"`

## 📦 Deploy no Vercel

1. Conecte o repositório GitHub ao Vercel
2. O Vercel automaticamente detectará e deployará o projeto
3. A URL raiz (`/`) abrirá `index.html` (página de boas-vindas)
4. URLs como `/pages/home.html` abrirão a página correspondente

## ✅ Verificação

Para testar localmente:
```bash
# Abrir em um servidor local (Python)
python -m http.server 8000

# Depois acesse:
# http://localhost:8000/         # Boas-vindas
# http://localhost:8000/pages/home.html  # Home
```

## 🔧 Arquivos Atualizados

Todos os seguintes arquivos foram atualizados para usar `pages/`:
- `js/auth.js` - Redirecionamentos de login/cadastro
- `js/perfil.js` - Redirecionamentos de perfil
- `js/login.js` - Redirecionamentos após login
- `js/help-modal.js` - Link "Entre em Contato"
- `js/dynamic-genres-menu.js` - Array de páginas raízes
- `js/reviews-page.js`, `quer-ler-page.js`, `ja-lidos-page.js`, `favoritos-page.js` - Links de exploração
- `index.html` - Link para home

---

**Nota:** O `index.html` fica na raiz porque o Vercel requer um ponto de entrada no diretório raiz.
