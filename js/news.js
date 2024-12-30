async function fetchNews() {
    try {
        // Используем CryptoCompare News API
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await response.json();
        displayNews(data.Data);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function displayNews(news) {
    const newsGrid = document.getElementById('news-grid');
    newsGrid.innerHTML = '';

    if (news.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-results">
                <h3>No news found for this category</h3>
            </div>
        `;
        return;
    }

    news.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-aos', 'fade-up');
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <img src="${article.imageurl}" alt="${article.title}" class="news-image" loading="lazy">
            <div class="news-content">
                <div class="news-date">${new Date(article.published_on * 1000).toLocaleDateString()}</div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.body.slice(0, 150)}...</p>
                <div class="news-meta">
                    <span class="news-source">${article.source}</span>
                    <a href="${article.url}" class="read-more" target="_blank">
                        Read More
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        newsGrid.appendChild(card);
    });
}

// Фильтрация новостей по категории
document.getElementById('news-category').addEventListener('change', (e) => {
    const category = e.target.value;
    if (category === 'all') {
        fetchNews();
    } else {
        fetchNewsByCategory(category);
    }
});

// Добавляем функцию фильтрации новостей по категории
async function fetchNewsByCategory(category) {
    try {
        const response = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${category}`);
        const data = await response.json();
        displayNews(data.Data);
    } catch (error) {
        console.error('Error fetching news by category:', error);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true
    });
    fetchNews();
}); 