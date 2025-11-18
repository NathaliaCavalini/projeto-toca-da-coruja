// admin-users.js - Gerenciamento de usuários com integração Firestore
import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { updateUserStatus as syncUpdateUserStatus } from './user-sync.js';

console.log('📦 admin-users.js carregado');

// Buscar usuários reais do Firestore
async function fetchRealUsers() {
    try {
        console.log('📥 Buscando usuários reais do Firestore...');
        const users = new Map();
        
        // Buscar da collection 'usuarios' (onde cadastro.js salva)
        try {
            console.log('  📥 Buscando de "usuarios" collection...');
            const usuariosRef = collection(db, 'usuarios');
            const snapshot = await getDocs(usuariosRef);
            
            snapshot.forEach(docSnap => {
                const { email, nome, displayName, criadoEm, createdAt, fotoURL, photoURL } = docSnap.data();
                const userEmail = email ? email.toLowerCase() : null;
                
                if (userEmail) {
                    users.set(userEmail, {
                        email: userEmail,
                        displayName: nome || displayName || 'Sem nome',
                        createdAt: criadoEm || createdAt,
                        photoURL: fotoURL || photoURL || null,
                        uid: docSnap.id,
                        source: 'usuarios'
                    });
                }
            });
            
            console.log(`    ✅ ${snapshot.size} usuários encontrados em "usuarios"`);
        } catch (err) {
            console.warn('    ⚠️ Erro ao buscar "usuarios":', err.message);
        }
        
        // Buscar da collection 'users' também
        try {
            console.log('  📥 Buscando de "users" collection...');
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            
            snapshot.forEach(docSnap => {
                const { email, displayName, name, createdAt, photoURL } = docSnap.data();
                const userEmail = (email || docSnap.id).toLowerCase();
                
                if (!users.has(userEmail)) {
                    users.set(userEmail, {
                        email: userEmail,
                        displayName: displayName || name || 'Sem nome',
                        createdAt: createdAt,
                        photoURL: photoURL || null,
                        source: 'users'
                    });
                }
            });
            
            console.log(`    ✅ Verificada "users" collection`);
        } catch (err) {
            console.warn('    ⚠️ Erro ao buscar "users":', err.message);
        }
        
        console.log(`✅ Total: ${users.size} usuários encontrados`);
        
        if (users.size === 0) {
            console.warn('⚠️ Nenhum usuário encontrado em nenhuma collection');
        }
        
        return users;
    } catch (err) {
        console.error('❌ Erro ao buscar usuários:', err.message);
        return new Map();
    }
}

// Buscar status de controle
async function fetchUserStatus() {
    try {
        console.log('📥 Buscando status dos usuários...');
        const statusRef = collection(db, 'users-admin-control');
        const snapshot = await getDocs(statusRef);
        
        const statuses = new Map();
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const email = docSnap.id.toLowerCase();
            statuses.set(email, data.status || 'ativo');
        });
        
        console.log(`✅ Status de ${statuses.size} usuários carregados`);
        return statuses;
    } catch (err) {
        console.warn('⚠️ Aviso ao buscar status:', err.message);
        return new Map();
    }
}

// Atualizar status do usuário
async function updateUserStatus(email, status) {
    try {
        const normalizedEmail = email.toLowerCase();
        console.log(`🔄 Atualizando status de ${normalizedEmail} para ${status}...`);
        
        const userDocRef = doc(db, 'users-admin-control', normalizedEmail);
        
        await setDoc(userDocRef, {
            email: normalizedEmail,
            status: status,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ Status atualizado em users-admin-control`);
        
        // Também sincronizar usando user-sync se disponível
        try {
            await syncUpdateUserStatus(normalizedEmail, status);
            console.log(`✅ Status sincronizado em user-sync`);
        } catch (err) {
            console.warn('⚠️ Erro ao sincronizar com user-sync:', err.message);
        }
        
        return true;
    } catch (err) {
        console.error('❌ Erro ao atualizar status:', err.message);
        alert('Erro ao atualizar status: ' + err.message);
        return false;
    }
}

// Renderizar lista de usuários
async function renderUsersList() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;

    usersList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--color-text);">⏳ Carregando usuários...</div>';

    try {
        const usersFromDb = await fetchRealUsers();
        const statuses = await fetchUserStatus();

        // Combinar dados
        let usersArray = Array.from(usersFromDb.values()).map(user => ({
            ...user,
            status: statuses.get(user.email) || 'ativo'
        }));

        if (usersArray.length === 0) {
            usersList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--color-text); opacity: 0.8;">
                    <p>⚠️ Nenhum usuário registrado ainda</p>
                    <small style="opacity: 0.6;">Quando usuários fizerem cadastro, aparecerão aqui</small>
                </div>
            `;
            return;
        }

        // Aplicar filtros
        const searchTerm = (document.getElementById('user-search')?.value || '').toLowerCase();
        const statusFilter = document.getElementById('user-filter')?.value || '';

        let filtered = usersArray.filter(user => {
            const matchesSearch = !searchTerm || 
                user.email.toLowerCase().includes(searchTerm) ||
                (user.displayName || '').toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            usersList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--color-text); opacity: 0.6;">
                    <p>🔍 Nenhum usuário encontrado com estes critérios</p>
                </div>
            `;
            return;
        }

        // Ordenar por data (mais recentes primeiro)
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        // Renderizar
        usersList.innerHTML = filtered.map(user => {
            const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida';
            const borderColor = user.status === 'ativo' ? '#4CAF50' : user.status === 'suspenso' ? '#FFC107' : '#F44336';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--color-primary); border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${borderColor};">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: var(--color-text); word-break: break-all;">${user.email}</div>
                        <small style="opacity: 0.7; color: var(--color-text); display: block;">
                            ${user.displayName} • ${date}
                        </small>
                        <div style="margin-top: 4px;">
                            <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;
                                ${user.status === 'ativo' ? 'background: rgba(76, 175, 80, 0.2); color: #4CAF50;' : ''}
                                ${user.status === 'suspenso' ? 'background: rgba(255, 193, 7, 0.2); color: #FFC107;' : ''}
                                ${user.status === 'banido' ? 'background: rgba(244, 67, 54, 0.2); color: #F44336;' : ''}
                            ">
                                ${user.status === 'ativo' ? '✅ Ativo' : user.status === 'suspenso' ? '⏸️ Suspenso' : '🚫 Banido'}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; min-width: auto; margin-left: 10px;">
                        ${user.status !== 'suspenso' ? `<button class="btn-suspend" data-email="${user.email}" style="padding: 6px 10px; border: 1px solid #FFC107; border-radius: 4px; background: rgba(255, 193, 7, 0.1); color: #FFC107; cursor: pointer; font-weight: 600; font-size: 0.9rem; white-space: nowrap;">⏸️ Suspender</button>` : `<button class="btn-unsuspend" data-email="${user.email}" style="padding: 6px 10px; border: 1px solid #4CAF50; border-radius: 4px; background: rgba(76, 175, 80, 0.1); color: #4CAF50; cursor: pointer; font-weight: 600; font-size: 0.9rem; white-space: nowrap;">✅ Ativar</button>`}
                        ${user.status !== 'banido' ? `<button class="btn-ban" data-email="${user.email}" style="padding: 6px 10px; border: 1px solid #F44336; border-radius: 4px; background: rgba(244, 67, 54, 0.1); color: #F44336; cursor: pointer; font-weight: 600; font-size: 0.9rem; white-space: nowrap;">🚫 Banir</button>` : `<button class="btn-unban" data-email="${user.email}" style="padding: 6px 10px; border: 1px solid #4CAF50; border-radius: 4px; background: rgba(76, 175, 80, 0.1); color: #4CAF50; cursor: pointer; font-weight: 600; font-size: 0.9rem; white-space: nowrap;">✅ Desbanir</button>`}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners
        attachEventListeners();
        console.log(`✅ Lista renderizada com ${filtered.length} usuários`);
    } catch (err) {
        console.error('❌ Erro ao renderizar:', err);
        usersList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #F44336; font-family: monospace;">
                <p style="font-weight: bold;">❌ Erro ao carregar usuários</p>
                <small>${err.message || 'Verifique o console'}</small>
            </div>
        `;
    }
}

// Anexar event listeners
function attachEventListeners() {
    document.querySelectorAll('.btn-suspend').forEach(btn => {
        btn.addEventListener('click', () => changeUserStatus(btn.dataset.email, 'suspenso'));
    });
    
    document.querySelectorAll('.btn-unsuspend').forEach(btn => {
        btn.addEventListener('click', () => changeUserStatus(btn.dataset.email, 'ativo'));
    });
    
    document.querySelectorAll('.btn-ban').forEach(btn => {
        btn.addEventListener('click', () => changeUserStatus(btn.dataset.email, 'banido'));
    });
    
    document.querySelectorAll('.btn-unban').forEach(btn => {
        btn.addEventListener('click', () => changeUserStatus(btn.dataset.email, 'ativo'));
    });
}

// Mudar status do usuário
async function changeUserStatus(email, newStatus) {
    const action = newStatus === 'banido' ? 'banir' : newStatus === 'suspenso' ? 'suspender' : 'ativar';
    
    if (!confirm(`⚠️ Tem certeza que deseja ${action} este usuário?\n\n${email}`)) {
        return;
    }

    const success = await updateUserStatus(email, newStatus);
    if (success) {
        setTimeout(() => renderUsersList(), 500);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Users module inicializado');
    
    if (document.getElementById('users-list')) {
        renderUsersList();
    }
    
    document.getElementById('user-search')?.addEventListener('input', () => renderUsersList());
    document.getElementById('user-filter')?.addEventListener('change', () => renderUsersList());
});

export { renderUsersList, changeUserStatus, fetchRealUsers, fetchUserStatus, updateUserStatus };
