const permission = require('../utility/permissions');

const authorize = (requiredPermission) => {
    return (request, response, next) => {
        // AuthMiddleware must run before this middleware so that
        // we can have access to user object.
        const user = request.user;

        if (!user) {
            return response.status(401).json({ message: 'Unauthorized access' });
        }

        const role = user.role ? user.role.toLowerCase() : '';
        const userPermissions = permission[role] || [];
        if (!userPermissions.includes(requiredPermission)) {
            console.log(`Permission denied for user ${user.email} with role ${user.role}. Required: ${requiredPermission}`);
            return response.status(403).json({
                message: 'Forbidden: Insufficient Permissions'
            });
        }

        next();
    }
};

module.exports = authorize;
