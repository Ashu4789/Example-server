const groupDao = require("../dao/groupDao");

const groupController = {

    create: async (request, response) => {
        try {
            const user = request.user;
            const { name, description, membersEmail, thumbnail } = request.body;

            const creatorEmail = user.email.toLowerCase();
            // Creator is always admin of the group
            let allMembers = [{ email: creatorEmail, role: 'admin' }];

            if (membersEmail && Array.isArray(membersEmail)) {
                const additionalMembers = membersEmail
                    .map(email => email.trim().toLowerCase())
                    .filter(email => email !== creatorEmail)
                    .map(email => ({ email, role: 'viewer' }));
                allMembers = [...allMembers, ...additionalMembers];
            }

            const newGroup = await groupDao.createGroup({
                name,
                description,
                adminEmail: creatorEmail,
                members: allMembers,
                thumbnail,
                paymentStatus: {
                    amount: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false
                }
            });

            response.status(201).json({
                message: 'Group created successfully',
                groupId: newGroup._id
            });
        } catch (error) {
            console.error("Group Create Error:", error);
            response.status(500).json({ message: "Internal server error", details: error.message });
        }
    },

    update: async (request, response) => {
        try {
            const updatedGroup = await groupDao.updateGroup(request.body);
            if (!updatedGroup) {
                return response.status(404).json({ message: "Group not found" });
            }
            response.status(200).json(updatedGroup);
        } catch (error) {
            response.status(500).json({ message: "Error updating group" });
        }
    },

    addMembers: async (request, response) => {
        try {
            const { groupId, emails, members } = request.body;
            // Support both old array of strings and new array of objects
            const membersToAdd = members
                ? members.map(m => ({ email: m.email.toLowerCase().trim(), role: m.role }))
                : emails.map(email => ({ email: email.toLowerCase().trim(), role: 'viewer' }));

            const updatedGroup = await groupDao.addMembers(groupId, ...membersToAdd);
            response.status(200).json(updatedGroup);
        } catch (error) {
            console.error("Add Members Error:", error);
            response.status(500).json({ message: "Error adding members", details: error.message });
        }
    },

    removeMembers: async (request, response) => {
        try {
            const { groupId, emails } = request.body;
            const updatedGroup = await groupDao.removeMembers(groupId, ...emails);
            response.status(200).json(updatedGroup);
        } catch (error) {
            response.status(500).json({ message: "Error removing members" });
        }
    },

    getGroupsByUser: async (request, response) => {
        try {
            const { email } = request.user;

            // Note: We removed the adminId logic here to ensure users ONLY see 
            // groups they are personally added to as members.

            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            const sortBy = request.query.sortBy || 'newest';
            let sortOptions = { createdAt: -1 };
            if (sortBy === 'oldest') {
                sortOptions = { createdAt: 1 };
            }

            const { groups, totalCount } = await groupDao.getGroupsPaginated(email, limit, skip, sortOptions);

            response.status(200).json({
                groups: groups,
                pagination: {
                    totalItems: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    currentPage: page,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            console.log(error);
            response.status(500).json({ message: "Error fetching groups" });
        }
    },

    getGroupsByPaymentStatus: async (request, response) => {
        try {
            const { isPaid } = request.query;
            const status = isPaid === 'true';
            const groups = await groupDao.getGroupByStatus(status);
            response.status(200).json(groups);
        } catch (error) {
            response.status(500).json({ message: "Error filtering groups" });
        }
    },

    getAudit: async (request, response) => {
        try {
            const { groupId } = request.params;
            const lastSettled = await groupDao.getAuditLog(groupId);
            response.status(200).json({ lastSettled });
        } catch (error) {
            response.status(500).json({ message: "Error fetching audit log" });
        }
    },

    getGroupById: async (request, response) => {
        try {
            // Group is already fetched by checkGroupRole middleware
            const group = request.currentGroup;
            response.status(200).json(group);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error fetching group" });
        }
    },

    deleteGroup: async (request, response) => {
        try {
            const { groupId } = request.params;
            await groupDao.deleteGroup(groupId);
            response.status(200).json({ message: "Group deleted successfully" });
        } catch (error) {
            console.error("Delete Group Error:", error);
            response.status(500).json({ message: "Error deleting group" });
        }
    },

    updateMemberRole: async (request, response) => {
        try {
            const { groupId, email, newRole } = request.body;
            const group = await groupDao.updateMemberRole(groupId, email, newRole);
            response.status(200).json(group);
        } catch (error) {
            console.error("Update Role Error:", error);
            response.status(500).json({ message: "Error updating member role" });
        }
    }
};

module.exports = groupController;