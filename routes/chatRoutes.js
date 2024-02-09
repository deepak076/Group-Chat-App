// routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Endpoint to handle incoming chat messages
router.post('/send-message', chatController.sendMessage);

// New endpoint to get all messages
router.get('/get-messages', chatController.getAllMessages);

module.exports = router;
