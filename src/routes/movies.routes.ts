import { Router } from 'express';
import { listMovies, getMovie, createMovie, updateMovie, deleteMovie } from '../controllers/movies.controller';
const router = Router();
router.get('/', listMovies);
router.get('/:id', getMovie);
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
export default router;
