//cart.js
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartBody = document.getElementById('cartBody');
  const cartTotal = document.getElementById('cartTotal');
  const status = document.getElementById('status');

  if (!cart.length) {
    status.textContent = 'Your cart is empty.';
    cartBody.innerHTML = '';
    cartTotal.textContent = 'Total: $0.00';
    return;
  }

  let total = 0;
  cartBody.innerHTML = cart.map((item, index) => {
    const rawPrice = String(item.price).replace(/[^0-9.-]/g, '');
    const unitPrice = parseFloat(rawPrice);
    const qty = Number(item.quantity) || 1;

    const lineTotal = unitPrice * qty;
    total += lineTotal;

    return `
      <tr>
        <td>${item.product_name}</td>
        <td>$${lineTotal.toFixed(2)}</td>
        <td>
          <div class="qty-controls">
            <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQty(${index})">-</button>
            <span class="qty-value">${qty}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="increaseQty(${index})">+</button>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">×</button>
        </td>
      </tr>
    `;
  }).join('');

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  const itemCount = cart.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
  status.textContent = `You have ${itemCount} item(s) in your cart.`;
}

function increaseQty(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart[index].quantity = (Number(cart[index].quantity) || 1) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function decreaseQty(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let currentQty = Number(cart[index].quantity) || 1;
  if (currentQty > 1) {
    cart[index].quantity = currentQty - 1;
  } else {
    // If qty would drop below 1, remove the item
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function clearCart() {
  localStorage.removeItem('cart');
  renderCart();
  alert('Cart cleared.');
}

// Redirect to checkout form
function placeOrder() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }
  //window.location.href = 'checkout.html';
  //Show checkout modal instead of redirect
  const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  modal.show();
}



//checkout Modal logic
document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const shipping_address = document.getElementById('shippingAddress').value;
      const billing_address = document.getElementById('billingAddress').value;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to place an order.');
        return;
      }

      try {
        const subtotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * (i.quantity || 1)), 0);
        const total = subtotal;

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            shipping_address,
            billing_address,
            subtotal,
            tax: 0,
            shipping_fee: 0,
            total,
            order_status: 'pending',
            cart
          })
        });

        const result = await res.json();

        if (result.success) {
          alert('Order placed successfully!');
          localStorage.removeItem('cart');
          window.location.href = 'customer-orders.html';
        } else {
          alert('Failed to place order: ' + (result.message || 'Unknown error'));
        }
      } catch (err) {
        console.error(err);
        alert('Failed to place order: ' + err.message);
      }
    });
  }
});
