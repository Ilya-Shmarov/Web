// products-api.js
const PRODUCTS_API_BASE_URL = 'http://localhost:50374/api';

class ProductsAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
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
            console.log(`Making products request to: ${PRODUCTS_API_BASE_URL}${url}`);
            
            const response = await fetch(`${PRODUCTS_API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Products API request failed:', error);
            throw error;
        }
    }

    // Получить все товары
    async getProducts() {
        return await this.makeRequest('/products');
    }

    // Получить товар по ID
    async getProduct(id) {
        return await this.makeRequest(`/products/${id}`);
    }

    // Получить товары по категории
    async getProductsByCategory(category) {
        return await this.makeRequest(`/products/category/${category}`);
    }

    // Создать товар (для администраторов)
    async createProduct(productData) {
        return await this.makeRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    // Обновить товар (для администраторов)
    async updateProduct(id, productData) {
        return await this.makeRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    // Инициализация товаров (создание если их нет)
    async initializeProducts() {
        try {
            // Сначала проверяем, есть ли уже товары
            const existingProducts = await this.getProducts();
            
            if (existingProducts.length > 0) {
                console.log('Товары уже существуют в базе данных');
                return existingProducts;
            }

            console.log('Создаем начальные товары...');

            // Статические товары из HTML с ПРАВИЛЬНЫМИ категориями
            const staticProducts = [
                // КОФЕ
                {
                    name: "Кофе в зернах Эспрессо",
                    price: 2300,
                    imageUrl: "img/arabica.jpg",
                    shortDescription: "Премиальный кофе в зернах",
                    category: "coffee", // Должно совпадать с URL coffe.html
                    weight: 1000,
                    calories: 1,
                    proteins: 0.2,
                    fats: 0.1,
                    carbohydrates: 0.3
                },
                {
                    name: "Кофе в зёрнах Декаф Колумбия",
                    price: 2300,
                    imageUrl: "img/espresso.jpg",
                    shortDescription: "Безкофеиновый кофе",
                    category: "coffee", // Должно совпадать с URL coffe.html
                    weight: 1000,
                    calories: 1,
                    proteins: 0.2,
                    fats: 0.1,
                    carbohydrates: 0.3
                },
                {
                    name: "Капсулы кофе",
                    price: 1600,
                    imageUrl: "img/capsuls.jpg",
                    shortDescription: "Кофе в капсулах",
                    category: "coffee", // Должно совпадать с URL coffe.html
                    weight: 500,
                    calories: 1,
                    proteins: 0.2,
                    fats: 0.1,
                    carbohydrates: 0.3
                },
                // МЕНЮ
                {
                    name: "Рулет из говяжьих хвостов",
                    price: 2100,
                    imageUrl: "img/cow.jpg",
                    shortDescription: "Деликатесный рулет",
                    category: "menu", // Должно совпадать с URL menu.html
                    weight: 400,
                    calories: 250,
                    proteins: 20,
                    fats: 15,
                    carbohydrates: 5
                },
                {
                    name: "Фокачча Аль Печино",
                    price: 950,
                    imageUrl: "img/fokacha.jpg",
                    shortDescription: "Итальянская лепешка",
                    category: "menu", // Должно совпадать с URL menu.html
                    weight: 300,
                    calories: 200,
                    proteins: 6,
                    fats: 8,
                    carbohydrates: 28
                },
                {
                    name: "Утка по пекински",
                    price: 1600,
                    imageUrl: "img/utka.jpg",
                    shortDescription: "Традиционное блюдо",
                    category: "menu", // Должно совпадать с URL menu.html
                    weight: 600,
                    calories: 300,
                    proteins: 25,
                    fats: 20,
                    carbohydrates: 10
                },
                // КУЛИНАРИЯ НА ЗАКАЗ
                {
                    name: "Колбаски из индейки",
                    price: 1300,
                    imageUrl: "img/colbas.jpg",
                    shortDescription: "Диетические колбаски",
                    category: "culinary", // Должно совпадать с URL cuchnya.html
                    weight: 400,
                    calories: 180,
                    proteins: 18,
                    fats: 10,
                    carbohydrates: 5
                },
                {
                    name: "Котлеты из ягнёнка",
                    price: 2300,
                    imageUrl: "img/kotleta.jpg",
                    shortDescription: "Нежные котлеты",
                    category: "culinary", // Должно совпадать с URL cuchnya.html
                    weight: 500,
                    calories: 280,
                    proteins: 22,
                    fats: 18,
                    carbohydrates: 8
                },
                {
                    name: "Маринованная курица",
                    price: 1800,
                    imageUrl: "img/chiken.jpg",
                    shortDescription: "Ароматная курица",
                    category: "culinary", // Должно совпадать с URL cuchnya.html
                    weight: 700,
                    calories: 220,
                    proteins: 25,
                    fats: 12,
                    carbohydrates: 6
                }
            ];

            // Создаем товары через API
            const createdProducts = [];
            for (const productData of staticProducts) {
                try {
                    const product = await this.createProduct(productData);
                    createdProducts.push(product);
                    console.log(`Создан товар: ${product.name} (категория: ${product.category})`);
                } catch (error) {
                    console.error(`Ошибка создания товара ${productData.name}:`, error);
                }
            }

            console.log(`Создано ${createdProducts.length} товаров`);
            return createdProducts;

        } catch (error) {
            console.error('Ошибка инициализации товаров:', error);
            throw error;
        }
    }
}

// Создаем глобальный экземпляр API
window.productsAPI = new ProductsAPI();

// Функция для ручной инициализации (можно вызвать из консоли браузера)
window.initializeProducts = async function() {
    try {
        const result = await window.productsAPI.initializeProducts();
        console.log('Товары инициализированы:', result);
        alert(`Создано ${result.length} товаров`);
        
        // Перезагружаем товары на странице
        if (typeof loadProducts === 'function') {
            const category = getCurrentPageCategory();
            loadProducts(category);
        }
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка инициализации товаров: ' + error.message);
    }
};