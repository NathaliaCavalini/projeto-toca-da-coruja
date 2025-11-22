// Importa auth do firebase-config
import { auth } from "./firebase-config.js";

// Email do administrador
const ADMIN_EMAIL = 'tatacavalini@gmail.com';

// Verificar se o usuário atual é admin
function isAdmin() {
    return auth.currentUser && auth.currentUser.email === ADMIN_EMAIL;
}

// Função para salvar uma review
export function saveReview(bookId, review) {
    // Verifica se o usuário está logado
    if (!auth.currentUser) {
        throw new Error("Você precisa estar logado para deixar uma review!");
    }

    // Carrega reviews existentes
    let allReviews = getAllReviews();
    
    // Cria a nova review com informações do usuário
    const username = auth.currentUser.displayName
        || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : 'Usuário');
    const newReview = {
        bookId,
        username,
        userEmail: auth.currentUser.email || null,
        userId: auth.currentUser.uid,
        rating: review.rating,
        text: review.text,
        timestamp: new Date().toISOString()
    };

    // Adiciona a nova review
    allReviews.unshift(newReview);

    // Salva todas as reviews
    localStorage.setItem('all_reviews', JSON.stringify(allReviews));

    return newReview;
}

// Função para carregar todas as reviews
export function getAllReviews() {
    return JSON.parse(localStorage.getItem('all_reviews')) || [];
}

// Função para carregar reviews do usuário atual
export function getCurrentUserReviews() {
    if (!auth.currentUser) return [];
    const allReviews = getAllReviews();
    return allReviews.filter(review => review.userId === auth.currentUser.uid);
}

// Função para carregar reviews de um livro específico
export function getBookReviews(bookId) {
    const allReviews = getAllReviews();
    return allReviews.filter(review => review.bookId === bookId);
}

// Função para deletar uma review
export function deleteReview(bookId, timestamp) {
    if (!auth.currentUser) {
        throw new Error("Você precisa estar logado para deletar uma review!");
    }

    let allReviews = getAllReviews();
    
    // Encontra a review para verificar se o usuário atual é o autor
    const review = allReviews.find(r => r.bookId === bookId && r.timestamp === timestamp);
    
    // Admin pode deletar qualquer review, usuário comum só pode deletar a sua própria
    if (!review) {
        throw new Error("Review não encontrada!");
    }
    
    if (!isAdmin() && review.userId !== auth.currentUser.uid) {
        throw new Error("Você só pode deletar suas próprias reviews!");
    }

    // Remove a review
    allReviews = allReviews.filter(r => !(r.bookId === bookId && r.timestamp === timestamp));
    
    // Salva as reviews atualizadas
    localStorage.setItem('all_reviews', JSON.stringify(allReviews));
}

// Função para criar elemento HTML de uma review
export function createReviewElement(review, showBookInfo = false) {
    const div = document.createElement("div");
    div.classList.add("review-item");
    div.setAttribute("data-timestamp", review.timestamp);
    
    let bookInfo = '';
    if (showBookInfo && window.livros && window.livros[review.bookId]) {
        const book = window.livros[review.bookId];
        bookInfo = `
            <div class="review-book-info">
                <img src="${book.imagem}" alt="${book.titulo}" class="review-book-cover">
                <div>
                    <h3>${book.titulo}</h3>
                    <p>por ${book.autor}</p>
                </div>
            </div>
        `;
    }

    div.innerHTML = `
        ${bookInfo}
        <div class="review-meta">
            <strong class="review-user">${review.username}</strong>
            <span class="review-rating">
                ${[...Array(5)].map((_, i) => {
                    const val = i + 1;
                    const rating = review.rating;
                    if (rating >= val) {
                        return '<span class="star full">★</span>';
                    } else if (rating >= val - 0.5) {
                        return '<span class="star half">★</span>';
                    } else {
                        return '<span class="star">★</span>';
                    }
                }).join('')}
            </span>
            <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
        </div>
        <p class="review-text">${review.text}</p>
    `;
    
        // Adiciona botão de deletar se o review for do usuário atual OU se for admin
        if (auth.currentUser && (review.userId === auth.currentUser.uid || isAdmin())) {
    const deleteBtn = document.createElement("button");
    // Usa a mesma classe visual do botão de envio de review para manter o estilo
    deleteBtn.classList.add("delete-review", "submit-btn");
    deleteBtn.innerHTML = "🗑️ Deletar";
        deleteBtn.onclick = () => {
            if (confirm("Tem certeza que deseja deletar esta review?")) {
                deleteReview(review.bookId, review.timestamp);
                div.remove();
            }
        };
        div.appendChild(deleteBtn);
    }

    return div;
}