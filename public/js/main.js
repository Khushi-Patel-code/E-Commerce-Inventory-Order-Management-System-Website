// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loadProducts');
  const status = document.getElementById('status');
  const table = document.getElementById('productsTable');
  const thead = document.getElementById('productsHead');
  const tbody = document.getElementById('productsBody');

  btn.addEventListener('click', async () => {
    status.textContent = 'Loading products...';
    table.style.display = 'none';
    thead.innerHTML = '';
    tbody.innerHTML = '';

    try {
      const res = await fetch('http://localhost:3000/api/products');
      if (!res.ok) throw new Error('Network response not ok');
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || 'Server error');

      const rows = payload.data;
      if (!rows.length) {
        status.textContent = 'No products found.';
        return;
      }

      // Build table head using keys of first row
      const cols = Object.keys(rows[0]);
      thead.innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';

      // Build rows
      tbody.innerHTML = rows.map(r => {
        return '<tr>' + cols.map(c => `<td>${escapeHtml(String(r[c] ?? ''))}</td>`).join('') + '</tr>';
      }).join('');

      status.textContent = `Loaded ${rows.length} products.`;
      table.style.display = '';
    } catch (err) {
      console.error(err);
      status.textContent = 'Failed to load products: ' + (err.message || err);
    }
  });

  // basic HTML escape
  function escapeHtml(str) {
    return str.replace(/[&<>"]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
    })[s]);
  }
});
