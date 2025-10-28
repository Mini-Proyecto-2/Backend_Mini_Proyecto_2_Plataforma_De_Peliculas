/**
 * @file Pexels API controller.
 * @description Handles integration with Pexels API to fetch popular videos,
 * search videos by query, and retrieve specific videos by ID.
 */
import { Request, Response } from 'express';
import { createClient } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY as string);

/**
 * Fetches a list of popular videos from the Pexels API.
 *
 * @function getPopularMovies
 * @async
 * @param {Request} _req - Express request object (unused).
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Retrieves up to 10 of the most popular videos from Pexels.
 * - Requires a valid `PEXELS_API_KEY` environment variable.
 * - Responds with HTTP 200 and the API response JSON on success.
 * - Responds with HTTP 500 if the request fails.
 */
export const getPopularMovies = async (_req: Request, res: Response) => {
  try {
    const data = await client.videos.popular({ per_page: 10 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular videos" });
  }
};

/**
 * Searches for videos on Pexels based on a query string.
 *
 * @function getSearchedMovies
 * @async
 * @param {Request} req - Express request object.
 * @param {object} req.params - Route parameters.
 * @param {string} req.params.query - Search term for videos.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Returns up to 10 videos that match the search query.
 * - Requires a valid `PEXELS_API_KEY` environment variable.
 * - Responds with HTTP 200 and the Pexels API JSON data on success.
 * - Responds with HTTP 500 if the request fails.
 */
export const getSearchedMovies = async (req: Request, res: Response) => {
  try {
    const data = await client.videos.search({ query: req.params.query, per_page: 10 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch searched video" });
  }
};

/**
 * Retrieves a specific video by ID from the Pexels API.
 *
 * @function getSearchedMovieById
 * @async
 * @param {Request} req - Express request object.
 * @param {object} req.params - Route parameters.
 * @param {string} req.params.id - Unique identifier for the Pexels video.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Requires a valid `PEXELS_API_KEY` environment variable.
 * - Responds with HTTP 200 and the video details on success.
 * - Responds with HTTP 500 if the request fails.
 */
export const getSearchedMovieById = async (req: Request, res: Response) => {
  try {
    const data = await client.videos.show({ id: req.params.id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch searched video by id" });
  }
};
