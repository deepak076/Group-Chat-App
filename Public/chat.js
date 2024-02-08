document.addEventListener('DOMContentLoaded', () => {
    const joinMessage = document.getElementById('join-message');
    const chatHistory = document.getElementById('chat-history');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Get JWT token from local storage
    const token = localStorage.getItem('jwt');
    let username;
    const joinedUsers = new Set(); // Keep track of joined users

    if (!token) {
        // Handle the case where the JWT token is not available
        console.error('JWT token not found.');
        return;
    }

    function displayMessage(userName, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
        chatHistory.appendChild(messageElement);
    }

    fetch('http://localhost:3000/user/details', {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    })
        .then(response => response.json())
        .then(userData => {
            username = userData.user.name;
            if (!joinedUsers.has(username)) {
                // Display join message only if the user hasn't joined before
                displayMessage(username, 'joins the chat');
                joinedUsers.add(username);
            }

            // Event listener for the send button
            sendButton.addEventListener('click', () => {
                const userMessage = messageInput.value;
                if (userMessage.trim() !== '') {
                    // Simulating sending a message
                    displayMessage(username, userMessage);
                    messageInput.value = ''; // Clear the input field
                }
            });
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        });

    fetch('http://localhost:3000/user/all', {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    })
        .then(response => response.json())
        .then(usersData => {
            console.log('Users Data:', usersData);

            if (usersData.success && Array.isArray(usersData.users)) {
                usersData.users.forEach(user => {
                    if (!joinedUsers.has(user.name)) {
                        // Display join message only if the user hasn't joined before
                        displayMessage(user.name, 'has joined the chat');
                        joinedUsers.add(user.name);
                    }
                });
            } else {
                console.error('Invalid response format for fetching all users:', usersData);
            }
        })
        .catch(error => console.error('Error fetching all users:', error));
});
