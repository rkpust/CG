import { User } from "../models/User.js";
import { Note } from "../models/Note.js";
import { Post } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination, paginate } from "../utils/pagination.js";
import { assert, isNonEmptyString, isValidEmail, toStringArray } from "../utils/validate.js";

/**
 * GET /api/users?page=&limit=&role=  (admin only)
 * Filter { role } + sort { _id: 1 } -> { role: 1, _id: 1 } index;
 * without the role filter the default _id index serves the sort.
 */
export async function listUsers(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.role !== undefined) {
      assert(
        ["user", "admin"].includes(req.query.role),
        "role filter must be 'user' or 'admin'"
      );
      filter.role = req.query.role;
    }

    const result = await paginate(User, filter, { page, limit, skip }, {
      sort: { _id: 1 },
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/users (admin only) — add a user with any role. */
export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, interests } = req.body ?? {};

    assert(isNonEmptyString(name), "name is required");
    assert(isValidEmail(email), "a valid email is required");
    assert(
      typeof password === "string" && password.length >= 8,
      "password must be at least 8 characters"
    );
    assert(
      role === undefined || ["user", "admin"].includes(role),
      "role must be 'user' or 'admin'"
    );

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.conflict("email already in use");

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: role ?? "user",
      interests: toStringArray(interests) ?? [],
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:id (admin only) — default _id index. */
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound("user not found");
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/users/:id (admin only). */
export async function updateUser(req, res, next) {
  try {
    const { name, email, password, role, interests } = req.body ?? {};
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound("user not found");

    if (name !== undefined) {
      assert(isNonEmptyString(name), "name cannot be empty");
      user.name = name.trim();
    }
    if (email !== undefined) {
      assert(isValidEmail(email), "a valid email is required");
      user.email = email.toLowerCase();
    }
    if (password !== undefined) {
      assert(
        typeof password === "string" && password.length >= 8,
        "password must be at least 8 characters"
      );
      user.password = password; // re-hashed by the pre-save hook
    }
    if (role !== undefined) {
      assert(["user", "admin"].includes(role), "role must be 'user' or 'admin'");
      user.role = role;
    }
    if (interests !== undefined) {
      assert(Array.isArray(interests), "interests must be an array of strings");
      user.interests = toStringArray(interests) ?? [];
    }

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/users/:id (admin only) — cascades notes + posts. */
export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound("user not found");
    if (user._id.equals(req.user._id)) {
      throw ApiError.badRequest("you cannot delete your own account");
    }

    // deleteMany filters use the owner/author prefixes of the compound indexes.
    await Promise.all([
      Note.deleteMany({ owner: user._id }),
      Post.deleteMany({ author: user._id }),
      user.deleteOne(),
    ]);

    res.json({ message: "user deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/by-interests (authenticated)
 *
 * Aggregation Scenario 1 — users grouped by their interests.
 * Constraint: exactly ONE User.aggregate() call, no other query methods.
 * The { interests: 1 } index supports the pipeline's $unwind stage.
 */
export async function usersByInterest(_req, res, next) {
  try {
    const groups = await User.aggregate([
      { $unwind: "$interests" },
      {
        $group: {
          _id: "$interests",
          count: { $sum: 1 },
          users: {
            $push: { _id: "$_id", name: "$name", email: "$email" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ data: groups, total: groups.length });
  } catch (err) {
    next(err);
  }
}
