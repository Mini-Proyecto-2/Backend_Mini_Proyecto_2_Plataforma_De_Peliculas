/**
 * @file comment.controller.ts
 * @description Controller functions for managing movie comments.
 */

import { Request, Response } from "express";
import Comment from "../models/comment.model";

/**
 * Creates a new comment for a movie.
 *
 * @function createComment
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.description - Comment text content (required).
 * @param {string} req.body.moviePexelsId - Pexels movie ID to comment on (required).
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Requires authentication via JWT middleware.
 * - Responds with HTTP 201 and the created comment on success.
 * - Responds with HTTP 400 if required fields are missing.
 * - Responds with HTTP 401 if user is not authenticated.
 * - Responds with HTTP 500 on server error.
 * @example
 * POST /api/comments
 * {
 *   "description": "Great movie!",
 *   "moviePexelsId": "3190131"
 * }
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const { description, moviePexelsId } = req.body;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!description || !moviePexelsId) {
      return res.status(400).json({ message: "description and moviePexelsId are required" });
    }

    const newComment = await Comment.create({
      description,
      moviePexelsId,
      userId: req.user.userId
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error creating comment" });
  }
};

/**
 * Retrieves all comments for a specific movie, separated into user's comments and others' comments.
 *
 * @function getCommentsByMovie
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.moviePexelsId - Pexels movie ID.
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Populates user information (firstName, lastName, email) for each comment.
 * - Sorts comments by creation date (newest first).
 * - Separates comments into userComments (by authenticated user) and otherComments.
 * - Responds with HTTP 200 and the comment arrays on success.
 * - Responds with HTTP 500 on server error.
 * @example
 * GET /api/comments/movie/3190131
 */
export const getCommentsByMovie = async (req: Request, res: Response) => {
  try {
    const { moviePexelsId } = req.params;

    const comments = await Comment.find({ moviePexelsId })
      .populate("userId", "_id firstName lastName email") // populate user info
      .sort({ createdAt: -1 });

    const userComments = comments.filter((comment: any) => comment.userId._id.toString() === req.user.userId); // filter out comments with deleted users
    const otherComments = comments.filter((comment: any) => comment.userId._id.toString() !== req.user.userId); // filter out comments with deleted users
    res.status(200).json({ userComments, otherComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error fetching comments" });
  }
};

/**
 * Retrieves all comments made by a specific user.
 *
 * @function getCommentsByUser
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.userId - User identifier.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Sorts comments by creation date (newest first).
 * - Responds with HTTP 200 and the comment array on success.
 * - Responds with HTTP 500 on server error.
 * @example
 * GET /api/comments/user/6721a9c4...
 */
export const getCommentsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const comments = await Comment.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({ message: "Server error fetching user comments" });
  }
};

/**
 * Deletes a comment (only the comment owner can delete).
 *
 * @function deleteComment
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.id - Comment identifier.
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Verifies that the authenticated user is the owner of the comment.
 * - Responds with HTTP 200 and a success message when deleted.
 * - Responds with HTTP 401 if user is not authenticated.
 * - Responds with HTTP 403 if user is not the comment owner.
 * - Responds with HTTP 404 if comment is not found.
 * - Responds with HTTP 500 on server error.
 * @example
 * DELETE /api/comments/673d5a12...
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error deleting comment" });
  }
};

/**
 * Updates a comment's description (only the comment owner can update).
 *
 * @function updateComment
 * @async
 * @param {Request} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.id - Comment identifier.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.description - New comment text content (required).
 * @param {Object} req.user - Authenticated user injected by auth middleware.
 * @param {string} req.user.userId - Authenticated user's ID.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Verifies that the authenticated user is the owner of the comment.
 * - Responds with HTTP 200 and the updated comment on success.
 * - Responds with HTTP 401 if user is not authenticated.
 * - Responds with HTTP 403 if user is not the comment owner.
 * - Responds with HTTP 404 if comment is not found.
 * - Responds with HTTP 500 on server error.
 * @example
 * PATCH /api/comments/673d5a12...
 * {
 *   "description": "Updated comment text"
 * }
 */
export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to update this comment" });
        }

        comment.description = description;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Server error updating comment" });
    }
}