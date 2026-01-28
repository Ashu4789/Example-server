const groupController = {
    create: async (req, res) => {
        try {
            const user = req.user;
            const {
                name, description, memberEmail, thumbnail,
            } = req.body;
            let allmembers = [user.email];
            if(memberEmail && Array.isArray(memberEmail)) {
                allmembers = [...new Set([...allmembers, ...memberEmail])];
            }
            const newGroup = await groupDao.createGroup({
                name, description, adminEmail: user.email,
                paymentStatus: {
                    account: 0,
                    currency: 'INR',
                    date: Date.now(),
                    isPaid: false,
                }
            });
            res.status(200).json({message: "Group created successfully", groupId: newGroup._id});
        } catch (error) {
            console.error("Error creating group:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
};

module.exports = groupController;