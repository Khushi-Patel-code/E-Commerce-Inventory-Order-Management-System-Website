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
        <td>${qty}</td>
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

// Instead of placing the order directly, redirect to checkout form
function placeOrder() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) {
    alert('Your cart is empty.');
    return;
  }

  // Redirect to checkout.html where the user confirms addresses
  window.location.href = 'checkout.html';
}
