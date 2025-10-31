/**
 * @file movie.model.ts
 * @description Definition of the Rating schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");


/**
 * Schema for the `Comment` collection.
 *
 * Represents a comment associated with a movie.
 * Includes user reference and movie information.
 *
 * @typedef {Object} ratingSchema
 * @property {number} value - Rating value (required, between 1 and 5).
 * @property {string} moviePexelsId - Rating movie id (required).
 * @property {Date} createdAt - Rating creation date (automatic).
 * @property {mongoose.Types.ObjectId} userId - Reference to the user who added this rating.
 */


const ratingSchema = new mongoose.Schema({
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
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

/**
 * Mongoose model for the `Rating` collection.
 *
 * @type {mongoose.Model<Rating>}
 */

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating; // Export the Rating model