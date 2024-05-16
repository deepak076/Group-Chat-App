const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./util/db');
const User = require('./models/user');
const ChatMessage = require('./models/chatMessage');
const Group = require('./models/group');
const GroupMembership = require('./models/groupMembership');
const GroupMessage = require('./models/groupMessage');
const ArchivedChat = require('./models/ArchivedChat');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const http = require('http'); // Import http module
const socketIo = require('socket.io');

const cronJob = require('./services/cronjob'); // Import the cron job service

const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

app.use(cors());

sequelize.sync({ force: false })
    .then(() => {
        console.log('Database and tables created!');
    })
    .catch(err => {
        console.error('Error syncing with database:', err);
    });

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'Public')));

app.get('/check', (req, res) => {
    console.log("backend is working");
});

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);
User.belongsToMany(Group, { through: GroupMembership });
Group.belongsToMany(User, { through: GroupMembership });
GroupMessage.belongsTo(User, { foreignKey: 'userId' });
GroupMessage.belongsTo(Group, { foreignKey: 'groupId' });

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = socketIo(server);

// Socket.IO event handlers
io.on('connection', socket => {
    console.log('New client connected');

    // Handle chat message event
    socket.on('chatMessage', ({ userName, message }) => {
        // Broadcast the message to all clients
        io.emit('message', { userName, message });
    });

    // Handle file message event
    socket.on('fileMessage', ({ userName, message }) => {
        // Broadcast the file message to all clients
        io.emit('fileMessage', { userName, message });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Start the cron job
cronJob.job.start();
