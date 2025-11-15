document.addEventListener("DOMContentLoaded", () => {
    loadAdminName();
    loadDashboardCounts();
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
            document.getElementById("count-revenue").textContent = `$${data.revenue}`;
        })
        .catch(() => {
            document.getElementById("count-revenue").textContent = "ERR";
        });
}

function loadProducts() {
    fetch("http://localhost:3000/admin/dashboard/products")
        .then(res => res.json())
        .then(data => {
            document.getElementById("count-products").textContent = data.totalProducts;
        })
        .catch(() => {
            document.getElementById("count-products").textContent = "ERR";
        });
}

function loadCustomers() {
    fetch("http://localhost:3000/admin/dashboard/customers")
        .then(res => res.json())
        .then(data => {
            document.getElementById("count-customers").textContent = data.totalCustomers;
        })
        .catch(() => {
            document.getElementById("count-customers").textContent = "ERR";
        });
}

function loadOrders() {
    fetch("http://localhost:3000/admin/dashboard/orders")
        .then(res => res.json())
        .then(data => {
            document.getElementById("count-orders").textContent = data.totalOrders;
        })
        .catch(() => {
            document.getElementById("count-orders").textContent = "ERR";
        });
}
