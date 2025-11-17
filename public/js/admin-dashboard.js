document.addEventListener("DOMContentLoaded", () => {
    loadAdminName();
    loadDashboardCounts();
    loadDashboardCharts();
});

function loadAdminName() {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (admin) {
        document.getElementById("admin-name").textContent =
            (admin.name || admin.username || "ADMIN").toUpperCase();
    }
}

function loadDashboardCounts() {
    loadRevenue();
    loadProducts();
    loadCustomers();
    loadOrders();
}

// ------------------- API LOADERS ----------------------

function loadRevenue() {
    fetch("http://localhost:3000/admin/dashboard/revenue")
        .then(res => res.json())
        .then(data => {
            animateCount("count-revenue", data.revenue, 1000, '$'); // 2000ms duration for revenue
        })
        .catch(() => {
            document.getElementById("count-revenue").textContent = "ERR";
        });
}

function loadProducts() {
    fetch("http://localhost:3000/admin/dashboard/products")
        .then(res => res.json())
        .then(data => {
            animateCount("count-products", data.totalProducts);
        })
        .catch(() => {
            document.getElementById("count-products").textContent = "ERR";
        });
}

function loadCustomers() {
    fetch("http://localhost:3000/admin/dashboard/customers")
        .then(res => res.json())
        .then(data => {
            animateCount("count-customers", data.totalCustomers);
        })
        .catch(() => {
            document.getElementById("count-customers").textContent = "ERR";
        });
}

function loadOrders() {
    fetch("http://localhost:3000/admin/dashboard/orders")
        .then(res => res.json())
        .then(data => {
            animateCount("count-orders", data.totalOrders);
        })
        .catch(() => {
            document.getElementById("count-orders").textContent = "ERR";
        });
}

// ------------------- DASHBOARD CHARTS ----------------------
function loadDashboardCharts() {
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
                            backgroundColor: '#3d08baff'
                        }]
                    },
                    options: { indexAxis: 'y', responsive: true, scales: { x: { beginAtZero: true } } }
                });
            }

        })
        .catch(err => console.error('Error loading dashboard charts:', err));
}

// Function to animate the counting effect on stat numbers
function animateCount(id, finalValue, duration = 1000, prefix = '') {
    const obj = document.getElementById(id);
    if (!obj) return; 

    let startValue = 0;
    let numericValue = parseFloat(String(finalValue).replace(/[$,]/g, ''));
    
    // Determine the step size and whether to use decimals
    const step = numericValue / (duration / 16);
    const isRevenue = id === 'count-revenue';
    
    let current = 0;
    
    const counter = setInterval(() => {
        current += step;
        
        if (current >= numericValue) {
            clearInterval(counter);
            current = numericValue; // Ensure it stops exactly on the final value
        }

        let displayValue;
        if (isRevenue) {
             displayValue = current.toFixed(2);
        } else {
             displayValue = Math.floor(current);
        }

        obj.textContent = prefix + displayValue;

        if (current === numericValue) {
            clearInterval(counter);
        }
    }, 16); // Runs approximately 60 times per second
}
