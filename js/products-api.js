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

    // Удалить товар (для администраторов)
    async deleteProduct(id) {
        return await this.makeRequest(`/products/${id}`, {
            method: 'DELETE'
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

            // Статические товары из HTML с обновленными категориями
            const staticProducts = [
                {
                    name: "Кофе в зернах Эспрессо",
                    price: 2400,
                    imageUrl: "img/arabica.jpg",
                    shortDescription: "Кофе Эспрессо премиального качества",
                    category: "Зерновой кофе",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Кофе в зернах Декаф Колумбия",
                    price: 1850,
                    imageUrl: "img/espresso.jpg",
                    shortDescription: "Кофе в зернах Декаф Колумбия – это архив...",
                    category: "Зерновой кофе",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Кофе в капсулах",
                    price: 890,
                    imageUrl: "img/capsals.jpg",
                    shortDescription: "Кофе в капсулах – это удобный формат при...",
                    category: "Кофе в капсулах",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Рулет из говяжьих хвостов",
                    price: 3200,
                    imageUrl: "img/cow.jpg",
                    shortDescription: "Нежный рулет из отборных говяжьих хвост...",
                    category: "Мясное блюдо",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Фокачка Аль Печино",
                    price: 450,
                    imageUrl: "img/folzacha.jpg",
                    shortDescription: "Ароматная итальянская фокачка с оливков...",
                    category: "Хлебобулочное изделие",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Утка по-пекински",
                    price: 4800,
                    imageUrl: "img/utka.jpg",
                    shortDescription: "Эксклюзивное блюдо китайской кухни - хруст...",
                    category: "Мясное блюдо",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Котлеты с ягнёнком",
                    price: 2900,
                    imageUrl: "img/kotieta.jpg",
                    shortDescription: "Нежные котлеты из молодого ягнёнка с аро...",
                    category: "Заморозка",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Колбаски из индейки",
                    price: 1200,
                    imageUrl: "img/cobas.jpg",
                    shortDescription: "Нежные диетические колбаски из филе инд...",
                    category: "Заморозка",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
                },
                {
                    name: "Маринованная курица",
                    price: 950,
                    imageUrl: "img/chiken.jpg",
                    shortDescription: "Сочная курица, маринованная в ароматной с...",
                    category: "Заморозка",
                    weight: 250,
                    calories: 331,
                    proteins: 13.9,
                    fats: 0,
                    carbohydrates: 0
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

            console.log('Распределение товаров по категориям:');
            console.log('- Зерновой кофе:', createdProducts.filter(p => p.category === 'Зерновой кофе').map(p => p.name));
            console.log('- Кофе в капсулах:', createdProducts.filter(p => p.category === 'Кофе в капсулах').map(p => p.name));
            console.log('- Мясное блюдо:', createdProducts.filter(p => p.category === 'Мясное блюдо').map(p => p.name));
            console.log('- Хлебобулочное изделие:', createdProducts.filter(p => p.category === 'Хлебобулочное изделие').map(p => p.name));
            console.log('- Заморозка:', createdProducts.filter(p => p.category === 'Заморозка').map(p => p.name));

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

// Функция для ручной инициализации
window.initializeProducts = async function() {
    try {
        const result = await window.productsAPI.initializeProducts();
        console.log('Товары инициализированы:', result);
        
        // Перезагружаем товары на странице
        if (typeof loadProducts === 'function') {
            const categories = getCurrentPageCategory();
            await loadProducts(categories);
        }
        
        return result;
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        throw error;
    }
};