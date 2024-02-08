// routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Endpoint to handle incoming chat messages
router.post('/send-message', chatController.sendMessage);

module.exports = router;
