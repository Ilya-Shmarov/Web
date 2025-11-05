// API интеграция для отзывов
const FEEDBACK_API_BASE_URL = 'http://localhost:50374/api';

class FeedbackAPI {
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
            const response = await fetch(`${FEEDBACK_API_BASE_URL}${url}`, {
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
            console.error('API request failed:', error);
            throw error;
        }
    }

    async submitFeedback(feedbackData) {
        const endpoint = this.token ? '/feedback/authenticated' : '/feedback';
        return await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    }

    async getFeedbacks(publicOnly = true, productId = null) {
        let url = `/feedback?publicOnly=${publicOnly}`;
        if (productId) {
            url += `&productId=${productId}`;
        }
        return await this.makeRequest(url);
    }
}

// Создаем глобальный экземпляр API
window.feedbackAPI = new FeedbackAPI();
