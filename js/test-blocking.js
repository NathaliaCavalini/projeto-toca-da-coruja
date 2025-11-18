// Script de teste interativo para debug de penalidades
// Adicione isto ao console ou ao reviews.html para testes

export async function testBlockingSystem() {
    console.clear();
    console.log('='.repeat(80));
    console.log('🔐 TESTE DO SISTEMA DE BLOQUEIO - SIMULANDO CLIQUE');
    console.log('='.repeat(80));
    
    try {
        // Importar funções
        const { checkUserPenalty, blockActionIfPenalized } = await import('./check-penalties.js');
        
        console.log('\n1️⃣ Obtendo penalty atual...');
        const penalty = await checkUserPenalty();
        
        console.log(`\n2️⃣ Penalty obtido:`);
        console.log(`   - Email: ${penalty.email}`);
        console.log(`   - Status: ${penalty.status}`);
        console.log(`   - isBanned: ${penalty.isBanned}`);
        
        console.log(`\n3️⃣ Simulando clique em "Escrever Review"...`);
        console.log('   → Chamando blockActionIfPenalized(penalty, "write_review")');
        
        const resultado = blockActionIfPenalized(penalty, 'write_review');
        
        console.log(`\n4️⃣ RESULTADO:`);
        if (resultado) {
            console.log('   ✅ Função retornou TRUE → Ação PERMITIDA');
        } else {
            console.log('   ❌ Função retornou FALSE → Ação BLOQUEADA');
        }
        
        if (penalty.isBanned && resultado) {
            console.error('\n⚠️⚠️⚠️ PROBLEMA DETECTADO!');
            console.error('   - Usuário está BANIDO');
            console.error('   - Mas a ação foi PERMITIDA');
            console.error('   - Isso é um bug na lógica de bloqueio');
        }
        
        console.log('\n' + '='.repeat(80));
        
    } catch (err) {
        console.error('Erro:', err);
    }
}

export async function testRealAction() {
    console.clear();
    console.log('='.repeat(80));
    console.log('🎬 TESTE DE AÇÃO REAL - TENTANDO ESCREVER REVIEW');
    console.log('='.repeat(80));
    
    try {
        const { checkUserPenalty, blockActionIfPenalized } = await import('./check-penalties.js');
        
        const penalty = await checkUserPenalty();
        
        console.log(`\n📊 Penalty: ${penalty.status} | isBanned: ${penalty.isBanned}`);
        console.log(`\n🚀 Tentando escrever review...`);
        
        const podeEscrever = blockActionIfPenalized(penalty, 'write_review');
        
        if (podeEscrever) {
            console.log(`\n✅ RESULTADO: Review DESBLOQUEADO`);
            console.log(`   → Sistema permite que a ação continue`);
        } else {
            console.log(`\n❌ RESULTADO: Review BLOQUEADO`);
            console.log(`   → Sistema impediu a ação (como esperado)`);
        }
        
    } catch (err) {
        console.error('Erro:', err);
    }
}

export async function testAllActions() {
    console.clear();
    console.log('='.repeat(80));
    console.log('🎯 TESTE DE TODAS AS AÇÕES');
    console.log('='.repeat(80));
    
    try {
        const { checkUserPenalty, blockActionIfPenalized } = await import('./check-penalties.js');
        
        const penalty = await checkUserPenalty();
        
        console.log(`\n📊 Status do usuário: ${penalty.status}`);
        console.log('─'.repeat(80));
        
        const acoes = [
            'write_review',
            'edit_review', 
            'add_favorite',
            'mark_as_read',
            'mark_as_want',
            'outra_acao_qualquer'
        ];
        
        acoes.forEach(acao => {
            console.log(`\n🔍 Testando: ${acao}`);
            const resultado = blockActionIfPenalized(penalty, acao);
            // Resultado será mostrado nos logs internos de blockActionIfPenalized
        });
        
    } catch (err) {
        console.error('Erro:', err);
    }
}
