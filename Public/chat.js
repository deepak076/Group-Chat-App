// Public\chat.js
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const joinMessage = document.getElementById('join-message');
    const groupListContainer = document.getElementById('group-list');
    const createGroupButton = document.getElementById('create-group-button');

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

    createGroupButton.addEventListener('click', () => {
        // Fetch all users to display a list with checkboxes
        fetch('http://localhost:3000/user/all', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
        .then(response => response.json())
        .then(usersData => {
            if (usersData.success && Array.isArray(usersData.users)) {
                // Populate the modal with users and checkboxes
                populateUserModal(usersData.users);
    
                // Display the modal
                const modal = document.getElementById('myModal');
                const span = document.getElementsByClassName('close')[0];
                modal.style.display = 'block';
    
                // Close the modal if the user clicks on the close button
                span.onclick = () => {
                    modal.style.display = 'none';
                };
    
                // Close the modal if the user clicks outside of it
                window.onclick = (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                };
    
                // Create the group when the user clicks the "Create Group" button
                const createGroupButton = document.getElementById('create-group');
                createGroupButton.addEventListener('click', () => {
                    const groupName = document.getElementById('group-name').value.trim();
                    if (groupName) {
                        const selectedUsers = getSelectedUsers();
                        createGroup(groupName, selectedUsers);
                        modal.style.display = 'none';
                    } else {
                        alert('Please enter a group name.');
                    }
                });
            } else {
                console.error('Invalid response format for fetching all users:', usersData);
            }
        })
        .catch(error => console.error('Error fetching all users:', error));
    });    

    function populateUserModal(users) {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        users.forEach(user => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'user';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(user.name));

            userList.appendChild(label);
        });
    }

    function getSelectedUsers() {
        const selectedUsers = [];
        const checkboxes = document.querySelectorAll('input[name=user]:checked');

        checkboxes.forEach((checkbox) => {
            selectedUsers.push(checkbox.value);
        });

        return selectedUsers;
    }

    function createGroup(groupName, userIds) {
        fetch('http://localhost:3000/group/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ groupName, userIds }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Group created successfully:', data.group);
                    // Add logic to handle the created group (e.g., update UI)
                    fetchAllGroups(); // Refresh the group list after creation
                } else {
                    console.error('Failed to create group:', data.message);
                }
            })
            .catch(error => console.error('Error creating group:', error));
    }

    // Function to display a list of groups
    function displayGroupList(groups) {
        groupListContainer.innerHTML = '';
        groups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.innerHTML = `<div>${group.name}</div>`;
            groupElement.addEventListener('click', () => {
                joinGroup(group.id); // Implement this function to join the selected group
            });
            groupListContainer.appendChild(groupElement);
        });
    }

    // Function to fetch and display the list of groups
    function fetchAllGroups() {
        fetch('http://localhost:3000/group/all', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(groupData => {
                if (groupData.success && Array.isArray(groupData.groups)) {
                    displayGroupList(groupData.groups);
                } else {
                    console.error('Invalid response format for fetching all groups:', groupData);
                }
            })
            .catch(error => console.error('Error fetching all groups:', error));
    }

    // Function to join a group
    function joinGroup(groupId) {
        fetch(`http://localhost:3000/group/join/${groupId}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(`Successfully joined group ${groupId}`);
                    // Fetch updated user and group information
                    joinChat();
                    fetchAllGroups();
                    fetchAllMessages();
                } else {
                    console.error('Failed to join group:', data.message);
                }
            })
            .catch(error => console.error('Error joining group:', error));
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
        fetchAllGroups(); // Fetch groups when the page loads
        fetchAllMessages();
    }

    fetchAllData();

    // setInterval(() => {
    //     fetchAllMessages();
    // }, 1000);
});