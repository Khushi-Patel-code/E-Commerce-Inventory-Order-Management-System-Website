const admin = JSON.parse(localStorage.getItem("admin"));

if (!admin) {
    alert("Not logged in!");
    window.location.href = "staff-login.html";
}

async function loadProfile() {
    const res = await fetch("http://localhost:3000/api/admin/profile/" + admin.user_id);
    const data = await res.json();

    document.getElementById("username").value = data.username;
    document.getElementById("email").value = data.email;
}

loadProfile();

document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updated = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    const res = await fetch("http://localhost:3000/api/admin/profile/" + admin.user_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    const result = await res.json();
    alert(result.message);

    // update localStorage
    admin.username = updated.username;
    localStorage.setItem("admin", JSON.stringify(admin));

    window.location.href = "admin-dashboard.html";
});
