const rbacDao = require("../dao/rbacDao");
const bcrypt = require('bcryptjs');
const { generateTemporaryPassword } = require("../utility/passwordUtil");
const emailService = require('../services/emailService');
const { USER_ROLES } = require('../utility/userRoles');

const rbacController = {
    create: async (request, response) => {
        try {
            console.log("RBAC Create Request Body:", request.body);
            console.log("RBAC Create Request User:", request.user);
            const { name, email, role } = request.body;

            if (!USER_ROLES.includes(role)) {
                console.log("Invalid role:", role);
                return response.status(400).json({
                    message: 'Invalid role'
                });
            }

            const tempPassword = generateTemporaryPassword(8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            const adminId = request.user.id || request.user._id;
            const user = await rbacDao.create(email, name, role, hashedPassword, adminId);

            try {
                await emailService.send(
                    email, 'Temporary Password',
                    `Your temporary password is: ${tempPassword}`
                );
            } catch (error) {
                console.log(`Error sending email, temporary password is ${tempPassword}`, error);
            }

            return response.status(200).json({
                message: 'User created!',
                user: user
            });
        } catch (error) {
            console.error("RBAC Create Error Details:", error);
            if (error.code === 11000) {
                return response.status(400).json({ message: 'User with this email already exists' });
            }
            response.status(500).json({ message: 'Internal server error', details: error.message });
        }
    },

    update: async (request, response) => {
        try {
            // Updated to take userId from body as per screenshot requirement
            const { name, role, userId } = request.body;
            const user = await rbacDao.update(userId, name, role);

            return response.status(200).json({
                message: 'User updated!',
                user: user
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: 'Internal server error' });
        }
    },

    delete: async (request, response) => {
        try {
            // Updated to take userId from body as per screenshot requirement
            const { userId } = request.body;
            await rbacDao.delete(userId);

            return response.status(200).json({
                message: 'User deleted!'
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: 'Internal server error' });
        }
    },

    getAllUsers: async (request, response) => {
        try {
            const adminId = request.user.id || request.user._id;
            const users = await rbacDao.getUsersByAdminId(adminId);

            return response.status(200).json({
                users: users
            });
        } catch (error) {
            console.error("RBAC GetAllUsers Error:", error);
            response.status(500).json({ message: 'Internal server error', details: error.message });
        }
    }
};

module.exports = rbacController;
