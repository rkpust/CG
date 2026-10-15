import { Router } from "express";
import {
  listMyNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

// All note routes require authentication; ownership is enforced in controllers.
router.get("/", verifyJWT, listMyNotes);
router.post("/", verifyJWT, createNote);
router.get("/:id", verifyJWT, getNote);
router.patch("/:id", verifyJWT, updateNote);
router.delete("/:id", verifyJWT, deleteNote);

export default router;
