// routes\groupRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const groupController = require('../controllers/groupController');

router.post('/create-group', groupController.createGroup);
router.post('/add-members', groupController.addMembersToGroup);
router.get('/user-groups', authMiddleware.authenticate, groupController.getUserGroups); 

module.exports = router;
