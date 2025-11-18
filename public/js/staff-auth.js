document.addEventListener('DOMContentLoaded', () => {

    const showSuccess = (message) => {
        document.getElementById('successMessage').textContent = message;
        new bootstrap.Modal(document.getElementById('successModal')).show();
    };

    const showError = (message) => {
        document.getElementById('errorMessage').textContent = message;
        new bootstrap.Modal(document.getElementById('errorModal')).show();
    };

    document.getElementById('staffLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.token) {
                console.log("Decoded token:", JSON.parse(atob(result.token.split('.')[1])));

                localStorage.setItem("token", result.token);
                localStorage.setItem("admin", JSON.stringify(result.admin));

                showSuccess('Login successful!');

                setTimeout(() => {
                    window.location.href = "/admin/admin-dashboard.html";
                }, 1200);

            } else {
                showError(result.message || 'Login failed');
            }

        } catch (err) {
            console.error('Login error:', err);
            showError('Error connecting to server');
        }
    });

});
