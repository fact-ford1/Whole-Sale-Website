const ADMIN_PASS = 'goford123';
function adminLogin() {
  const pass = document.getElementById('admin-password').value;
  document.getElementById('login-error').style.display = 'none'; // Hide error on each attempt
  if (pass === ADMIN_PASS) {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAdminProducts();
    loadAdminMessages();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

// Ensure pressing Enter in the password field also triggers login
document.getElementById('admin-password').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    adminLogin();
  }
});

function adminLogout() {
  document.getElementById('admin-login').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
}
async function loadAdminProducts() {
  const res = await fetch('/api/products');
  const products = await res.json();
  const list = document.getElementById('admin-products-list');
  list.innerHTML = '';
  products.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'admin-product-item';
    item.innerHTML = `
      <img src="${p.image}" />
      <input type="text" value="${p.name}" id="name${i}" />
      <input type="number" value="${p.price}" id="price${i}" />
      <input type="number" value="${p.stock}" id="stock${i}" />
      <button class="edit" onclick="editProduct(${i})">Save</button>
      <button onclick="deleteProduct(${i})">Delete</button>
    `;
    list.appendChild(item);
  });
}

window.editProduct = async function(i) {
  // Fetch the latest products
  const res = await fetch('/api/products');
  const products = await res.json();
  // Prepare updated product
  const updated = {
    name: document.getElementById('name'+i).value,
    price: +document.getElementById('price'+i).value,
    stock: +document.getElementById('stock'+i).value,
    image: products[i].image
  };
  // Save update to backend
  await fetch(`/api/products/${i}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  });
  loadAdminProducts();
};

window.deleteProduct = async function(i) {
  await fetch(`/api/products/${i}`, { method: 'DELETE' });
  loadAdminProducts();
};

document.getElementById('add-product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const price = Number(form.price.value);
  const stock = Number(form.stock.value);
  const imageFile = form.image.files[0];

  let image = '';
  if (imageFile) {
    // 1. Upload the image file to /api/upload
    const formData = new FormData();
    formData.append('image', imageFile);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    image = uploadData.imageUrl; // e.g. "/images/123456-filename.jpg"
  }

  // 2. Send product details to /api/products
  await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, stock, image })
  });

  form.reset();
  loadAdminProducts();
});
function loadAdminMessages() {
  const messages = JSON.parse(localStorage.getItem('goford_messages') || '[]');
  const list = document.getElementById('admin-messages-list');
  list.innerHTML = '';
  messages.forEach(m => {
    const item = document.createElement('div');
    item.className = 'admin-message-item';
    item.innerHTML = `<b>${m.name}</b> (${m.email})<br>${m.message}<br><small>${new Date(m.date).toLocaleString()}</small>`;
    list.appendChild(item);
  });
}
