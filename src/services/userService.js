const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET;

class UserService {
    async register(userData) {
        try {
            // Validate role
            if (userData.role && !['user', 'owner'].includes(userData.role)) {
                throw new BadRequest('Invalid role. Must be either "user" or "owner"');
            }

            // Check if user already exists
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new BadRequest('User already exists');
            }

            // Create new user
            const user = await userRepository.create(userData);
            
            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                },
                token
            };
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Find user
            const user = await userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                },
                token
            };
        } catch (error) {
            throw error;
        }
    }

    async getProfile(userId) {
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();
