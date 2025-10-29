/**
 * @file movie.routes.ts
 * @description Defines routes for managing movie resources in the application.
 * Includes listing, retrieving, creating, and deleting movies.
 */

import { Router } from 'express';
import { listMovies, getMovie, createMovie, deleteMovie } from '../controllers/movies.controller';
const authMiddleware = require("../middleware/auth");
const router = Router();

/**
 * @route GET /movies
 * @description Retrieves all movies stored in the database, sorted by creation date.
 * @access Public
 * @returns {Array<Object>} List of movies with their associated user information.
 * @example
 * GET /movies
 * Response:
 * [
 *   {
 *     "_id": "673d4a12...",
 *     "title": "Sample Movie",
 *     "videoUrl": "https://...",
 *     "miniatureUrl": "https://...",
 *     "userId": { "_id": "6721a9c4...", "email": "user@example.com" }
 *   }
 * ]
 */
router.get('/', authMiddleware, listMovies);

/**
 * @route GET /movies/:id
 * @description Retrieves a single movie by its ID.
 * @access Public
 * @param {string} id - Movie identifier.
 * @returns {Object} The requested movie or a 404 error if not found.
 * @example
 * GET /movies/673d4a12
 * Response:
 * {
 *   "_id": "673d4a12...",
 *   "title": "Sample Movie",
 *   "videoUrl": "https://...",
 *   "miniatureUrl": "https://..."
 * }
 */
router.get('/:id', authMiddleware, getMovie);

/**
 * @route POST /movies
 * @description Creates a new movie associated with the authenticated user.
 * @access Private (requires JWT authentication)
 * @example
 * POST /movies
 * {
 *   "title": "New Movie",
 *   "pexelsId": "123456",
 *   "videoUrl": "https://...",
 *   "miniatureUrl": "https://..."
 * }
 * Response:
 * {
 *   "_id": "673d4b33...",
 *   "title": "New Movie",
 *   "videoUrl": "https://...",
 *   "userId": "6721a9c4..."
 * }
 */
router.post('/', authMiddleware, createMovie);

/**
 * @route DELETE /movies/:id
 * @description Deletes a movie by its ID.
 * @access Private (requires JWT authentication)
 * @param {string} id - Movie identifier.
 * @returns {void} Responds with HTTP 204 if deletion succeeds or 404 if not found.
 * @example
 * DELETE /movies/673d4a12
 * Response: 204 No Content
 */
router.delete('/:id', authMiddleware, deleteMovie);

export default router;
