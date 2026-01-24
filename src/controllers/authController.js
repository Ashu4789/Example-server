const users = require('../dao/userDb');

const authController = {
    login: (req, res) => {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({error: "Email and Password are required"});
        }
        const user = users.find(u => u.email === email && u.password === password);
        if(!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }
        console.log("Logging in user:", email);
        return res.status(200).json({ message: "Login successful", userId: user.id });
    },
    register: (req, res) => {
        const { username, email, password } = req.body;
        if(!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const userExists = users.find(user => user.email === email);
        if(userExists) {
            return res.status(409).json({ error: "User already exists" });
        }
        const newUser = {
            id: users.length + 1,
            username: username,
            email: email,
            password: password
        };
        users.push(newUser);
        console.log("Registering user:", username, email);
        return res.status(201).json({ message: "User registered successfully", userId: newUser.id });
    },
};
module.exports = authController;