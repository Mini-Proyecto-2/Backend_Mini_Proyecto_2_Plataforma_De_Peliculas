import { Request, Response } from 'express';
import { createClient } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY as string);

/**
 * Controller to get popular videos from Pexels API.
 * @function getPopularMovies
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with popular videos or a 500 error if the request fails.
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
 * Controller to search videos from Pexels API based on a query.
 * @function getSearchedMovies
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.query - Query parameter for searched movies.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with searched videos or a 500 error if the request fails.
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
 * Controller to get a video by id from Pexels API.
 * @function getSearchedMovieById
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - Id parameter for searched movie.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with searched video by id or a 500 error if the request fails.
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
