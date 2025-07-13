const User = require('../models/userModel');
const mongoose = require('mongoose');

class UserRepository {
    async create(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

        async findById(userId) {
        try {
            // Convert to ObjectId if needed
            if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
                userId = new mongoose.Types.ObjectId(userId);
            }
            console.log('[userRepository.findById] Searching for:', userId, typeof userId);
            return await User.findById(userId);
        } catch (error) {
            throw error;
        }
    }

    async updateById(userId, updateData) {
        try {
            return await User.findByIdAndUpdate(userId, updateData, { new: true });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserRepository();
