import { Router } from "express";
import { listPosts, createPost, userPosts } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

// Aggregation Scenario 2 — declared BEFORE any /:id-style route.
router.get("/user/:userId", userPosts);

// Public feed; creating a post requires authentication.
router.get("/", listPosts);
router.post("/", verifyJWT, createPost);

export default router;
