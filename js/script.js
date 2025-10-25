import {LOCAL_URL, PROD_URL, AUTOCOMPLETE_API } from './config.js';

const BASE_URL = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;
const userUrl = `${BASE_URL}/services/`;
const tokenKey = 'token';
let pricesData = null;


// === Функція отримання токена ===
async function getToken() {
    const saved = getSavedToken();
    if (saved) return saved;

    const res = await fetch(`${BASE_URL}/generate-token/`);
    const data = await res.json();

    const newToken = {
        userToken: data.token,
        expiry: Date.now() + 3300 * 1000 // 1 година
    };

    localStorage.setItem(tokenKey, JSON.stringify(newToken));
    return newToken;
}

// === Перевірка терміну токена ===
function getSavedToken() {
    const saved = JSON.parse(localStorage.getItem(tokenKey));
    if (saved) {
        if (Date.now() < saved.expiry) {
            return saved;
        } else {
            localStorage.removeItem(tokenKey);
            console.warn('Прострочений токен видалено з localStorage');
        }
    }
    return null; 
}


// === Функція запиту сервісів ===
async function getPricesData() {
    const tokenData = JSON.parse(localStorage.getItem(tokenKey));

    const headers = tokenData
        ? { 'Content-Type': 'application/json', 'Authorization': `Token ${tokenData.userToken}` }
        : { 'Content-Type': 'application/json' };

    try {
        const response = await fetch(userUrl, {
            credentials: 'include',
            headers
        });

        if (!response.ok) {
            throw new Error('Помилка мережі: ' + response.status);
        }

        const data = await response.json();
        console.log('Отримані дані:', data);
        return data;

    } catch (error) {
        console.error('Сталася помилка при fetch:', error);
        return null;
    }
}

// === Функція оновлення геолокації ===
async function sendUserLocation({latitude, longitude, user_address}) {
    const tokenData = await getToken();

    try {
        const response = await fetch(`${BASE_URL}/user-location/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude,
                longitude,
                user_address,
                user_url: userUrl,
                user_token: tokenData.userToken
            })
        });

        const data = await response.json();

        if (data.error) {
            console.warn("Помилка від бекенду:", data.error);
            return;
        }       

        tokenData.expiry = Date.now() + 3300 * 1000;
        localStorage.setItem(tokenKey, JSON.stringify(tokenData));

        pricesData = await getPricesData();

    } catch (error) {
        console.error('Помилка при надсиланні локації:', error);
    }
}

// === Ініціалізація карти ===
document.addEventListener('DOMContentLoaded', async function () {
    const map = L.map('map').setView([49.8397, 24.0297], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        zoomControl: false,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.zoomControl.remove();
    
    const savedToken = getSavedToken();
    // === Початкове завантаження сервісів (без токена) ===
    pricesData = await getPricesData();

    // === Геолокація користувача ===
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const user_latitude = position.coords.latitude;
                const user_longitude = position.coords.longitude;
                sendUserLocation({latitude: user_latitude, longitude: user_longitude});
            },
            error => console.error("Помилка геолокації:", error.message)
        );
    } else {
        console.error("Геолокація не підтримується цим браузером.");
    }

    // === Логіка фільтрів ===
    const categorySelect = document.getElementById('category');
    const serviceSelect = document.getElementById('service');

    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;

        serviceSelect.innerHTML = '<option selected disabled>Послуга</option>';

        if (category === 'Стоматологія') {
            serviceSelect.innerHTML += '<option>Чистка</option><option>Пломба</option>';
        } else if (category === 'Краса') {
            serviceSelect.innerHTML += '<option>Манікюр</option><option>Макіяж</option>';
        } else if (category === 'Авто') {
            serviceSelect.innerHTML += '<option>Мийка</option><option>Шиномонтаж</option>';
        }
    });
    let timer
    const locationInput = document.getElementById('address-input');
    const suggestAddressList = document.getElementById('suggest-address-list');

    locationInput.addEventListener('input', function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            
            const address = locationInput.value;
            const options = {method: 'GET', headers: {accept: 'application/json'}};

            if(address.length < 3) {
                suggestAddressList.innerHTML = '';
                return
            }

            fetch(`https://eu1.locationiq.com/v1/search?key=${AUTOCOMPLETE_API}&q=${encodeURIComponent(address)}&viewbox=24.0,49.9,24.2,49.8&bounded=1&format=json&limit=5`, options)
              .then(res => res.json())
              .then(res => {
                suggestAddressList.innerHTML = res
                .map(item =>
                    `<span class="suggest-address-item">${item.display_name}</span>`
                ).join('');
              })
              .catch(err => console.error(err));
        }, 400)
    });

    suggestAddressList.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggest-address-item')) {
            sendUserLocation({user_address: e.target.textContent});
        }
    });
});
