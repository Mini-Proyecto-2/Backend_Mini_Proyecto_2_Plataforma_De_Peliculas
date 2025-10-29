/**
 * @file server.ts
 * @description Main entry point of the Film Unity backend application.
 * Configures Express, middleware, routes, database connection, and CORS policies.
 */

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import pexelsRoutes from './routes/pexels.routes';
import commentsRoutes from './routes/comment.routes';
import ratingRoutes from './routes/rating.routes';
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

/**
 * Express CORS configuration.
 *
 * @remarks
 * - Allows requests from any origin (`origin: true`).
 * - Enables credentials (cookies, authorization headers).
 * - Supports standard REST methods and headers.
 */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

/**
 * Registers application routes.
 *
 * @remarks
 * - `/api/auth`: Authentication and user management.
 * - `/api/movies`: Movie CRUD operations.
 * - `/api/pexels`: Pexels API integration (video content).
 */
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/pexels', pexelsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ratings', ratingRoutes);

/**
 * Health check endpoint.
 *
 * @route GET /api/health
 * @description Verifies that the server is running and responding.
 * @returns {Object} `{ status: "ok" }` if the API is operational.
 * @access Public
 * @example
 * GET /api/health
 * Response: { "status": "ok" }
 */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/**
 * Server configuration.
 *
 * @constant
 * @type {number | string}
 * @default 4000
 * @remarks
 * Uses the environment variable `PORT` if defined, otherwise defaults to `4000`.
 */
const PORT = process.env.PORT || 4000;

/**
 * Starts the Express server.
 *
 * @function
 * @returns {void}
 * @example
 * // Logs: "Server running on port 4000"
 */
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

/**
 * Establishes a connection to the MongoDB database.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves once the connection is established.
 * @remarks
 * - Uses the environment variable `MONGODB_URI` from `.env`.
 * - Logs a success message when connected or terminates on error.
 */
connectDB();