/**
 * @file pexels.routes.ts
 * @description Defines routes for interacting with the Pexels API to fetch popular videos,
 * search videos by keyword, and retrieve individual video details by ID.
 */

import { Router } from 'express';
import { getPopularMovies, getSearchedMovies, getSearchedMovieById } from '../controllers/pexels.controller';
const authMiddleware = require("../middleware/auth");

const router = Router();

/**
 * @route GET /pexels/popular
 * @description Retrieves a list of the most popular videos from the Pexels API.
 * @access Private (requires JWT authentication)
 * @returns {Array<Object>} List of popular videos from Pexels.
 * @example
 * GET /pexels/popular
 * Response:
 * {
 *   "videos": [
 *     { "id": 12345, "url": "https://videos.pexels.com/...", "user": { "name": "John Doe" } },
 *     { "id": 67890, "url": "https://videos.pexels.com/...", "user": { "name": "Jane Smith" } }
 *   ]
 * }
 */
router.get('/popular', authMiddleware, getPopularMovies);

/**
 * @route GET /pexels/search/:query
 * @description Searches for Pexels videos based on the provided query keyword.
 * @access Private (requires JWT authentication)
 * @param {string} query - The search term used to find videos on Pexels.
 * @returns {Array<Object>} List of videos matching the query.
 * @example
 * GET /pexels/search/nature
 * Response:
 * {
 *   "videos": [
 *     { "id": 78901, "url": "https://videos.pexels.com/...", "user": { "name": "Alex" } }
 *   ]
 * }
 */
router.get('/search/:query', authMiddleware, getSearchedMovies);

/**
 * @route GET /pexels/searchById/:id
 * @description Retrieves details of a specific Pexels video by its ID.
 * @access Private (requires JWT authentication)
 * @param {string} id - Unique identifier of the Pexels video.
 * @returns {Object} Detailed information about the requested video.
 * @example
 * GET /pexels/searchById/12345
 * Response:
 * {
 *   "id": 12345,
 *   "width": 1920,
 *   "height": 1080,
 *   "url": "https://videos.pexels.com/...",
 *   "user": { "id": 22, "name": "John Doe" }
 * }
 */
router.get('/searchById/:id', authMiddleware, getSearchedMovieById);

export default router;