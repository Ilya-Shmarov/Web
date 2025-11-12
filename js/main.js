// main.js
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
    
    // Загружаем продукты если на странице есть каталог
    if (document.querySelector('.catalog')) {
        initializeAndLoadProducts();
    }
    
    // Добавляем обработчики для всех страниц
    initializeCommonHandlers();
});

// Инициализация и загрузка товаров
async function initializeAndLoadProducts() {
    try {
        const categories = getCurrentPageCategory();
        console.log(`Current page categories: ${categories}`);
        
        // Пытаемся загрузить товары
        let products = await loadProducts(categories);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError(error.message);
    }
}

// Функция показа промпта для инициализации
function showProductsInitializationPrompt() {
    const catalogContainer = document.querySelector('.catalog');
    if (catalogContainer) {
        catalogContainer.innerHTML = `
            <div class="catalog-empty">
                <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
                <h4>Товары не найдены</h4>
                <p>База данных пуста. Хотите создать демо-товары?</p>
                <button onclick="initializeDemoProducts()" class="retry-btn" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    Создать демо-товары
                </button>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                    Это создаст все товары из каталога в базе данных
                </p>
            </div>
        `;
    }
}

// Функция для инициализации демо-товаров
async function initializeDemoProducts() {
    try {
        const catalogContainer = document.querySelector('.catalog');
        if (catalogContainer) {
            catalogContainer.innerHTML = `
                <div class="catalog-loading">
                    <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
                    <h4>Создание товаров...</h4>
                    <p>Пожалуйста, подождите</p>
                </div>
            `;
        }

        await window.initializeProducts();
        
    } catch (error) {
        console.error('Failed to initialize products:', error);
        showProductsError('Ошибка создания товаров: ' + error.message);
    }
}

// Функции для работы с продуктами
async function loadProducts(categories = null) {
    try {
        let products;
        
        if (categories) {
            console.log(`Loading products for categories: ${categories}`);
            // Получаем все товары и фильтруем по категориям
            products = await window.productsAPI.getProducts();
            products = products.filter(product => categories.includes(product.category));
            console.log(`Found ${products.length} products in categories ${categories}:`, products.map(p => p.name));
        } else {
            console.log('Loading all products');
            products = await window.productsAPI.getProducts();
            console.log(`Found ${products.length} total products:`, products.map(p => `${p.name} (${p.category})`));
        }
        
        renderProducts(products);
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError(error.message);
        return [];
    }
}

function renderProducts(products) {
    const catalogContainer = document.querySelector('.catalog');
    if (!catalogContainer) {
        console.log('Catalog container not found on this page');
        return;
    }

    if (products.length === 0) {
        catalogContainer.innerHTML = `
            <div class="catalog-empty">
                <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
                <h4>Товары не найдены</h4>
                <p>Попробуйте обновить страницу или зайти позже</p>
            </div>
        `;
        return;
    }

    catalogContainer.innerHTML = products.map(product => `
        <div class="catalog__item">
            <img class="item__image" src="${product.imageUrl || 'img/placeholder.jpg'}" alt="${product.name}"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUQ2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iI0U2RDdDMyIvPgo8cGF0aCBkPSJNNjAgNjBIMTQwVjE0MEg2MFY2MFoiIGZpbGw9IiM4QjczNTUiLz4KPC9zdmc+'">
            <p class="item__name">${product.name}</p>
            <p class="item__price">${product.price} ₽</p>
            ${product.weight ? `<p class="item__weight">${product.weight}g</p>` : ''}
            <div class="item__actions">
                <a class="item__link" href="product_${product.id}.html">перейти</a>
                <button class="item__cart-btn" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl || 'img/placeholder.jpg'}')">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.4 5.2 16.4H17M17 13V16.4M9 19C9 19.6 8.6 20 8 20C7.4 20 7 19.6 7 19C7 18.4 7.4 18 8 18C8.6 18 9 18.4 9 19ZM19 19C19 19.6 18.6 20 18 20C17.4 20 17 19.6 17 19C17 18.4 17.4 18 18 18C18.6 18 19 18.4 19 19Z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    console.log(`Rendered ${products.length} products`);
}

function showProductsError(message) {
    const catalogContainer = document.querySelector('.catalog');
    if (catalogContainer) {
        catalogContainer.innerHTML = `
            <div class="catalog-error">
                <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                <h4>Ошибка загрузки товаров</h4>
                <p>${message}</p>
                <button onclick="retryLoadingProducts()" class="retry-btn">Попробовать снова</button>
            </div>
        `;
    }
}

function retryLoadingProducts() {
    const categories = getCurrentPageCategory();
    loadProducts(categories);
}

function getCurrentPageCategory() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    const categoryMap = {
        'coffe.html': ['Зерновой кофе', 'Кофе в капсулах'], // Все категории кофе
        'menu.html': ['Мясное блюдо', 'Хлебобулочное изделие'], // Меню - мясные блюда и хлебобулочные изделия
        'cuchnya.html': ['Заморозка'], // Кулинария на заказ - заморозка
        'catalog.html': null // все товары
    };
    
    const categories = categoryMap[page] || null;
    console.log(`Page: ${page}, Categories: ${categories}`);
    return categories;
}

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

// Функции для обновления UI авторизации
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

// Отладочные функции для проверки категорий
window.debugCategories = async function() {
    console.log('=== ДЕБАГ КАТЕГОРИЙ ===');
    
    // Проверим текущую страницу и категорию
    const currentPage = window.location.pathname.split('/').pop();
    const currentCategories = getCurrentPageCategory();
    console.log(`Текущая страница: ${currentPage}`);
    console.log(`Определенные категории: ${currentCategories}`);
    
    // Проверим все товары в БД
    try {
        const allProducts = await window.productsAPI.getProducts();
        console.log('Все товары в БД:');
        allProducts.forEach(p => {
            console.log(`- ${p.name} -> Категория: "${p.category}"`);
        });
        
        // Проверим распределение по страницам
        console.log('=== РАСПРЕДЕЛЕНИЕ ПО СТРАНИЦАМ ===');
        
        // Меню
        const menuProducts = allProducts.filter(p => ['Мясное блюдо', 'Хлебобулочное изделие'].includes(p.category));
        console.log('МЕНЮ (menu.html):', menuProducts.map(p => p.name));
        
        // Кофе
        const coffeeProducts = allProducts.filter(p => ['Зерновой кофе', 'Кофе в капсулах'].includes(p.category));
        console.log('КОФЕ (coffe.html):', coffeeProducts.map(p => p.name));
        
        // Кулинария на заказ
        const cuchnyaProducts = allProducts.filter(p => p.category === 'Заморозка');
        console.log('КУЛИНАРИЯ НА ЗАКАЗ (cuchnya.html):', cuchnyaProducts.map(p => p.name));
        
    } catch (error) {
        console.error('Ошибка при отладке:', error);
    }
};

// Функция для принудительного обновления цен с сервера
window.forceRefreshProducts = async function() {
    try {
        console.log('Принудительное обновление товаров...');
        const categories = getCurrentPageCategory();
        
        // Перезагружаем товары
        await loadProducts(categories);
        console.log('Товары обновлены!');
        
    } catch (error) {
        console.error('Ошибка обновления:', error);
    }
};

// Функция для проверки распределения товаров
window.checkProductDistribution = function() {
    console.log('=== ПРОВЕРКА РАСПРЕДЕЛЕНИЯ ТОВАРОВ ===');
    console.log('После обновления распределение должно быть следующим:');
    console.log('');
    console.log('📋 МЕНЮ (menu.html):');
    console.log('   - Рулет из говяжьих хвостов (Мясное блюдо)');
    console.log('   - Утка по-пекински (Мясное блюдо)');
    console.log('   - Фокачка Аль Печино (Хлебобулочное изделие)');
    console.log('');
    console.log('☕ КОФЕ (coffe.html):');
    console.log('   - Кофе в зернах Эспрессо (Зерновой кофе)');
    console.log('   - Кофе в зернах Декаф Колумбия (Зерновой кофе)');
    console.log('   - Кофе в капсулах (Кофе в капсулах)');
    console.log('');
    console.log('🍳 КУЛИНАРИЯ НА ЗАКАЗ (cuchnya.html):');
    console.log('   - Колбаски из индейки (Заморозка)');
    console.log('   - Котлеты с ягнёнком (Заморозка)');
    console.log('   - Маринованная курица (Заморозка)');
    console.log('');
    console.log('📦 КАТАЛОГ (catalog.html): Все товары');
    console.log('');
    console.log('Для проверки реального распределения используйте: debugCategories()');
};

// Добавляем CSS стили для новых состояний
if (!document.querySelector('#products-styles')) {
    const style = document.createElement('style');
    style.id = 'products-styles';
    style.textContent = `
        .catalog-empty, .catalog-error, .catalog-loading {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .catalog-empty h4, .catalog-error h4, .catalog-loading h4 {
            margin-bottom: 10px;
            color: #333;
        }
        
        .retry-btn {
            background: #8B4513;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .retry-btn:hover {
            background: #A0522D;
        }
        
        .item__weight {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
        }
        
        .catalog-loading {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
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

// Экспортируем функции для глобального использования
window.loadProducts = loadProducts;
window.getCurrentPageCategory = getCurrentPageCategory;
window.retryLoadingProducts = retryLoadingProducts;
window.initializeAndLoadProducts = initializeAndLoadProducts;