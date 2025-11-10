// Centralized theme manager — ensures theme is applied immediately and the
// dark-mode icon is kept in sync. This runs as a module when imported or
// when included as <script type="module" src="/js/theme.js"></script>.

const body = document.body;

function isSavedDark() {
    return localStorage.getItem('theme') === 'dark';
}

function applyTheme(dark) {
    if (dark) body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');
    updateIcons(dark);
}

function updateIcons(dark) {
    // Invert logic: show the icon for the *opposite* mode
    // (so user can click to toggle to that mode).
    // If dark mode is ON, show the light icon (to switch to light).
    // If dark mode is OFF, show the dark icon (to switch to dark).
    const iconPath = dark ? '/imagens/claro.png' : '/imagens/escuro.png';
    const iconAlt = dark ? 'Ícone modo claro' : 'Ícone modo escuro';

    const btn = document.querySelector('.icon-btn[title="Modo escuro"]');
    if (!btn) return;
    const img = btn.querySelector('img');
    if (!img) return;
    img.src = iconPath;
    img.alt = iconAlt;
}

function initTheme() {
    // Apply saved preference immediately (synchronous) so any other scripts
    // that run later see the correct body.classList.
    const dark = isSavedDark();
    applyTheme(dark);

    // Attach a delegated click handler to keep logic in one place.
    const btn = document.querySelector('.icon-btn[title="Modo escuro"]');
    if (btn) {
        btn.addEventListener('click', () => {
            const nowDark = body.classList.toggle('dark-mode');
            localStorage.setItem('theme', nowDark ? 'dark' : 'light');
            updateIcons(nowDark);
        });
    }
}

// Run on import
initTheme();

export { initTheme, applyTheme };
