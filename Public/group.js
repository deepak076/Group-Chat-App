    // Public\group.js

    const token = localStorage.getItem('jwt');
    console.log("token", token);

    document.addEventListener('DOMContentLoaded', () => {
      const createGroupBtn = document.getElementById('create-group-btn');
      const createGroupForm = document.getElementById('create-group-form');
      const groupChatContainer = document.getElementById('groupChat-container');
      const closeGroupChatBtn = document.getElementById('close-groupChat-btn');

      closeGroupChatBtn.addEventListener('click', function () {
        groupChatContainer.classList.add('hidden');
      });

      createGroupBtn.addEventListener('click', function () {
        createGroupForm.classList.toggle('hidden');
      });

      createGroupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const groupName = document.getElementById('group-name-input').value;
        let memberDetails = document.getElementById('members-input').value;
        const members = memberDetails.split(',').map(member => member.trim());

        createGroup(groupName, members);
      });

      fetchUserGroups(token);
    });

    function createGroup(groupName, members) {
      fetch('http://localhost:3000/group/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupName: groupName })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const groupId = data.groupId;
            addMembersToGroup(groupId, members);
          } else {
            throw new Error('Failed to create group');
          }
        })
        .catch(error => console.error('Error creating group:', error));
    }

    function addMembersToGroup(groupId, members) {
      fetch('http://localhost:3000/group/add-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: groupId, members: members })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Group created and members added successfully!');
            // Clear form fields manually
            document.getElementById('group-name-input').value = '';
            document.getElementById('members-input').value = '';
            document.getElementById('create-group-form').classList.add('hidden');

            // Refresh user's groups
            fetchUserGroups();
          } else {
            throw new Error('Failed to add members to group');
          }
        })
        .catch(error => console.error('Error adding members to group:', error));
    }

    function fetchUserGroups(token) {
      console.log('Fetching user groups...');
      fetch('http://localhost:3000/group/user-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('Response:', data); // Log the response data
          if (data.success) {
            console.log('User groups:', data.groups); // Log the user groups
            // Clear the existing group list
            const groupList = document.getElementById('group-list');
            groupList.innerHTML = '';

            // Populate the group list with user's groups
            data.groups.forEach(group => {
              const li = document.createElement('li');
              li.textContent = group.name;
              li.dataset.groupId = group.id;
              groupList.appendChild(li);
            });
          } else {
            throw new Error('Failed to fetch user groups');
          }
        })
        .catch(error => console.error('Error fetching user groups:', error));
    }

    document.addEventListener('DOMContentLoaded', () => {
      const groupList = document.getElementById('group-list');
      const sendButton = document.getElementById('groupSend-button');
      const messageInput = document.getElementById('group-message-input');
      const chatHistory = document.getElementById('groupChat-history');

      groupList.addEventListener('click', async (event) => {
        const clickedListItem = event.target.closest('li'); // Find the closest <li> element

        if (clickedListItem && groupList.contains(clickedListItem)) {
          console.log('Clicked:', clickedListItem.textContent.trim()); // Log the text content of the clicked <li>

          const groupId = clickedListItem.dataset.groupId; // Get the group ID from the data attribute
          const groupName = clickedListItem.textContent.trim(); // Get the group name from the text content
          const groupChatContainer = document.getElementById('groupChat-container');

          // Remove the 'active' class from previously selected groups
          const activeGroups = document.querySelectorAll('#group-list li.active');
          activeGroups.forEach(group => group.classList.remove('active'));

          // Add the 'active' class to the clicked group
          clickedListItem.classList.add('active');

          // Display the chat container for the clicked group
          displayGroupChatContainer(groupChatContainer, groupName);
          displayGroupChatContainer(groupChatContainer, groupName);
        }
      });

      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId');

      sendButton.addEventListener('click', () => {
        console.log("send button add event listener");
        const userMessage = messageInput.value.trim();
        if (userMessage !== '') {
          // Simulating sending a message
          displayMessage(username, userMessage);
          // Call the backend API to send the message
          sendMessageToServer(username, userId, userMessage);
          messageInput.value = ''; // Clear the input field
        }
      });

      function displayMessage(userName, message) {
        console.log('Displaying message:', userName, message);
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${userName}: ${message}`;
        chatHistory.appendChild(messageElement);
      }

      function getCurrentGroupId() {
        const selectedGroup = document.querySelector('#group-list li.active');
        if (selectedGroup) {
          return selectedGroup.dataset.groupId;
        }
        return null; // If no group is selected or active
      }

      function sendMessageToServer(userName, userId, message) {
        console.log('Sending group message with username:', userName, 'and userId:', userId);
        const groupId = getCurrentGroupId();
        console.log("groupid current", groupId);
        fetch('http://localhost:3000/group/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({ userName: userName, userId: userId, message: message, groupId: groupId }), // Include userId in the request body
        })
          .then(response => response.json())
          .then(data => {
            console.log('Response from server:', data);
            if (data.success) {
              console.log('Message sent successfully:', data.message);
              // Check if the message is already in local storage
              const isMessageInLocalStorage = JSON.parse(localStorage.getItem('group-chats') || '[]')
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
        let chats = JSON.parse(localStorage.getItem('group-chats')) || [];

        // Add the new messages to the end of the array
        chats = chats.concat(newMessages);

        // Limit the number of stored chats to 10
        const limitedChats = chats.slice(Math.max(chats.length - 10, 0));

        // Save the limited chats back to local storage
        localStorage.setItem('group-chats', JSON.stringify(limitedChats));
      }

      let lastMessageTimestamp; // Declare lastMessageTimestamp
      let receivedMessageIds = new Set();

      function fetchAllMessages() {
          console.log("entering fetch all messages ");
          fetch(`http://localhost:3000/group/get-messages`, {
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
                          console.log('New Messages:', newMessages); // Log new messages

                          newMessages.forEach(message => {
                              // Check if the message ID is already in the set of received messages
                              if (!receivedMessageIds.has(message.id)) {
                                  // Check if the message is already in local storage
                                  const isMessageInLocalStorage = JSON.parse(localStorage.getItem('group-chats') || '[]')
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
          fetchAllMessages();
      }

      fetchAllData(); // Call this once to fetch initial data

      // setInterval(() => {
      //     fetchAllMessages();
      // }, 1000);
    });

    function displayGroupChatContainer(container, groupName) {
      // Find the group chat name element and set its content
      const groupNameElement = document.getElementById('group-chat-name');
      if (groupNameElement) {
        groupNameElement.textContent = groupName; // Set the group name
      }
      container.classList.remove('hidden'); // Remove the 'hidden' class to display the group chat container
    }

