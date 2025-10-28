/**
 * @file auth.js
 * @description Authentication middleware that validates the JWT token from cookies.
 */


const jwt = require("jsonwebtoken");
import { Request, Response, NextFunction } from "express";

/**
 * Extends the Express `Request` interface to include an optional `user` property.
 */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware that verifies the JWT token stored in cookies.
 *
 * @function authMiddleware
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.cookies - Cookies sent by the client.
 * @param {string} [req.cookies.token] - Authentication JWT token.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Function to pass control to the next middleware.
 * @returns {void} Sends a 401 Unauthorized response if the token is missing or invalid; otherwise calls `next()`.
 * @throws {Error} If the JWT verification fails due to expiration or tampering.
 * @remarks
 * - Requires `JWT_SECRET` to be defined in environment variables.
 * - On success, attaches the decoded token payload to `req.user`.
 * - Designed for use in routes that require authentication.
 *
 * @example
 * app.get('/profile', authMiddleware, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */

function authMiddleware(req: Request, res: Response, next: NextFunction) {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data to request
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;