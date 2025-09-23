const userUrl = 'https://servicelviv.servicelviv.art/services'
document.addEventListener('DOMContentLoaded', function () {
     
    var map = L.map('map').setView([49.8397, 24.0297], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        zoomControl: false,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.zoomControl.remove();

    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Перевіряємо, чи цей cookie починається з потрібного імені
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

     if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude
                const lon = position.coords.longitude

                fetch('https://servicelviv.servicelviv.art/user-location/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                              'X-CSRFToken': csrftoken
                     },
                    credentials: 'include',
                    body: JSON.stringify({ latitude: lat, longitude: lon, user_url: userUrl })
                });

            },
            function(error) {
                console.error("Помилка геолокації:", error.message);
            }
        );
    } else {
        console.error("Геолокація не підтримується цим браузером.");
    }
});

let pricesData = null;

fetch(userUrl, {credentials: 'include'})

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

