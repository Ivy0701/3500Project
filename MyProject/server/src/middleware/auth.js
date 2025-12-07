import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // No token provided, continue without user (for guest access)
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user from database to get latest info including name, region, and accessibleLocationIds
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = {
        id: user._id.toString(),
        account: user.account,
        name: user.name,
        role: user.role,
        region: user.region || null,
        accessibleLocationIds: Array.isArray(user.accessibleLocationIds) ? user.accessibleLocationIds : [],
        assignedLocationId: user.assignedLocationId || null
      };
    } else {
      req.user = {
        id: decoded.id,
        account: decoded.account,
        role: decoded.role,
        region: null,
        accessibleLocationIds: [],
        assignedLocationId: null
      };
    }
    next();
  } catch (error) {
    // Invalid token, continue without user
    req.user = null;
    next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Login required' });
  }
  next();
};

