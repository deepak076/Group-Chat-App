// controllers\groupController.js
const Group = require('../models/group');
const GroupMembership = require('../models/groupMembership');
const User = require('../models/user');
const GroupMessage = require('../models/groupMessage'); 
 

// Controller to create a new group
// Controller to create a new group
exports.createGroup = async (req, res) => {
    try {
        console.log("entering create group");
        const { groupName,userId } = req.body;
        console.log("grpname", groupName);
        const group = await Group.create({ name: groupName });
        console.log("group",group);
        console.log("req.user.id",req.body);
        console.log("userid", userId);
        // Set the title of the user who creates the group as admin in GroupMembership
        await GroupMembership.create({
            groupId: group.id,
            userId: userId, 
            title: 'admin' // Set the title as admin
        });
        console.log("line 24");
        
        res.json({ success: true, groupId: group.id });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ success: false, message: 'Failed to create group' });
    }
};

exports.addMembersToGroup = async (req, res) => {
    try {
        const { groupId, members } = req.body;

        // Fetch userId for each member name
        const userIds = await Promise.all(members.map(async (memberName) => {
            const user = await User.findOne({ where: { name: memberName } });
            return user ? user.id : null;
        }));

        // Filter out any null userIds (if member name doesn't correspond to any user)
        const validUserIds = userIds.filter(userId => userId !== null);

        // Insert records into GroupMembership table
        await Promise.all(validUserIds.map(async (userId) => {
            try {
                await GroupMembership.create({ groupId: groupId, userId: userId, title: 'member' });
            } catch (error) {
                console.error('Error creating Group Membership:', error);
            }
        }));

        res.json({ success: true, message: 'Members added successfully' });
    } catch (error) {
        console.error('Error adding members to group:', error);
        res.status(500).json({ success: false, message: 'Failed to add members to group' });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        console.log("Entering getUserGroups");

        // Extract the userId from the request object
        const userId = req.user.id;
        console.log('User ID:', userId); // Log the userId to check its value

        // Fetch user groups based on the userId
        const userGroups = await Group.findAll({ include: [{ model: User, where: { id: userId } }] });

        // Respond with the fetched user groups
        res.json({ success: true, groups: userGroups });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user groups' });
    }
};

exports.getGroupChatMessages = async (req, res) => {
    try {
        // Extract the group ID from the request parameters
        const { groupId } = req.params;

        // Fetch chat messages for the specified group ID using Sequelize
        const chatMessages = await GroupMessage.findAll({ where: { groupId } });

        // Send the chat messages in the response
        res.json({ success: true, messages: chatMessages });
    } catch (error) {
        console.error('Error fetching group chat messages:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


exports.sendMessage = async (req, res) => {
    console.log("Entering sendMessage");
    const { userId, message, groupId } = req.body; // Change userName to userId
    console.log('Received request body:', req.body);
    try {
        console.log("Entering try block");
        // Ensure the group exists before attempting to save a message
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }
        console.log("Group found:", group);

        // Fetch the user associated with the userId
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log("User found:", user);

        // Create the new message associated with both the user's name and the group's ID
        const newMessage = await GroupMessage.create({
            userId: userId,
            groupId: groupId,
            userName: user.name, // Use the retrieved user's name
            message: message // The message content
        });
        console.log("New message created:", newMessage);

        res.json({ success: true, message: 'Message sent successfully', data: newMessage });
    } catch (error) {
        console.error('Error storing message:', error);
        res.status(500).json({ success: false, message: 'Error storing message' });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await GroupMessage.findAll({ include: User });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



