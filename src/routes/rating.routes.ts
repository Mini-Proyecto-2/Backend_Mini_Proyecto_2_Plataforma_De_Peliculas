import { Router } from "express";
import {
  createOrUpdateRating,
  getAverageRatingByMovie,
  getRatingsByUser,
  deleteRating,
} from "../controllers/rating.controller";
const authMiddleware = require("../middleware/auth");

const router = Router();

router.post("/", authMiddleware, createOrUpdateRating);
router.get("/movie/:moviePexelsId", authMiddleware, getAverageRatingByMovie);
router.get("/user/:userId", authMiddleware, getRatingsByUser);
router.delete("/:id", authMiddleware, deleteRating);

export default router;