function submitForm(){
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var password = document.getElementById('password').value;

    fetch('http://localhost:3000/user/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',

        },
        body: JSON.stringify({name,email, phone, password   }),

    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from backend: ', data);
    })
    .catch(error => console.error('Error:', error));
}