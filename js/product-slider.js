// js/product-slider.js
class ProductSlider {
    constructor(containerId, productData) {
        this.container = document.getElementById(containerId);
        this.productData = productData;
        this.currentSlide = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.isAutoPlaying = true;
        this.autoPlayDelay = 4000; // 4 секунды
        
        this.init();
    }

    init() {
        if (!this.container || !this.productData) {
            console.warn('ProductSlider: Container or product data not found');
            return;
        }

        // Собираем все доступные изображения
        if (this.productData.imageUrl) {
            this.slides.push(this.productData.imageUrl);
        }
        if (this.productData.imageUrl2) {
            this.slides.push(this.productData.imageUrl2);
        }

        console.log('ProductSlider: Found', this.slides.length, 'images');

        // Если только одно изображение - статичное отображение
        if (this.slides.length <= 1) {
            this.renderStaticImage();
            return;
        }

        // Если несколько изображений - создаем слайдер
        this.renderSlider();
        this.startAutoPlay();
    }

    renderStaticImage() {
        console.log('ProductSlider: Rendering static image');
        this.container.innerHTML = `
            <div class="product-image-static">
                <img src="${this.slides[0]}" alt="${this.productData.name}" class="product__img">
            </div>
        `;
    }

    renderSlider() {
        console.log('ProductSlider: Rendering slider with', this.slides.length, 'images');
        this.container.innerHTML = `
            <div class="product-slider">
                <div class="slider-container">
                    ${this.slides.map((slide, index) => `
                        <div class="slide ${index === 0 ? 'active' : ''}">
                            <img src="${slide}" alt="${this.productData.name} - изображение ${index + 1}" class="product__img">
                        </div>
                    `).join('')}
                </div>
                
                <!-- Стрелки навигации -->
                <button class="slider-arrow slider-arrow-prev" aria-label="Предыдущее изображение">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="slider-arrow slider-arrow-next" aria-label="Следующее изображение">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                
                <!-- Индикаторы -->
                <div class="slider-indicators">
                    ${this.slides.map((_, index) => `
                        <button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}" aria-label="Перейти к изображению ${index + 1}"></button>
                    `).join('')}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        // Стрелки
        const prevBtn = this.container.querySelector('.slider-arrow-prev');
        const nextBtn = this.container.querySelector('.slider-arrow-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Индикаторы
        const indicators = this.container.querySelectorAll('.indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
            });
        });

        // Пауза автопрокрутки при наведении
        const slider = this.container.querySelector('.product-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
            slider.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(event) {
        // Стрелки влево/вправо для навигации
        if (event.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (event.key === 'ArrowRight') {
            this.nextSlide();
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
        this.resetAutoPlay();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
        this.resetAutoPlay();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.updateSlider();
            this.resetAutoPlay();
        }
    }

    updateSlider() {
        const slides = this.container.querySelectorAll('.slide');
        const indicators = this.container.querySelectorAll('.indicator');

        // Обновляем слайды
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        // Обновляем индикаторы
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            if (this.isAutoPlaying && this.slides.length > 1) {
                this.nextSlide();
            }
        }, this.autoPlayDelay);
    }

    pauseAutoPlay() {
        this.isAutoPlaying = false;
    }

    resumeAutoPlay() {
        this.isAutoPlaying = true;
    }

    resetAutoPlay() {
        // Сбрасываем автопрокрутку при ручном переключении
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.startAutoPlay();
    }

    destroy() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        // Удаляем обработчики событий
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}

// Функция для инициализации слайдера на странице товара
function initProductSlider() {
    // Получаем данные товара из глобальной переменной
    const productData = window.currentProduct;
    
    if (productData && document.getElementById('productImageContainer')) {
        console.log('Initializing product slider with data:', productData);
        window.productSlider = new ProductSlider('productImageContainer', productData);
    } else {
        console.warn('ProductSlider: Required elements not found');
    }
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductSlider);
} else {
    initProductSlider();
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductSlider, initProductSlider };
}