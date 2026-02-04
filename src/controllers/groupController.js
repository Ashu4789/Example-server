const groupDao = require("../dao/groupdao");

const groupController = {

    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

            let allMembers = [user.email];
            if (membersEmail && Array.isArray(membersEmail)) {
                allMembers = [...new Set([...allMembers, ...membersEmail])];
            }

            const newGroup = await groupDao.createdGroup({
                name,
                description,
                adminEmail: user.email,
                membersEmail: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            return response.status(200).json({
                message: 'Group created',
                groupId: newGroup._id
            });

        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    updateGroup: async (request, response) => {
        try {
            const group = await groupDao.updateGroup(request.body);
            return response.status(200).json(group);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    addMembers: async (request, response) => {
        try {
            const { groupId, membersEmail } = request.body;
            const group = await groupDao.addMembers(groupId, ...membersEmail);
            return response.status(200).json(group);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    removeMembers: async (request, response) => {
        try {
            const { groupId, membersEmail } = request.body;
            const group = await groupDao.removeMembers(groupId, ...membersEmail);
            return response.status(200).json(group);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    getGroupByEmail: async (request, response) => {
        try {
            const { email } = request.params;
            const groups = await groupDao.getGroupByEmail(email);
            return response.status(200).json(groups);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    getGroupByStatus: async (request, response) => {
        try {
            const { status } = request.params;
            const groups = await groupDao.getGroupByStatus(status === 'true');
            return response.status(200).json(groups);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    },

    getAuditLog: async (request, response) => {
        try {
            const { groupId } = request.params;
            const auditLog = await groupDao.getAuditLog(groupId);
            return response.status(200).json(auditLog);
        } catch (error) {
            console.log(error);
            return response.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = groupController;
