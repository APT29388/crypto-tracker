// Инициализация анимаций
AOS.init({
    duration: 1000,
    once: true
});

// Функция для обновления цен криптовалют
async function updateCryptoPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true');
        const data = await response.json();
        
        const btcPrice = document.getElementById('btc-price');
        const marketCap = document.getElementById('market-cap');
        
        btcPrice.textContent = `$${data.bitcoin.usd.toLocaleString()}`;
        marketCap.textContent = `$${(data.bitcoin.usd_market_cap / 1000000000).toFixed(2)}B`;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
    }
}

// Обновление цен каждые 30 секунд
updateCryptoPrices();
setInterval(updateCryptoPrices, 30000); 