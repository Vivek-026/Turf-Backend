const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { BadRequest, Unauthorized } = require('http-errors');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
  authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Unauthorized('No token provided');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Unauthorized('Invalid token format');
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("decoded data", decoded);
        console.log("userId from user Controller ", decoded.userId);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
      } catch (jwtError) {
        throw new Unauthorized('Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { name, email, password, role = 'user' } = req.body;
      const result = await userService.register({ name, email, password, role });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
