// products-api.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
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

    // Инициализация товаров (создание если их нет) - ИСПРАВЛЕННЫЕ КАТЕГОРИИ
    async initializeProducts() {
        try {
            // Сначала проверяем, есть ли уже товары
            const existingProducts = await this.getProducts();
            
            if (existingProducts.length > 0) {
                console.log('Товары уже существуют в базе данных');
                return existingProducts;
            }

            console.log('Создаем начальные товары с правильными категориями...');

            // Статические товары из HTML с ПРАВИЛЬНЫМИ категориями
            const staticProducts = [
                // === КОФЕ === (должны отображаться в coffe.html)
                {
                    name: "Кофе в зернах Эспрессо",
                    price: 2300,
                    imageUrl: "img/arabica.jpg",
                    shortDescription: "Премиальный кофе в зернах",
                    category: "coffee", // Должно совпадать с coffe.html
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
                    category: "coffee", // Должно совпадать с coffe.html
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
                    category: "coffee", // Должно совпадать с coffe.html
                    weight: 500,
                    calories: 1,
                    proteins: 0.2,
                    fats: 0.1,
                    carbohydrates: 0.3
                },

                // === МЕНЮ === (должны отображаться в menu.html)
                {
                    name: "Рулет из говяжьих хвостов",
                    price: 2100,
                    imageUrl: "img/cow.jpg",
                    shortDescription: "Деликатесный рулет",
                    category: "menu", // Должно совпадать с menu.html
                    weight: 400,
                    calories: 250,
                    proteins: 20,
                    fats: 15,
                    carbohydrates: 5
                },
                {
                    name: "Утка по пекински",
                    price: 1600,
                    imageUrl: "img/utka.jpg",
                    shortDescription: "Традиционное блюдо",
                    category: "menu", // Должно совпадать с menu.html
                    weight: 600,
                    calories: 300,
                    proteins: 25,
                    fats: 20,
                    carbohydrates: 10
                },
                {
                    name: "Фокачча Аль Печино",
                    price: 950,
                    imageUrl: "img/fokacha.jpg",
                    shortDescription: "Итальянская лепешка",
                    category: "menu", // Должно совпадать с menu.html
                    weight: 300,
                    calories: 200,
                    proteins: 6,
                    fats: 8,
                    carbohydrates: 28
                },

                // === КУЛИНАРИЯ НА ЗАКАЗ === (должны отображаться в cuchnya.html)
                {
                    name: "Колбаски из индейки",
                    price: 1300,
                    imageUrl: "img/colbas.jpg",
                    shortDescription: "Диетические колбаски",
                    category: "culinary", // Должно совпадать с cuchnya.html
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
                    category: "culinary", // Должно совпадать с cuchnya.html
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
                    category: "culinary", // Должно совпадать с cuchnya.html
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

            console.log('Распределение товаров по категориям:');
            console.log('- Кофе (coffee):', createdProducts.filter(p => p.category === 'coffee').map(p => p.name));
            console.log('- Меню (menu):', createdProducts.filter(p => p.category === 'menu').map(p => p.name));
            console.log('- Кулинария (culinary):', createdProducts.filter(p => p.category === 'culinary').map(p => p.name));

            console.log(`Создано ${createdProducts.length} товаров`);
            return createdProducts;

        } catch (error) {
            console.error('Ошибка инициализации товаров:', error);
            throw error;
        }
    }

    // Функция для принудительного пересоздания товаров с правильными категориями
    async recreateProductsWithCorrectCategories() {
        try {
            console.log('Удаляем старые товары и создаем новые с правильными категориями...');
            
            // Получаем все товары
            const existingProducts = await this.getProducts();
            
            // Удаляем все существующие товары
            for (const product of existingProducts) {
                try {
                    await this.deleteProduct(product.id);
                    console.log(`Удален товар: ${product.name}`);
                } catch (error) {
                    console.error(`Ошибка удаления товара ${product.name}:`, error);
                }
            }
            
            // Создаем новые товары с правильными категориями
            return await this.initializeProducts();
            
        } catch (error) {
            console.error('Ошибка пересоздания товаров:', error);
            throw error;
        }
    }

    // Функция для исправления категорий существующих товаров
    async fixExistingCategories() {
        try {
            console.log('Исправляем категории существующих товаров...');
            
            const products = await this.getProducts();
            const categoryMapping = {
                // Кофе
                'Кофе в зернах Эспрессо': 'coffee',
                'Кофе в зёрнах Декаф Колумбия': 'coffee', 
                'Капсулы кофе': 'coffee',
                
                // Меню
                'Рулет из говяжьих хвостов': 'menu',
                'Утка по пекински': 'menu',
                'Фокачча Аль Печино': 'menu',
                
                // Кулинария
                'Колбаски из индейки': 'culinary',
                'Котлеты из ягнёнка': 'culinary',
                'Маринованная курица': 'culinary'
            };

            let fixedCount = 0;
            
            for (const product of products) {
                const correctCategory = categoryMapping[product.name];
                if (correctCategory && product.category !== correctCategory) {
                    try {
                        await this.updateProduct(product.id, {
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            shortDescription: product.shortDescription,
                            category: correctCategory,
                            weight: product.weight,
                            calories: product.calories,
                            proteins: product.proteins,
                            fats: product.fats,
                            carbohydrates: product.carbohydrates
                        });
                        console.log(`Исправлена категория: ${product.name} -> ${correctCategory}`);
                        fixedCount++;
                    } catch (error) {
                        console.error(`Ошибка исправления товара ${product.name}:`, error);
                    }
                }
            }

            console.log(`Исправлено ${fixedCount} товаров`);
            return fixedCount;
            
        } catch (error) {
            console.error('Ошибка исправления категорий:', error);
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
        alert(`Создано ${result.length} товаров с правильными категориями`);
        
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

// Функция для принудительного исправления категорий
window.fixCategories = async function() {
    try {
        const result = await window.productsAPI.recreateProductsWithCorrectCategories();
        console.log('Категории исправлены:', result);
        alert('Категории товаров исправлены! Товары пересозданы.');
        
        // Перезагружаем товары на странице
        if (typeof loadProducts === 'function') {
            const category = getCurrentPageCategory();
            loadProducts(category);
        }
    } catch (error) {
        console.error('Ошибка исправления категорий:', error);
        alert('Ошибка исправления категорий: ' + error.message);
    }
};

// Функция для исправления существующих категорий без удаления товаров
window.fixExistingCategories = async function() {
    try {
        const fixedCount = await window.productsAPI.fixExistingCategories();
        console.log('Категории исправлены:', fixedCount);
        alert(`Исправлено ${fixedCount} товаров!`);
        
        // Перезагружаем товары на странице
        if (typeof loadProducts === 'function') {
            const category = getCurrentPageCategory();
            loadProducts(category);
        }
    } catch (error) {
        console.error('Ошибка исправления категорий:', error);
        alert('Ошибка исправления категорий: ' + error.message);
    }
};

// Функция для немедленного исправления отображения товаров на страницах
window.fixCurrentPageProducts = async function() {
    try {
        const currentPage = window.location.pathname.split('/').pop();
        console.log('Текущая страница:', currentPage);
        
        const categoryMap = {
            'coffe.html': 'coffee',
            'menu.html': 'menu',
            'cuchnya.html': 'culinary'
        };
        
        const currentCategory = categoryMap[currentPage];
        
        if (!currentCategory) {
            console.log('Это не категорийная страница');
            return;
        }
        
        console.log(`Загружаем товары для категории: ${currentCategory}`);
        
        // Временно создаем статические товары для каждой категории
        const staticProductsByCategory = {
            'coffee': [
                {
                    id: 1,
                    name: "Кофе в зернах Эспрессо",
                    price: 2300,
                    imageUrl: "img/arabica.jpg",
                    category: "coffee",
                    weight: 1000
                },
                {
                    id: 2,
                    name: "Кофе в капсулах",
                    price: 1600,
                    imageUrl: "img/capsuls.jpg", 
                    category: "coffee",
                    weight: 500
                },
                {
                    id: 3,
                    name: "Кофе в зёрнах Декаф Колумбия",
                    price: 2300,
                    imageUrl: "img/espresso.jpg",
                    category: "coffee",
                    weight: 1000
                }
            ],
            'menu': [
                {
                    id: 4,
                    name: "Рулет из говяжьих хвостов",
                    price: 2100,
                    imageUrl: "img/cow.jpg",
                    category: "menu",
                    weight: 400
                },
                {
                    id: 5,
                    name: "Утка по пекински", 
                    price: 1600,
                    imageUrl: "img/utka.jpg",
                    category: "menu",
                    weight: 600
                },
                {
                    id: 6,
                    name: "Фокачча Аль Печино",
                    price: 950,
                    imageUrl: "img/fokacha.jpg",
                    category: "menu", 
                    weight: 300
                }
            ],
            'culinary': [
                {
                    id: 7,
                    name: "Колбаски из индейки",
                    price: 1300,
                    imageUrl: "img/colbas.jpg",
                    category: "culinary",
                    weight: 400
                },
                {
                    id: 8,
                    name: "Котлеты из ягнёнка",
                    price: 2300,
                    imageUrl: "img/kotleta.jpg",
                    category: "culinary",
                    weight: 500
                },
                {
                    id: 9, 
                    name: "Маринованная курица",
                    price: 1800,
                    imageUrl: "img/chiken.jpg",
                    category: "culinary",
                    weight: 700
                }
            ]
        };
        
        const products = staticProductsByCategory[currentCategory] || [];
        console.log(`Найдено ${products.length} товаров для категории ${currentCategory}`);
        
        if (products.length > 0) {
            renderProducts(products);
        } else {
            showProductsInitializationPrompt();
        }
        
    } catch (error) {
        console.error('Ошибка при исправлении товаров:', error);
        showProductsError(error.message);
    }
};

// Функция для рендера товаров (аналогичная существующей в main.js)
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

    console.log(`Отображено ${products.length} товаров`);
}

function showProductsError(message) {
    const catalogContainer = document.querySelector('.catalog');
    if (catalogContainer) {
        catalogContainer.innerHTML = `
            <div class="catalog-error">
                <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                <h4>Ошибка загрузки товаров</h4>
                <p>${message}</p>
                <button onclick="fixCurrentPageProducts()" class="retry-btn">Попробовать снова</button>
            </div>
        `;
    }
}

function showProductsInitializationPrompt() {
    const catalogContainer = document.querySelector('.catalog');
    if (catalogContainer) {
        catalogContainer.innerHTML = `
            <div class="catalog-empty">
                <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
                <h4>Товары не найдены</h4>
                <p>База данных пуста. Хотите создать демо-товары?</p>
                <button onclick="fixCurrentPageProducts()" class="retry-btn" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    Показать товары для этой страницы
                </button>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                    Это покажет товары для текущего раздела
                </p>
            </div>
        `;
    }
}