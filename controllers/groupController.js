// groupController.js
const { models } = require('../util/db');
const { Group, User } = models;


const createGroup = async (req, res) => {
    try {
        const { groupName, userIds } = req.body;
        const { userId } = req.user;

        // Create the group
        const group = await Group.create({ name: groupName });

        // Add users to the group
        await group.addUsers(userIds);

        return res.status(201).json({ success: true, group });
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching all groups:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.user;
    try {
        // Check if the user is already part of the group
        const userInGroup = await Group.findOne({
            where: {
                id: groupId,
            },
            include: [
                {
                    model: User,
                    where: {
                        id: userId,
                    },
                },
            ],
        });

        if (userInGroup) {
            return res.json({ success: false, message: 'User is already part of the group' });
        }

        // Add the user to the group
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        await group.addUser(userId);

        res.json({ success: true, message: 'User joined the group successfully' });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createGroup,
    getAllGroups,
    joinGroup,
};
