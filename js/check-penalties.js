// check-penalties.js - Sistema de verificação de penalidades para usuários
import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

console.log('📋 check-penalties.js carregado');

// Cache de status
let statusCache = new Map();
let cacheTimestamp = new Map();
const CACHE_DURATION = 5000; // 5 segundos

// Tipos de penalidades
export const PENALTIES = {
    NONE: 'ativo',
    SUSPENDED: 'suspenso',
    BANNED: 'banido'
};

// Buscar status do usuário do Firebase
async function fetchUserStatus(email) {
    if (!email) {
        console.warn('⚠️ Email não fornecido');
        return PENALTIES.NONE;
    }

    try {
        // Verificar cache
        if (statusCache.has(email)) {
            const timestamp = cacheTimestamp.get(email);
            if (Date.now() - timestamp < CACHE_DURATION) {
                const cached = statusCache.get(email);
                console.log(`💾 Status em cache para ${email}: ${cached}`);
                return cached;
            }
        }

        // Buscar do Firebase - tentar AMBAS as coleções
        console.log(`📥 Buscando status de ${email}...`);
        
        // Tentar primeira na coleção users-admin-control
        const userStatusRef = doc(db, 'users-admin-control', email);
        let userStatusSnap = await getDoc(userStatusRef);

        let status = PENALTIES.NONE;

        if (userStatusSnap.exists()) {
            const data = userStatusSnap.data();
            console.log(`✅ Documento encontrado em users-admin-control:`, data);
            status = data.status || PENALTIES.NONE;
        } else {
            console.warn(`⚠️ Não encontrado em users-admin-control`);
            
            // Tentar alternativa: buscar por email na coleção 'users'
            console.log(`📥 Tentando buscar em coleção "users"...`);
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const data = userDoc.data();
                console.log(`✅ Documento encontrado em "users":`, data);
                status = data.status || PENALTIES.NONE;
            } else {
                console.log(`ℹ️ Nenhum documento encontrado - usuário ativo por padrão`);
                status = PENALTIES.NONE;
            }
        }
        
        // Guardar no cache
        statusCache.set(email, status);
        cacheTimestamp.set(email, Date.now());

        console.log(`✅ Status definido para: ${status}`);
        return status;
    } catch (err) {
        console.error(`❌ Erro ao buscar status:`, err);
        return PENALTIES.NONE;
    }
}

// Verificar penalidade usando onAuthStateChanged (mais confiável)
export function checkUserPenalty() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                console.log('🔍 checkUserPenalty - onAuthStateChanged acionado');
                console.log('  Usuário:', user ? user.email : 'nenhum');

                if (!user) {
                    console.log('ℹ️ Nenhum usuário autenticado');
                    unsubscribe(); // Para de ouvir
                    resolve({
                        status: PENALTIES.NONE,
                        isBanned: false,
                        isSuspended: false,
                        isActive: true,
                        email: null,
                        displayName: null,
                        uid: null
                    });
                    return;
                }

                const normalizedEmail = user.email.toLowerCase();
                console.log(`🔍 Verificando status de ${normalizedEmail}...`);
                const status = await fetchUserStatus(normalizedEmail);

                const result = {
                    status: status,
                    isBanned: status === PENALTIES.BANNED,
                    isSuspended: status === PENALTIES.SUSPENDED,
                    isActive: status === PENALTIES.NONE,
                    email: normalizedEmail,
                    displayName: user.displayName || 'Usuário',
                    uid: user.uid
                };

                console.log(`📊 Resultado:`, {
                    email: result.email,
                    status: result.status,
                    isBanned: result.isBanned,
                    isSuspended: result.isSuspended,
                    isActive: result.isActive
                });

                unsubscribe(); // Para de ouvir
                resolve(result);
            } catch (err) {
                console.error('❌ Erro em checkUserPenalty:', err);
                unsubscribe();
                resolve({
                    status: PENALTIES.NONE,
                    isBanned: false,
                    isSuspended: false,
                    isActive: true,
                    email: null,
                    displayName: null,
                    uid: null
                });
            }
        });
    });
}

// Mostrar aviso de penalidade
export function showPenaltyWarning(penalty) {
    if (penalty.isActive) {
        console.log('✅ Usuário ativo - sem aviso de penalidade');
        return;
    }

    console.log('🚨 Mostrando aviso de penalidade:', penalty.status);

    // Remover aviso antigo se existir
    const existing = document.getElementById('penalty-warning');
    if (existing) existing.remove();

    const warningDiv = document.createElement('div');
    warningDiv.id = 'penalty-warning';
    warningDiv.style.cssText = `
        background: ${penalty.isBanned ? '#F44336' : '#FFC107'};
        color: white;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        position: relative;
    `;

    const message = penalty.isBanned
        ? '🚫 Sua conta foi BANIDA. Você não pode mais realizar ações na plataforma.'
        : '⏸️ Sua conta está SUSPENSA. Você não pode escrever/editar reviews.';

    warningDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">✕</button>
    `;

    // Inserir no topo da página
    const mainContent = document.querySelector('main') || document.querySelector('.container') || document.body;
    mainContent.insertBefore(warningDiv, mainContent.firstChild);
}

// Bloquear ação com penalidade
export function blockActionIfPenalized(penalty, actionType) {
    console.log(`\n🛑 BLOQUEADOR ACIONADO:`);
    console.log(`   ├─ Email do usuário: ${penalty.email}`);
    console.log(`   ├─ Status no Firebase: "${penalty.status}"`);
    console.log(`   ├─ Tipo de ação: ${actionType}`);
    console.log(`   ├─ isActive: ${penalty.isActive}`);
    console.log(`   ├─ isBanned: ${penalty.isBanned}`);
    console.log(`   ├─ isSuspended: ${penalty.isSuspended}`);
    
    if (penalty.isActive) {
        console.log(`   ✅ RESULTADO: Usuário ativo - ação PERMITIDA`);
        return true;
    }

    if (penalty.isBanned) {
        console.log(`   ❌ RESULTADO: BLOQUEADO - Usuário banido!`);
        console.log(`   📢 Mostrando alert ao usuário...`);
        alert('🚫 Sua conta foi BANIDA. Você não pode realizar esta ação.');
        return false;
    }

    if (penalty.isSuspended) {
        const blockedActions = ['write_review', 'edit_review', 'add_favorite', 'mark_as_read', 'mark_as_want'];
        const isBlocked = blockedActions.includes(actionType);
        
        if (isBlocked) {
            console.log(`   ⏸️ RESULTADO: BLOQUEADO - Usuário suspenso + ação: ${actionType}`);
            console.log(`   📢 Mostrando alert ao usuário...`);
            alert('⏸️ Sua conta está SUSPENSA. Você não pode escrever ou editar reviews neste momento.');
            return false;
        }
        
        console.log(`   ✅ RESULTADO: Ação PERMITIDA (suspenso mas ação não bloqueada: ${actionType})`);
        return true;
    }

    console.log(`   ✅ RESULTADO: Sem penalidades - ação PERMITIDA`);
    return true;
}

// Invalidar cache (usado quando admin muda status)
export function invalidateCache(email) {
    console.log(`🗑️ Invalidando cache de ${email}`);
    statusCache.delete(email);
    cacheTimestamp.delete(email);
}

console.log('✅ Módulo de penalidades pronto para uso');
