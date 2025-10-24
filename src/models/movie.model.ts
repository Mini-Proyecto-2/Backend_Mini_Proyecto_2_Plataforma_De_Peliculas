/**
 * @file taskModel.js
 * @description Definition of the Task schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");


/**
 * Schema for the `Movie` collection.
 *
 * Represents a movie associated with a user.
 * Includes pexels data, video information, and user reference.
 *
 * @typedef {Object} Movie
 * @property {string} pexelsId - Movie id (pexels id, required).
 * @property {string} title - Movie title (required, maximum 100 characters).
 * @property {string} videoUrl - Movie video url (required).
 * @property {Date} createdAt - Movie creation date (automatic).
 * @property {String} miniatureUrl - Movie miniature url (required).
 * @property {mongoose.Types.ObjectId} userId - Reference to the user who added this movie.
 */


const movieSchema = new mongoose.Schema({
  pexelsId: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  miniatureUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: true
  }
});

/**
 * Mongoose model for the `Movie` collection.
 *
 * @type {mongoose.Model<Movie>}
 */

const Movie = mongoose.model('Movie', movieSchema);

export default Movie; // Export the Movie model