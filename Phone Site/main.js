// Fetch products and render product grid & slider
let sliderProducts = [];
let sliderIndex = 0;
let sliderInterval = null;

async function loadProducts() {
  const res = await fetch('data/products.json');
  const products = await res.json();
  renderProducts(products);
  sliderProducts = products.slice(0, 5);
  renderSlider(sliderProducts, 0);
  startSliderLoop();
}
function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="name">${p.name}</div>
      <div class="price ${p.stock === 0 ? 'stock out' : p.stock < 5 ? 'stock low' : 'stock in'}">
        ${p.stock === 0 ? `<span class="stock out">Out of Stock</span> <span style="text-decoration:line-through;">₵${p.price}</span>` :
          p.stock < 5 ? `<span class="stock low">Low Stock</span> <span style="background:#ffe06622;padding:2px 6px;border-radius:6px;">₵${p.price}</span>` :
          `<span class="stock in">In Stock</span> <span style="color:#25d366;">₵${p.price}</span>`
        }
      </div>
    `;
    grid.appendChild(card);
  });
}
function renderSlider(products, centerIndex = 0) {
  const slider = document.getElementById('product-slider');
  slider.innerHTML = '';
  if (!products.length) return;

  // Get 5 indices: [farLeft, left, center, right, farRight]
  const total = products.length;
  const getIndex = (offset) => (centerIndex + offset + total) % total;
  const indices = [-2, -1, 0, 1, 2].map(getIndex);

  indices.forEach((idx, pos) => {
    let cardClass = 'slider-card';
    if (pos === 2) cardClass += ' slider-card-center';
    else if (pos === 1 || pos === 3) cardClass += ' slider-card-mid';
    else cardClass += ' slider-card-edge';

    const p = products[idx];
    const card = document.createElement('div');
    card.className = cardClass;
    card.innerHTML = `
      <div class="slider-img-wrap">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="name">${p.name}</div>
      <div class="price">₵${p.price}</div>
    `;
    slider.appendChild(card);
  });
}
function showSliderAt(idx) {
  sliderIndex = (idx + sliderProducts.length) % sliderProducts.length;
  renderSlider(sliderProducts, sliderIndex);
}
function nextSlider() {
  showSliderAt(sliderIndex + 1);
}
function prevSlider() {
  showSliderAt(sliderIndex - 1);
}
function startSliderLoop() {
  if (sliderInterval) clearInterval(sliderInterval);
  sliderInterval = setInterval(() => {
    nextSlider();
  }, 3500);
}
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  document.getElementById('slider-next').onclick = () => {
    nextSlider();
    startSliderLoop();
  };
  document.getElementById('slider-prev').onclick = () => {
    prevSlider();
    startSliderLoop();
  };
  // Touch and mouse drag events for slider
  const slider = document.getElementById('product-slider');
  slider.addEventListener('touchstart', sliderPointerDown, {passive: true});
  slider.addEventListener('touchmove', sliderPointerMove, {passive: true});
  slider.addEventListener('touchend', sliderPointerUp);
  slider.addEventListener('mousedown', sliderPointerDown);
  slider.addEventListener('mousemove', sliderPointerMove);
  slider.addEventListener('mouseup', sliderPointerUp);
  slider.addEventListener('mouseleave', sliderPointerUp);
});

// Contact form logic
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const message = this.message.value.trim();
  if (!name || !email || !message) return;
  const messages = JSON.parse(localStorage.getItem('goford_messages') || '[]');
  messages.push({ name, email, message, date: new Date().toISOString() });
  localStorage.setItem('goford_messages', JSON.stringify(messages));
  this.reset();
  document.getElementById('contact-success').style.display = 'block';
  setTimeout(() => document.getElementById('contact-success').style.display = 'none', 3000);
});

let sliderStartX = null;
let sliderDragging = false;

function sliderPointerDown(e) {
  sliderDragging = true;
  sliderStartX = e.touches ? e.touches[0].clientX : e.clientX;
}

function sliderPointerMove(e) {
  if (!sliderDragging) return;
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const dx = x - sliderStartX;
  if (Math.abs(dx) > 40) {
    if (dx < 0) {
      nextSlider();
    } else {
      prevSlider();
    }
    sliderDragging = false;
  }
}

function sliderPointerUp() {
  sliderDragging = false;
  sliderStartX = null;
}
