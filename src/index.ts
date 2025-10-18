import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movies.routes';
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

/**
 * List of allowed origins for CORS
 * @constant {string[]}
 */
const allowedOrigins = [
  "http://localhost",
  "*",
];

app.use(
  cors()
);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
/**
 * @description Connect to the database
 * @function
 */
connectDB();
