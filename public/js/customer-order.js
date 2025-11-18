// public/js/customer-order.js
document.addEventListener('DOMContentLoaded', async () => {
  const ordersBody = document.getElementById('ordersBody');
  const status = document.getElementById('status');

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      status.textContent = 'You must be logged in to view orders.';
      return;
    }

    // ✅ Correct backend route
    const res = await fetch('/api/orders/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Network error: ${res.status}`);
    const payload = await res.json();

    if (!payload.success) throw new Error(payload.message || 'Server error');
    const orders = payload.data;

    if (!orders || !orders.length) {
      status.textContent = 'You have no orders yet.';
      return;
    }

    ordersBody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.order_number}</td>
        <td>${new Date(o.order_date).toLocaleDateString()}</td>
        <td>${o.order_status || 'Pending'}</td>
        <td>$${Number(o.total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    status.textContent = `Loaded ${orders.length} order(s).`;
  } catch (err) {
    console.error(err);
    status.textContent = 'Failed to load orders: ' + err.message;
  }
});