function submitForm() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Perform client-side validation if needed

    // Send data to the backend API
    fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Login successful!');
            // Redirect or perform other actions upon successful login
        } else {
            alert('Login failed. Check your credentials.');
            console.error('Login failed:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
