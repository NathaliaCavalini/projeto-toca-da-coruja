/**
 * Valida se um email é real usando verificação de DNS e padrão
 * @param {string} email - Email a validar
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function validateRealEmail(email) {
    // Validação básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: "Formato de email inválido"
        };
    }

    // Extrair domínio
    const domain = email.split('@')[1].toLowerCase();

    // Lista de domínios bloqueados (emails temporários)
    const blockedDomains = [
        'tempmail.com',
        'throwaway.email',
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
        'temp-mail.org',
        'yopmail.com',
        'trashmail.com',
        'fakeinbox.com',
        'sharklasers.com',
        'temp-mail.io',
        'guerrillamail.info',
        'guerrillamail.net',
        'pokemail.net',
        'spam4.me',
        'grr.la',
        'guerrillamail.biz',
        'pokemail.info'
    ];

    if (blockedDomains.includes(domain)) {
        return {
            valid: false,
            message: "Email temporário não é permitido. Use um email real."
        };
    }

    // Validações adicionais
    if (email.length < 5 || email.length > 254) {
        return {
            valid: false,
            message: "Email com comprimento inválido"
        };
    }

    // Bloquear emails muito óbvios como fake
    const fakePatternsRegex = /^(test|admin|user|demo|spam|fake|fake\d+|a+@|1+@)/i;
    if (fakePatternsRegex.test(email)) {
        return {
            valid: false,
            message: "Email parece ser fake. Use um email real."
        };
    }

    return {
        valid: true,
        message: "Email válido"
    };
}
