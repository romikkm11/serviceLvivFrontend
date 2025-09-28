const userUrl = 'https://servicelviv.servicelviv.art/services?company=1';

// === Ініціалізація карти ===
document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([49.8397, 24.0297], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        zoomControl: false,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.zoomControl.remove();

    // === Геолокація користувача ===
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                fetch('https://servicelviv.servicelviv.art/user-location/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: lat,
                        longitude: lon,
                        user_url: userUrl
                    })
                });
            },
            function (error) {
                console.error("Помилка геолокації:", error.message);
            }
        );
    } else {
        console.error("Геолокація не підтримується цим браузером.");
    }
});

// === Дані з API ===
let pricesData = null;

fetch(userUrl, { credentials: 'include' })
    .then(response => {
        if (!response.ok) {
            throw new Error('Помилка мережі: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        pricesData = data;
    })
    .catch(error => {
        console.error('Сталася помилка:', error);
    });

// === Логіка фільтрів ===
const categorySelect = document.getElementById('category');
const serviceSelect = document.getElementById('service');
const companySelect = document.getElementById('company');

categorySelect.addEventListener('change', () => {
    const category = categorySelect.value;

    // Очистити і додати відповідні послуги
    serviceSelect.innerHTML = '<option selected disabled>Послуга</option>';

    if (category === 'Стоматологія') {
        serviceSelect.innerHTML += '<option>Чистка</option><option>Пломба</option>';
    } else if (category === 'Краса') {
        serviceSelect.innerHTML += '<option>Манікюр</option><option>Макіяж</option>';
    } else if (category === 'Авто') {
        serviceSelect.innerHTML += '<option>Мийка</option><option>Шиномонтаж</option>';
    }
});
