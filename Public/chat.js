document.addEventListener('DOMContentLoaded', () => {
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

    function fetchAllMessages() {
        fetch('http://localhost:3000/chat/get-messages', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.messages.forEach(message => {
                        displayMessage(message.userName, message.message);
                    });
                } else {
                    console.error('Error fetching messages:', data.message);
                }
            })
            .catch(error => console.error('Error fetching messages:', error));
    }

    function joinChat() {
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
                    const userMessage = messageInput.value.trim();
                    if (userMessage !== '') {
                        // Simulating sending a message
                        displayMessage(username, userMessage);
                        // Call the backend API to send the message
                        sendMessageToServer(username, userMessage);
                        messageInput.value = ''; // Clear the input field
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });
    }

    function sendMessageToServer(email, message) {
        console.log('Sending message with email:', email);
        fetch('http://localhost:3000/chat/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ userName: email, message }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.success) {
                    console.log('Message sent successfully:', data.message);
                } else {
                    console.error('Failed to send message:', data.message);
                }
            })
            .catch(error => console.error('Error sending message:', error));
    }


    function fetchAllUsers() {
        fetch('http://localhost:3000/user/all', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(usersData => {
                // console.log('Users Data:', usersData);

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
    }

    // Call functions to join the chat and fetch all users
    
    joinChat();
    fetchAllUsers();
    fetchAllMessages();


});
