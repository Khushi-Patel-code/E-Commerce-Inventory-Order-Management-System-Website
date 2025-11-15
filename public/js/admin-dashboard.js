// Load admin name
const admin = JSON.parse(localStorage.getItem("admin"));
if (admin) {
    document.getElementById("admin-name").textContent = admin.name;
}

// FETCH STATS EXAMPLE
async function loadStats() {
    try {
        const res = await fetch("http://localhost:3000/api/admin/stats");
        const data = await res.json();

        document.getElementById("count-products").textContent = data.products;
        document.getElementById("count-categories").textContent = data.categories;
        document.getElementById("low-stock").textContent = data.lowStock;
        document.getElementById("count-orders").textContent = data.orders;

    } catch (err) {
        console.error("Stats Error:", err);
    }
}

loadStats();

function logout() {
    localStorage.clear();
    window.location.href = "staff-login.html";
}
