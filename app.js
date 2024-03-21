// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
const sequelize = require('./util/db');
const User = require('./models/user');
const ChatMessage = require('./models/chatMessage'); 
const Group = require('./models/group');
const GroupMembership = require('./models/groupMembership');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());

sequelize.sync({ force: false })
    .then(() => {
        console.log('Database and tables created!');
    })
    .catch(err => {
        console.error('Error syncing with database:', err);
    });

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);
User.belongsToMany(Group, { through: GroupMembership });
Group.belongsToMany(User, { through: GroupMembership });

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
