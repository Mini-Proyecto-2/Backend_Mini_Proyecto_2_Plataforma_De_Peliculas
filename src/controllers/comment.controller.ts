/**
 * @file comment.controller.ts
 * @description Controller functions for managing movie comments.
 */

import { Request, Response } from "express";
import Comment from "../models/comment.model";

/**
 * Create a new comment
 * POST /api/comments
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
 * Get all comments for a specific movie
 * GET /api/comments/movie/:moviePexelsId
 */
export const getCommentsByMovie = async (req: Request, res: Response) => {
  try {
    const { moviePexelsId } = req.params;

    const comments = await Comment.find({ moviePexelsId })
      .populate("userId", "firstName lastName email") // populate user info
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error fetching comments" });
  }
};

/**
 * Get all comments made by a specific user
 * GET /api/comments/user/:userId
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
 * Delete a comment (only owner or admin)
 * DELETE /api/comments/:id
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