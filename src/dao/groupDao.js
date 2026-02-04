const Group = require('../model/group');

const groupDao = {

    createdGroup: async (data) => {
        const newGroup = new Group(data);
        return await newGroup.save();
    },

    updateGroup: async (data) => {
        const { groupId, name, description, thumbnail, adminEmail, paymentStatus } = data;
        return await Group.findByIdAndUpdate(
            groupId,
            { name, description, thumbnail, adminEmail, paymentStatus },
            { new: true }
        );
    },

    addMembers: async (groupId, ...membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { membersEmail: { $each: membersEmail } } },
            { new: true }
        );
    },

    removeMembers: async (groupId, ...membersEmail) => {
        return await Group.findByIdAndUpdate(
            groupId,
            { $pull: { membersEmail: { $in: membersEmail } } },
            { new: true }
        );
    },

    getGroupByEmail: async (email) => {
        return await Group.find({ membersEmail: email });
    },

    getGroupByStatus: async (status) => {
        return await Group.find({ "paymentStatus.isPaid": status });
    },

    /**
     * Returns audit/settlement information
     */
    getAuditLog: async (groupId) => {
        return await Group.findById(groupId).select({
            paymentStatus: 1,
            _id: 0
        });
    }
};

module.exports = groupDao;
