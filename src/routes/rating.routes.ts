import { Router } from "express";
import {
  createOrUpdateRating,
  getAverageRatingByMovie,
  getRatingsByUser,
  deleteRating,
} from "../controllers/rating.controller";

const router = Router();

router.post("/", createOrUpdateRating);
router.get("/:moviePexelsId", getAverageRatingByMovie);
router.get("/:userId", getRatingsByUser);
router.delete("/:id", deleteRating);

export default router;