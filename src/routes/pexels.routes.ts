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
 * @route GET /pexels/search?query=keyword&per_page=10&page=1
 * @description Searches for Pexels videos based on query parameter.
 * @access Private (requires JWT authentication)
 * @param {string} [query=movies] - Search term (optional, defaults to "movies").
 * @param {number} [per_page=10] - Results per page (1-80, optional).
 * @param {number} [page=1] - Page number (optional).
 * @param {string} [orientation=landscape] - Video orientation (optional).
 * @param {string} [size=small] - Video size (optional).
 * @param {string} [locale=es-ES] - Locale for results (optional).
 * @returns {Array<Object>} List of videos matching the query.
 * @example
 * GET /pexels/search  (returns 10 videos of "movies")
 * GET /pexels/search?per_page=5  (returns 5 videos of "movies")
 * GET /pexels/search?query=nature&per_page=1  (returns 1 video of "nature")
 * GET /pexels/search?query=pets&per_page=3&page=2  (returns 3 videos of "pets", page 2)
 * Response:
 * {
 *   "videos": [
 *     { "id": 78901, "url": "https://videos.pexels.com/...", "user": { "name": "Alex" } }
 *   ]
 * }
 */
router.get('/search', authMiddleware, getSearchedMovies);

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