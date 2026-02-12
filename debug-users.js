const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/model/User');

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, AdminID: ${u.adminId}`);
            if (u.adminId) {
                console.log(`  -> Linked to Admin: ${u.adminId} (Type: ${typeof u.adminId})`);
            } else {
                console.log(`  -> No Admin Link`);
            }
        });

        const admins = users.filter(u => u.role === 'admin' || !u.adminId);
        console.log("\nPotential Admins:");
        admins.forEach(a => {
            console.log(`ID: ${a._id}, Name: ${a.name}`);
            // Check children
            const children = users.filter(u => u.adminId && u.adminId.toString() === a._id.toString());
            console.log(`  -> Has ${children.length} sub-users`);
            children.forEach(c => console.log(`     - ${c.name} (${c.role})`));
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugUsers();
