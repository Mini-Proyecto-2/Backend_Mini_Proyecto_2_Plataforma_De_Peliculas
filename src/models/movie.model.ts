/**
 * @file movie.model.ts
 * @description Definition of the Movie schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");


/**
 * Schema for the `Movie` collection.
 *
 * Represents a movie associated with a user.
 * Includes pexels data, video information, and user reference.
 *
 * @typedef {Object} Movie
 * @property {string} title - Movie title (required).
 * @property {string} pexelUser - Pexels user/author name (required).
 * @property {string} pexelsId - Pexels video ID (required).
 * @property {string} miniatureUrl - Movie miniature/thumbnail url (required).
 * @property {mongoose.Types.ObjectId} userId - Reference to the user who added this movie.
 * @property {Date} createdAt - Movie creation date (automatic).
 */


const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  pexelUser: {
    type: String,
    required: true,
    trim: true
  },
  pexelsId: {
    type: String,
    required: true,
    trim: true
  },
  miniatureUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose model for the `Movie` collection.
 *
 * @type {mongoose.Model<Movie>}
 */

const Movie = mongoose.model('Movie', movieSchema);

export default Movie; // Export the Movie model