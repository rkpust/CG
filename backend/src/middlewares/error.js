import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Mongoose schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "validation failed", errors });
  }

  // e.g. casting an invalid :id to ObjectId
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `invalid ${err.path}` });
  }

  // Duplicate key on the unique email index
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return res.status(409).json({ message: `${field} already in use` });
  }

  const status = err.status ?? 500;
  if (status >= 500) console.error("[error]", err);
  res.status(status).json({ message: err.message ?? "internal server error" });
}
