import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const getTokenFromRequest = (req) => {
  const authorizationHeader = req.headers.authorization || req.headers.Authorization || '';
  if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.slice(7).trim();
  }

  const tokenHeader = req.headers['x-auth-token'] || req.headers['x-access-token'];
  if (typeof tokenHeader === 'string' && tokenHeader.trim()) {
    return tokenHeader.trim();
  }

  if (typeof authorizationHeader === 'string' && authorizationHeader.trim()) {
    return authorizationHeader.trim();
  }

  return '';
};

const auth = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id || '';

    req.user = {
      ...decoded,
      id: userId,
      _id: userId,
      userId,
      role: decoded.role || 'user',
      email: decoded.email || '',
      name: decoded.name || '',
    };
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
};

export const adminOnly = requireAdmin;
export const authenticateToken = auth;
export const verifyToken = auth;
export const isAuthenticated = auth;
export const authorizeAdmin = requireAdmin;

export default auth;