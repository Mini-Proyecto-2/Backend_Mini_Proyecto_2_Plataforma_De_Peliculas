import { Request, Response } from 'express';
import Movie from '../models/movie.model';

/**
 * Lists all movies with user information.
 * @function listMovies
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user.
 * @param {string} req.user._id - User id.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with all movies or a 500 error if the request fails.
 */
export async function listMovies(req: Request, res: Response) {
  const movies = await Movie.find().populate('userId').sort({ createdAt: -1 });
  res.json(movies);
}
/**
 * Gets a movie by id.
 * @function getMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.params.id - Movie id.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with the movie or a 404 error if the movie is not found.
 */
export async function getMovie(req: Request, res: Response) {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ msg: 'Not found' });
  res.json(movie);
}

/**
 * Creates a new movie associated with the authenticated user.
 * @function createMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Movie data.
 * @param {string} req.body.title - Movie title.
 * @param {string} req.body.pexelsId - Movie pexels id.
 * @param {string} req.body.videoUrl - Movie video url.
 * @param {string} req.body.miniatureUrl - Movie miniature url.
 * @param {Object} req.user - Authenticated user.
 * @param {string} req.user._id - User id.
 * @returns {void} Responds with the new movie or a 500 error if the request fails.
 */
export async function createMovie(req: Request, res: Response) {
  try {
    const { title, pexelsId, videoUrl, miniatureUrl } = req.body;
    
    // Validar que el usuario esté autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }
    
    const movie = new Movie({ 
      title, 
      pexelsId,
      videoUrl, 
      miniatureUrl,
      userId: req.user._id // Usar userId según el modelo
    });
    
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ msg: 'Error al crear la película', error });
  }
}

/**
 * Deletes a movie by id.
 * @function deleteMovie
 * @param {Object} req - Express request object.
 * @param {Object} req.params.id - Movie id.
 * @param {Object} res - Express response object.
 * @returns {void} Responds with a 204 status if the movie is deleted or a 500 error if the request fails.
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
