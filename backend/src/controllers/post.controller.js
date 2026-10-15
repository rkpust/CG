import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination, paginate } from "../utils/pagination.js";
import { assert, isNonEmptyString } from "../utils/validate.js";

/**
 * GET /api/posts?page=&limit= — public feed, sorted by newest.
 * Unfiltered sort { _id: -1 } is served by the default _id index,
 * so no extra index is created for this view.
 */
export async function listPosts(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await paginate(Post, {}, { page, limit, skip }, {
      populate: { path: "author", select: "name email" },
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/posts — any authenticated user; posts are publicly readable. */
export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body ?? {};
    assert(isNonEmptyString(title), "title is required");
    assert(isNonEmptyString(content), "content is required");

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/posts/user/:userId — Aggregation Scenario 2.
 *
 * All posts belonging to a particular user, retrieved with a SINGLE
 * aggregation pipeline containing a $lookup stage:
 *   $match user by _id (default _id index)
 *   -> $lookup posts where posts.author = users._id ({ author: 1, _id: 1 })
 *   -> $project the user info + joined posts
 */
export async function userPosts(req, res, next) {
  try {
    const { userId } = req.params;
    assert(mongoose.isValidObjectId(userId), "invalid user id");

    const [result] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
        },
      },
      { $project: { name: 1, email: 1, posts: 1 } },
    ]);

    if (!result) throw ApiError.notFound("user not found");
    res.json({ data: result, total: result.posts.length });
  } catch (err) {
    next(err);
  }
}
