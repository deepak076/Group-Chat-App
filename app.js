// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
const sequelize = require('./util/db');
const userRoutes = require('./routes/userRoutes');
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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
