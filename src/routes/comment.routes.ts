import { Router } from "express";
import {
  createComment,
  getCommentsByMovie,
  getCommentsByUser,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller";
const authMiddleware = require("../middleware/auth");

const router = Router();

router.post("/", authMiddleware, createComment);
router.get("/movie/:moviePexelsId", getCommentsByMovie);
router.get("/user/:userId", getCommentsByUser);
router.delete("/:id", authMiddleware, deleteComment);
router.patch("/:id", authMiddleware, updateComment);

export default router;