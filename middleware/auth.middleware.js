import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';

// Attach the authenticated user to req.user
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token is required.',
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    // Ensure user still exists and load latest roles/grade
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired authentication token.',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.is_admin !== 1) {
    return res.status(403).json({
      status: 'error',
      message: 'Administrator privileges are required.',
    });
  }
  next();
};

export const requireManagerOrAdmin = (req, res, next) => {
  if (
    !req.user ||
    (req.user.is_admin !== 1 && req.user.is_manager !== 1)
  ) {
    return res.status(403).json({
      status: 'error',
      message: 'Manager or administrator privileges are required.',
    });
  }
  next();
};


