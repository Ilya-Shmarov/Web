// cart.js
// === КОРЗИНА ===
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Проверяем, подключен ли API
const isAPIAvailable = typeof window.cartAPI !== 'undefined';

// Функция синхронизации корзины с API
async function syncCartWithAPI() {
    if (!isAPIAvailable || !window.cartAPI.token) {
        console.log('API not available or user not authenticated');
        return;
    }

    try {
        const apiCart = await window.cartAPI.getCart();
        
        // Преобразуем API корзину в формат localStorage
        cart = apiCart.items.map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            image: item.productImageUrl,
            quantity: item.quantity
        }));

        // Обновляем localStorage
        saveCart();
        
        console.log('Cart synced with API:', cart);
    } catch (error) {
        console.error('Failed to sync cart with API:', error);
    }
}

// Основная функция добавления в корзину
async function addToCart(id, name, price, image) {
    console.log('Добавляем товар в корзину:', { id, name, price, image });
    
    // Проверяем авторизацию
    const isAuthenticated = window.authAPI && window.authAPI.isAuthenticated();
    
    if (isAPIAvailable && isAuthenticated) {
        // Используем API для авторизованных пользователей
        await addToCartAPI(id, name, price, image);
    } else {
        // Используем localStorage для неавторизованных
        addToCartLocal(id, name, price, image);
    }
    
    // Анимация кнопки
    if (event && event.target) {
        animateCartButton(event.target);
    }
    
    // Обновляем попап корзины если он открыт
    if (document.getElementById('cartPopup')?.classList.contains('active')) {
        renderCartPopup();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCartLocal(id, name, price, image) {
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        const newItem = {
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        };
        cart.push(newItem);
    }
    
    saveCart();
    showCartNotification(name);
}

async function addToCartAPI(id, name, price, image) {
    try {
        await window.cartAPI.addToCart(id, 1);
        await syncCartWithAPI();
        showCartNotification(name);
    } catch (error) {
        console.error('Failed to add to cart via API:', error);
        // Fallback to localStorage
        addToCartLocal(id, name, price, image);
    }
}

function animateCartButton(button) {
    if (button) {
        button.style.transform = 'scale(1.2)';
        button.style.background = '#4CAF50';
        button.style.borderColor = '#4CAF50';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = '';
            button.style.borderColor = '';
        }, 200);
    }
}

function showCartNotification(productName) {
    const oldNotifications = document.querySelectorAll('.cart-notification');
    oldNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `<span>✅ Товар "${productName}" добавлен в корзину!</span>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function toggleCartPopup() {
    const popup = document.getElementById('cartPopup');
    if (!popup) {
        console.error('Элемент cartPopup не найден!');
        return;
    }
    
    popup.classList.toggle('active');
    
    if (popup.classList.contains('active')) {
        renderCartPopup();
    }
}

function closeCartPopup() {
    const popup = document.getElementById('cartPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

function renderCartPopup() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItemsList || !cartTotal) {
        console.error('Не найдены элементы корзины!');
        return;
    }
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="cart-empty">
                <div style="font-size: 48px; margin-bottom: 10px;">🛒</div>
                <h4>Корзина пуста</h4>
                <p>Добавьте товары из каталога</p>
            </div>
        `;
        cartTotal.textContent = '0 ₽';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    let totalAmount = 0;
    cartItemsList.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item__image"
                 onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUQ2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNFNkQ3QzMiLz4KPHBhdGggZD0iTTI1IDI1SDM1VjM1SDI1VjI1WiIgZmlsbD0iIzhCNzM1NSIvPgo8L3N2Zz4K'">
            <div class="cart-item__info">
                <div class="cart-item__name">${item.name}</div>
                <div class="cart-item__price">${item.price} ₽ × ${item.quantity} = ${itemTotal} ₽</div>
                <div class="cart-item__quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item__remove" onclick="removeFromCart(${item.id})" title="Удалить">×</button>
        `;
        
        cartItemsList.appendChild(cartItemElement);
    });
    
    cartTotal.textContent = `${totalAmount} ₽`;
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
}

// ОБНОВЛЕННАЯ функция updateCartQuantity для работы с API
async function updateCartQuantity(id, change) {
    // Останавливаем всплытие события, чтобы корзина не закрывалась
    if (event) {
        event.stopPropagation();
    }
    
    const isAuthenticated = window.authAPI && window.authAPI.isAuthenticated();
    
    if (isAPIAvailable && isAuthenticated) {
        try {
            const itemIndex = cart.findIndex(item => item.id === id);
            if (itemIndex === -1) return;
            
            const newQuantity = cart[itemIndex].quantity + change;
            
            if (newQuantity <= 0) {
                await window.cartAPI.removeFromCart(id);
            } else {
                await window.cartAPI.updateCartItem(id, newQuantity);
            }
            
            await syncCartWithAPI();
            renderCartPopup();
            return;
        } catch (error) {
            console.error('Failed to update cart via API:', error);
        }
    }
    
    // Fallback to localStorage
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart();
        renderCartPopup();
    }
}

// ОБНОВЛЕННАЯ функция removeFromCart для работы с API
async function removeFromCart(id) {
    // Останавливаем всплытие события, чтобы корзина не закрывалась
    if (event) {
        event.stopPropagation();
    }
    
    const isAuthenticated = window.authAPI && window.authAPI.isAuthenticated();
    
    if (isAPIAvailable && isAuthenticated) {
        try {
            await window.cartAPI.removeFromCart(id);
            await syncCartWithAPI();
            renderCartPopup();
            return;
        } catch (error) {
            console.error('Failed to remove from cart via API:', error);
        }
    }
    
    // Fallback to localStorage
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartPopup();
}

function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    
    const total = document.getElementById('cartTotal').textContent;
    const itemList = cart.map(item => `• ${item.name} (${item.quantity} шт.)`).join('\n');
    
    alert(`Заказ оформлен!\n\nТовары:\n${itemList}\n\nОбщая сумма: ${total}`);
    
    // Очищаем корзину через API если авторизованы
    const isAuthenticated = window.authAPI && window.authAPI.isAuthenticated();
    if (isAPIAvailable && isAuthenticated) {
        window.cartAPI.clearCart().catch(console.error);
    }
    
    cart = [];
    saveCart();
    renderCartPopup();
    closeCartPopup();
}

// Инициализация корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Синхронизируем с API если пользователь авторизован
    if (window.authAPI && window.authAPI.isAuthenticated() && isAPIAvailable) {
        syncCartWithAPI();
    }
    
    // УДАЛЕНО: Закрытие корзины по клику вне области
    // Теперь корзина закрывается только по крестику
    
    // Закрытие по Escape остается
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCartPopup();
        }
    });
    
    // Добавляем CSS анимацию если её нет
    if (!document.querySelector('#cart-animation-style')) {
        const style = document.createElement('style');
        style.id = 'cart-animation-style';
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
            
            .cart-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                font-size: 14px;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
});

// Экспортируем функции для использования в других модулях
window.syncCartWithAPI = syncCartWithAPI;
window.updateCartCount = updateCartCount;