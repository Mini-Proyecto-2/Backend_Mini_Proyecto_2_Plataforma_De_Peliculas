import { Router } from "express";
import {
  createComment,
  getCommentsByMovie,
  getCommentsByUser,
  deleteComment,
} from "../controllers/comment.controller";

const router = Router();

router.post("/", createComment);
router.get("/:moviePexelsId", getCommentsByMovie);
router.get("/:userId", getCommentsByUser);
router.delete("/:id", deleteComment);

export default router;