// admin-charts.js (updated for both dashboard & charts page)
fetch('/api/charts/data')
  .then(res => res.json())
  .then(data => {
    const { revenueVsDate, revenueByCategory, topProducts } = data;

    // Revenue vs Date
    const revenueCanvas = document.getElementById("revenueChart");
    if (revenueCanvas) {
      new Chart(revenueCanvas, {
        type: 'line',
        data: {
          labels: revenueVsDate.map(d => new Date(d.date).toLocaleDateString()),
          datasets: [{
            label: 'Revenue ($)',
            data: revenueVsDate.map(d => parseFloat(d.revenue)),
            borderColor: '#4e73df',
            backgroundColor: 'rgba(78,115,223,0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    }

    // Revenue by Category
    const categoryCanvas = document.getElementById("categoryDonut");
      if (categoryCanvas) {
          new Chart(categoryCanvas, {
              type: 'doughnut',
              data: {
                  labels: revenueByCategory.map(c => c.category_name),
                  datasets: [{
                      data: revenueByCategory.map(c => parseFloat(c.revenue)),
                      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796']
                  }]
              },
              options: {
                  responsive: true,
                  // 🌟 Key Configuration to move the legend to the bottom
                  plugins: {
                      legend: {
                          position: 'bottom', // Places the legend underneath the chart
                          align: 'center'     // Optional: Centers the legend horizontally
                      }
                  }
              }
          });
      }

    // Top Selling Products
    const topProductsCanvas = document.getElementById("topProducts");
    if (topProductsCanvas) {
      new Chart(topProductsCanvas, {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.product_name),
          datasets: [{
            label: 'Units Sold',
            data: topProducts.map(p => parseInt(p.units_sold)),
            backgroundColor: '#1cc88a'
          }]
        },
        options: { indexAxis: 'y', responsive: true, scales: { x: { beginAtZero: true } } }
      });
    }

  })
  .catch(err => console.error('Error loading chart data:', err));
