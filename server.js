require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const rbacRoutes = require('./src/routes/rbacRoutes');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((error) => console.log('Error Connecting to Database: ', error));

const corsOption = {
    origin: process.env.CLIENT_URL,
    credentials: true
};

const app = express();

app.use(cors(corsOption));
app.use(express.json()); // Middleware
app.use(cookieParser()); // Middleware
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

console.log('Registering /auth routes');
app.use('/auth', authRoutes);
console.log('Registering /groups routes');
app.use('/groups', groupRoutes);
console.log('Registering /expenses routes');
app.use('/expenses', expenseRoutes);
console.log('Registering /users routes');
app.use('/users', rbacRoutes);
console.log('Routes registered');

app.listen(5002, () => {
    console.log('Server is running on port 5002');
});