//Public\login.js
function submitForm() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

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
            localStorage.setItem('jwt', data.token);
            alert('Login successful!');
            window.location.href = 'chatWindow.html';
            
        } else {
            alert('Login failed. Check your credentials.');
            console.error('Login failed:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
