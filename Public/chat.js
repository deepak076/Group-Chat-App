// Public\chat.js
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const joinMessage = document.getElementById('join-message');

    const token = localStorage.getItem('jwt');
    let username;
    const joinedUsers = new Set(); 

    if (!token) {
        console.error('JWT token not found.');
        return;
    }

    function displayUser(userName, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
        joinMessage.appendChild(messageElement);
    }

    function displayMessage(userName, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}: ${message}`;
        chatHistory.appendChild(messageElement);
    }

    function clearChatHistory() {
        chatHistory.innerHTML = '';
    }

    function saveMessageToLocalStorage(message) {
        let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        message.timestamp = new Date().toISOString();
        messages.push(message);

        // Limit the stored messages to the most recent 10 chats
        if (messages.length > 10) {
            messages.shift(); // Remove the oldest message
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }

    function fetchMessagesFromLocalStorage() {
        return JSON.parse(localStorage.getItem('chatMessages')) || [];
    }

    function fetchAllMessages() {
        // Fetch messages from local storage first
        const localMessages = fetchMessagesFromLocalStorage();
        console.log('Local Messages:', localMessages); // Log local messages
        clearChatHistory();
        localMessages.forEach((message) => {
            displayMessage(message.User.name, message.message, message.timestamp);
        });

        // Fetch new messages from the backend
        fetch('http://localhost:3000/chat/get-messages', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Backend Messages:', data.messages); 
                if (data.success) {
                    // Filter out messages that are already displayed
                    const newMessages = data.messages.filter((message) => {
                        const isAlreadyDisplayed = localMessages.some((localMessage) => localMessage.createdAt === message.createdAt);
                        return !isAlreadyDisplayed;
                    });

                    console.log('New Messages:', newMessages);

                    // Display new messages in the correct order
                    newMessages.forEach((message) => {
                        displayMessage(message.User.name, message.message, message.createdAt);
                        saveMessageToLocalStorage(message);
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
                    displayUser(username, 'joins the chat');
                    joinedUsers.add(username);
                }

                sendButton.addEventListener('click', () => {
                    const userMessage = messageInput.value.trim();
                    if (userMessage !== '') {
                        // Simulating sending a message
                        displayUser(username, userMessage);
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
                if (usersData.success && Array.isArray(usersData.users)) {
                    usersData.users.forEach(user => {
                        if (!joinedUsers.has(user.name)) {
                            displayUser(user.name, 'has joined the chat');
                            joinedUsers.add(user.name);
                        }
                    });
                } else {
                    console.error('Invalid response format for fetching all users:', usersData);
                }
            })
            .catch(error => console.error('Error fetching all users:', error));
    }

    setInterval(() => {
        fetchAllUsers();
        joinChat();
        fetchAllMessages();
    }, 1000);

});
