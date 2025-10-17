/**
 * @file auth.js
 * @description Authentication middleware that validates the JWT token from cookies.
 */


const jwt = require("jsonwebtoken");
import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include the `user` property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate the user using a JWT token stored in cookies.
 * 
 * - If the token does not exist, returns a 401 (unauthorized) error.
 * - If the token is invalid or expired, returns a 401 error.
 * - If the token is valid, adds the user data (`req.user`) and continues.
 *
 * @function authMiddleware
 * @param {Object} req - Express request object.
 * @param {Object} req.cookies - Cookies sent by the client.
 * @param {string} [req.cookies.token] - Authentication JWT token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Function to pass control to the next middleware.
 * @returns {void} Responds with a 401 error if the token is invalid or continues execution.
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