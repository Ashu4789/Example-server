require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const appRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("Could not connect to MongoDB...", err);
    process.exit(1);
  });

const app = express();
app.use(cookieParser());

app.use(express.json());

app.use('/auth', appRoutes);
app.use('/groups', groupRoutes);
app.listen(5003, () => {
    console.log('Server is running at http://localhost:5003');
});