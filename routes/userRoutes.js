// routes\userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/details', authMiddleware.authenticate, userController.getUserDetails);
router.get('/all', authMiddleware.authenticate, userController.getAllUsers);

module.exports = router;