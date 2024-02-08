// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('authorization');

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        const userId = Number(decodedToken.userId);

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Error during authentication:', err);
        return res.status(401).json({ success: false, message: 'User not authorized' });
    }
};

module.exports = {
    authenticate
};
