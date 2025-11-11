document.addEventListener('DOMContentLoaded', () => {
    console.log('customer-auth.js loaded');

    const registerForm = document.getElementById('customerRegisterForm');   
    const loginForm = document.getElementById('customerLoginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            
            //log submitted data
            console.log ('Submitted data:', data);
        try{
            const res = await fetch('http://localhost:3000/customers/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            //log the response status
            console.log('Response status:', res.status);


            if(!res.ok){
                const error = await res.json();
                console.error('Server error', error);
                alert(error.message || 'Registration failed');
                return;
            }
            const result = await res.json();
            alert(result.message || 'Registered!');
            window.location.href = 'index.html'; // back to greeting page
        } catch (err) {
            console.error('Registration error:', err);
            alert('Error registering. Please try again');
        }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            const res = await fetch('http://localhost:3000/customers/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (result.token) {
                localStorage.setItem('token', result.token);
                alert('Login successful!');
                window.location.href = 'products.html';
            } else {
                alert(result.message || 'Login failed');
            }
        });
    }
});

