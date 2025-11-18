document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('staffLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try{
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.token) {
                //debug: show decoded JWT payload
                console.log("Decoded token:", JSON.parse(atob(result.token.split('.')[1])));

                //store token
                localStorage.setItem("token", result.token);
                localStorage.setItem("admin", JSON.stringify(result.admin));

                alert('Login successful!');

                // Redirect to admin dashboard
                window.location.href = "/admin/admin-dashboard.html";

            } else {
                alert(result.message || 'Login failed');
            }
    } catch (err){
        console.error('Login error:', err);
        alert('Error connecting to server');
    }
    });

});