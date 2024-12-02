const API_URL = 'http://127.0.0.1:8000/auth/login';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form submission reload

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                username: email,
                password: password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Welcome back, ${email}!`);
            console.log(data);
            // You can save the token to localStorage/sessionStorage if needed
            localStorage.setItem('accessToken', data.access_token);
            // Redirect to another page or update the UI
        } else {
            const errorData = await response.json();
            document.getElementById('errorMessage').textContent = errorData.detail || 'Login failed';
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'An error occurred. Please try again later.';
        console.error(error);
    }
});