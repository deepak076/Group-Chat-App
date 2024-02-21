// groupRouter.js
const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/create', authMiddleware.authenticate, groupController.createGroup);
router.get('/all', authMiddleware.authenticate, groupController.getAllGroups);
router.post('/join/:groupId', authMiddleware.authenticate, groupController.joinGroup);

// Export the router
module.exports = router;
