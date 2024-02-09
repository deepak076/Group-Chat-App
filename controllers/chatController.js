// chatController.js
const { models } = require('../util/db');
const { User, ChatMessage } = models;

exports.sendMessage = async (req, res) => {
    console.log("entering sendMessage");
    const { userId, message } = req.body;
    console.log('Received userId:', userId);
    try {
        console.log("entering try");
        // Find the user by email to get the user's ID
        const user = await User.findOne({ where: { email: userId } });
        console.log('User found:', user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newMessage = await ChatMessage.create({
            userId: user.id, // Use the retrieved user's ID
            message,
        });
        console.log("newMessage", newMessage);

        res.json({ success: true, message: 'Message sent successfully', message: newMessage });
    } catch (error) {
        console.error('Error storing message:', error);
        res.status(500).json({ success: false, message: 'Error storing message' });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.findAll();
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};