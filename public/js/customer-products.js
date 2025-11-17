document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productsGrid');
  const status = document.getElementById('status');

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
    alert(`${product.product_name} added to cart!`);
  }

  try {
    const res = await fetch('/products');
    if (!res.ok) throw new Error('Network response not ok');
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.message || 'Server error');

    const rows = payload.data;
    if (!rows.length) {
      status.textContent = 'No products available.';
      return;
    }

    grid.innerHTML = rows.map((p, idx) => `
      <div class="col-md-3">
        <div class="product-card">
          <img src="https://via.placeholder.com/300x180?text=${encodeURIComponent(p.product_name)}"
               alt="${p.product_name}" class="product-img">
          <div class="product-body">
            <div class="product-title">${p.product_name}</div>
            <p class="text-muted">${p.description || 'No description available'}</p>
            <div class="product-price">$${Number(p.price || 0).toFixed(2)}</div>
            <div class="stock-status text-muted">
              ${p.stock > 0 ? `${p.stock} in Stock` : 'Out of Stock'}
            </div>
            <button class="btn btn-sm btn-primary mt-2 add-to-cart" data-index="${idx}">
              Add to Cart
            </button>
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

    status.textContent = `Loaded ${rows.length} products.`;
  } catch (err) {
    console.error(err);
    status.textContent = 'Failed to load products: ' + (err.message || err);
  }
});