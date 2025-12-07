import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(
    {
      id: user._id.toString(),
      account: user.account,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};

// 返回给前端的用户结构中增加库存相关字段，方便前端在调用库存接口时携带权限信息
const sanitizeUser = (user) => ({
  id: user._id.toString(),
  account: user.account,
  name: user.name,
  role: user.role,
  assignedLocationId: user.assignedLocationId || null,
  region: user.region || null,
  accessibleLocationIds: Array.isArray(user.accessibleLocationIds) ? user.accessibleLocationIds : []
});

export const register = async (req, res, next) => {
  try {
    const { account, password, name } = req.body;

    if (!account || !password || !name) {
      return res.status(400).json({ message: 'Account, password, and name are required' });
    }

    // Registration API only allows customer role
    const role = 'customer';

    const existingUser = await User.findOne({ account });
    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists, please try another account' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      account,
      passwordHash,
      name,
      role
    });

    const token = createToken(user);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { account, password, role } = req.body;

    if (!account || !password) {
      return res.status(400).json({ message: 'Account and password cannot be empty' });
    }

    const user = await User.findOne({ account });
    if (!user) {
      return res.status(401).json({ message: 'Invalid account or password' });
    }

    // Verify role match
    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Role mismatch, please select the correct role to login' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid account or password' });
    }

    const token = createToken(user);
    res.json({ user: sanitizeUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const verifyUserForPasswordReset = async (req, res, next) => {
  try {
    const { account, name } = req.body;

    if (!account || !name) {
      return res.status(400).json({ message: 'Account and name are required' });
    }

    // Find user by account and name
    const user = await User.findOne({ account, name });
    if (!user) {
      return res.status(404).json({ message: 'Username or name is incorrect, please try again' });
    }

    // Return success (don't expose user details)
    res.json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { account, newPassword } = req.body;

    if (!account || !newPassword) {
      return res.status(400).json({ message: 'Account and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user by account
    const user = await User.findOne({ account });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};



