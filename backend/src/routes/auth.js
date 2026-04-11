const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { findUserByEmail, createUser } = require('../utils/userStore');

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;
      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await createUser({
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        createdAt: new Date().toISOString(),
      });

      const token = createToken(user);
      return res.status(201).json({
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;
      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = createToken(user);
      return res.json({
        token,
        user: sanitizeUser(user),
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
