// Public\chat.js
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const joinMessage = document.getElementById('join-message');

<<<<<<< HEAD
    // Get JWT token from local storage
=======
>>>>>>> origin/master
    const token = localStorage.getItem('jwt');
    let username;
    const joinedUsers = new Set(); 

    if (!token) {
        console.error('JWT token not found.');
        return;
    }
<<<<<<< HEAD
    function displayUserJoinMessage(userName, message) {
=======

    function displayUser(userName, message) {
>>>>>>> origin/master
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

<<<<<<< HEAD
=======
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

>>>>>>> origin/master
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

<<<<<<< HEAD
=======
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

>>>>>>> origin/master
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
<<<<<<< HEAD

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
                    // Call updateLocalStorage after sending the message
                    updateLocalStorage([data.message]); // Pass the sent message in an array
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

    let lastMessageTimestamp; // Declare lastMessageTimestamp
    function fetchAllMessages() {
        fetch(`http://localhost:3000/chat/get-messages?timestamp=${lastMessageTimestamp || 0}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newMessages = data.messages;
    
                    if (newMessages.length > 0) {
                        console.log('New Messages:', newMessages); // Log new messages
                        clearChatHistory();
    
                        newMessages.forEach(message => {
                            displayMessage(message.User.name, message.message);
                            // Update lastMessageTimestamp with the latest timestamp
                            lastMessageTimestamp = message.createdAt;
                        });
    
                        // Call updateLocalStorage here, after displaying the messages
                        updateLocalStorage(newMessages);
                    }
                } else {
                    console.error('Error fetching messages:', data.message);
                }
    
            })
            .catch(error => console.error('Error fetching messages:', error));
    }

    joinChat();
    fetchAllUsers();
    fetchAllMessages();
=======
>>>>>>> origin/master

    setInterval(() => {
        joinChat();
        fetchAllUsers();
        fetchAllMessages();
    }, 1000);
<<<<<<< HEAD
=======

>>>>>>> origin/master
});
