const userDao = require('../dao/userDao');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const { ADMIN_ROLE } = require('../utility/userRoles');
const crypto = require('crypto');

const authController = {
  login: async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = request.body;

    const user = await userDao.findByEmail(email);

    const isPasswordMatched = await bcrypt.compare(password, user?.password);
    if (user && isPasswordMatched) {
      user.role = user.role ? user.role.toLowerCase() : ADMIN_ROLE;
      user.adminId = user.adminId ? user.adminId : user._id;

      const token = jwt.sign({
        name: user.name,
        email: user.email,
        id: user._id,
        // The logic below ensure backward compatibility.
        role: user.role,
        adminId: user.adminId,
      }, process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      response.cookie('jwtToken', token, {
        httpOnly: true,
        secure: true,
        domain: 'localhost',
        path: '/'
      });
      return response.status(200).json({
        message: 'User authenticated',
        user: {
          ...user.toObject(),
          hasPassword: !!user.password
        }
      });
    } else {
      return response.status(400).json({
        message: 'Invalid email or password'
      });
    }
  },

  register: async (request, response) => {
    try {
      const { name, email, password } = request.body;

      if (!name || !email || !password) {
        return response.status(400).json({
          message: 'Name, Email, Password are required'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await userDao.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: ADMIN_ROLE.toLowerCase()
      });

      return response.status(200).json({
        message: 'User registered',
        user: {
          id: user._id,
          hasPassword: true
        }
      });
    } catch (error) {
      if (error.code === 'USER_EXIST') {
        return response.status(400).json({
          message: 'User with the email already exist'
        });
      }
      console.error(error);
      return response.status(500).json({
        message: "Internal server error"
      });
    }
  },

  forgotPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const user = await userDao.findByEmail(email);

      if (!user) {
        // We don't want to leak if a user exists or not, but for this training app, a clear message is fine.
        return response.status(404).json({ message: "User not found" });
      }

      const token = crypto.randomBytes(20).toString('hex');
      const expires = Date.now() + 3600000; // 1 hour

      await userDao.setResetToken(email, token, expires);

      const emailService = require('../services/emailService');
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

      const emailBody = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

      await emailService.send(user.email, 'Password Reset Request', emailBody);

      response.status(200).json({ message: "Reset link sent to email" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Internal server error" });
    }
  },

  resetPassword: async (request, response) => {
    try {
      const { token, password } = request.body;
      const user = await userDao.findByResetToken(token);

      if (!user) {
        return response.status(400).json({ message: "Password reset token is invalid or has expired." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await userDao.updatePassword(user._id, hashedPassword);

      response.status(200).json({ message: "Password has been reset successfully." });
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Internal server error" });
    }
  },

  setPassword: async (request, response) => {
    try {
      const { password } = request.body;
      const userId = request.user.id;

      if (!password) {
        return response.status(400).json({ message: "Password is required" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await userDao.updatePassword(userId, hashedPassword);

      return response.status(200).json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Set Password Error:", error);
      return response.status(500).json({ message: "Internal server error" });
    }
  },

  isUserLoggedIn: async (request, response) => {
    try {
      const token = request.cookies?.jwtToken;

      if (!token) {
        return response.status(401).json({
          message: 'Unauthorized access'
        });
      }

      jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
        if (error) {
          return response.status(401).json({
            message: 'Invalid token'
          });
        } else {
          // Fetch fresh user data to get hasPassword status
          const user = await userDao.findById(decoded.id);
          if (!user) {
            return response.status(401).json({ message: "User not found" });
          }

          response.json({
            user: {
              ...user.toObject(),
              hasPassword: !!user.password
            }
          });
        }

      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  logout: async (request, response) => {
    try {
      response.clearCookie('jwtToken');
      response.json({ message: 'Logout successfull' });
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Internal server error'
      });
    }
  },

  googleSso: async (request, response) => {
    try {
      const { idToken } = request.body;
      if (!idToken) {
        return response.status(401).json({ message: 'Invalid request' });
      }

      const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const googleResponse = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = googleResponse.getPayload();
      const { sub: googleId, name, email } = payload;

      let user = await userDao.findByEmail(email);
      if (!user) {
        user = await userDao.create({
          name: name,
          email: email,
          googleId: googleId,
          role: ADMIN_ROLE.toLowerCase()
        });
      }

      const token = jwt.sign({
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        id: user._id,
        role: user.role ? user.role.toLowerCase() : ADMIN_ROLE,
        adminId: user.adminId ? user.adminId : user._id,
      }, process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      response.cookie('jwtToken', token, {
        httpOnly: true,
        secure: true,
        domain: 'localhost',
        path: '/'
      });
      return response.status(200).json({
        message: 'User authenticated',
        user: {
          ...user.toObject(),
          hasPassword: !!user.password
        }
      });

    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Internal server error'
      });
    }
  },
};

module.exports = authController;