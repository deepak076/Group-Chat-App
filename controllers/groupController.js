// controllers\groupController.js
const Group = require('../models/group');
const GroupMembership = require('../models/groupMembership');
const User = require('../models/user');


// Controller to create a new group
exports.createGroup = async (req, res) => {
    try {
        const { groupName } = req.body;
        const group = await Group.create({ name: groupName });
        res.json({ success: true, groupId: group.id });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ success: false, message: 'Failed to create group' });
    }
};

exports.addMembersToGroup = async (req, res) => {
    try {

        const { groupId, members } = req.body;

        console.log('Request Body:', req.body); // Log the entire request body to see what data is being sent
        console.log('Group ID:', groupId); // Log the group ID to see if it's correctly extracted from the request body
        console.log('Members:', members); // Log the members array to see if it contains the expected data

        // Fetch userId for each member name
        const userIds = await Promise.all(members.map(async (memberName) => {
            const user = await User.findOne({ where: { name: memberName } });
            return user ? user.id : null;
        }));

        console.log('User IDs:', userIds); // Log the retrieved userIds

        // Filter out any null userIds (if member name doesn't correspond to any user)
        const validUserIds = userIds.filter(userId => userId !== null);

        console.log('Valid User IDs:', validUserIds); // Log the filtered valid userIds

        // Insert records into GroupMembership table
        await Promise.all(validUserIds.map(async (userId) => {
            try {
                const groupMembership = await GroupMembership.create({ groupId: groupId, userId: userId });
                console.log('Group Membership created:', groupMembership.toJSON()); // Log the created GroupMembership
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
        console.log('User Groups:', userGroups); // Log userGroups to check its value

        // Respond with the fetched user groups
        res.json({ success: true, groups: userGroups });
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user groups' });
    }
};


