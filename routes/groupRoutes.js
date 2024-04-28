// routes\groupRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const groupController = require('../controllers/groupController');

router.post('/create-group', groupController.createGroup);
router.post('/add-members', groupController.addMembersToGroup);
router.get('/user-groups', authMiddleware.authenticate, groupController.getUserGroups); 
router.get('/groupChat-messages/:groupId', groupController.getGroupChatMessages);
router.post('/send-message',authMiddleware.authenticate, groupController.sendMessage);
router.get('/get-messages', groupController.getAllMessages);
router.get('/user-role/:groupId', authMiddleware.authenticate, groupController.getUserRole);


module.exports = router;
