const usersDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {

    // LOGIN FUNCTION
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and Password are required"
            });
        }

        const user = await usersDao.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // CREATE JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        //  SET COOKIE
        res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: false, // true only in HTTPS
            sameSite: 'strict'
        });

        //  SEND RESPONSE
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    },

    // REGISTER FUNCTION
    register: async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const userExists = await usersDao.findByEmail(email);

        if (userExists) {
            return res.status(409).json({
                error: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await usersDao.create({
            username: username,
            email: email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            userId: newUser._id
        });
    }
,

    // isLoggedIn - return current user when cookie/jwt is present
    isUserLoggedIn: async (req, res) => {
        try {
            const token = req.cookies?.jwtToken;
            if (!token) return res.status(401).json({ message: "Not authenticated" });

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(401).json({ message: "Invalid token" });
                }

            return res.status(200).json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
            });
        } catch (err) {
            console.error("Error in isUserLoggedIn:", err);

            return res.status(500).json({ message: "Internal server error" });
        }
    },

    // LOGOUT - clear the jwt cookie
    logout: async (req, res) => {
        try{
            res.clearCookie('jwtToken');
        
        return res.status(200).json({ message: "Logout successful" });
        } catch(err) {
            console.error("Error in logout:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

};

module.exports = authController;