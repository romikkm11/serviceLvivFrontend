fetch('http://3.71.86.119/prices')
  .then(response => response.json())
  .then(data => {
    const content = document.getElementById('content');
    content.innerHTML = data.items ? data.items.map(item => `<p>${item.name}</p>`).join('') : 'No data';
  })
  .catch(error => console.error('Error:', error));