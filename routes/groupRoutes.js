// routes\groupRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const groupController = require('../controllers/groupController');

// Group creation and member management
router.post('/create-group', authMiddleware.authenticate, groupController.createGroup);
router.post('/add-members', authMiddleware.authenticate, groupController.addMembersToGroup);
router.post('/add-user/:groupId', authMiddleware.authenticate, groupController.addUserToGroup);  // New route for adding a user

// Group data retrieval
router.get('/user-groups', authMiddleware.authenticate, groupController.getUserGroups);
router.get('/groupChat-messages/:groupId', authMiddleware.authenticate, groupController.getGroupChatMessages);
router.post('/send-message', authMiddleware.authenticate, groupController.sendMessage);
router.get('/get-messages', authMiddleware.authenticate, groupController.getAllMessages);
router.get('/user-role/:groupId', authMiddleware.authenticate, groupController.getUserRole);


module.exports = router;
