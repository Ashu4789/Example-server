const usersDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const { validationResult } = require('express-validator');


const authController = {

    // LOGIN FUNCTION
    login: async (req, res) => {
        // VALIDATION ERRORS FROM express-validator
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        const user = await usersDao.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // If user registered via Google SSO, they won't have a password.
        // Prevent password-based login for such users and instruct them to use Google SSO.
        if (user.googleId && !user.password) {
            return res.status(400).json({
                error: "Please log in using Google SSO"
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

        // CREATE JWT (log the user in immediately after registration)
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.JWT_SECRET || 'default_jwt_secret',
            { expiresIn: '1h' }
        );

        // SET COOKIE
        res.cookie('jwtToken', token, {
            httpOnly: true,
            secure: false, // true only in HTTPS
            sameSite: 'strict'
        });

        // RETURN USER INFO + token (frontend can use cookie or token)
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            token
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
    },

    //google-sso integration code
    googleSso: async (req,res) => {
        try {
            const {idToken} = req.body;
            if(!idToken) {
                return res.status(401).json({
                    message: 'invalid request from google sso'
                });
            }
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const googleResponse = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = googleResponse.getPayload();
            const { sub: googleId, name, email } = payload;

            let user = await usersDao.findByEmail(email);
            if (!user) {
                user = await usersDao.create({
                    username: name,
                    email,
                    googleId
                });
            }

            // CREATE JWT
            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.username,
                    googleId: user.googleId,
                    email: user.email
                },
                process.env.JWT_SECRET || 'default_jwt_secret',
                { expiresIn: '1h' }
            );

            //  SET COOKIE (use secure:true in production with HTTPS)
            res.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict'
            });

            return res.status(200).json({
                message: 'Google SSO successful',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });


        } catch(error) {
            console.log(error);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    },

};

module.exports = authController;