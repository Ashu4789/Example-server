const Group = require("../model/group");

const groupDao = {
    createGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    findById: async (id) => {
        return await Group.findById(id);
    },

    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;

        return await Group.findByIdAndUpdate(groupId, {
            name, description, thumbnail, adminEmail, paymentStatus,
        }, { new: true });
    },

    addMembers: async (groupId, ...members) => {
        // members should be array of { email, role }
        return await Group.findByIdAndUpdate(groupId, {
            $addToSet: { members: { $each: members } }
        }, { new: true });
    },

    removeMembers: async (groupId, ...membersEmails) => {
        return await Group.findByIdAndUpdate(groupId, {
            $pull: { members: { email: { $in: membersEmails } } }
        }, { new: true });
    },

    getGroupByEmail: async (email) => {
        return await Group.find({ "members.email": email });
    },

    getGroupByStatus: async (status) => {
        // Take email as the input, then filter groups by email
        // Check in membersEmail field.
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    /**
     * We'll only return when was the last time group
     * was settled to begin with.
     * In future, we can move this to separate entity!
     * @param {*} groupId 
     */
    getAuditLog: async (groupId) => {
        // Based on your schema, the most relevant "settled" info 
        // is the date within paymentStatus.
        const group = await Group.findById(groupId).select('paymentStatus.date');
        return group ? group.paymentStatus.date : null;
    },

    // Default sorting order of createdAt is descending order (-1)
    getGroupsPaginated: async (email, limit, skip, sortOptions = { createdAt: -1 }) => {
        const lowerEmail = email.toLowerCase();
        const [groups, totalCount] = await Promise.all([
            Group.find({ "members.email": lowerEmail })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),

            Group.countDocuments({ "members.email": email }),
        ]);

        return { groups, totalCount };
    },

    deleteGroup: async (groupId) => {
        return await Group.findByIdAndDelete(groupId);
    },

    updateMemberRole: async (groupId, email, newRole) => {
        return await Group.findOneAndUpdate(
            { _id: groupId, "members.email": email },
            { $set: { "members.$.role": newRole } },
            { new: true }
        );
    }
};

module.exports = groupDao;