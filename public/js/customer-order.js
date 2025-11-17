// public/js/customer-orders.js
document.addEventListener('DOMContentLoaded', async () => {
  const ordersBody = document.getElementById('ordersBody');
  const status = document.getElementById('status');

  try {
    const res = await fetch('/api/orders'); // backend should filter by logged-in user
    if (!res.ok) throw new Error('Network error');
    const payload = await res.json();

    if (!payload.success) throw new Error(payload.message || 'Server error');
    const orders = payload.data;

    if (!orders.length) {
      status.textContent = 'You have no orders yet.';
      return;
    }

    ordersBody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.order_number}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>${o.status || 'Pending'}</td>
        <td>$${Number(o.total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    status.textContent = `Loaded ${orders.length} order(s).`;
  } catch (err) {
    console.error(err);
    status.textContent = 'Failed to load orders: ' + err.message;
  }
});