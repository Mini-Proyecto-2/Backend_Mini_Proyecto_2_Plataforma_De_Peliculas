/**
 * @file rating.routes.ts
 * @description Defines routes for managing movie ratings.
 * Includes creating/updating ratings, retrieving ratings by movie or user, and deleting ratings.
 */

import { Router } from "express";
import {
  createOrUpdateRating,
  getAverageRatingByMovie,
  getRatingsByUser,
  deleteRating,
} from "../controllers/rating.controller";
const authMiddleware = require("../middleware/auth");

const router = Router();

/**
 * @route POST /ratings
 * @description Creates a new rating or updates an existing rating for a movie.
 * @access Private (requires JWT authentication)
 * @param {number} value - Rating value between 1 and 5 (required).
 * @param {string} moviePexelsId - Pexels movie ID to rate (required).
 * @returns {Object} The created or updated rating with success message.
 * @example
 * POST /ratings
 * {
 *   "value": 5,
 *   "moviePexelsId": "3190131"
 * }
 * Response (new rating):
 * {
 *   "message": "Rating created",
 *   "rating": {
 *     "_id": "673d6a12...",
 *     "value": 5,
 *     "moviePexelsId": "3190131",
 *     "userId": "6721a9c4..."
 *   }
 * }
 * Response (updated rating):
 * {
 *   "message": "Rating updated",
 *   "rating": {
 *     "_id": "673d6a12...",
 *     "value": 4,
 *     "moviePexelsId": "3190131",
 *     "userId": "6721a9c4..."
 *   }
 * }
 */
router.post("/", authMiddleware, createOrUpdateRating);

/**
 * @route GET /ratings/movie/:moviePexelsId
 * @description Retrieves the average rating, total ratings count, and the authenticated user's rating for a specific movie.
 * @access Private (requires JWT authentication)
 * @param {string} moviePexelsId - Pexels movie ID.
 * @returns {Object} Object containing averageRating, totalRatings, and userRating.
 * @example
 * GET /ratings/movie/3190131
 * Response:
 * {
 *   "averageRating": 4.5,
 *   "totalRatings": 10,
 *   "userRating": 5
 * }
 * Response (no ratings):
 * {
 *   "averageRating": 0,
 *   "totalRatings": 0,
 *   "userRating": 0
 * }
 */
router.get("/movie/:moviePexelsId", authMiddleware, getAverageRatingByMovie);

/**
 * @route GET /ratings/user/:userId
 * @description Retrieves all ratings made by a specific user.
 * @access Private (requires JWT authentication)
 * @param {string} userId - User identifier.
 * @returns {Array<Object>} List of ratings by the specified user, sorted by most recent.
 * @example
 * GET /ratings/user/6721a9c4...
 * Response:
 * [
 *   {
 *     "_id": "673d6a12...",
 *     "value": 5,
 *     "moviePexelsId": "3190131",
 *     "userId": "6721a9c4..."
 *   },
 *   {
 *     "_id": "673d6b45...",
 *     "value": 4,
 *     "moviePexelsId": "3190132",
 *     "userId": "6721a9c4..."
 *   }
 * ]
 */
router.get("/user/:userId", authMiddleware, getRatingsByUser);

/**
 * @route DELETE /ratings/:id
 * @description Deletes a rating (only the rating owner can delete).
 * @access Private (requires JWT authentication)
 * @param {string} id - Rating identifier.
 * @returns {Object} Success message.
 * @example
 * DELETE /ratings/673d6a12...
 * Response:
 * {
 *   "message": "Rating deleted successfully"
 * }
 */
router.delete("/:id", authMiddleware, deleteRating);

export default router;