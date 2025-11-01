/**
 * @file movie.model.ts
 * @description Definition of the Comment schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");


/**
 * Schema for the `Comment` collection.
 *
 * Represents a comment associated with a movie.
 * Includes user reference and movie information.
 *
 * @typedef {Object} commentSchema
 * @property {string} description - Comment description (required, maximum 100 characters).
 * @property {string} moviePexelsId - Comment movie id (required).
 * @property {Date} createdAt - Comment creation date (automatic).
 * @property {mongoose.Types.ObjectId} userId - Reference to the user who added this comment.
 */


const commentSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
  moviePexelsId: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose model for the `Comment` collection.
 *
 * @type {mongoose.Model<Comment>}
 */

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; // Export the Comment model