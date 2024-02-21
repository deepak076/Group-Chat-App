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
    function displayUserJoinMessage(userName, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
        joinMessage.appendChild(messageElement);
    }

    function displayMessage(userName, message) {
        console.log('Displaying message:', userName, message);
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}: ${message}`;
        chatHistory.appendChild(messageElement);
    }

    sendButton.addEventListener('click', () => {
        const userMessage = messageInput.value.trim();
        if (userMessage !== '') {
            // Simulating sending a message
            displayMessage(username, userMessage);
            sendMessageToServer(username, userMessage);
            messageInput.value = ''; 
        }
    });

    
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
                    displayUserJoinMessage(username, 'joins the chat');
                    joinedUsers.add(username);
                }

            })
            .catch(error => {
                console.error('Error fetching user details:', error);
            });
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
                            displayUserJoinMessage(user.name, 'has joined the chat');
                            joinedUsers.add(user.name);
                        }
                    });
                } else {
                    console.error('Invalid response format for fetching all users:', usersData);
                }
            })
            .catch(error => console.error('Error fetching all users:', error));
    }

    function sendMessageToServer(name, message) {
        console.log('Sending message with username:', name);
        fetch('http://localhost:3000/chat/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ userName: name, message }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response from server:', data);
                if (data.success) {
                    console.log('Message sent successfully:', data.message);

                    // Check if the message is already in local storage
                    const isMessageInLocalStorage = JSON.parse(localStorage.getItem('chats') || '[]')
                        .some(existingMessage => existingMessage.id === data.message.id);

                    if (!isMessageInLocalStorage) {
                        // Call updateLocalStorage after sending the message
                        updateLocalStorage([data.message]); // Pass the sent message in an array
                    }
                } else {
                    console.error('Failed to send message:', data.message);
                }
            })
            .catch(error => console.error('Error sending message:', error));
    }

    function updateLocalStorage(newMessages) {
        console.log('New Messages to Update Local Storage:', newMessages);

        // Retrieve existing chats from local storage
        let chats = JSON.parse(localStorage.getItem('chats')) || [];

        // Add the new messages to the end of the array
        chats = chats.concat(newMessages);

        // Limit the number of stored chats to 10
        const limitedChats = chats.slice(Math.max(chats.length - 10, 0));

        // Save the limited chats back to local storage
        localStorage.setItem('chats', JSON.stringify(limitedChats));
    }

    let lastMessageTimestamp; 
    let receivedMessageIds = new Set();

    function fetchAllMessages() {
        fetch(`http://localhost:3000/chat/get-messages`, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newMessages = data.messages.filter(message => !receivedMessageIds.has(message.id));

                    if (newMessages.length > 0) {
                        console.log('New Messages:', newMessages); 

                        newMessages.forEach(message => {
                            // Check if the message ID is already in the set of received messages
                            if (!receivedMessageIds.has(message.id)) {
                                // Check if the message is already in local storage
                                const isMessageInLocalStorage = JSON.parse(localStorage.getItem('chats') || '[]')
                                    .some(existingMessage => existingMessage.id === message.id);

                                if (!isMessageInLocalStorage) {
                                    // Call updateLocalStorage before displaying the message
                                    updateLocalStorage([message]); // Pass the received message in an array

                                    displayMessage(message.User.name, message.message);
                                    // Update lastMessageTimestamp with the latest timestamp
                                    lastMessageTimestamp = message.createdAt;
                                    // Add the message ID to the set of received messages
                                    receivedMessageIds.add(message.id);
                                }
                            }
                        });
                    }
                } else {
                    console.error('Error fetching messages:', data.message);
                }
            })
            .catch(error => console.error('Error fetching messages:', error));
    }

    function fetchAllData() {
        joinChat();
        fetchAllUsers();
        fetchAllMessages();
    }

    fetchAllData();

    // setInterval(() => {
    //     fetchAllMessages();
    // }, 1000);
});