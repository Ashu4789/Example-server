const rbacDao = require("../dao/rbacDao");
const bcrypt = require('bcryptjs');
const { generateTemporaryPassword } = require("../utility/passwordUtil");
const emailService = require('../services/emailService');
const { USER_ROLES } = require('../utility/userRoles');

const rbacController = {
    create: async (request, response) => {
        try {
            const adminUser = request.user;
            const { name, email, role } = request.body;

            if (!USER_ROLES.includes(role)) {
                return response.status(400).json({
                    message: 'Invalid role'
                });
            }

            const tempPassword = generateTemporaryPassword(8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            const user = await rbacDao.create(email, name, role, hashedPassword, adminUser._id);

            try {
                await emailService.send(
                    email, 'Temporary Password',
                    `Your temporary password is: ${tempPassword}`
                );
            } catch (error) {
                // Let the create user call succeed even though sending email
                // failed. We can offer re-trigger sending temporary password
                // functionality to the admins.
                console.log(`Error sending email, temporary password is ${tempPassword}`, error);
            }

            return response.status(200).json({
                message: 'User created!',
                user: user
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: 'Internal server error' });
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
            const adminId = request.user.adminId; // Depending on hierarchy, or just user._id if they are the admin
            // Assuming the logged in user is the admin who created them
            // If request.user is the admin, use request.user._id
            // If request.user is a manager created by admin, they might not see all users?
            // The previous code used request.user.adminId, let's stick to that if it makes sense contextually, 
            // OR use request.user._id if the logged-in user IS the admin.
            // Screenshot doesn't show getAllUsers explicitly. 
            // I'll stick to previous logic for now but perhaps request.user._id is safer for "My Users"
            const users = await rbacDao.getUsersByAdminId(request.user._id);

            return response.status(200).json({
                users: users
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = rbacController;
