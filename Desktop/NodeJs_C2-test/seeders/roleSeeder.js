const mongoose = require('mongoose');
const Role = require('../models/roles');

async function seedRoles() {
    try {
        // Kết nối database
        await mongoose.connect("mongodb://localhost:27017/C2");

        // Kiểm tra và tạo role mặc định nếu chưa có
        const roles = [
            {
                roleName: 'ADMIN',
                description: 'Administrator'
            },
            {
                roleName: 'user',
                description: 'Normal User'
            },
            {
                roleName: 'moderator',
                description: 'Moderator'
            }
        ];

        for (const role of roles) {
            const existingRole = await Role.findOne({ roleName: role.roleName });
            if (!existingRole) {
                await Role.create(role);
                console.log(`Created role: ${role.roleName}`);
            } else {
                console.log(`Role ${role.roleName} already exists`);
            }
        }

        console.log('Role seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
}

seedRoles(); 