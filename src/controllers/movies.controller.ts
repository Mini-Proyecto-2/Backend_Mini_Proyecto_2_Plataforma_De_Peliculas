import { Request, Response } from 'express';
import Movie from '../models/movie.model';

export async function listMovies(_req: Request, res: Response) {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json(movies);
}
export async function getMovie(req: Request, res: Response) {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ msg: 'Not found' });
  res.json(movie);
}
export async function createMovie(req: Request, res: Response) {
  const { title, description, videoUrl } = req.body;
  const movie = new Movie({ title, description, videoUrl });
  await movie.save();
  res.status(201).json(movie);
}
export async function updateMovie(req: Request, res: Response) {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!movie) return res.status(404).json({ msg: 'Not found' });
  res.json(movie);
}
export async function deleteMovie(req: Request, res: Response) {
  await Movie.findByIdAndDelete(req.params.id);
  res.status(204).end();
}
