// product-slider.js
class ProductSlider {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.slide');
        this.prevBtn = container.querySelector('.slider-arrow-prev');
        this.nextBtn = container.querySelector('.slider-arrow-next');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.indicators = [];
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (this.slides.length <= 1) {
            this.hideNavigation();
            return;
        }
        
        this.createIndicators();
        this.setupEventListeners();
        this.showSlide(this.currentSlide);
        this.startAutoplay();
    }
    
    createIndicators() {
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slider-indicators';
        
        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `slider-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            
            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        });
        
        this.container.appendChild(indicatorsContainer);
    }
    
    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.next());
        this.prevBtn.addEventListener('click', () => this.prev());
        
        // Пауза автоплея при наведении
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Свайпы для мобильных устройств
        this.setupTouchEvents();
        
        // Клавиатурная навигация
        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < this.slides.length) this.goToSlide(index);
            }
        });
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            this.stopAutoplay();
        });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            // Проверяем, что это горизонтальный свайп, а не вертикальный
            if (Math.abs(touchEndY - touchStartY) < Math.abs(touchEndX - touchStartX)) {
                this.handleSwipe(touchStartX, touchEndX);
            }
            
            this.startAutoplay();
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }
    
    showSlide(index, direction = 'next') {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Убираем классы анимации
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'next-enter', 'prev-enter');
        });
        
        // Скрываем текущий слайд
        this.slides[this.currentSlide].style.opacity = '0';
        
        // Показываем новый слайд с анимацией
        setTimeout(() => {
            this.slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            this.slides[index].classList.add('active', `${direction}-enter`);
            this.slides[index].style.opacity = '1';
            
            // Обновляем индикаторы
            this.indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
            
            this.currentSlide = index;
            
            // Сбрасываем флаг анимации
            setTimeout(() => {
                this.isAnimating = false;
                this.slides[index].classList.remove('next-enter', 'prev-enter');
            }, 600);
        }, 50);
    }
    
    goToSlide(index) {
        if (index === this.currentSlide || this.isAnimating) return;
        
        this.stopAutoplay();
        const direction = index > this.currentSlide ? 'next' : 'prev';
        this.showSlide(index, direction);
        this.startAutoplay();
    }
    
    next() {
        if (this.isAnimating) return;
        
        this.stopAutoplay();
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex, 'next');
        this.startAutoplay();
    }
    
    prev() {
        if (this.isAnimating) return;
        
        this.stopAutoplay();
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex, 'prev');
        this.startAutoplay();
    }
    
    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            if (!this.isAnimating) {
                this.next();
            }
        }, 5000);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    hideNavigation() {
        if (this.prevBtn) this.prevBtn.style.display = 'none';
        if (this.nextBtn) this.nextBtn.style.display = 'none';
        
        const indicatorsContainer = this.container.querySelector('.slider-indicators');
        if (indicatorsContainer) {
            indicatorsContainer.style.display = 'none';
        }
    }
    
    destroy() {
        this.stopAutoplay();
        
        // Удаляем индикаторы
        const indicatorsContainer = this.container.querySelector('.slider-indicators');
        if (indicatorsContainer) {
            indicatorsContainer.remove();
        }
    }
}

// Функция для инициализации всех слайдеров на странице
function initializeAllProductSliders() {
    const sliderContainers = document.querySelectorAll('.product-slider');
    const sliders = [];
    
    sliderContainers.forEach(container => {
        if (container.querySelectorAll('.slide').length === 0) {
            return;
        }
        
        const slider = new ProductSlider(container);
        sliders.push(slider);
    });
    
    console.log(`🎨 Инициализировано ${sliders.length} красивых слайдеров`);
    return sliders;
}

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAllProductSliders, 100);
});

// Глобальный экспорт
window.ProductSlider = ProductSlider;
window.initializeAllProductSliders = initializeAllProductSliders;