import { Router } from 'express';
import { signup, login, logout, forgotPassword, resetPassword, getProfile, updateProfile, deleteProfile, session } from '../controllers/auth.controller';
const authMiddleware = require("../middleware/auth");
const router = Router();


router.post('/register', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteProfile);
router.get('/session', authMiddleware, session);
export default router;
