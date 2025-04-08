const User = require('../models/users');
const Role = require('../models/roles');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const constants = require('../Utils/constants');

module.exports = {
    getUserById: async function (id) {
        return await User.findById(id)
            .populate({
                path: 'role',
                select: 'roleName description'
            });
    },
    
    getUserByEmail: async function (email) {
        return await User.findOne({
            email: email
        }).populate({
            path: 'role',
            select: 'roleName description'
        });
    },
    
    getUserByToken: async function (token) {
        return await User.findOne({
            resetPasswordToken: token
        }).populate({
            path: 'role',
            select: 'roleName description'
        });
    },
    
    createUser: async function (username, password, email, roleName) {
        try {
            // Kiểm tra username và email đã tồn tại
            const existingUser = await User.findOne({ 
                $or: [
                    { username: username },
                    { email: email }
                ]
            });
            
            if (existingUser) {
                throw new Error("Username hoặc email đã tồn tại");
            }

            // Tìm role
            const role = await Role.findOne({ roleName: roleName });
            if (!role) {
                throw new Error(`Role ${roleName} không tồn tại`);
            }

            // Tạo user mới
            const newUser = new User({
                username,
                password,
                email,
                role: role._id,
            });

            await newUser.save();
            return newUser;
        } catch (error) {
            throw error;
        }
    },
    
    checkLogin: async function (username, password) {
        try {
            // Tìm user theo username
            const user = await User.findOne({ username })
                .populate({
                    path: 'role',
                    select: 'roleName description'
                })
                .select('+password');
            
            if (!user) {
                return {
                    success: false,
                    message: 'Tài khoản không tồn tại'
                };
            }
            
            // Kiểm tra password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    success: false,
                    message: 'Mật khẩu không đúng'
                };
            }
            
            // Tạo token
            const token = jwt.sign({
                id: user._id,
                expireIn: Date.now() + 30 * 60 * 1000 // 30 phút
            }, constants.SECRET_KEY);
            
            // Trả về thông tin user (không bao gồm password)
            const userData = user.toObject();
            delete userData.password;
            
            return {
                success: true,
                token,
                user: userData
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi đăng nhập'
            };
        }
    }
};