/**
 * @file taskModel.js
 * @description Definition of the Task schema and model in MongoDB using Mongoose.
 */

const mongoose = require("mongoose");


/**
 * Schema for the `Task` collection.
 *
 * Represents a task associated with a user.
 * Includes title, detail, date, time, status, and calculated due date.
 *
 * @typedef {Object} Movie
 * @property {string} title - Task title (required, maximum 100 characters).
 * @property {string} [description] - Optional task detail (maximum 500 characters).
 * @property {string} videoUrl - Task date in `YYYY-MM-DD` format.
 * @property {Date} createdAt - Automatic task creation date.
 */


const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Mongoose model for the `Task` collection.
 *
 * @type {mongoose.Model<Task>}
 */

const Movie = mongoose.model('Movie', movieSchema);

export default Movie; // Export the Movie model