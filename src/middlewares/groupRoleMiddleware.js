const Group = require('../model/group');

/**
 * Middleware to check if the user has one of the required roles in a group.
 * @param {Array} allowedRoles - Array of roles allowed to perform the action (e.g. ['admin', 'manager'])
 */
const checkGroupRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const groupId = req.params.groupId || req.body.groupId;
            const userEmail = req.user.email.toLowerCase();

            if (!groupId) {
                return res.status(400).json({ message: "Group ID is required" });
            }

            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            }

            const member = group.members?.find(m => m.email?.toLowerCase() === userEmail);
            let role = member ? member.role : null;

            // Fallback to adminEmail
            if (!role && group.adminEmail?.toLowerCase() === userEmail) {
                role = 'admin';
            }

            if (!role) {
                return res.status(403).json({ message: "Forbidden: You are not a member of this group" });
            }

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}`
                });
            }

            // Attach role and group to request for convenience
            req.groupRole = role;
            req.currentGroup = group;

            next();
        } catch (error) {
            console.error("Group Role Middleware Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
};

module.exports = checkGroupRole;
