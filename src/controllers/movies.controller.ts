/**
 * @file Movie controller.
 * @description Handles CRUD operations for movies, including listing, retrieving,
 * creating, and deleting movies associated with authenticated users.
 */

import { Request, Response } from 'express';
import Movie from '../models/movie.model';

/**
 * Lists all movies and includes the creator user via `populate('userId')`.
 *
 * @function listMovies
 * @async
 * @param {Request} req - Express request object.
 * @param {object} [req.user] - Authenticated user injected by auth middleware.
 * @param {string} [req.user._id] - Authenticated user's id.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Sorts results by `createdAt` in descending order.
 * - Responds with HTTP 200 and the movie array on success.
 * - Intended to return HTTP 500 on unexpected failure (no explicit try/catch here).
 */
export async function listMovies(req: Request, res: Response) {
try {
    const userId = req.user.userId; 
    const movies = await Movie.find({ userId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(movies);
  } catch (error) {
    console.error("Error al listar películas:", error);
    res.status(500).json({ message: "Error al obtener las películas" });
  }
}
/**
 * Retrieves a single movie by its identifier.
 *
 * @function getMovie
 * @async
 * @param {Request} req - Express request object.
 * @param {object} req.params - Route parameters.
 * @param {string} req.params.id - Movie identifier.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Responds with HTTP 200 and the movie document when found.
 * - Responds with HTTP 404 and `{ msg: 'Not found' }` if the movie does not exist.
 * - Intended to return HTTP 500 on unexpected failure (no explicit try/catch here).
 */
export async function getMovie(req: Request, res: Response) {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(200).json({ exists: false });
    }
    
    res.status(200).json({ exists: true, movie });
  } catch (error) {
    res.status(500).json({ exists: false, msg: 'Error al buscar la película' });
  }
}

/**
 * Creates a new movie associated with the authenticated user.
 *
 * @function createMovie
 * @async
 * @param {Request} req - Express request object.
 * @param {object} req.body - Incoming movie payload.
 * @param {string} req.body.title - Movie title.
 * @param {string} req.body.pexelUser - Pexels user/author name.
 * @param {string} req.body.pexelsId - Pexels video ID.
 * @param {string} req.body.miniatureUrl - Movie thumbnail URL.
 * @param {object} [req.user] - Authenticated user injected by auth middleware.
 * @param {string} [req.user._id] - Authenticated user's id used as `userId`.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Responds with HTTP 201 and the created movie document on success.
 * - Responds with HTTP 400 if required fields are missing.
 * - Responds with HTTP 401 if the request is unauthenticated.
 * - Responds with HTTP 500 and an error payload on unexpected failure.
 */
export async function createMovie(req: Request, res: Response) {
  try {
    const { title, pexelUser, pexelsId, miniatureUrl } = req.body;
    
    // Validate required fields
    if (!title || !pexelUser || !pexelsId || !miniatureUrl) {
      return res.status(400).json({ 
        msg: 'Todos los campos son requeridos',
        required: ['title', 'pexelUser', 'pexelsId', 'miniatureUrl']
      });
    }
    
    // Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }
    
    const movie = new Movie({ 
      title, 
      pexelUser,
      pexelsId,
      miniatureUrl,
      userId: req.user._id
    });
    
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear la película', error });
  }
}

/**
 * Deletes a movie by its identifier.
 *
 * @function deleteMovie
 * @async
 * @param {Request} req - Express request object.
 * @param {object} req.params - Route parameters.
 * @param {string} req.params.id - Movie identifier.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Resolves after sending the HTTP response.
 * @remarks
 * - Responds with HTTP 204 (no content) when the movie is deleted.
 * - Responds with HTTP 404 if the movie does not exist.
 * - Responds with HTTP 500 and an error payload on unexpected failure.
 */

export async function deleteMovie(req: Request, res: Response) {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ msg: 'Película no encontrada' });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ msg: 'Error al eliminar la película', error });
  }
}
