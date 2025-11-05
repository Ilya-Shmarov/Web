// Основная инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Coffeemania application...');
    
    // Проверяем авторизацию
    if (window.authAPI && window.authAPI.isAuthenticated()) {
        updateAuthUI();
        if (window.cartAPI) {
            syncCartWithAPI();
        }
    }
    
    // Инициализируем корзину
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Добавляем обработчики для всех страниц
    initializeCommonHandlers();
});

function initializeCommonHandlers() {
    // Закрытие попапов по клику вне области
    document.addEventListener('click', function(event) {
        // Закрытие авторизации
        const authPopup = document.getElementById('authPopup');
        const profileIcon = document.querySelector('.profile-icon');
        
        if (authPopup && authPopup.classList.contains('active') && 
            !authPopup.contains(event.target) && 
            !profileIcon.contains(event.target)) {
            closeAuthPopup();
        }
        
        // Закрытие корзины
        const cartPopup = document.getElementById('cartPopup');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartPopup && cartPopup.classList.contains('active') && 
            !cartPopup.contains(event.target) && 
            !cartIcon.contains(event.target)) {
            closeCartPopup();
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAuthPopup();
            closeCartPopup();
        }
    });
}

// Глобальные функции для попапов
function toggleAuthPopup() {
    const popup = document.getElementById('authPopup');
    if (popup) {
        popup.classList.toggle('active');
        if (popup.classList.contains('active')) {
            showLoginForm();
        }
    }
}

function closeAuthPopup() {
    const popup = document.getElementById('authPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginSwitchSection').style.display = 'none';
    document.getElementById('registerSwitchSection').style.display = 'block';
    document.getElementById('authPopupTitle').textContent = 'Регистрация';
    
    const body = document.querySelector('.auth-popup__body');
    if (body) body.scrollTop = 0;
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginSwitchSection').style.display = 'block';
    document.getElementById('registerSwitchSection').style.display = 'none';
    document.getElementById('authPopupTitle').textContent = 'Вход в аккаунт';
    
    const body = document.querySelector('.auth-popup__body');
    if (body) body.scrollTop = 0;
}