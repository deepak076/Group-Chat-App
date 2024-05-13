// chatController.js
const { models } = require('../util/db');
const { User, ChatMessage } = models;
const s3Service = require('../services/s3service'); 


exports.sendMessage = async (req, res) => {
    console.log("entering sendMessage");
    const { userName, message } = req.body;
    console.log('Received request body:', req.body);
    try {
        console.log("entering try");
        // Find the user by username to get the user's ID
        const user = await User.findOne({ where: { name: userName } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log("userid line 16", user);
        const newMessage = await ChatMessage.create({
            userId: user.id, // Use the retrieved user's ID
            message
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
        const messages = await ChatMessage.findAll({ include: User });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        // Check if file is present in the request
        if (!req.file) {
            throw new Error('No file uploaded.');
        }

        // Construct file object with necessary properties
        const file = {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
            mimetype: req.file.mimetype
        };

        // Upload the file to S3
        const fileUrl = await s3Service.uploadFileToS3(file);
        
        // Send the URL of the uploaded file back to the client
        res.send(fileUrl);
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        res.status(500).json({ success: false, message: 'Error uploading file to S3' });
    }
};
