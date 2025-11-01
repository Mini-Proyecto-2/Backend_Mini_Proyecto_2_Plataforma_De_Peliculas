/**
 * @file auth.routes.ts
 * @description Defines authentication-related API endpoints including registration,
 * login, logout, password recovery, profile management, and session validation.
 */

import { Router } from 'express';
import { signup, login, logout, forgotPassword, resetPassword, getProfile, updateProfile, deleteProfile, session, changePassword } from '../controllers/auth.controller';
const authMiddleware = require("../middleware/auth");
const router = Router();

/**
 * @route POST /auth/register
 * @description Registers a new user in the system.
 * @access Public
 * @example
 * POST /auth/register
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "age": 25,
 *   "email": "john@example.com",
 *   "password": "Secret123!"
 * }
 */
router.post('/register', signup);

/**
 * @route POST /auth/login
 * @description Authenticates a user and issues a JWT cookie.
 * @access Public
 * @example
 * POST /auth/login
 * {
 *   "email": "john@example.com",
 *   "password": "Secret123!"
 * }
 */
router.post('/login', login);

/**
 * @route POST /auth/logout
 * @description Logs out the authenticated user by clearing the token cookie.
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route POST /auth/forgot-password
 * @description Sends a password reset email with a temporary recovery token.
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route POST /auth/reset-password/:token
 * @description Resets the user's password using a valid token from the reset email.
 * @access Public
 */
router.post('/reset-password/:token', resetPassword);

/**
 * @route GET /auth/profile
 * @description Retrieves the authenticated user's profile.
 * @access Private (requires JWT authentication)
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @route PUT /auth/profile
 * @description Updates the authenticated user's profile information.
 * @access Private (requires JWT authentication)
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * @route DELETE /auth/profile
 * @description Deletes the authenticated user's account after confirming password.
 * @access Private (requires JWT authentication)
 */
router.delete('/profile', authMiddleware, deleteProfile);

/**
 * @route GET /auth/session
 * @description Checks if the current JWT session is still valid.
 * @access Private (requires JWT authentication)
 */
router.get('/session', authMiddleware, session);

router.post('/change-password', authMiddleware, changePassword);

export default router;
