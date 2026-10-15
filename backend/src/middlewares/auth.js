import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies the "Authorization: Bearer <token>" header, loads the user and
 * attaches it to req.user. Uses the default _id index (findById).
 */
export async function verifyJWT(req, _res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized("authentication token missing");

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw ApiError.unauthorized("invalid or expired token");
    }

    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized("user no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
