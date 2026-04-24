import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } from '../config.js';

const router = express.Router();

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

export const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const derivedHash = crypto.pbkdf2Sync(String(password), salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedHash}`;
};

export const verifyPassword = (password, storedPasswordHash) => {
  if (!storedPasswordHash) {
    return false;
  }

  const storedValue = String(storedPasswordHash);

  if (!storedValue.includes(':')) {
    return storedValue === String(password);
  }

  const [salt, expectedHash] = storedValue.split(':');

  if (!salt || !expectedHash) {
    return storedValue === String(password);
  }

  const derivedHash = crypto.pbkdf2Sync(String(password), salt, 100000, 64, 'sha512').toString('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(derivedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch (error) {
    return derivedHash === expectedHash;
  }
};

const createAuthToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name || '',
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

const buildUserResponse = (user) => ({
  id: user._id.toString(),
  userId: user._id.toString(),
  name: user.name || '',
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

router.post(['/register', '/signup'], async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const role = String(req.body.role || 'user').trim().toLowerCase();

    if (role && role !== 'user') {
      return res.status(400).json({ message: 'Only user registration is allowed' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'user',
    });

    const token = createAuthToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    return res.status(500).json({
      message: 'Failed to create user account',
      error: error.message,
    });
  }
});

router.post(['/login', '/signin'], async (req, res) => {
  try {
    const role = String(req.body.role || req.body.userType || req.body.accountType || '').trim().toLowerCase();
    const email = normalizeEmail(req.body.email || req.body.username || req.body.identifier);
    const password = String(req.body.password || '');

    if (!role) {
      return res.status(400).json({ message: 'Login role is required' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (role === 'admin') {
      let user = await User.findOne({ email, role: 'admin' });

      if (!user) {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          user = await User.create({
            name: 'om',
            email: ADMIN_EMAIL,
            passwordHash: hashPassword(ADMIN_PASSWORD),
            role: 'admin',
          });
        } else {
          return res.status(401).json({ message: 'Invalid admin credentials' });
        }
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      const token = createAuthToken(user);

      return res.json({
        message: 'Login successful',
        token,
        user: buildUserResponse(user),
      });
    }

    if (role === 'user') {
      const user = await User.findOne({ email, role: 'user' });

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = createAuthToken(user);

      return res.json({
        message: 'Login successful',
        token,
        user: buildUserResponse(user),
      });
    }

    return res.status(400).json({ message: 'Unsupported login role' });
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

export { buildUserResponse, createAuthToken, normalizeEmail };

export default router;