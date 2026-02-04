require('dotenv').config(); // npm install dotenv 

const express = require('express'); 
// require() is used to import dependencies in CommonJS (Node.js).
// It loads only what is needed, helping keep applications lightweight.
const mongoose=require('mongoose');
const authRoutes=require('./src/routes/authRoutes');
const groupRoutes=require('./src/routes/groupRoutes');
const cookieparser=require('cookie-parser');
const cors=require('cors');

mongoose.connect(process.env.MONGODB_URI) // mongoose 27017 default port
.then(()=> console.log('MongoDB Connected'))
.catch((error)=> console.log('Could not connect MongoDB..',error));

const corsOption={
    origin:process.env.CLIENT_URL,
    credentials:true
};





const app = express();


app.use(cors(corsOption));


// Middleware to parse incoming JSON requests into JavaScript objects
app.use(express.json());// middleware
app.use(cookieparser());//Middleware


app.use('/auth',authRoutes);
app.use('/group',groupRoutes);



app.listen(5001, () => {
    console.log('Server is running on port 5001');
});

