// API интеграция для корзины
const CART_API_BASE_URL = 'http://localhost:50374/api';

class CartAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
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
            const response = await fetch(`${CART_API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            if (response.status === 401) {
                // Токен истек или недействителен
                this.clearToken();
                throw new Error('Authentication required');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Методы для работы с корзиной
    async getCart() {
        return await this.makeRequest('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return await this.makeRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            })
        });
    }

    async updateCartItem(productId, quantity) {
        return await this.makeRequest('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            })
        });
    }

    async removeFromCart(productId) {
        return await this.makeRequest(`/cart/remove/${productId}`, {
            method: 'DELETE'
        });
    }

    async clearCart() {
        return await this.makeRequest('/cart/clear', {
            method: 'DELETE'
        });
    }

    async getCartItem(productId) {
        return await this.makeRequest(`/cart/item/${productId}`);
    }
}

// Создаем глобальный экземпляр API
window.cartAPI = new CartAPI();

// Функции для интеграции с существующим кодом корзины
async function syncCartWithAPI() {
    if (!window.cartAPI.token) {
        console.log('User not authenticated, using localStorage only');
        return;
    }

    try {
        const apiCart = await window.cartAPI.getCart();
        
        // Преобразуем API корзину в формат localStorage
        const localCart = apiCart.items.map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.productPrice,
            image: item.productImageUrl,
            quantity: item.quantity
        }));

        // Обновляем localStorage
        localStorage.setItem('cart', JSON.stringify(localCart));
        
        // Обновляем UI
        updateCartCount();
        
        console.log('Cart synced with API');
    } catch (error) {
        console.error('Failed to sync cart with API:', error);
    }
}

async function addToCartAPI(id, name, price, image) {
    try {
        if (window.cartAPI.token) {
            // Пользователь авторизован - используем API
            await window.cartAPI.addToCart(id, 1);
            await syncCartWithAPI();
        } else {
            // Пользователь не авторизован - используем localStorage
            addToCartLocal(id, name, price, image);
        }
        
        showCartNotification(name);
    } catch (error) {
        console.error('Failed to add to cart:', error);
        // Fallback to localStorage
        addToCartLocal(id, name, price, image);
        showCartNotification(name);
    }
}

function addToCartLocal(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
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
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Переопределяем глобальную функцию addToCart
window.addToCart = addToCartAPI;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли токен
    const token = localStorage.getItem('authToken');
    if (token) {
        window.cartAPI.setToken(token);
        syncCartWithAPI();
    }
    
    // Слушаем события авторизации
    window.addEventListener('userLoggedIn', function(event) {
        window.cartAPI.setToken(event.detail.token);
        syncCartWithAPI();
    });
    
    window.addEventListener('userLoggedOut', function() {
        window.cartAPI.clearToken();
        // Очищаем корзину при выходе
        localStorage.removeItem('cart');
        updateCartCount();
    });
});
