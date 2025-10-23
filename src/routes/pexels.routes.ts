import { Router } from 'express';
import { getPopularMovies, getSearchedMovies, getSearchedMovieById } from '../controllers/pexels.controller';
const authMiddleware = require("../middleware/auth");
const router = Router();

router.get('/popular', authMiddleware, getPopularMovies);
router.get('/search/:query', authMiddleware, getSearchedMovies);
router.get('/searchById/:id', authMiddleware, getSearchedMovieById);
export default router;