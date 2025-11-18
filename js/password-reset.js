import { auth } from "./firebase-config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/**
 * Envia email de reset de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<void>}
 */
export async function sendResetEmail(email) {
    if (!email) {
        throw new Error("Email não fornecido");
    }

    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: "Email de confirmação enviado! Verifique sua caixa de entrada."
        };
    } catch (err) {
        console.error("Erro ao enviar email de reset:", err);
        
        let mensagem = "Erro ao enviar email de reset";
        if (err.code === 'auth/user-not-found') {
            mensagem = "Email não encontrado";
        } else if (err.code === 'auth/invalid-email') {
            mensagem = "Email inválido";
        } else if (err.code === 'auth/too-many-requests') {
            mensagem = "Muitas tentativas. Tente novamente mais tarde.";
        }
        
        throw new Error(mensagem);
    }
}

/**
 * Abre um modal card para solicitar email e enviar reset
 * @returns {Promise<void>}
 */
export async function openPasswordResetModal() {
    return new Promise((resolve, reject) => {
        // Criar modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'password-reset-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const modalCard = document.createElement('div');
        modalCard.className = 'password-reset-card';
        modalCard.style.cssText = `
            background: #c89f7d;
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            width: 360px;
            max-width: 90vw;
            text-align: center;
            animation: slideUp 0.3s ease-out;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            body.dark-mode .password-reset-card {
                background: #4A2F20 !important;
            }
            
            body.dark-mode .password-reset-card h2,
            body.dark-mode .password-reset-card p {
                color: rgba(255, 255, 255, 0.90) !important;
            }
            
            body.dark-mode .password-reset-card input {
                background: #543829 !important;
                color: #fff !important;
                border-color: #5A3F2E !important;
            }
            
            body.dark-mode .password-reset-card input::placeholder {
                color: rgba(255, 255, 255, 0.70) !important;
            }
            
            .password-reset-card input::placeholder {
                color: #8b7355;
            }
            
            body.dark-mode .password-reset-card input:focus {
                background: #5A3F2E !important;
                border-color: #8B694D !important;
            }
            
            body.dark-mode .password-reset-card button {
                background: #7A5540 !important;
                color: rgba(255, 255, 255, 0.90) !important;
            }
            
            body.dark-mode .password-reset-card button:hover {
                background: #8B694D !important;
            }
            
            body.dark-mode .password-reset-card .btn-cancel {
                background: #543829 !important;
                color: rgba(255, 255, 255, 0.90) !important;
                border-color: #5A3F2E !important;
            }
        `;
        document.head.appendChild(style);

        modalCard.innerHTML = `
            <h2 style="margin-bottom: 1rem; color: #4b2e23; font-size: 1.5rem;">Alterar Senha</h2>
            <p style="color: #4b2e23; margin-bottom: 1.5rem; font-size: 0.95rem;">
                Digite seu email para receber um link de confirmação
            </p>
            <form id="reset-form" style="display: flex; flex-direction: column; gap: 14px;">
                <input 
                    type="email" 
                    id="reset-email" 
                    placeholder="Seu email" 
                    required
                    style="
                        width: 100%;
                        padding: 0.9rem;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        font-size: 1rem;
                        outline: none;
                        background: #fff;
                        color: #4b2e23;
                        box-sizing: border-box;
                    "
                />
                <div style="display: flex; gap: 10px;">
                    <button 
                        type="button" 
                        class="btn-cancel"
                        style="
                            flex: 1;
                            padding: 0.9rem;
                            background: #f5e6d3;
                            color: #4b2e23;
                            border: 1px solid #ccc;
                            border-radius: 10px;
                            font-size: 1rem;
                            cursor: pointer;
                            font-weight: bold;
                            transition: 0.2s;
                        "
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        style="
                            flex: 1;
                            padding: 0.9rem;
                            background: #8B694D;
                            color: #fff;
                            border: none;
                            border-radius: 10px;
                            font-size: 1rem;
                            cursor: pointer;
                            font-weight: bold;
                            transition: 0.2s;
                        "
                    >
                        Enviar
                    </button>
                </div>
            </form>
        `;

        modalOverlay.appendChild(modalCard);
        document.body.appendChild(modalOverlay);

        const emailInput = modalCard.querySelector('#reset-email');
        const form = modalCard.querySelector('#reset-form');
        const cancelBtn = modalCard.querySelector('.btn-cancel');

        // Auto-preencher com email do usuário logado
        const user = auth.currentUser;
        if (user && user.email) {
            emailInput.value = user.email;
        }

        // Fechar ao clicar em cancelar
        cancelBtn.addEventListener('click', () => {
            modalOverlay.remove();
            reject(new Error("Cancelado"));
        });

        // Fechar ao clicar fora do card
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
                reject(new Error("Cancelado"));
            }
        });

        // Lidar com submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();

            if (!email) {
                alert("Email não pode estar vazio");
                return;
            }

            try {
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = "Enviando...";

                const result = await sendResetEmail(email);
                
                // Mostrar mensagem de sucesso
                modalCard.innerHTML = `
                    <h2 style="margin-bottom: 1rem; color: #4b2e23; font-size: 1.5rem;">✅ Sucesso!</h2>
                    <p style="color: #4b2e23; margin-bottom: 1.5rem; font-size: 0.95rem;">
                        ${result.message}
                    </p>
                    <p style="color: #4b2e23; margin-bottom: 1.5rem; font-size: 0.85rem; opacity: 0.8;">
                        Você receberá um email com um link para redefinir sua senha.
                    </p>
                    <p style="color: #fff; margin-bottom: 1.5rem; font-size: 0.80rem; background: #3a3027; padding: 10px; border-radius: 8px; border-left: 3px solid #8B694D;">
                        💡 Dica: Se não receber o email, verifique a pasta de <strong>SPAM</strong> ou <strong>LIXO</strong>
                    </p>
                    <button 
                        id="close-btn"
                        style="
                            width: 100%;
                            padding: 0.9rem;
                            background: #8B694D;
                            color: #fff;
                            border: none;
                            border-radius: 10px;
                            font-size: 1rem;
                            cursor: pointer;
                            font-weight: bold;
                            transition: 0.2s;
                        "
                    >
                        Fechar
                    </button>
                `;

                modalCard.querySelector('#close-btn').addEventListener('click', () => {
                    modalOverlay.remove();
                    resolve();
                });
            } catch (err) {
                alert("Erro: " + err.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "Enviar";
            }
        });

        emailInput.focus();
    });
}
