// migrate-descriptions.js
// Migração única: trunca descrições longas salvas nas listas para ~70 caracteres
// Mantém compatibilidade com a renderização atual (mini-descrições sob os títulos)

(function() {
    console.log('🔄 Iniciando migração de descrições...');

    function makeShortDesc(text, max = 70) {
        const t = String(text || '').trim();
        if (!t) return '';
        if (t.length <= max) return t;
        const slice = t.slice(0, max);
        const lastSpace = slice.lastIndexOf(' ');
        return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim() + '…';
    }

    function migrateList(storageKey) {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return 0;

            const items = JSON.parse(raw);
            if (!Array.isArray(items) || items.length === 0) return 0;

            let changed = 0;
            items.forEach(item => {
                if (item.desc && item.desc.length > 70) {
                    item.desc = makeShortDesc(item.desc);
                    changed++;
                }
            });

            if (changed > 0) {
                localStorage.setItem(storageKey, JSON.stringify(items));
                console.log(`✅ ${storageKey}: ${changed} descrições truncadas`);
            }

            return changed;
        } catch (e) {
            console.error(`❌ Erro ao migrar ${storageKey}:`, e);
            return 0;
        }
    }

    // Encontra todas as chaves de lista no localStorage (user-* e guest)
    const listTypes = ['querLer', 'jaLi', 'favoritos'];
    const allKeys = Object.keys(localStorage);
    let totalChanged = 0;

    allKeys.forEach(key => {
        // Migra listas com padrão user-{uid}::listName ou guest::listName
        listTypes.forEach(listType => {
            if (key.endsWith(`::${listType}`)) {
                totalChanged += migrateList(key);
            }
        });
    });

    if (totalChanged > 0) {
        console.log(`🎉 Migração concluída: ${totalChanged} descrições foram ajustadas`);
        alert(`✅ Migração concluída!\n${totalChanged} descrições foram ajustadas para formato curto.`);
    } else {
        console.log('ℹ️ Nenhuma descrição precisou ser migrada');
    }
})();
