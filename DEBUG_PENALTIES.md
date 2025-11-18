# Debug de Penalidades

## Como Testar:

1. **Abra o Console do Navegador (F12)**

2. **Digite os seguintes comandos:**

\\\javascript
// 1. Verificar qual usuário está logado
auth.currentUser?.email

// 2. Verificar o status dele
import('./js/check-penalties.js').then(m => m.checkUserPenalty()).then(p => console.log(p))

// 3. Verificar se está no Firebase
import('./js/firebase-config.js').then(fb => {
  import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js').then(fs => {
    const userRef = fb.db.collection('users-admin-control').doc('email@test.com')
    userRef.get().then(doc => console.log('Documento:', doc.data()))
  })
})
\\\

## Se Não Funcionar:

1. Verifique se o email está salvo em: 
   - Firebase Console > Firestore > users-admin-control > [email]

2. Verifique se o campo 'status' contém: 'banido' ou 'suspenso'

3. Limpe o cache (CTRL+Shift+Delete) e recarregue

## Logs Esperados:

-  Status de user@email.com: banido
-  blockActionIfPenalized chamado: { isBanned: true }
-  Usuário banido - bloqueando ação
