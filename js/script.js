document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([49.8397, 24.0297], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        zoomControl: false,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.zoomControl.remove();
});

fetch('http://3.71.86.119/prices') // заміни на своє API
  .then(response => {
    if (!response.ok) {
      throw new Error('Помилка мережі: ' + response.status);
    }
    return response.json(); // або response.text(), якщо API не повертає JSON
  })
  .then(data => {
    console.log('Дані з API:', data);
  })
  .catch(error => {
    console.error('Сталася помилка:', error);
  });
