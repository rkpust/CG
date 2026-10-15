import { ApiError } from "../utils/ApiError.js";

/**
 * Role guard: authorize("admin") etc. Must run after verifyJWT.
 */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized("authentication required"));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("insufficient permissions"));
    }
    next();
  };
}
