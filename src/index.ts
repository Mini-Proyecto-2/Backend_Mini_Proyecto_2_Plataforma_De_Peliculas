import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movies.routes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Verifica que la variable de entorno se esté leyendo correctamente

/**
 * @description Connect to the database
 * @function
 */
connectDB();