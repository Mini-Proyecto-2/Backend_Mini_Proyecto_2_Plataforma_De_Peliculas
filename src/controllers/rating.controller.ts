/**
 * @file rating.controller.ts
 * @description Controller functions for managing movie ratings.
 */

import { Request, Response } from "express";
import Rating from "../models/rating.model";

/**
 * Creates a new rating or updates an existing rating for a movie.
 *
 * @function createOrUpdateRating
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {number} req.body.value - Rating value between 1 and 5 (required).
 * @param {string} req.body.moviePexelsId - Pexels movie ID to rate (required).
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - If user already rated the movie, updates the existing rating.
 * - Otherwise, creates a new rating.
 * - Requires authentication via JWT middleware.
 * - Responds with HTTP 201 for new rating or HTTP 200 for updated rating.
 * - Responds with HTTP 400 if required fields are missing or value is out of range (1-5).
 * - Responds with HTTP 401 if user is not authenticated.
 * - Responds with HTTP 500 on server error.
 * @example
 * POST /api/ratings
 * {
 *   "value": 5,
 *   "moviePexelsId": "3190131"
 * }
 */
export const createOrUpdateRating = async (req: Request, res: Response) => {
  try {
    const { value, moviePexelsId } = req.body;
    const userId = req.user.userId; // depends on auth middleware
    if(!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!value || !moviePexelsId) {
      return res.status(400).json({ message: "value and moviePexelsId are required" });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user already rated this movie
    const existingRating = await Rating.findOne({ userId, moviePexelsId });

    if (existingRating) {
      existingRating.value = value;
      await existingRating.save();
      return res.status(200).json({ message: "Rating updated", rating: existingRating });
    }

    // Otherwise, create a new rating
    const newRating = await Rating.create({ userId, moviePexelsId, value });
    res.status(201).json({ message: "Rating created", rating: newRating });
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    res.status(500).json({ message: "Server error creating/updating rating" });
  }
};

/**
 * Retrieves the average rating, total ratings count, and the authenticated user's rating for a specific movie.
 *
 * @function getAverageRatingByMovie
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.moviePexelsId - Pexels movie ID.
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Uses MongoDB aggregation to calculate average rating and total count.
 * - Also fetches the authenticated user's rating for this movie.
 * - Responds with HTTP 200 and rating statistics on success.
 * - Returns zero values if the movie has no ratings.
 * - Responds with HTTP 500 on server error.
 * @example
 * GET /api/ratings/movie/3190131
 * Response:
 * {
 *   "averageRating": 4.5,
 *   "totalRatings": 10,
 *   "userRating": 5
 * }
 */
export const getAverageRatingByMovie = async (req: Request, res: Response) => {
  try {
    const { moviePexelsId } = req.params;
    const userId = req.user.userId; // depends on auth middleware

    const ratings = await Rating.aggregate([
      { $match: { moviePexelsId } },
      {
        $group: {
          _id: "$moviePexelsId",
          averageRating: { $avg: "$value" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (ratings.length === 0) {
      return res.status(200).json({ averageRating: 0, totalRatings: 0, userRating: 0 });
    }

    const userRating = await Rating.findOne({ userId, moviePexelsId });

    const { averageRating, totalRatings } = ratings[0];
    res.status(200).json({ averageRating, totalRatings, userRating: userRating?.value || 0 });
  } catch (error) {
    console.error("Error fetching movie ratings:", error);
    res.status(500).json({ message: "Server error fetching movie ratings" });
  }
};

/**
 * Retrieves all ratings made by a specific user.
 *
 * @function getRatingsByUser
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.userId - User identifier.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Sorts ratings by ID in descending order (most recent first).
 * - Responds with HTTP 200 and the rating array on success.
 * - Responds with HTTP 500 on server error.
 * @example
 * GET /api/ratings/user/6721a9c4...
 * Response:
 * [
 *   {
 *     "_id": "673d6a12...",
 *     "value": 5,
 *     "moviePexelsId": "3190131",
 *     "userId": "6721a9c4..."
 *   }
 * ]
 */
export const getRatingsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.find({ userId }).sort({ _id: -1 });
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ message: "Server error fetching user ratings" });
  }
};

/**
 * Deletes a rating (only the rating owner can delete).
 *
 * @function deleteRating
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.id - Rating identifier.
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Verifies that the authenticated user is the owner of the rating.
 * - Responds with HTTP 200 and a success message when deleted.
 * - Responds with HTTP 403 if user is not the rating owner.
 * - Responds with HTTP 404 if rating is not found.
 * - Responds with HTTP 500 on server error.
 * @example
 * DELETE /api/ratings/673d6a12...
 * Response:
 * {
 *   "message": "Rating deleted successfully"
 * }
 */
export const deleteRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (rating.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this rating" });
    }

    await rating.deleteOne();
    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Server error deleting rating" });
  }
};