import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "pages/login.html";
        return;
    }

    const { photoURL, displayName, email, uid } = user;
    const userPhoto = document.getElementById("user-photo");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");

    if (userPhoto) userPhoto.src = photoURL || "../imagens/user.png";
    if (usernameInput) usernameInput.value = displayName || "";
    if (emailInput) emailInput.value = email || "";

    try {
        const snap = await getDoc(doc(db, "usuarios", uid));
        const userData = snap.data();
        if (snap.exists() && userData?.photoURL) {
            userPhoto.src = userData.photoURL;
        }
    } catch (err) {
        console.warn("Erro ao carregar dados do Firestore:", err);
    }
});

// Adiciona preview de imagem ao selecionar arquivo
document.getElementById("photo-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const userPhoto = document.getElementById("user-photo");
        userPhoto.src = URL.createObjectURL(file);
    }
});

// Permite clicar na imagem para abrir seletor de arquivo
document.getElementById("user-photo").addEventListener("click", () => {
    document.getElementById("photo-file").click();
});

// Função para converter arquivo em base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const base64String = reader.result.split(',')[1];
                if (!base64String) {
                    throw new Error('Formato de imagem inválido');
                }
                resolve(base64String);
            } catch (error) {
                reject(new Error('Erro ao processar a imagem. Verifique se é uma imagem válida.'));
            }
        };
        reader.onerror = error => reject(new Error('Erro ao ler o arquivo: ' + error.message));
        reader.readAsDataURL(file);
    });
}

// Função para fazer upload da imagem para o ImgBB
async function uploadToImgBB(base64Image) {
    const apiKey = 'b89552e357fbf3f8ec94c02aa7af7ecd'; // Substitua pela sua API Key do ImgBB
    
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `image=${encodeURIComponent(base64Image)}`
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Detalhes do erro:', errorData);
            throw new Error(`Erro ao fazer upload da imagem: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error?.message || 'Erro desconhecido no upload');
        }

        return data.data.url;
    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error(`Não foi possível fazer o upload da imagem: ${error.message}`);
    }
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert("Usuário não encontrado.");
        return;
    }

    const { email, uid, photoURL: currentPhotoURL } = user;
    const usernameInput = document.getElementById("username");
    const photoFileInput = document.getElementById("photo-file");
    const userPhoto = document.getElementById("user-photo");
    const submitButton = e.target.querySelector('button[type="submit"]');

    try {
        // Desabilita o botão durante o processo
        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";

        const displayName = usernameInput.value.trim();
        let photoURL = currentPhotoURL;

        // Se uma nova foto foi selecionada
        if (photoFileInput.files[0]) {
            const file = photoFileInput.files[0];
            
            // Verifica o tamanho do arquivo (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error("A imagem deve ter menos de 2MB");
            }

            submitButton.textContent = "Fazendo upload...";
            
            try {
                // Converte a imagem para base64
                const base64String = await readFileAsBase64(file);
                
                // Faz o upload para o ImgBB
                photoURL = await uploadToImgBB(base64String);
                
                if (!photoURL) {
                    throw new Error("Erro ao obter URL da imagem");
                }
            } catch (imgError) {
                console.error("Erro no processamento da imagem:", imgError);
                throw new Error("Não foi possível fazer o upload da imagem. Tente novamente.");
            }
        }

        // Atualiza Auth Profile
        await updateProfile(user, {
            displayName,
            photoURL
        });

        // Atualiza Firestore
        await setDoc(doc(db, "usuarios", uid), {
            displayName,
            email,
            photoURL,
            updatedAt: new Date()
        }, { merge: true });

        // Atualiza a interface
        userPhoto.src = photoURL;
        photoFileInput.value = '';

        // Tenta recarregar o usuário
        try {
            await user.reload();
        } catch (reloadError) {
            console.warn("Aviso: Não foi possível recarregar usuário");
        }

        alert("✅ Perfil atualizado com sucesso!");
        
        // Redireciona após sucesso
        setTimeout(() => {
            window.location.href = "pages/home.html";
        }, 1000);

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("❌ " + (error.message || "Erro ao atualizar perfil. Por favor, tente novamente."));
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Salvar Alterações";
    }
});

// Funcionalidade de logout
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "pages/login.html";
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("❌ Erro ao fazer logout. Por favor, tente novamente.");
    }
});
