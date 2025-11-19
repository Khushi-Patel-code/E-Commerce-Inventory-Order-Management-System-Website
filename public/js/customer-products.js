// customer-products.js
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productsGrid');
  const status = document.getElementById('status');
  const categorySelect = document.getElementById('categoryFilter');

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already exists
    const existing = cart.find(item => item.product_id === product.product_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        price: Number(product.price || 0),
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Show success modal instead of alert
    document.getElementById('cartSuccessMessage').innerText =
      `${product.product_name} added to cart!`;

    const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
    modal.show();

    // Optional: auto-close after 2 seconds
    setTimeout(() => modal.hide(), 2000);
  }

  /* ---------------------------
     Load Categories into Dropdown
  -----------------------------*/
  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || 'Failed to fetch categories');

      categorySelect.innerHTML = '<option value="">All Categories</option>';
      payload.data.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.category_id;
        opt.textContent = cat.category_name;
        categorySelect.appendChild(opt);
      });

      // Reload products when category changes
      categorySelect.addEventListener('change', () => {
        loadProducts(categorySelect.value);
      });
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  /* ---------------------------
     Load Products (with optional filter)
  -----------------------------*/
  async function loadProducts(categoryId = '') {
    status.textContent = 'Loading products...';
    let url = '/api/products';
    if (categoryId) url += `?category_id=${encodeURIComponent(categoryId)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response not ok');
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || 'Server error');

      const rows = payload.data;
      if (!rows.length) {
        status.textContent = 'No products available.';
        grid.innerHTML = '';
        return;
      }


      grid.innerHTML = rows.map((p, idx) => `
      <div class="col-md-3" id="product-${p.product_id}">
        <div class="card product-card">
        <img class="card-img-top product-img" 
             src="https://via.placeholder.com/400x200?text=${encodeURIComponent(p.product_name)}" 
             alt="${p.product_name}">
        <div class="card-body">
          <h6 class="card-title">${p.product_name}</h6>
          <p class="card-text muted-small">
            ${p.description || 'No description available'}<br>
            Price: $${Number(p.price || 0).toFixed(2)}
          </p>
          <div class="d-flex justify-content-between align-items-center">
            ${
              p.stock > 0
                ? `<button class="btn btn-sm btn-primary add-to-cart" data-index="${idx}">
                     Add to Cart
                   </button>`
                : `<button class="btn btn-sm btn-secondary" disabled>
                     Out of Stock
                   </button>`
            }
            <small class="text-muted">
              ${p.stock > 0 ? `${p.stock} in Stock` : 'Out of Stock'}
            </small>
          </div>
        </div>
      </div>
    </div>    
  `).join('');

      // Attach listeners
      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', e => {
          const idx = e.target.getAttribute('data-index');
          addToCart(rows[idx]);
        });
      });

      status.textContent = `Loaded ${rows.length} product(s)${categoryId ? ' in this category' : ''}.`;
    } catch (err) {
      console.error(err);
      status.textContent = 'Failed to load products: ' + (err.message || err);
    }



    // After products are rendered
const hash = window.location.hash;
if (hash) {
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
  }

  // Initial load
  await loadCategories();

  //check if category_id is passed in URL
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category_id') || '';

  //if a category was passed, set the dropdown to match
  if (initialCategory) {
    categorySelect.value = initialCategory;
  }

  await loadProducts(initialCategory);
});