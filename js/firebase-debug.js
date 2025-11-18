// Módulo de debug para investigar Firebase e penalidades

import { db } from './firebase-config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { collection, getDocs, doc, getDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export async function debugFirebase() {
    console.clear();
    console.log('='.repeat(80));
    console.log('🔍 DEBUG FIREBASE - INVESTIGAÇÃO PROFUNDA');
    console.log('='.repeat(80));
    
    const auth = getAuth();
    
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.error('❌ Nenhum usuário autenticado!');
                resolve();
                return;
            }
            
            console.log('\n📌 USUÁRIO ATUAL');
            console.log('─'.repeat(80));
            console.log(`Email: ${user.email}`);
            console.log(`UID: ${user.uid}`);
            console.log(`Nome: ${user.displayName || '(não definido)'}`);
            
            // Verificar coleção users-admin-control
            console.log('\n📌 COLEÇÃO: users-admin-control');
            console.log('─'.repeat(80));
            
            try {
                // Buscar documento específico
                const docRef = doc(db, 'users-admin-control', user.email);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    console.log(`✅ Documento para email "${user.email}" encontrado:`);
                    const data = docSnap.data();
                    console.log(`   status: "${data.status}"`);
                    console.log(`   Dados completos:`, data);
                } else {
                    console.warn(`⚠️ Documento para email "${user.email}" NÃO existe`);
                }
            } catch (err) {
                console.error(`❌ Erro ao buscar documento:`, err);
            }
            
            // Listar TODOS os documentos da coleção
            console.log('\n📌 TODOS OS DOCUMENTOS NA COLEÇÃO');
            console.log('─'.repeat(80));
            
            try {
                const collRef = collection(db, 'users-admin-control');
                const snapshot = await getDocs(collRef);
                
                if (snapshot.empty) {
                    console.warn('⚠️ Coleção vazia!');
                } else {
                    console.log(`✅ Total de documentos: ${snapshot.size}\n`);
                    
                    snapshot.forEach((doc, index) => {
                        const data = doc.data();
                        console.log(`${index + 1}. Documento ID: "${doc.id}"`);
                        console.log(`   status: "${data.status}"`);
                        console.log(`   Dados:`, data);
                        console.log('');
                    });
                }
            } catch (err) {
                console.error('❌ Erro ao listar documentos:', err);
            }
            
            // Verificar também coleção "users" (alternativa)
            console.log('\n📌 COLEÇÃO ALTERNATIVA: users');
            console.log('─'.repeat(80));
            
            try {
                const usersRef = collection(db, 'users');
                const snapshot = await getDocs(usersRef);
                
                if (snapshot.empty) {
                    console.warn('⚠️ Coleção "users" vazia ou não existe');
                } else {
                    console.log(`✅ Total de documentos em "users": ${snapshot.size}\n`);
                    
                    snapshot.forEach((doc, index) => {
                        const data = doc.data();
                        console.log(`${index + 1}. Documento ID: "${doc.id}"`);
                        if (data.status) console.log(`   status: "${data.status}"`);
                        console.log(`   Dados:`, data);
                        console.log('');
                    });
                }
            } catch (err) {
                console.warn('⚠️ Erro ao buscar coleção "users":', err.message);
            }
            
            console.log('\n' + '='.repeat(80));
            console.log('✅ Debug concluído');
            console.log('='.repeat(80));
            
            resolve();
        });
    });
}

export async function debugSpecificUser(email) {
    console.clear();
    console.log('='.repeat(80));
    console.log(`🔍 DEBUG USER: ${email}`);
    console.log('='.repeat(80));
    
    try {
        console.log('\n📥 Buscando em users-admin-control...');
        const docRef = doc(db, 'users-admin-control', email);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log(`✅ Encontrado!`);
            const data = docSnap.data();
            console.log(`   status: "${data.status}"`);
            console.log(`   Dados completos:`);
            console.table(data);
        } else {
            console.warn(`❌ NÃO encontrado para: ${email}`);
        }
    } catch (err) {
        console.error('Erro:', err);
    }
}
