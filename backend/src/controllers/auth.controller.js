import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { assert, isNonEmptyString, isValidEmail } from "../utils/validate.js";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/** POST /api/auth/register */
export async function register(req, res, next) {
  try {
    const { name, email, password, interests } = req.body ?? {};

    assert(isNonEmptyString(name), "name is required");
    assert(isValidEmail(email), "a valid email is required");
    assert(
      typeof password === "string" && password.length >= 8,
      "password must be at least 8 characters"
    );

    // Duplicate check uses the { email: 1 } unique index; create() is also
    // protected by it (11000 -> 409 in the error handler).
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict("email already in use");

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      interests: Array.isArray(interests)
        ? interests.map((i) => String(i).trim()).filter(Boolean)
        : [],
    });

    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    assert(isValidEmail(email), "a valid email is required");
    assert(typeof password === "string" && password, "password is required");

    // Lookup by email -> { email: 1 } index; select("+password") because the
    // field is excluded by default.
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    const valid = user && (await user.comparePassword(password));
    if (!valid) throw ApiError.unauthorized("invalid email or password");

    res.json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — profile of the authenticated user (default _id index). */
export async function me(req, res) {
  res.json({ user: req.user });
}
