// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const multer = require('../middleware/multer');
const upload = multer.upload;

router.post('/send-message', chatController.sendMessage);
router.get('/get-messages', chatController.getAllMessages);
router.post('/upload', upload.single('imageFile'), chatController.uploadFile);

module.exports = router;
