import { Router } from "express";
import {
  createComment,
  getCommentsByMovie,
  getCommentsByUser,
  deleteComment,
} from "../controllers/comment.controller";
const authMiddleware = require("../middleware/auth");

const router = Router();

router.post("/", authMiddleware, createComment);
router.get("/:moviePexelsId", getCommentsByMovie);
router.get("/:userId", getCommentsByUser);
router.delete("/:id", authMiddleware, deleteComment);

export default router;