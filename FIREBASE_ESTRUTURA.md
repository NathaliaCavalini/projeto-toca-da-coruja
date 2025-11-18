# 📊 ESTRUTURA DO FIREBASE - COLEÇÃO users-admin-control

## Como Deve Estar:

```
Firestore Database
└── Projeto: seu-projeto
    └── Coleção: users-admin-control
        ├── Documento: usuario1@gmail.com
        │   └── status: "ativo"
        │
        ├── Documento: usuario2@gmail.com
        │   └── status: "banido"         ← ⭐ BANIDO
        │
        ├── Documento: usuario3@gmail.com
        │   └── status: "suspenso"       ← ⏸️ SUSPENSO
        │
        └── Documento: usuario4@gmail.com
            └── status: "ativo"
```

---

## Exemplos de Documentos

### 1️⃣ Usuário Ativo (Normal)
```json
Document ID: "joao@gmail.com"
{
  "status": "ativo"
}
```

### 2️⃣ Usuário Banido ✅ (O que queremos testar)
```json
Document ID: "maria@gmail.com"
{
  "status": "banido"
}
```

### 3️⃣ Usuário Suspenso
```json
Document ID: "pedro@gmail.com"
{
  "status": "suspenso"
}
```

### 4️⃣ Com Mais Dados (Opcional)
```json
Document ID: "ana@gmail.com"
{
  "status": "banido",
  "motivo": "Spam excessivo",
  "data_ban": "2024-01-15",
  "admin": "admin@sistema.com"
}
```

---

## ⚠️ ERROS COMUNS

### ❌ Errado - Status com typo
```json
Document ID: "usuario@gmail.com"
{
  "status": "Banido"  ← ERRADO! Começa com maiúscula
}
```
**Esperado:** `"banido"` (lowercase)

---

### ❌ Errado - Email diferente
```json
Document ID: "Usuario@gmail.com"  ← ERRADO! Maiúscula
{
  "status": "banido"
}
```
**Esperado:** Email lowercase exato do usuário

---

### ❌ Errado - Campo diferente
```json
Document ID: "usuario@gmail.com"
{
  "penalidade": "banido"  ← ERRADO! Campo se chama "status"
}
```
**Esperado:** campo deve ser `"status"`

---

### ❌ Errado - Documento em coleção errada
```
Firestore Database
└── Coleção: "users"  ← ERRADO! Deveria ser "users-admin-control"
    └── Documento: usuario@gmail.com
        └── status: "banido"
```
**Esperado:** Coleção deve se chamar `"users-admin-control"`

---

## ✅ CORRETO

```json
Coleção: users-admin-control
Document ID: usuario@gmail.com
{
  "status": "banido"
}
```

---

## Como Adicionar Manualmente

### Via Firebase Console:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Firestore Database**
4. Clique na coleção **users-admin-control**
5. Clique em **+ Adicionar documento**
6. Defina:
   - **Document ID:** `seu-email@gmail.com` (exatamente como está autenticado)
   - **Primeiro campo:**
     - **Campo:** `status`
     - **Tipo:** String
     - **Valor:** `banido`
7. Clique em **Salvar**

### Pronto! Agora:
1. Recarregue a página (F5)
2. No console, execute: `testPenalties()`
3. Deve mostrar: `isBanned: true`

---

## Verificando se Está Correto

Execute no console:
```javascript
debugFirebase()
```

Procure seu email na saída. Você deve ver:
```
✅ Documento encontrado:
   ├─ status: "banido"
   ├─ Data completa: { status: "banido" }
```

Se mostrar:
```
⚠️ Documento NÃO encontrado para: seu-email@gmail.com
```

Significa que o documento não existe ou o email está diferente.

---

## Estados Possíveis

| Status | O que acontece |
|--------|---|
| `"ativo"` ou não existe | ✅ Usuário pode fazer tudo |
| `"banido"` | ❌ Usuário não pode fazer nada |
| `"suspenso"` | ⏸️ Usuário não pode escrever/editar reviews, mas pode navegar |

---

## Para Debug: Verificar Todos os Bans

```javascript
debugFirebase()
```

Mostrará TODOS os documentos da coleção, então você pode ver:
- Quantas pessoas estão banidas
- Qual é o status de cada uma
- Se há typos nos campos

---

**Se tiver dúvidas, execute `testPenalties()` no console para ver seu status atual!**
