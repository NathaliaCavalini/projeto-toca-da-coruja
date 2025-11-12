// fix-catalog-buttons.js
// Script para adicionar os botões de ação (Quero Ler, Já Li, Favorito)
// em todos os cards de livros nas páginas de catálogo
// Configurável via atributo data-button-mode na tag <body>

(function() {
    'use strict';
    
    // Espera o DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFixes);
    } else {
        initFixes();
    }
    
    function initFixes(){
        // Apenas garantir botões; não alterar markup legacy das descrições
        fixButtons();
    }
    
    function fixButtons() {
        // Verifica modo de botões (padrão: 'all', opções: 'single' para apenas Quero Ler)
        const mode = document.body.dataset.buttonMode || 'all';
        
        // Pega todos os book-items
        const bookItems = document.querySelectorAll('.book-item');
        
        bookItems.forEach(card => {
            // Pega ou cria o data-id baseado no link "Veja mais"
            let dataId = card.dataset.id;
            if (!dataId) {
                const link = card.querySelector('.book-action a');
                if (link) {
                    const href = link.getAttribute('href');
                    const match = href.match(/id=([^&]+)/);
                    if (match) {
                        dataId = match[1];
                        card.dataset.id = dataId;
                    }
                }
            }
            
            // Se ainda não tem data-id, tenta criar do título
            if (!dataId && card.dataset.title) {
                dataId = normalizeToId(card.dataset.title);
                card.dataset.id = dataId;
            }
            
            // Encontra o container de botões
            const buttonContainer = card.querySelector('.botao-quero-ler');
            if (!buttonContainer) return;
            
            // Se já foi processado, pula
            if (buttonContainer.getAttribute('data-buttons-fixed') === 'true') return;
            
            // Verifica se já tem os botões corretos baseado no modo
            const hasQuerLer = buttonContainer.querySelector('.btn-quer-ler');
            const hasJaLi = buttonContainer.querySelector('.btn-ja-li');
            const hasFavorito = buttonContainer.querySelector('.btn-favorito');
            
            // Se modo 'single', verifica se tem apenas Quero Ler
            if (mode === 'single' && hasQuerLer && !hasJaLi && !hasFavorito) {
                buttonContainer.setAttribute('data-buttons-fixed', 'true');
                return;
            }
            
            // Se modo 'all', verifica se tem todos os três
            if (mode === 'all' && hasQuerLer && hasJaLi && hasFavorito) {
                buttonContainer.setAttribute('data-buttons-fixed', 'true');
                return;
            }
            
            // Limpa e recria os botões
            buttonContainer.innerHTML = '';
            
            // Cria botão Quero Ler (sempre presente)
            const btnQuerLer = document.createElement('button');
            btnQuerLer.className = 'action-btn btn-quer-ler';
            btnQuerLer.textContent = '📖 Quero Ler';
            btnQuerLer.setAttribute('data-library-action', 'querLer');
            buttonContainer.appendChild(btnQuerLer);
            
            // Se modo 'all', adiciona os outros dois botões
            if (mode === 'all') {
                const btnJaLi = document.createElement('button');
                btnJaLi.className = 'action-btn btn-ja-li';
                btnJaLi.textContent = '✅ Já Li';
                btnJaLi.setAttribute('data-library-action', 'jaLi');
                
                const btnFavorito = document.createElement('button');
                btnFavorito.className = 'action-btn btn-favorito';
                btnFavorito.textContent = '⭐ Favorito';
                btnFavorito.setAttribute('data-library-action', 'favoritos');
                
                buttonContainer.appendChild(btnJaLi);
                buttonContainer.appendChild(btnFavorito);
            }
            
            // Marca como processado
            buttonContainer.setAttribute('data-buttons-fixed', 'true');
        });
        
        console.log('✅ Botões de biblioteca corrigidos em', bookItems.length, 'cards');
        
        // Dispara evento para que library-actions-delegated.js possa atualizar estados
        // Aguarda um pouco mais para garantir que library-actions-delegated.js carregou
        const tryRefresh = () => {
            if (window.__libraryActions && window.__libraryActions.refreshAll) {
                window.__libraryActions.refreshAll();
            } else {
                // Se ainda não carregou, tenta novamente
                setTimeout(tryRefresh, 50);
            }
        };
        setTimeout(tryRefresh, 100);
    }
    
    
    // Função helper para normalizar título em ID
    function normalizeToId(str) {
        return String(str || '').trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/\-+/g, '-')
            .replace(/^\-+|\-+$/g, '');
    }
})();
