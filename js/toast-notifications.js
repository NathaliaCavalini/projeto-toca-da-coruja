// toast-notifications.js
// Sistema simples de notificações toast para feedback de ações

(function() {
    'use strict';
    
    // Cria container de toasts se não existir
    function ensureToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    // Mostra toast com mensagem
    function showToast(message, type = 'success', duration = 3000) {
        const container = ensureToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = getIconForType(type);
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
        
        container.appendChild(toast);
        
        // Anima entrada
        setTimeout(() => toast.classList.add('toast-show'), 10);
        
        // Remove após duração
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    function getIconForType(type) {
        const icons = {
            'success': '✓',
            'error': '✕',
            'info': 'ℹ',
            'warning': '⚠'
        };
        return icons[type] || icons.info;
    }
    
    // Exporta globalmente
    window.showToast = showToast;
})();
