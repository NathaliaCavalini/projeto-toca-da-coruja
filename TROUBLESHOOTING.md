# 🔧 TROUBLESHOOTING - SISTEMA DE PENALIDADES

## PROBLEMA: Usuário banido consegue escrever reviews

---

## 🎯 DIAGNÓSTICO PASSO A PASSO

### Passo 1: Verificar Autenticação
```
No console, execute:
  testPenalties()

Olhe para:
  Email: ???
  
Seu email apareceu? SIM ✅ / NÃO ❌
```

**Se NÃO:**
- [ ] Você está autenticado?
- [ ] Fez login na conta?
- [ ] Recarregue a página e faça login novamente

---

### Passo 2: Verificar Status no Sistema
```
No resultado de testPenalties(), olhe para:
  Status: ???
  isBanned: ???
```

**Status esperado para usuário banido: "banido"**
**isBanned esperado: true**

| Status | isBanned | O que fazer |
|--------|----------|---|
| ativo | false | 🔴 Ir pro Passo 3 (problema no Firebase) |
| banido | true | ✅ Ir pro Passo 4 (testar bloqueio) |
| outro | ??? | ⚠️ Executar debugFirebase() |

---

### Passo 3: Verificar Firebase
```
No console, execute:
  debugFirebase()

Procure seu email na saída.
```

**Cenários:**

#### A) Documento existe mas status errado
```
✅ Documento encontrado:
   status: "BANIDO"  ← ❌ MAIÚSCULA
```

**Solução:**
- Abra Firebase Console
- Edite documento
- Mude "BANIDO" para "banido" (lowercase)
- Recarregue página (F5)
- Execute testPenalties() novamente

#### B) Documento não existe
```
⚠️ Documento NÃO encontrado para: usuario@gmail.com
```

**Solução:**
- Vá em Firebase Console > Firestore
- Coleção: users-admin-control
- Clique em "+ Adicionar documento"
- Document ID: usuario@gmail.com (EXATO do seu email)
- Campo: status | Valor: banido
- Salve
- Recarregue página (F5)
- Execute testPenalties() novamente

#### C) Email diferente
```
Você vê documento com: usuario@gmail.com
Mas seu email é: usuario@mailinator.com
```

**Solução:**
- Crie novo documento com email CORRETO
- Use o email que aparece em testPenalties()

---

### Passo 4: Testar Bloqueio
```
Se testPenalties() mostra isBanned: true
Execute:
  testBlockingSystem()
```

**Resultado esperado:**
```
❌ RESULTADO: Review BLOQUEADO
   → Sistema impediu a ação (como esperado)
```

**Se mostrar PERMITIDO quando deveria ser BLOQUEADO:**
- [ ] Há um bug na lógica de blockActionIfPenalized()
- [ ] Compartilhe os logs para investigação

---

### Passo 5: Testar Ação Real
```
Execute:
  testRealAction()
```

Se tudo estiver certo, deve mostrar:
```
❌ RESULTADO: Review BLOQUEADO
```

---

### Passo 6: Tentar Ação Manual
Tente clicar em "Escrever Review"

**Cenários:**

#### ✅ Correto
- Clica no botão
- Aparece alert: "🚫 Sua conta foi BANIDA"
- Review NÃO é enviado

#### ❌ Problema
- Clica no botão
- Alert NÃO aparece
- Review é enviado normalmente

**Se isso acontecer:**
- Execute: testBlockingSystem()
- Procure nos logs por "❌ RESULTADO: Review BLOQUEADO"
- Se houver, o problema é que a ação real não está passando pelo bloqueador
- Pode ser que haja múltiplos caminhos de código

---

## 🔍 CHECKLIST DE PROBLEMAS

### ❌ Status errado no Firebase
- [ ] Status é "banido" (lowercase)
- [ ] Não é "BANIDO", "Banido", "baniido"
- [ ] Se não, edite no Firebase Console

### ❌ Email não corresponde
- [ ] testPenalties() mostra seu email
- [ ] Firebase tem documento com esse EXATO email
- [ ] Email case-sensitive (usuario@gmail.com ≠ Usuario@gmail.com)

### ❌ Documento não existe
- [ ] Acesse Firebase Console > Firestore > users-admin-control
- [ ] Procure documento com ID = seu email
- [ ] Se não existir, crie um novo

### ❌ Usando coleção errada
- [ ] Coleção deve ser: "users-admin-control"
- [ ] NÃO "users", "usuarios", "penalties", etc

### ❌ Cache expirado
- [ ] Se mudou status no Firebase
- [ ] Aguarde 5 segundos
- [ ] Ou recarregue página (F5)

### ❌ Não está autenticado
- [ ] Está logado na conta banida?
- [ ] Email do login = email do documento?
- [ ] Se não, faça login corretamente

---

## 📊 MATRIZ DE DEBUG

| testPenalties() | debugFirebase() | testBlockingSystem() | Diagnóstico |
|---|---|---|---|
| isBanned: false | Documento: "ativo" | PERMITIDA | Email não está banido no Firebase |
| isBanned: false | Documento não existe | PERMITIDA | Ban não foi criado no Firebase |
| isBanned: true | Documento: "banido" | BLOQUEADA | ✅ Sistema OK, pode testar ação real |
| isBanned: true | Documento: "banido" | PERMITIDA | 🐛 Bug na lógica de bloqueio |
| isBanned: true | Documento: "BANIDO" | BLOQUEADA | Status com typo, editar Firebase |

---

## 🚨 SE NADA DISSO FUNCIONAR

Reúna estas informações:

1. **Output de testPenalties()**
   ```javascript
   copy(await testPenalties())
   ```

2. **Output de debugFirebase()**
   ```javascript
   debugFirebase()  // copie o console inteiro
   ```

3. **Output de testBlockingSystem()**
   ```javascript
   testBlockingSystem()  // copie o console inteiro
   ```

4. **Output de debugSpecificUser()**
   ```javascript
   debugSpecificUser('seu-email@gmail.com')  // seu email real
   ```

5. **Tente fazer ação real (escrever review)**
   - Abra console
   - Clique em "Escrever Review"
   - Copie TODOS os logs que aparecerem

Compartilhe tudo isso para análise profunda.

---

## ✅ CONFIRMAÇÃO FINAL

Quando funcionar corretamente, você verá:

### 1. Teste de Penalidades
```
isBanned: true
isSuspended: false
isActive: false
```

### 2. Teste de Bloqueio
```
❌ RESULTADO: Review BLOQUEADO
```

### 3. Ação Manual
```
Clica em "Escrever Review"
↓
Aparece: "🚫 Sua conta foi BANIDA"
↓
Review NÃO é enviado
↓
✅ SUCESSO!
```

---

**Se chegou aqui e ainda não funciona, os arquivos de debug têm informações suficientes para investigação!**
