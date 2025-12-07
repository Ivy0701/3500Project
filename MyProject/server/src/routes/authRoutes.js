import { Router } from 'express';
import { login, register, verifyUserForPasswordReset, resetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-password-reset', verifyUserForPasswordReset);
router.post('/reset-password', resetPassword);

export default router;






