// public/js/customer-auth.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('customer-auth.js loaded');

  const registerForm = document.getElementById('customerRegisterForm');
  const loginForm = document.getElementById('customerLoginForm');

  // -------------------- REGISTER --------------------
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      if (!registerForm.checkValidity()) return;
      e.preventDefault();

      const formData = new FormData(registerForm);

      // ✅ Map frontend fields to backend expectations
      const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
      };

      console.log('Register payload', data);
      try {
        const res = await fetch('/api/customers/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          const error = await res.json();
          document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
          console.error('Server error', error);

          if (error.errors) {
            error.errors.forEach(e => {
              const fieldError = document.getElementById(`${e.field}Error`);
              if (fieldError) fieldError.textContent = e.message;
            });
          } else {
            alert(error.message || 'Registration failed');
          }
          return;
        }

        const result = await res.json();
        alert(result.message || 'Registered successfully!');
        window.location.href = 'customer-login.html'; // ✅ redirect to login
      } catch (err) {
        console.error('Registration error:', err);
        alert('Error registering. Please try again');
      }
    });
  }

  // -------------------- LOGIN --------------------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/customers/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.message || 'Login failed');
          return;
        }

        const result = await res.json();
        if (result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('role', result.role);

          alert('Login successful!');
          window.location.href = 'customer-dashboard.html';
        } else {
          alert(result.message || 'Login failed');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Error logging in. Please try again');
      }
    });
  }
});