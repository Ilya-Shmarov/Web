// API интеграция для аутентификации
const API_BASE_URL = 'http://localhost:50374';

class AuthAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Уведомляем другие компоненты об авторизации
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { token, user } 
        }));
    }

    clearAuthData() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Уведомляем другие компоненты о выходе
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    async makeRequest(url, options = {}) {
        try {
            console.log(`Making request to: ${API_BASE_URL}${url}`);
            
            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...this.getHeaders(),
                    ...options.headers
                },
                ...options
            };

            // Убираем Content-Type из headers если body не JSON
            if (options.body && typeof options.body === 'string') {
                requestOptions.body = options.body;
            }

            const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Если не удалось распарсить JSON, используем текст ответа
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API request failed:', error);
            
            // Специальная обработка CORS ошибок
            if (error.message.includes('CORS') || error.message.includes('blocked') || error.message.includes('Failed to fetch')) {
                throw new Error('Ошибка подключения к серверу. Убедитесь, что сервер запущен на порту 50374');
            }
            
            throw error;
        }
    }

    // Методы аутентификации
    async register(userData) {
        return await this.makeRequest('/api/Auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        return await this.makeRequest('/api/Auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        this.clearAuthData();
        return { success: true };
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        return this.user;
    }
}

// Создаем глобальный экземпляр API
window.authAPI = new AuthAPI();

// Функции для интеграции с существующими формами
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const credentials = {
        login: formData.get('login'),
        password: formData.get('password')
    };

    try {
        const response = await window.authAPI.login(credentials);
        
        // Сохраняем данные авторизации
        window.authAPI.setAuthData(response.token, response.user);
        
        // Показываем уведомление об успехе
        showAuthNotification(`🎉 Добро пожаловать, ${response.user.firstName}! Вход выполнен успешно`, 'success');
        
        // Закрываем попап
        closeAuthPopup();
        
        // Обновляем UI
        updateAuthUI();
        
        console.log('Login successful:', response);
    } catch (error) {
        console.error('Login failed:', error);
        showAuthNotification(error.message || 'Ошибка входа', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const userData = {
        firstName: formData.get('first_name'),
        lastName: formData.get('last_name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        login: formData.get('login') || formData.get('email'), // Используем логин или email
        password: formData.get('password'),
        privacyPolicy: formData.get('privacy_policy') === 'on'
    };

    try {
        const response = await window.authAPI.register(userData);
        
        // Сохраняем данные авторизации
        window.authAPI.setAuthData(response.token, response.user);
        
        // Показываем уведомление об успехе
        showAuthNotification(`🎊 Поздравляем, ${response.user.firstName}! Регистрация выполнена успешно`, 'success');
        
        // Закрываем попап
        closeAuthPopup();
        
        // Обновляем UI
        updateAuthUI();
        
        console.log('Registration successful:', response);
    } catch (error) {
        console.error('Registration failed:', error);
        showAuthNotification(error.message || 'Ошибка регистрации', 'error');
    }
}

function showAuthNotification(message, type = 'info') {
    const oldNotifications = document.querySelectorAll('.auth-notification');
    oldNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'auth-notification';
    
    // Добавляем иконку в зависимости от типа
    let icon = '';
    switch(type) {
        case 'success': icon = '✅'; break;
        case 'error': icon = '❌'; break;
        case 'info': icon = 'ℹ️'; break;
        default: icon = '📢';
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Красивые градиенты для разных типов уведомлений
    let bgGradient = '';
    switch(type) {
        case 'success': 
            bgGradient = 'linear-gradient(135deg, #4CAF50, #45a049)'; 
            break;
        case 'error': 
            bgGradient = 'linear-gradient(135deg, #f44336, #d32f2f)'; 
            break;
        case 'info': 
            bgGradient = 'linear-gradient(135deg, #2196F3, #1976D2)'; 
            break;
        default: 
            bgGradient = 'linear-gradient(135deg, #FF9800, #F57C00)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgGradient};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        max-width: 350px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        transform: translateX(0);
        transition: all 0.3s ease;
    `;
    
    // Добавляем CSS анимацию если её нет
    if (!document.querySelector('#auth-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Плавное исчезновение
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

function updateAuthUI() {
    const profileIcon = document.querySelector('.profile-icon');
    if (!profileIcon) return;
    
    const user = window.authAPI.getCurrentUser();
    
    if (user) {
        // Создаем красивый контейнер для информации о пользователе
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8B4513, #A0522D);
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;
        
        // Создаем аватар пользователя
        const avatar = document.createElement('div');
        avatar.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #D2691E, #CD853F);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
        `;
        avatar.textContent = user.firstName ? user.firstName.charAt(0) : 'U';
        
        // Создаем контейнер для имени и кнопки выхода
        const userDetails = document.createElement('div');
        userDetails.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        `;
        
        // Имя пользователя
        const userName = document.createElement('span');
        userName.style.cssText = `
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        `;
        userName.textContent = user.firstName || 'Пользователь';
        
        // Кнопка выхода
        const logoutBtn = document.createElement('button');
        logoutBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        `;
        logoutBtn.textContent = 'Выйти';
        logoutBtn.onclick = handleLogout;
        
        // Добавляем эффекты при наведении
        logoutBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.3)';
            this.style.transform = 'scale(1.05)';
        });
        
        logoutBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
            this.style.transform = 'scale(1)';
        });
        
        // Добавляем эффект при наведении на весь контейнер
        userInfo.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        
        userInfo.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        });
        
        // Собираем все элементы
        userDetails.appendChild(userName);
        userDetails.appendChild(logoutBtn);
        userInfo.appendChild(avatar);
        userInfo.appendChild(userDetails);
        
        // Удаляем старую информацию
        const oldUserInfo = profileIcon.querySelector('.user-info');
        if (oldUserInfo) {
            oldUserInfo.remove();
        }
        
        profileIcon.appendChild(userInfo);
    } else {
        // Если пользователь не авторизован, показываем обычную иконку профиля
        const oldUserInfo = profileIcon.querySelector('.user-info');
        if (oldUserInfo) {
            oldUserInfo.remove();
        }
    }
}

async function handleLogout() {
    try {
        // Показываем красивое уведомление о выходе
        showAuthNotification('👋 До свидания! Вы успешно вышли из системы', 'info');
        
        await window.authAPI.logout();
        updateAuthUI();
        
        // Очищаем корзину при выходе
        localStorage.removeItem('cart');
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
        
        // Небольшая задержка для плавного перехода
        setTimeout(() => {
            showAuthNotification('Вы можете войти в систему снова в любое время', 'success');
        }, 1500);
        
    } catch (error) {
        console.error('Logout failed:', error);
        showAuthNotification('Ошибка при выходе из системы', 'error');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обновляем UI при загрузке
    updateAuthUI();
    
    // Подключаем обработчики к формам
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});
