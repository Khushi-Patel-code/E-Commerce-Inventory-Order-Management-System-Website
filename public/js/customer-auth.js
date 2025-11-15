document.addEventListener('DOMContentLoaded', () => {
    console.log('customer-auth.js loaded');

    const registerForm = document.getElementById('customerRegisterForm');   
    const loginForm = document.getElementById('customerLoginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            if (!registerForm.checkValidity()){
                //let browser show its native warnings
                return;
            }
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

                //clear old messages
                document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

                console.error('Server error', error);

                if (error.errors) {
                    error.errors.forEach(e => {
                        const fieldError = document.getElementById(`$e.field}Error`);
                        if (fieldError) {
                            fieldError.textContent = e.message;
                        }
                    });
                } else {
                    alert(err.message || 'Registration failed');
                }
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
            } else if (result.errors) {
                alert(result.errors.map(err => err.msg).join('\n'));
            } else {
                alert(result.message || 'Login failed');
            }
        });
    }
});