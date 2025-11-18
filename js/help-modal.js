// Help Modal System
import { auth } from '../js/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Criar elementos do modal
function createHelpModal() {
  const modal = document.createElement('div');
  modal.id = 'help-modal';
  modal.className = 'help-modal-overlay';
  modal.innerHTML = `
    <div class="help-modal-content">
      <button class="help-modal-close" aria-label="Fechar">&times;</button>
      <div class="help-modal-body">
        <!-- Conteúdo será preenchido dinamicamente -->
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Adicionar CSS dinâmico
function addHelpModalStyles() {
  if (document.getElementById('help-modal-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'help-modal-styles';
  style.textContent = `
    .help-modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }

    .help-modal-overlay.active {
      display: flex;
      animation: fadeIn 0.3s ease-out;
    }

    .help-modal-content {
      background: linear-gradient(135deg, 
        #f5e7d7 0%,
        rgba(245, 231, 215, 0.95) 50%,
        rgba(230, 201, 168, 0.8) 100%
      );
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      padding: 32px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease-out;
      border-top: 3px solid var(--color-primary, #c5946c);
    }

    .help-modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .help-modal-close:hover {
      color: #333;
    }

    .help-modal-body {
      margin-top: 8px;
    }

    .help-modal-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-accent, #8b694d);
      margin-bottom: 16px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    }

    .help-modal-message {
      font-size: 1rem;
      color: #4a3728;
      line-height: 1.6;
      margin-bottom: 24px;
      font-weight: 500;
    }

    .help-modal-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--color-primary, #c5946c), var(--color-accent, #8b694d));
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 12px;
      margin-right: 12px;
    }

    .help-modal-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(197, 148, 108, 0.3);
    }

    .help-modal-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .help-modal-link {
      display: flex;
      align-items: center;
      padding: 12px;
      padding-left: 36px;
      background: linear-gradient(135deg, rgba(197, 148, 108, 0.1), rgba(139, 105, 77, 0.08));
      border-radius: 8px;
      text-decoration: none;
      color: #000 !important;
      font-weight: 600;
      transition: all 0.2s;
      position: relative;
      border: 1px solid rgba(197, 148, 108, 0.2);
    }

    .help-modal-link:hover {
      background: linear-gradient(135deg, rgba(197, 148, 108, 0.2), rgba(139, 105, 77, 0.15));
      border-color: rgba(197, 148, 108, 0.4);
      transform: translateX(4px);
    }

    .help-modal-link::before {
      content: '';
      position: absolute;
      left: 8px;
      width: 20px;
      height: 20px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }

    .help-modal-link[href*="mailto:"]::before,
    .help-modal-link-email::before {
      background-image: url('/imagens/e-mail-light-mode.png');
    }

    .help-modal-link[href*="whatsapp"]::before,
    .help-modal-link-whatsapp::before {
      background-image: url('/imagens/whatsapp-light-mode.png');
    }

    body.dark-mode .help-modal-link[href*="mailto:"]::before,
    body.dark-mode .help-modal-link-email::before {
      background-image: url('/imagens/e-mail-dark-mode.png');
    }

    body.dark-mode .help-modal-link[href*="whatsapp"]::before,
    body.dark-mode .help-modal-link-whatsapp::before {
      background-image: url('/imagens/whatsapp-dark-mode.png');
    }

    body.dark-mode .help-modal-content {
      background: linear-gradient(135deg, 
        #4A2F20 0%,
        rgba(61, 36, 24, 0.9) 50%,
        rgba(45, 28, 18, 0.8) 100%
      );
      color: rgba(255, 255, 255, 0.9);
      border-top: 3px solid #FFD4A3;
    }

    body.dark-mode .help-modal-title {
      color: #FFE6CC;
      font-weight: 800;
    }

    body.dark-mode .help-modal-message {
      color: rgba(255, 255, 255, 0.85);
    }

    body.dark-mode .help-modal-close {
      color: rgba(255, 255, 255, 0.7);
    }

    body.dark-mode .help-modal-close:hover {
      color: #FFE6CC;
    }

    body.dark-mode .help-modal-button {
      background: linear-gradient(135deg, #FFD4A3, #FFB366);
      color: #4A2F20;
      font-weight: 700;
    }

    body.dark-mode .help-modal-button:hover {
      box-shadow: 0 8px 16px rgba(255, 212, 163, 0.3);
    }

    body.dark-mode .help-modal-link {
      background: rgba(255, 212, 163, 0.1);
      color: #fff !important;
      border: 1px solid rgba(255, 212, 163, 0.2);
    }

    body.dark-mode .help-modal-link:hover {
      background: rgba(255, 212, 163, 0.15);
      border-color: rgba(255, 212, 163, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// Inicializar sistema de ajuda
function initHelpModal() {
  addHelpModalStyles();
  const modal = createHelpModal();
  
  // Encontrar botões de ajuda
  const helpButtons = document.querySelectorAll('.icon-btn');
  const ajudaButton = Array.from(helpButtons).find(btn => {
    const img = btn.querySelector('img[alt="Ícone ajuda"]');
    return img && (img.src.includes('ajuda.png') || img.src.includes('ajuda-light-mode.png') || img.src.includes('ajuda-dark-mode.png'));
  });

  if (!ajudaButton) return;

  // Adicionar ID ao botão
  ajudaButton.id = 'help-button';

  // Detectar se é admin
  onAuthStateChanged(auth, (user) => {
    const isAdmin = user && user.email === 'tatacavalini@gmail.com';
    
    ajudaButton.addEventListener('click', () => {
      const body = modal.querySelector('.help-modal-body');
      
      if (isAdmin) {
        body.innerHTML = `
          <h2 class="help-modal-title">🔧 Suporte Técnico</h2>
          <p class="help-modal-message">Precisa consertar algum bug ou quer modificar algo no sistema? Entre em contato.</p>
          <div class="help-modal-links">
            <a href="mailto:cavalini236@gmail.com" class="help-modal-link help-modal-link-email">Email: cavalini236@gmail.com</a>
            <a href="https://wa.me/5561996052015" target="_blank" rel="noopener noreferrer" class="help-modal-link help-modal-link-whatsapp">WhatsApp: 61 9 9605-2015</a>
          </div>
        `;
      } else {
        body.innerHTML = `
          <h2 class="help-modal-title">💬 Precisando de Ajuda?</h2>
          <p class="help-modal-message">Encontrou algum erro ou tem dúvidas? Estamos aqui para ajudar!</p>
          <a href="pages/contato.html" class="help-modal-button">Entre em Contato</a>
        `;
      }
      
      modal.classList.add('active');
    });
  });

  // Fechar modal
  const closeBtn = modal.querySelector('.help-modal-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  // Atualizar ícone de ajuda ao trocar de tema
  function updateHelpIcon() {
    const ajudaButton = document.querySelector('.icon-btn img[alt="Ícone ajuda"]');
    if (ajudaButton) {
      const currentSrc = ajudaButton.src;
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      // Detectar o caminho base
      let basePath = '../imagens/';
      if (currentSrc.includes('/imagens/')) {
        // URL absoluta com /
        basePath = '/imagens/';
      } else if (currentSrc.includes('imagens/') && !currentSrc.includes('../')) {
        // Caminho relativo direto (reviews.html)
        basePath = 'imagens/';
      }
      
      const newSrc = basePath + (isDarkMode ? 'ajuda-dark-mode.png' : 'ajuda-light-mode.png');
      ajudaButton.src = newSrc;
    }
  }

  // Atualizar ícones ao trocar de tema
  const themeToggleBtn = document.querySelector('.icon-btn:first-of-type');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      setTimeout(() => {
        // Forçar re-render dos ícones
        const links = modal.querySelectorAll('.help-modal-link');
        links.forEach(link => {
          link.style.backgroundImage = 'none';
          if (link.href.includes('mailto:')) {
            if (document.body.classList.contains('dark-mode')) {
              link.style.backgroundImage = "url('/imagens/e-mail-dark-mode.png')";
            } else {
              link.style.backgroundImage = "url('/imagens/e-mail-light-mode.png')";
            }
          } else if (link.href.includes('whatsapp')) {
            if (document.body.classList.contains('dark-mode')) {
              link.style.backgroundImage = "url('/imagens/whatsapp-dark-mode.png')";
            } else {
              link.style.backgroundImage = "url('/imagens/whatsapp-light-mode.png')";
            }
          }
        });
        // Atualizar ícone de ajuda também
        updateHelpIcon();
      }, 100);
    });
  }

  // Atualizar ícone ao inicializar
  updateHelpIcon();

  // Observar mudanças no tema
  const observer = new MutationObserver(() => {
    updateHelpIcon();
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHelpModal);
} else {
  initHelpModal();
}
