import { Router } from "express";
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  usersByInterest,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

// Aggregation Scenario 1 — declared BEFORE /:id so "by-interests"
// is never treated as an :id parameter.
router.get("/by-interests", verifyJWT, usersByInterest);

// Admin-only user management.
router.get("/", verifyJWT, authorize("admin"), listUsers);
router.post("/", verifyJWT, authorize("admin"), createUser);
router.get("/:id", verifyJWT, authorize("admin"), getUser);
router.patch("/:id", verifyJWT, authorize("admin"), updateUser);
router.delete("/:id", verifyJWT, authorize("admin"), deleteUser);

export default router;
