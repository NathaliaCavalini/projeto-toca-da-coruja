/**
 * Password Visibility Toggle Module
 * Gerencia mostrar/ocultar senha em campos de input
 */

export function setupPasswordVisibilityToggle() {
    // Verificar se está em modo escuro
    function isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }
    
    // Retornar o ícone correto baseado no tipo de input e modo
    function getIconPath(isVisible) {
        if (isVisible) {
            // Quando a senha está visível, mostrar ícone de "não ver"
            return '/imagens/nao-ver-light-mode.png';
        } else {
            // Quando a senha está oculta, mostrar ícone de "ver"
            return '/imagens/ver-light-mode.png';
        }
    }
    
    function getTitle(isVisible) {
        return isVisible ? 'Ocultar Senha' : 'Mostrar Senha';
    }
    
    // Encontrar todos os inputs de senha
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach((input) => {
        // Criar container para o input e o ícone
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.margin = '0.6rem 0';
        
        // Inserir o container antes do input
        input.parentNode.insertBefore(container, input);
        
        // Remover margin do input original já que o container possui
        input.style.margin = '0';
        input.style.width = '100%';
        input.style.paddingRight = '45px';
        
        container.appendChild(input);
        
        // Criar botão de toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle-btn';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.right = '8px';
        toggleBtn.style.background = 'none';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.padding = '0';
        toggleBtn.style.display = 'flex';
        toggleBtn.style.alignItems = 'center';
        toggleBtn.style.justifyContent = 'center';
        toggleBtn.style.zIndex = '10';
        toggleBtn.style.top = '50%';
        toggleBtn.style.transform = 'translateY(-50%)';
        toggleBtn.style.width = '32px';
        toggleBtn.style.height = '32px';
        
        // Criar imagem
        const img = document.createElement('img');
        img.src = getIconPath(false); // Começa com ícone de "ver" (senha oculta)
        img.alt = 'Mostrar Senha';
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.objectFit = 'contain';
        
        toggleBtn.appendChild(img);
        toggleBtn.setAttribute('title', 'Mostrar Senha');
        
        // Adicionar o botão ao container
        container.appendChild(toggleBtn);
        
        // Adicionar evento de clique
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (input.type === 'password') {
                input.type = 'text';
                img.src = getIconPath(true); // Senha visível, mostrar "não ver"
                img.alt = 'Ocultar Senha';
                toggleBtn.setAttribute('title', 'Ocultar Senha');
            } else {
                input.type = 'password';
                img.src = getIconPath(false); // Senha oculta, mostrar "ver"
                img.alt = 'Mostrar Senha';
                toggleBtn.setAttribute('title', 'Mostrar Senha');
            }
        });
    });
    
    // Observar mudanças de tema para atualizar ícones
    const observer = new MutationObserver(() => {
        const allToggles = document.querySelectorAll('.password-toggle-btn');
        allToggles.forEach((btn) => {
            const img = btn.querySelector('img');
            const input = btn.parentNode.querySelector('input[type="password"], input[type="text"]');
            if (img && input) {
                const isVisible = input.type === 'text';
                img.src = getIconPath(isVisible);
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
}

// Chamar automaticamente ao carregar o módulo
setupPasswordVisibilityToggle();
