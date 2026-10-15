import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { listAllNotes } from "../controllers/note.controller.js";

const router = Router();

// Everything under /api/admin requires admin role.
router.use(verifyJWT, authorize("admin"));

// GET /api/admin/notes — everyone's notes, paginated.
router.get("/notes", listAllNotes);

export default router;
