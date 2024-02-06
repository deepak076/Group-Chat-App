// controllers/userController.js
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
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
