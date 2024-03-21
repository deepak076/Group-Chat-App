// Public\group.js
document.addEventListener('DOMContentLoaded', () => {
  const createGroupBtn = document.getElementById('create-group-btn');
  const createGroupForm = document.getElementById('create-group-form');
  

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

  const token = localStorage.getItem('jwt');
  console.log("token", token);
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
              groupList.appendChild(li);
          });
      } else {
          throw new Error('Failed to fetch user groups');
      }
  })
  .catch(error => console.error('Error fetching user groups:', error));
}


