// controllers/userController.js
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Check if the user already exists by email or phone
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }],
            },
        });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database with the hashed password
        const newUser = await User.create({ name, email, phone, password: hashedPassword });

        // Respond with success
        res.json({ success: true, message: 'User signed up successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        // Check if the user exists and the password is correct
        if (user && bcrypt.compareSync(password, user.password)) {
            // Create a JWT with user ID encrypted
            const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '1h' });

            // Respond with success, the token, and any other necessary user information
            res.json({ success: true, message: 'Login successful', token, user: { id: user.id, email: user.email } });
        } else if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
        } else {
            res.status(401).json({ success: false, message: 'User not authorized' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

