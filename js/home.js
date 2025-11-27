// home.js — busca de títulos (filtra os .book-item pelo título)

// util: normaliza texto (remove acentos e transforma minúsculas)
function normalizeText(str){
    if(!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
    // BUSCA DE LIVROS
    const searchInput = document.querySelector('#search-input');
    const books = Array.from(document.querySelectorAll('.book-item'));

    if(searchInput){
        function doSearch(){
            const term = normalizeText(searchInput.value.trim());
            if(term === ''){
                books.forEach(b => b.classList.remove('hidden'));
                return;
            }

            books.forEach(book => {
                const dataTitle = book.getAttribute('data-title') || '';
                const titleText = dataTitle || (book.querySelector('.book-title p')?.textContent || '');
                const normalizedTitle = normalizeText(titleText);

                const match = normalizedTitle.includes(term);
                if(match) book.classList.remove('hidden');
                else book.classList.add('hidden');
            });
        }

        searchInput.addEventListener('input', doSearch);
        searchInput.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') {
                searchInput.value = '';
                doSearch();
            }
        });
    }

    // Theme is handled centrally by /js/theme.js

    // ===== GÊNEROS: trocar ícone de livro quando selecionado =====
    try {
        const genreLinks = Array.from(document.querySelectorAll('.menu-list a'));
        const currentFile = window.location.pathname.split('/').filter(Boolean).pop() || '';

        genreLinks.forEach(link => {
            const img = link.querySelector('img');
            if (!img) return;

            // Se o href corresponder ao arquivo atual, mostra o livro aberto
            const href = link.getAttribute('href') || '';
            const hrefFile = href.split('/').filter(Boolean).pop() || '';
            if (hrefFile && currentFile && hrefFile === currentFile) {
                img.src = img.src.replace('livro_fechado', 'livro_aberto');
                link.classList.add('genre-selected');
            }

            // Animação ao clicar antes da navegação: troca icone e faz um pequeno "pop"
            link.addEventListener('click', (ev) => {
                // se é um link que navega pra outra página, animamos antes
                const targetImg = link.querySelector('img');
                if (targetImg) {
                    // troca visual para aberto
                    targetImg.src = targetImg.src.replace('livro_fechado', 'livro_aberto');
                    targetImg.classList.add('icon-animate');
                    // pausa curta para a animação, depois segue para o href normalmente
                    ev.preventDefault();
                    setTimeout(() => {
                        // navegar para o destino
                        window.location.href = link.href;
                    }, 140);
                }
            });
        });
    } catch (e) {
        console.warn('Erro ao inicializar ícones de gênero', e);
    }
});

// ===== Mobile portrait: move .search-form into the hero as first child =====
(() => {
    const SEARCH_MEDIA = '(orientation: portrait) and (max-width: 430px)';
    const mq = window.matchMedia ? window.matchMedia(SEARCH_MEDIA) : null;
    const searchForm = document.querySelector('.search-form');
    const hero = document.querySelector('.hero-section');
    if (!searchForm || !mq || !hero) return;

    let originalParent = null;
    let originalNext = null;
    let moved = false;

    function positionOutside() {
        // place the search centered horizontally and slightly above the hero's top
        const heroRect = hero.getBoundingClientRect();
        const heroTopAbs = heroRect.top + window.scrollY;
        // place the bottom of the search-form 10px above the hero top
        // compute search height (fallback to 35px if not available)
        const searchRect = searchForm.getBoundingClientRect();
        const searchHeight = (searchRect && searchRect.height) ? searchRect.height : 35;
        const desiredTop = heroTopAbs - searchHeight - 13; // 13px gap above the card (increased by 3px)
        // apply inline top so it's absolute relative to document
        searchForm.style.position = 'absolute';
        searchForm.style.top = desiredTop + 'px';
        searchForm.style.left = '50%';
        searchForm.style.transform = 'translateX(-50%)';
    }

    function moveOutsideBody() {
        if (moved) return;
        originalParent = searchForm.parentNode;
        originalNext = searchForm.nextSibling;
        // hide while we move & compute position to avoid flicker/overlay on load
        searchForm.style.visibility = 'hidden';
        document.body.appendChild(searchForm);
        searchForm.classList.add('mobile-search-outside');

        // Try to compute position several times (layout may change while images/fonts load).
        let attempts = 0;
        const maxAttempts = 8;

        function tryPosition() {
            attempts += 1;
            try {
                positionOutside();
            } catch (e) {
                // swallow and retry
            }

            // Verify that the computed top looks reasonable: the element should have a top value
            // and it should not overlap the hero (we check that search's bottom is above hero top).
            const sfRect = searchForm.getBoundingClientRect();
            const heroRectNow = hero.getBoundingClientRect();
            const good = sfRect.height > 0 && (sfRect.bottom <= heroRectNow.top + 6);

            if (good || attempts >= maxAttempts) {
                // reveal after positioned (even if not ideal after max attempts)
                searchForm.style.visibility = '';
                moved = true;
            } else {
                // try again on next frame
                requestAnimationFrame(tryPosition);
            }
        }

        // start attempts on next frame to give the browser a moment to layout
        requestAnimationFrame(tryPosition);
    }

    function restoreOriginal() {
        if (!moved) return;
        if (originalParent) {
            if (originalNext) originalParent.insertBefore(searchForm, originalNext);
            else originalParent.appendChild(searchForm);
        }
        searchForm.classList.remove('mobile-search-outside');
        // clear inline styles we set
        searchForm.style.position = '';
        searchForm.style.top = '';
        searchForm.style.left = '';
        searchForm.style.transform = '';
        searchForm.style.visibility = '';
        moved = false;
    }

    function update() {
        try {
            if (mq.matches) moveOutsideBody();
            else restoreOriginal();
        } catch (e) {
            console.warn('Erro ao reposicionar search-form dentro do hero:', e);
        }
    }

    update();
    try {
        mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
    } catch (e) {
        mq.addListener(update);
    }
    window.addEventListener('resize', () => { if (moved) positionOutside(); else update(); });
    window.addEventListener('orientationchange', () => { if (moved) positionOutside(); else update(); });
    window.addEventListener('scroll', () => { if (moved) positionOutside(); });
    // When the page fully loads (images/fonts), re-run positioning to ensure correctness
    window.addEventListener('load', () => { if (mq.matches) { if (moved) positionOutside(); else moveOutsideBody(); } });
})();

// Theme visuals are initialized by /js/theme.js (imported in HTML)

// ===== Mobile menu open/close (centralized) =====
function initMobileMenu() {
    // Early guard: do not initialize or show the mobile toggle on auth/profile pages.
    // This runs before any checks for `#mobileMenu` so it covers pages that may
    // include the toggle markup but not the mobile panel.
    try {
        const currentFile = window.location.pathname.split('/').filter(Boolean).pop() || '';
        const pageBase = currentFile.split('.')[0];
        const hidePages = ['login', 'cadastro', 'perfil'];
        if (hidePages.includes(pageBase)) {
            // hide possible toggle elements if present and exit early
            const candidates = document.querySelectorAll('.mobile-menu-toggle, .mobile-toggle-box');
            candidates.forEach(el => { try { el.style.display = 'none'; } catch (e) {} });
            return;
        }
    } catch (e) { /* ignore */ }
    const toggle = document.querySelector('.mobile-menu-toggle');
    const panel = document.getElementById('mobileMenu');
    const closeBtn = document.querySelector('.mobile-menu-close');
    if (!toggle || !panel) return;

    // Do not show or initialize the mobile toggle on auth/profile pages
    // (these pages have their own simplified headers and should not show the site menu)
    try {
        const currentFile = window.location.pathname.split('/').filter(Boolean).pop() || '';
        const pageBase = currentFile.split('.')[0]; // handles both 'login' and 'login.html'
        const hidePages = ['login', 'cadastro', 'perfil'];
        if (hidePages.includes(pageBase)) {
            // ensure the toggle element is hidden and any existing mobile toggle box is hidden
            try { toggle.style.display = 'none'; } catch (e) {}
            const existingBox = document.querySelector('.mobile-toggle-box');
            if (existingBox) existingBox.style.display = 'none';
            return;
        }
    } catch (e) { /* ignore errors here and continue initialization */ }

    // Insert avatar and wrap toggle + avatar in a small box on mobile
    (function ensureHeaderAvatar(){
        try {
            const header = document.querySelector('.header');
            if (!header) return;

            // ensure avatar element
            let avatarWrap = header.querySelector('.header-avatar');
            if (!avatarWrap) {
                avatarWrap = document.createElement('div');
                avatarWrap.className = 'header-avatar';

                const img = document.createElement('img');
                img.alt = 'Avatar';
                img.width = 30;
                img.height = 30;
                img.style.borderRadius = '50%';
                img.style.display = 'block';
                img.style.objectFit = 'cover';

                // Helper: set avatar src from #user-info if present, otherwise use default
                function updateAvatarFromUserInfo() {
                    try {
                        const ui = document.getElementById('user-info');
                        if (ui) {
                            const innerImg = ui.querySelector('img');
                            if (innerImg && innerImg.src) {
                                img.src = innerImg.src;
                                return;
                            }
                        }
                    } catch (e) { /* ignore */ }
                    // fallback default image when no profile photo / not logged in
                    img.src = '/imagens/user.png';
                }

                updateAvatarFromUserInfo();

                // Observe #user-info so changes (login/logout or profile photo update)
                // are reflected in the header avatar automatically.
                try {
                    const target = document.getElementById('user-info');
                    if (target) {
                        const mo = new MutationObserver(() => { updateAvatarFromUserInfo(); });
                        mo.observe(target, { childList: true, subtree: true, attributes: true });
                    }
                } catch (e) { /* ignore observer errors */ }

                avatarWrap.appendChild(img);
            }

            // Make avatar clickable: trigger sidebar #user-info click or navigate to login/profile
            try {
                avatarWrap.style.cursor = 'pointer';
                avatarWrap.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const userLink = document.getElementById('user-info');
                    if (userLink) {
                        try { userLink.click(); } catch (e) { if (userLink.href) window.location.href = userLink.href; }
                    } else {
                        // fallback: navigate to login/profile
                        window.location.href = 'login.html';
                    }
                });
            } catch (e) { /* ignore */ }

            // create wrapper box that will contain toggle + avatar
            let box = header.querySelector('.mobile-toggle-box');
            if (!box) {
                box = document.createElement('div');
                box.className = 'mobile-toggle-box';
                // append the box to the end of the header so it remains on the right
                // This avoids order flipping when scripts run in different orders.
                header.appendChild(box);
            }

            // move toggle and avatar into the box
            if (toggle.parentNode !== box) box.appendChild(toggle);
            if (avatarWrap.parentNode !== box) box.appendChild(avatarWrap);

            // Add theme toggle button inside the box (so toggle + avatar + theme fit together)
            let themeBtn = box.querySelector('.icon-btn[title="Modo escuro"]');
            function updateThemeIcons(dark){
                // Keep all theme icon buttons in sync
                const iconBtns = document.querySelectorAll('.icon-btn[title="Modo escuro"]');
                iconBtns.forEach(b => {
                    const img = b.querySelector('img');
                    if (!img) return;
                    img.src = dark ? '/imagens/claro.png' : '/imagens/escuro.png';
                    img.alt = dark ? 'Ícone modo claro' : 'Ícone modo escuro';
                });
            }

            if (!themeBtn) {
                themeBtn = document.createElement('button');
                themeBtn.type = 'button';
                themeBtn.className = 'icon-btn';
                themeBtn.title = 'Modo escuro';
                const img = document.createElement('img');
                img.width = 20;
                img.height = 20;
                // initial icon depends on current theme
                const isDark = document.body.classList.contains('dark-mode') || localStorage.getItem('theme') === 'dark';
                img.src = isDark ? '/imagens/claro.png' : '/imagens/escuro.png';
                img.alt = isDark ? 'Ícone modo claro' : 'Ícone modo escuro';
                themeBtn.appendChild(img);
                box.appendChild(themeBtn);

                // Toggle theme when clicked — keep storage and all icons in sync
                themeBtn.addEventListener('click', () => {
                    const nowDark = document.body.classList.toggle('dark-mode');
                    try { localStorage.setItem('theme', nowDark ? 'dark' : 'light'); } catch(e){}
                    updateThemeIcons(nowDark);
                });
            }

            // control visibility via matchMedia (CSS shows box only on mobile, but keep inline fallback)
            const mq = window.matchMedia('(max-width: 900px)');
            function update() {
                if (mq.matches) {
                    box.style.display = 'flex';
                    avatarWrap.style.display = 'flex';
                } else {
                    box.style.display = '';
                    avatarWrap.style.display = '';
                }
            }
            update();
            try { mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update); } catch(e){}
        } catch (e) { console.warn('avatar init failed', e); }
    })();

    // Copy desktop sidebar icons into the main mobile menu items (so mobile shows same icons)
    // Expose a function that clones sidebar/admin icons into mobile menu items.
    // We call it immediately and again when opening the panel to handle timing races
    // (admin panel scripts may attach icons later or sidebar could be hidden at init).
    function cloneMobileIcons() {
        try {
            const panel = document.getElementById('mobileMenu');
            const mobileItemsNodeList = panel && panel.querySelectorAll('.mobile-menu-list .menu-item');
            if (!mobileItemsNodeList || mobileItemsNodeList.length === 0) return false;
            const mobileItems = Array.from(mobileItemsNodeList);

            let inserted = 0;

            mobileItems.forEach(item => {
                try {
                    // avoid inserting twice or when the item already contains an image
                    // (genre links are cloned including their <img>, so skip to prevent duplication)
                    if (item.querySelector('.mobile-icon-wrap') || item.querySelector('img')) return;

                    const href = item.getAttribute('href') || item.dataset?.href || '';
                    if (!href) return;

                    // try to find matching anchors inside the sidebar, admin-section or top nav
                    let sourceAnchor = document.querySelector(`.sidebar .menu-list a[href="${href}"]`);
                    if (!sourceAnchor) sourceAnchor = document.querySelector(`.sidebar .menu-list a[href$="${href}"]`);
                    // fallback: look inside #admin-section (some admin pages render icons there)
                    if (!sourceAnchor) sourceAnchor = document.querySelector(`#admin-section .menu-list a[href="${href}"]`);
                    if (!sourceAnchor) sourceAnchor = document.querySelector(`#admin-section .menu-list a[href$="${href}"]`);
                    // also check top navigation (nav-menu) where the main action icons live
                    if (!sourceAnchor) sourceAnchor = document.querySelector(`.nav-menu a[href="${href}"]`);
                    if (!sourceAnchor) sourceAnchor = document.querySelector(`.nav-menu a[href$="${href}"]`);
                    if (!sourceAnchor) return;

                    const imgs = Array.from(sourceAnchor.querySelectorAll('img'));
                    if (imgs.length === 0) return;

                    const wrapper = document.createElement('span');
                    wrapper.className = 'mobile-icon-wrap';
                    wrapper.style.display = 'inline-flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.marginRight = '10px';

                    imgs.forEach(srcImg => {
                        const imgClone = srcImg.cloneNode(true);
                        imgClone.removeAttribute('width');
                        imgClone.removeAttribute('height');
                        imgClone.style.width = imgClone.style.width || '20px';
                        imgClone.style.height = imgClone.style.height || '20px';
                        // Do NOT force display — let existing .--light / .--dark rules control visibility.
                        // Invert the light/dark suffix on the cloned image classes so the mobile
                        // menu shows the opposite variant per your request.
                        try {
                            // Keep the clone's classes unchanged (do not invert suffixes).
                            // The previous implementation inverted `--light`/`--dark` but
                            // you requested to invert that behavior — so we preserve
                            // original classes here to match desktop variants.
                        } catch (e) { /* ignore class manipulation errors */ }
                        wrapper.appendChild(imgClone);
                    });

                    item.insertBefore(wrapper, item.firstChild);
                    inserted += 1;
                } catch (e) { /* ignore per-item errors */ }
            });

            return inserted > 0;
        } catch (e) {
            return false;
        }
    }

    // initial attempt
    cloneMobileIcons();
    // retry after load and a small delay in case admin scripts run later
    window.addEventListener('load', () => { cloneMobileIcons(); });
    setTimeout(() => { cloneMobileIcons(); }, 300);

    // Hide admin-related menu items on mobile for non-admin users
    function isCurrentUserAdmin() {
        try {
            const fb = window.__fb;
            if (!fb || !fb.auth) return false;
            const user = fb.auth.currentUser;
            if (!user || !user.email) return false;
            return user.email === 'tatacavalini@gmail.com';
        } catch (e) { return false; }
    }

    function hideAdminItemsIfNotAdmin() {
        try {
            const admin = isCurrentUserAdmin();
            // find admin links inside the mobile panel and hide them if user is not admin
            const panel = document.getElementById('mobileMenu');
            if (!panel) return;
            const selectors = ['.admin-tab', '.admin-link', 'a[href*="admin.html"]', 'a[href*="/admin"]'];
            selectors.forEach(sel => {
                const els = panel.querySelectorAll(sel);
                els.forEach(el => {
                    if (!admin) el.style.display = 'none';
                    else el.style.display = '';
                });
            });
        } catch (e) { /* ignore */ }
    }

    // run check now and also when menu opens
    try { hideAdminItemsIfNotAdmin(); } catch (e) {}

    // Keep mobile icons in sync with theme changes (body class changes).
    try {
        const bodyObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'class') {
                    try { if (typeof cloneMobileIcons === 'function') cloneMobileIcons(); } catch (e) { /* ignore */ }
                }
            }
        });
        bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) { /* ignore observer failures on older browsers */ }

    const openMenu = () => {
        try { if (typeof cloneMobileIcons === 'function') cloneMobileIcons(); } catch (e) { /* ignore */ }
        try { if (typeof hideAdminItemsIfNotAdmin === 'function') hideAdminItemsIfNotAdmin(); } catch (e) { /* ignore */ }
        panel.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        // mark body so moved search can be hidden via CSS while the menu is open
        document.body.classList.add('mobile-menu-open');
    };

    const closeMenu = () => {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.body.classList.remove('mobile-menu-open');
    };

    toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    panel.addEventListener('click', (e) => { if (e.target === panel) closeMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) closeMenu(); });

    // "Voltar home" buttons inside the mobile panel should close the panel and navigate home
    try {
        const voltarButtons = Array.from(document.querySelectorAll('.voltar-home'));
        voltarButtons.forEach(btn => {
            btn.addEventListener('click', (ev) => {
                try { closeMenu(); } catch (e) { /* ignore */ }
                // navigate to home (relative path used across pages)
                window.location.href = 'home.html';
            });
        });
    } catch (e) {
        console.warn('Erro ao inicializar botão voltar-home no painel móvel', e);
    }

    // Initialize mobile "Gêneros" drawer inside the mobile menu (clones sidebar genres)
    (function initMobileGenresDrawer() {
        try {
            const panel = document.getElementById('mobileMenu');
            const mobileList = panel && panel.querySelector('.mobile-menu-list');
            if (!panel || !mobileList) return;

            // Find the sidebar genres list (menu-list) and clone links
            const sidebarGenres = document.querySelector('.sidebar .menu-section .menu-list');
            if (!sidebarGenres) return;

            // Create the drawer header/button
            const drawerHeader = document.createElement('button');
            drawerHeader.type = 'button';
            drawerHeader.className = 'mobile-genre-toggle';
            drawerHeader.setAttribute('aria-expanded', 'false');
            drawerHeader.innerHTML = '<span>Gêneros</span> <span class="chev">▸</span>';

            // Create container for genre links
            const drawerList = document.createElement('div');
            drawerList.className = 'mobile-genre-list';

            // Clone each link into the drawerList
            Array.from(sidebarGenres.querySelectorAll('a')).forEach(a => {
                // For admin-tab links (tabs inside the admin sidebar) the original
                // elements have event listeners attached by `js/admin.js`.
                // Cloning them would not copy those listeners, so we wire the
                // cloned element to trigger the original tab's click instead.
                const isAdminTab = a.classList.contains('admin-tab') || a.classList.contains('admin-link');
                const link = a.cloneNode(true);
                link.classList.add('menu-item');

                if (isAdminTab) {
                    link.addEventListener('click', (ev) => {
                        ev.preventDefault();
                        const tabName = a.dataset?.tab;

                        if (tabName) {
                            // Deactivate existing admin tabs visually
                            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));

                            // Try to activate the original tab element (visual state)
                            const original = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
                            if (original) original.classList.add('active');

                            // Hide hero and ensure admin container is shown (same behavior as admin.js)
                            const heroAdmin = document.querySelector('.hero-admin');
                            const adminContainer = document.querySelector('.admin-container');
                            if (heroAdmin) heroAdmin.classList.add('hidden');
                            if (adminContainer) adminContainer.classList.add('show');

                            // Hide all admin tab content panes and show the requested one
                            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
                            const pane = document.getElementById(`tab-${tabName}`);
                            if (pane) pane.classList.remove('hidden');

                            // Close mobile menu
                            try { closeMenu(); } catch (e) { /* ignore */ }
                            return;
                        }

                        // Fallback: navigate/call original click if no data-tab
                        try { a.click(); } catch (e) { if (a.href) window.location.href = a.href; }
                        try { closeMenu(); } catch (e) { /* ignore */ }
                    });
                }

                drawerList.appendChild(link);
            });

            // Insert at the top of the mobile menu list
            mobileList.insertBefore(drawerHeader, mobileList.firstChild);
            mobileList.insertBefore(drawerList, drawerHeader.nextSibling);

            // Toggle behavior
            drawerHeader.addEventListener('click', () => {
                const open = drawerHeader.getAttribute('aria-expanded') === 'true';
                drawerHeader.setAttribute('aria-expanded', String(!open));
                drawerList.classList.toggle('open', !open);
                const chev = drawerHeader.querySelector('.chev');
                if (chev) chev.textContent = !open ? '▾' : '▸';
            });

            // Close drawer when navigating via link
            drawerList.addEventListener('click', (ev) => {
                const target = ev.target.closest('a');
                if (!target) return;
                try { closeMenu(); } catch (e) {}
            });
        } catch (e) {
            console.warn('Erro ao inicializar gaveta de gêneros no menu móvel', e);
        }
    })();
}

// Ensure initialization runs even if this script is loaded after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// ===== Mobile portrait: transfer `header.logo` into the top mobile header =====
(() => {
    const LOGO_MEDIA = '(orientation: portrait) and (max-width: 430px)';
    const mq = window.matchMedia ? window.matchMedia(LOGO_MEDIA) : null;
    const logoEl = document.querySelector('aside.sidebar header.logo') || document.querySelector('header.logo');
    const headerContainer = document.querySelector('.header');
    const toggleBtn = headerContainer && headerContainer.querySelector('.mobile-menu-toggle');
    if (!mq || !logoEl || !headerContainer || !toggleBtn) return;

    let originalParent = logoEl.parentNode;
    let originalNext = logoEl.nextSibling;
    let moved = false;

    function moveToHeader() {
        if (moved) return;
        // If we have the boxed toggle, insert the logo AFTER the box so they swap places
        const box = headerContainer.querySelector('.mobile-toggle-box');
        if (box && box.parentNode === headerContainer) {
            // insert BEFORE the box so the logo appears to the left of the toggle box
            headerContainer.insertBefore(logoEl, box);
        } else {
            headerContainer.insertBefore(logoEl, toggleBtn);
        }
        moved = true;
    }

    function restoreLogo() {
        if (!moved) return;
        if (originalParent) {
            if (originalNext) originalParent.insertBefore(logoEl, originalNext);
            else originalParent.appendChild(logoEl);
        }
        moved = false;
    }

    function update() {
        try {
            if (mq.matches) moveToHeader();
            else restoreLogo();
        } catch (e) {
            console.warn('Erro ao transferir header.logo para header mobile:', e);
        }
    }

    update();
    try { mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update); } catch (e) { mq.addListener(update); }
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
})();
