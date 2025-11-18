# 🧪 GUIA DE DEBUG - SISTEMA DE PENALIDADES

## 📋 Resumo do Problema
Usuários banidos ainda conseguem realizar ações (escrever reviews, adicionar livros, etc).
Sistema de penalidades foi criado mas **não está bloqueando as ações**.

---

## 🚀 COMO TESTAR

### Passo 1: Abrir o Console do Navegador
1. Abra `reviews.html` no navegador
2. Pressione **F12** para abrir Developer Tools
3. Clique na aba **Console**

### Passo 2: Executar Teste Completo
No console, digite:
```javascript
testPenalties()
```

Isso mostrará:
- ✅ Email do usuário autenticado
- ✅ Status no Firebase
- ✅ Se está Ativo / Suspenso / Banido
- ✅ Se as ações estão sendo bloqueadas

### Passo 3: Debug Profundo (se testPenalties não for suficiente)
Se o resultado não for o esperado, execute:
```javascript
debugFirebase()
```

Isso mostrará:
- 🔍 **Todos** os documentos na coleção `users-admin-control`
- 📥 Estrutura exata do seu documento no Firebase
- ⚠️ Se o documento existe ou não

### Passo 4: Verificar Email Específico
Se quiser verificar um email específico:
```javascript
debugSpecificUser('seu-email@exemplo.com')
```

---

## 🔍 VERIFICAÇÃO NO FIREBASE

### Navegue até:
1. **Firebase Console** → Seu Projeto
2. **Firestore Database** → Coleção `users-admin-control`
3. Procure o documento com ID = email do usuário banido

### Estrutura esperada:
```
Documento: seu-email@exemplo.com
├── status: "banido"  (exatamente assim, lowercase)
└── (outros campos opcionais)
```

### ⚠️ Problemas Comuns:
- ❌ Campo `status` com valor errado (ex: "Banido", "BANIDO")
- ❌ Email errado no documento ID
- ❌ Documento não existe na coleção
- ❌ Coleção `users-admin-control` não existe

---

## 🔧 COMO ADICIONAR UM BAN (Teste Manual)

### Via Firebase Console:
1. Vá até Firestore → Coleção `users-admin-control`
2. Adicione novo documento
3. Defina ID como: `seu-email@exemplo.com`
4. Adicione campo:
   - `status`: `banido`

### Depois recarregue a página (F5) e teste com `testPenalties()`

---

## ✅ RESULTADO ESPERADO

### Para Usuário ATIVO:
```
✅ isActive: true
✅ isBanned: false
✅ isSuspended: false

Todas ações: ✅ PERMITIDA
```

### Para Usuário BANIDO:
```
❌ isActive: false
❌ isBanned: true
❌ isSuspended: false

Todas ações: ❌ BLOQUEADA
```

### Para Usuário SUSPENSO:
```
⚠️ isActive: false
⚠️ isBanned: false
⚠️ isSuspended: true

write_review: ❌ BLOQUEADA
add_favorite: ❌ BLOQUEADA
mark_as_read: ✅ PERMITIDA
```

---

## 🐛 SE AINDA NÃO FUNCIONOU

### Checklist:
- [ ] Status no Firebase é exatamente `banido` (lowercase)
- [ ] Email no documento está correto (case-sensitive)
- [ ] Página foi recarregada depois do ban (F5)
- [ ] Está autenticado com a conta banida
- [ ] Console mostra logs detalhados (verifique console.log)
- [ ] `testPenalties()` retorna `isBanned: true`
- [ ] Mesmo assim não bloqueia? → Verifique `blockActionIfPenalized()` logic

### Próximas ações:
1. Execute `debugFirebase()` e compartilhe o resultado
2. Execute `testPenalties()` e compartilhe o resultado
3. Tente executar uma ação (enviar review) e copie os logs do console

---

## 📞 FUNÇÕES DISPONÍVEIS

| Função | O que faz |
|--------|-----------|
| `testPenalties()` | Teste completo do sistema |
| `debugFirebase()` | Lista todos os bans no Firebase |
| `debugSpecificUser(email)` | Debug de usuário específico |
| `debugPenalties()` | Mostra este menu |

---

## 🎯 ONDE ESTÁ O CÓDIGO

### Arquivos principais:
- `js/check-penalties.js` - Core do sistema de penalidades
- `js/firebase-debug.js` - Funções de debug
- `js/reviews-page.js` - Integração no formulário de reviews
- `js/library-actions.js` - Integração nos botões de livros
- `reviews.html` - Script de teste

### Coleção Firebase:
- `users-admin-control` - Documento ID = email, field = status

---

**Última atualização:** Agora com funcionalidades de debug para investigar penalidades
