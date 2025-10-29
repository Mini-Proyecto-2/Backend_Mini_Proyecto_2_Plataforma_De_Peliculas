/**
 * @file rating.controller.ts
 * @description Controller functions for managing movie ratings.
 */

import { Request, Response } from "express";
import Rating from "../models/rating.model";

/**
 * Create or update a rating for a movie
 * POST /api/ratings
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
 * Get average rating for a specific movie
 * GET /api/ratings/movie/:moviePexelsId
 */
export const getAverageRatingByMovie = async (req: Request, res: Response) => {
  try {
    const { moviePexelsId } = req.params;
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
      return res.status(200).json({ averageRating: 0, totalRatings: 0 });
    }

    const { averageRating, totalRatings } = ratings[0];
    res.status(200).json({ averageRating, totalRatings });
  } catch (error) {
    console.error("Error fetching movie ratings:", error);
    res.status(500).json({ message: "Server error fetching movie ratings" });
  }
};

/**
 * Get all ratings made by a specific user
 * GET /api/ratings/user/:userId
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
 * Delete a rating (only owner or admin)
 * DELETE /api/ratings/:id
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