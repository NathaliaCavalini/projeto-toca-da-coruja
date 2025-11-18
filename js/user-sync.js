// user-sync.js - Sincroniza usuários entre Auth e users-admin-control
// Este arquivo garante que todo usuário novo tenha um documento em users-admin-control

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

console.log('🔄 user-sync.js carregado');

/**
 * Sincroniza usuário autenticado com a coleção users-admin-control
 * Garante que todo usuário autenticado tenha um documento admin
 */
export async function syncUserToAdminControl() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('❌ Nenhum usuário autenticado para sincronizar');
                resolve(false);
                return;
            }

            try {
                const email = user.email.toLowerCase(); // Normalize email
                console.log(`🔄 Sincronizando usuário: ${email}`);

                // Verificar se já existe documento
                const adminDocRef = doc(db, 'users-admin-control', email);
                const adminDocSnap = await getDoc(adminDocRef);

                if (adminDocSnap.exists()) {
                    console.log(`✅ Documento já existe para: ${email}`);
                    console.log(`   Status atual: ${adminDocSnap.data().status}`);
                } else {
                    console.log(`📝 Criando novo documento admin para: ${email}`);
                    
                    // Criar documento com status ativo (padrão)
                    await setDoc(adminDocRef, {
                        email: email,
                        status: 'ativo',
                        criadoEm: new Date().toISOString(),
                        displayName: user.displayName || 'Usuário',
                        uid: user.uid,
                        sinronizadoEm: new Date().toISOString()
                    });

                    console.log(`✅ Documento admin criado com sucesso!`);
                    console.log(`   Email: ${email}`);
                    console.log(`   Status: ativo`);
                }

                resolve(true);
            } catch (err) {
                console.error('❌ Erro ao sincronizar usuário:', err);
                resolve(false);
            }
        });
    });
}

/**
 * Atualiza status de um usuário em users-admin-control
 * @param {string} email - Email do usuário
 * @param {string} status - Status: 'ativo', 'suspenso', 'banido'
 */
export async function updateUserStatus(email, status) {
    try {
        const normalizedEmail = email.toLowerCase();
        console.log(`🔐 Atualizando status de ${normalizedEmail} para: ${status}`);

        const userDocRef = doc(db, 'users-admin-control', normalizedEmail);
        
        // Primeiro, verificar se documento existe
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
            console.warn(`⚠️ Documento não existe, criando...`);
            await setDoc(userDocRef, {
                email: normalizedEmail,
                status: status,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            });
        } else {
            // Atualizar documento existente
            await setDoc(userDocRef, {
                ...docSnap.data(),
                status: status,
                atualizadoEm: new Date().toISOString()
            });
        }

        console.log(`✅ Status atualizado com sucesso!`);
        return true;
    } catch (err) {
        console.error('❌ Erro ao atualizar status:', err);
        return false;
    }
}

/**
 * Sincroniza automaticamente quando o usuário faz login
 */
export function initializeUserSync() {
    console.log('🚀 Inicializando sincronização automática de usuários');
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(`👤 Usuário autenticado: ${user.email}`);
            syncUserToAdminControl().then((success) => {
                if (success) {
                    console.log('✅ Sincronização completada');
                } else {
                    console.warn('⚠️ Sincronização falhou');
                }
            });
        } else {
            console.log('👋 Usuário desautenticado');
        }
    });
}

// Auto-inicializar sincronização quando este arquivo for importado
initializeUserSync();
