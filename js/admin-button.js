import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

const ADMIN_EMAIL = 'tatacavalini@gmail.com';

onAuthStateChanged(auth, (user) => {
    const adminSection = document.getElementById('admin-section');
    
    if (adminSection) {
        if (user && user.email === ADMIN_EMAIL) {
            adminSection.style.display = 'block';
        } else {
            adminSection.style.display = 'none';
        }
    }
});
