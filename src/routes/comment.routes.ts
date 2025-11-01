/**
 * @file comment.routes.ts
 * @description Defines routes for managing movie comments.
 * Includes creating, retrieving, updating, and deleting comments.
 */

import { Router } from "express";
import {
  createComment,
  getCommentsByMovie,
  getCommentsByUser,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller";
const authMiddleware = require("../middleware/auth");

const router = Router();

/**
 * @route POST /comments
 * @description Creates a new comment for a movie.
 * @access Private (requires JWT authentication)
 * @param {string} description - Comment text content (required).
 * @param {string} moviePexelsId - Pexels movie ID to comment on (required).
 * @returns {Object} The newly created comment with user reference.
 * @example
 * POST /comments
 * {
 *   "description": "Great movie!",
 *   "moviePexelsId": "3190131"
 * }
 * Response:
 * {
 *   "_id": "673d5a12...",
 *   "description": "Great movie!",
 *   "moviePexelsId": "3190131",
 *   "userId": "6721a9c4...",
 *   "createdAt": "2024-01-15T10:30:00.000Z"
 * }
 */
router.post("/", authMiddleware, createComment);

/**
 * @route GET /comments/movie/:moviePexelsId
 * @description Retrieves all comments for a specific movie, separated by user's comments and others.
 * @access Private (requires JWT authentication)
 * @param {string} moviePexelsId - Pexels movie ID.
 * @returns {Object} Object containing userComments and otherComments arrays.
 * @example
 * GET /comments/movie/3190131
 * Response:
 * {
 *   "userComments": [{ "_id": "...", "description": "My comment", "userId": {...} }],
 *   "otherComments": [{ "_id": "...", "description": "Other comment", "userId": {...} }]
 * }
 */
router.get("/movie/:moviePexelsId", authMiddleware, getCommentsByMovie);

/**
 * @route GET /comments/user/:userId
 * @description Retrieves all comments made by a specific user.
 * @access Private (requires JWT authentication)
 * @param {string} userId - User identifier.
 * @returns {Array<Object>} List of comments by the specified user.
 * @example
 * GET /comments/user/6721a9c4...
 * Response:
 * [
 *   {
 *     "_id": "673d5a12...",
 *     "description": "Great movie!",
 *     "moviePexelsId": "3190131",
 *     "createdAt": "2024-01-15T10:30:00.000Z"
 *   }
 * ]
 */
router.get("/user/:userId", authMiddleware, getCommentsByUser);

/**
 * @route DELETE /comments/:id
 * @description Deletes a comment (only the comment owner can delete).
 * @access Private (requires JWT authentication)
 * @param {string} id - Comment identifier.
 * @returns {Object} Success message.
 * @example
 * DELETE /comments/673d5a12...
 * Response:
 * {
 *   "message": "Comment deleted successfully"
 * }
 */
router.delete("/:id", authMiddleware, deleteComment);

/**
 * @route PUT /comments/:id
 * @description Updates a comment's description (only the comment owner can update).
 * @access Private (requires JWT authentication)
 * @param {string} id - Comment identifier.
 * @param {string} description - New comment text content (required).
 * @returns {Object} Success message with updated comment.
 * @example
 * PATCH /comments/673d5a12...
 * {
 *   "description": "Updated comment text"
 * }
 * Response:
 * {
 *   "message": "Comment updated successfully",
 *   "comment": { "_id": "...", "description": "Updated comment text", ... }
 * }
 */
router.put("/:id", authMiddleware, updateComment);

export default router;