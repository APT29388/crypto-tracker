let allCoins = []; // Сохраняем все монеты для фильтрации

async function fetchMarketData() {
    try {
        // Показываем индикатор загрузки
        const marketsGrid = document.getElementById('markets-grid');
        marketsGrid.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading cryptocurrencies...</p>
            </div>
        `;

        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('No data received from API');
        }

        allCoins = data;
        displayMarketData(data);
    } catch (error) {
        console.error('Error fetching market data:', error);
        const marketsGrid = document.getElementById('markets-grid');
        marketsGrid.innerHTML = `
            <div class="error-message">
                <h3>Unable to load cryptocurrencies</h3>
                <p>Please try again later or refresh the page</p>
                <button onclick="fetchMarketData()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function displayMarketData(coins) {
    const marketsGrid = document.getElementById('markets-grid');
    marketsGrid.innerHTML = '';

    if (coins.length === 0) {
        marketsGrid.innerHTML = `
            <div class="no-results">
                <h3>No cryptocurrencies found</h3>
            </div>
        `;
        return;
    }

    coins.forEach(coin => {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-coin-id', coin.id);

        const priceChangeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

        card.innerHTML = `
            <div class="crypto-header">
                <img src="${coin.image}" alt="${coin.name}">
                <h3>${coin.name}</h3>
            </div>
            <div class="crypto-price">$${coin.current_price.toLocaleString()}</div>
            <span class="price-change ${priceChangeClass}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </span>
            <div class="crypto-details">
                <div class="detail">
                    <span class="label">Market Cap</span>
                    <span class="value">$${(coin.market_cap / 1000000).toFixed(2)}M</span>
                </div>
                <div class="detail">
                    <span class="label">24h Volume</span>
                    <span class="value">$${(coin.total_volume / 1000000).toFixed(2)}M</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openCryptoDetails(coin.id));

        marketsGrid.appendChild(card);
    });
}

async function openCryptoDetails(coinId) {
    try {
        showModal(`
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                <p>Loading data...</p>
            </div>
        `);

        // Получаем данные за 30 дней для всех периодов
        const [coinData, newsData, priceData] = await Promise.all([
            fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&sparkline=true&market_data=true`).then(r => r.json()),
            fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${coinId}`).then(r => r.json()),
            fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`).then(r => r.json())
        ]);

        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="coin-info">
                        <img src="${coinData.image.small}" alt="${coinData.name}">
                        <div class="coin-basic-info">
                            <h2>${coinData.name} (${coinData.symbol.toUpperCase()})</h2>
                            <div class="coin-rank">Rank #${coinData.market_cap_rank}</div>
                        </div>
                    </div>
                    <div class="current-price">
                        <span class="price">$${coinData.market_data.current_price.usd.toLocaleString()}</span>
                        <span class="price-change ${coinData.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                            ${coinData.market_data.price_change_percentage_24h.toFixed(2)}%
                        </span>
                    </div>
                    <button class="modal-close">&times;</button>
                </div>

                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="chart">Chart</button>
                    <button class="tab-btn" data-tab="info">Information</button>
                    <button class="tab-btn" data-tab="news">News</button>
                </div>

                <div class="tab-content">
                    <div class="tab-pane active" id="chart-tab">
                        <div class="chart-container">
                            <canvas id="priceChart"></canvas>
                        </div>
                        <div class="time-filters">
                            <button class="time-btn active" data-days="7">7D</button>
                            <button class="time-btn" data-days="14">14D</button>
                            <button class="time-btn" data-days="30">30D</button>
                        </div>
                        <div class="price-stats">
                            <div class="stat">
                                <span class="label">24h High</span>
                                <span class="value">$${coinData.market_data.high_24h.usd.toLocaleString()}</span>
                            </div>
                            <div class="stat">
                                <span class="label">24h Low</span>
                                <span class="value">$${coinData.market_data.low_24h.usd.toLocaleString()}</span>
                            </div>
                            <div class="stat">
                                <span class="label">Market Cap</span>
                                <span class="value">$${coinData.market_data.market_cap.usd.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="info-tab">
                        <div class="coin-details">
                            <div class="detail-section">
                                <h3>Market Statistics</h3>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <span class="label">Circulating Supply</span>
                                        <span class="value">${coinData.market_data.circulating_supply.toLocaleString()} ${coinData.symbol.toUpperCase()}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="label">Total Supply</span>
                                        <span class="value">${coinData.market_data.total_supply ? coinData.market_data.total_supply.toLocaleString() : 'N/A'}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="label">All-Time High</span>
                                        <span class="value">$${coinData.market_data.ath.usd.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="detail-section">
                                <h3>About ${coinData.name}</h3>
                                <div class="description">
                                    ${coinData.description.en || 'No description available.'}
                                </div>
                            </div>
                            <div class="detail-section">
                                <h3>Links</h3>
                                <div class="links-grid">
                                    ${coinData.links.homepage[0] ? `<a href="${coinData.links.homepage[0]}" target="_blank" class="link-item">Website</a>` : ''}
                                    ${coinData.links.blockchain_site[0] ? `<a href="${coinData.links.blockchain_site[0]}" target="_blank" class="link-item">Explorer</a>` : ''}
                                    ${coinData.links.subreddit_url ? `<a href="${coinData.links.subreddit_url}" target="_blank" class="link-item">Reddit</a>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane" id="news-tab">
                        <div class="news-list">
                            ${newsData.Data.length > 0 ? 
                                newsData.Data.slice(0, 4).map(article => `
                                    <div class="news-item">
                                        <img src="${article.imageurl}" alt="${article.title}" loading="lazy">
                                        <div class="news-item-content">
                                            <h3>${article.title}</h3>
                                            <p>${article.body.slice(0, 100)}...</p>
                                            <a href="${article.url}" target="_blank">Read more</a>
                                        </div>
                                    </div>
                                `).join('') :
                                '<div class="no-news">No recent news available for this cryptocurrency.</div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        showModal(modalContent);

        // Инициализируем график с 7-дневными данными
        const sevenDayData = priceData.prices.slice(-7 * 24);
        const ctx = document.getElementById('priceChart').getContext('2d');
        window.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sevenDayData.map((price) => new Date(price[0]).toLocaleDateString()),
                datasets: [{
                    label: 'Price',
                    data: sevenDayData.map(price => price[1]),
                    borderColor: '#0066FF',
                    backgroundColor: 'rgba(0, 102, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        ticks: {
                            callback: value => `$${value.toLocaleString()}`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        // Обработчики для кнопок времени
        document.querySelectorAll('.time-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const days = parseInt(button.dataset.days);
                const periodData = priceData.prices.slice(-days * 24);

                window.priceChart.data.labels = periodData.map(price => 
                    new Date(price[0]).toLocaleDateString()
                );
                window.priceChart.data.datasets[0].data = periodData.map(price => price[1]);
                window.priceChart.options.scales.x.ticks.maxTicksLimit = days;
                window.priceChart.update('none'); // Используем 'none' для плавного обновления
            });
        });

        // Обработчики для табов
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                
                button.classList.add('active');
                const targetTab = document.getElementById(`${button.dataset.tab}-tab`);
                targetTab.classList.add('active');

                // Обновляем график при возвращении на вкладку с графиком
                if (button.dataset.tab === 'chart' && window.priceChart) {
                    window.priceChart.update();
                }
            });
        });

    } catch (error) {
        console.error('Error loading crypto details:', error);
        showModal(`
            <div class="modal-error">
                <h3>Error loading data</h3>
                <p>Please try again later</p>
            </div>
        `);
    }
}

function showModal(content) {
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = content;
    modal.classList.add('active');

    modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Функция поиска
function searchCrypto(query) {
    if (!allCoins || allCoins.length === 0) {
        return; // Не выполняем поиск, если данные еще не загружены
    }
    
    query = query.toLowerCase().trim();
    const filteredCoins = allCoins.filter(coin => 
        coin.name.toLowerCase().includes(query) || 
        coin.symbol.toLowerCase().includes(query)
    );
    displayMarketData(filteredCoins);
}

// Обработчик поиска
document.getElementById('search-crypto').addEventListener('input', (e) => {
    searchCrypto(e.target.value);
});

// Обработчик сортировки
document.getElementById('sort-by').addEventListener('change', (e) => {
    const sortBy = e.target.value;
    const sortedCoins = [...allCoins];

    switch(sortBy) {
        case 'price':
            sortedCoins.sort((a, b) => b.current_price - a.current_price);
            break;
        case 'change':
            sortedCoins.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
            break;
        case 'rank':
            sortedCoins.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
            break;
    }

    displayMarketData(sortedCoins);
});

// Добавим новые стили для сообщений об ошибках и загрузки
const styles = `
.loading, .error-message {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    background: var(--card-bg);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 102, 255, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.error-message h3 {
    color: #ff4444;
    margin-bottom: 1rem;
}

.retry-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
    transition: background-color 0.3s ease;
}

.retry-btn:hover {
    background: #0052cc;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
`;

// Добавляем стили на страницу
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Добавим автоматическую повторную попытку загрузки при ошибке
let retryCount = 0;
const maxRetries = 3;

async function fetchWithRetry() {
    try {
        await fetchMarketData();
    } catch (error) {
        if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying... Attempt ${retryCount} of ${maxRetries}`);
            setTimeout(fetchWithRetry, 2000 * retryCount); // Увеличиваем время между попытками
        }
    }
}

// Обновляем инициализацию
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true
    });
    fetchWithRetry();
});

// Обновление данных каждую минуту
setInterval(fetchMarketData, 60000); 