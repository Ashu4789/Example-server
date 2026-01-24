const express = require('express');
const appRoutes = require('./src/routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/auth', appRoutes);

app.listen(5001, () => {
    console.log('Server is running at http://localhost:5001');
});