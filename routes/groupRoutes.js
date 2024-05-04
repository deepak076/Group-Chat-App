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
router.post('/add-user/:groupId', authMiddleware.authenticate, groupController.addUserToGroup); // Route for adding a user to a group
router.post('/remove-user/:groupId', authMiddleware.authenticate, groupController.removeUserFromGroup); // Route for removing a user from a group
router.post('/make-admin/:groupId', authMiddleware.authenticate, groupController.makeUserAdmin); // Route for promoting a user to admin in a group


module.exports = router;
