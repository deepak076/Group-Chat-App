// Public\chat.js
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const joinMessage = document.getElementById('join-message');
    const commonChatBtn = document.getElementById('common-chat-btn');
    const chatContainer = document.getElementById('chat-container');
    const closeChatBtn = document.getElementById('close-chat-btn');

    const socket = io('http://localhost:3000'); // Connect to Socket.IO server

    commonChatBtn.addEventListener('click', function () {
        chatContainer.classList.remove('hidden');
    });

    closeChatBtn.addEventListener('click', function () {
        chatContainer.classList.add('hidden');
    });

    // Get JWT token from local storage
    const token = localStorage.getItem('jwt');
    let username;
    const joinedUsers = new Set(); // Keep track of joined users

    if (!token) {
        // Handle the case where the JWT token is not available
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
        console.log("send button add event listener");
        const userMessage = messageInput.value.trim();
        if (userMessage !== '') {
            // Simulating sending a message
            // Emit the message to the server
            socket.emit('chatMessage', { userName: username, message: userMessage });
            messageInput.value = ''; // Clear the input field
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
                const userId = userData.user.id;

                // Save the user ID and username in local storage
                localStorage.setItem('userId', userId);
                localStorage.setItem('username', username);

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

    // Receive message from server
    socket.on('message', ({ userName, message }) => {
        displayMessage(userName, message);
    });

    // Receive file message from server
    socket.on('fileMessage', ({ userName, message }) => {
        // Create a new image element
        const imageElement = document.createElement('img');
        imageElement.src = message; // Set the image source to the received URL
        imageElement.alt = `${userName}'s Image`; // Set alt text for accessibility
        // Append the image to the chat history
        chatHistory.appendChild(imageElement);
    });

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

    function fetchAllData() {
        joinChat();
        fetchAllUsers();
    }

    fetchAllData(); // Call this once to fetch initial data


    const textInput = document.getElementById('text-input');
    const multimediaInput = document.getElementById('multimedia-input');
    const inputModeSwitch = document.getElementById('input-mode-switch');

    inputModeSwitch.addEventListener('click', () => {
        textInput.classList.toggle('hidden');
        multimediaInput.classList.toggle('hidden');

        if (textInput.classList.contains('hidden')) {
            inputModeSwitch.textContent = 'Switch to Text';
        } else {
            inputModeSwitch.textContent = 'Switch to Multimedia';
        }
    });

    const sendFileButton = document.getElementById('send-file-button');

    sendFileButton.addEventListener('click', async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (file) {
            try {
                // Upload the file to the server
                const formData = new FormData();
                formData.append('imageFile', file);

                console.log(formData); // Log the FormData object before sending the request

                const response = await fetch('http://localhost:3000/chat/upload', {
                    method: 'POST',
                    body: formData
                });

                console.log(response); // Log the response from the server

                if (!response.ok) {
                    throw new Error('Failed to upload file to server.');
                }

                // Get the URL of the uploaded file from the response
                const fileUrl = await response.text();

                // Send the file URL to the server as a message
                socket.emit('fileMessage', { userName: username, message: fileUrl });

                // Clear the file input
                fileInput.value = '';

            } catch (error) {
                console.error('Error uploading file:', error);
            }
        } else {
            console.error('No file selected.');
        }
    });

});