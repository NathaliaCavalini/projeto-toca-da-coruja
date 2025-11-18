#!/usr/bin/env node
/**
 * 🧪 QUICK START - TESTE DE PENALIDADES
 * 
 * INSTRUÇÕES RÁPIDAS:
 * 1. Abra reviews.html em seu navegador
 * 2. Pressione F12 para abrir console
 * 3. Cole um dos comandos abaixo
 */

// ============================================
// TESTE BÁSICO (comece por aqui)
// ============================================
console.log(`
┌─────────────────────────────────────────────┐
│ 🧪 TESTE COMPLETO DE PENALIDADES           │
└─────────────────────────────────────────────┘

No console, digite:
  testPenalties()

Isso mostrará:
  ✅ Se o usuário está banido ou não
  ✅ O status no Firebase
  ✅ Se as ações estão bloqueadas
`);

// ============================================
// TESTE DE BLOQUEIO
// ============================================
console.log(`
┌─────────────────────────────────────────────┐
│ 🔐 TESTE DE BLOQUEIO (simula um clique)    │
└─────────────────────────────────────────────┘

No console, digite:
  testBlockingSystem()

Simula o que acontece quando você clica em um botão.
`);

// ============================================
// DEBUG FIREBASE
// ============================================
console.log(`
┌─────────────────────────────────────────────┐
│ 📥 DEBUG FIREBASE (mostra todos os bans)   │
└─────────────────────────────────────────────┘

No console, digite:
  debugFirebase()

Mostra TODOS os documentos na coleção users-admin-control
`);

// ============================================
// RESUMO DE TESTES
// ============================================
console.log(`
┌─────────────────────────────────────────────────────────┐
│ 📋 RESUMO DE TODAS AS FUNÇÕES DISPONÍVEIS              │
└─────────────────────────────────────────────────────────┘

TESTES:
  • testPenalties()        - Teste completo ⭐ (comece aqui)
  • testBlockingSystem()   - Simula um clique
  • testRealAction()       - Testa write_review
  • testAllActions()       - Testa TODAS as ações

DEBUG:
  • debugFirebase()            - Mostra todos os bans
  • debugSpecificUser(email)   - Debug de 1 usuário

INFO:
  • debugPenalties()  - Mostra este menu

RESULTADO ESPERADO (para usuário banido):
  ❌ isBanned: true
  ✅ isSuspended: false
  ✅ isActive: false
  
Todas as ações devem mostrar: ❌ BLOQUEADA

┌─────────────────────────────────────────────────────────┐
│ ⚠️ SE NÃO FUNCIONAR:                                    │
│                                                         │
│ 1. Verificar se status no Firebase é: "banido"         │
│ 2. Verificar se email está correto (case-sensitive)   │
│ 3. Recarregar página (F5)                              │
│ 4. Aguardar 5 segundos (cache)                         │
│ 5. Executar debugFirebase() para investigar            │
└─────────────────────────────────────────────────────────┘
`);
