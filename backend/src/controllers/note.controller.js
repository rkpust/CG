import { Note } from "../models/Note.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination, paginate } from "../utils/pagination.js";
import { assert, isNonEmptyString } from "../utils/validate.js";

/**
 * GET /api/notes?page=&limit= — list OWN notes.
 * Filter { owner } + sort { _id: -1 } -> { owner: 1, _id: 1 } index.
 */
export async function listMyNotes(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await paginate(Note, { owner: req.user._id }, { page, limit, skip });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/notes — create a note owned by the authenticated user. */
export async function createNote(req, res, next) {
  try {
    const { title, content } = req.body ?? {};
    assert(isNonEmptyString(title), "title is required");
    assert(isNonEmptyString(content), "content is required");

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      owner: req.user._id,
    });

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notes/:id — owner or admin.
 * Owner path: equality { _id, owner } -> { owner: 1, _id: 1 } index.
 * Admin fallback: findById -> default _id index.
 */
export async function getNote(req, res, next) {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note && req.user.role === "admin") {
      note = await Note.findById(req.params.id);
    }
    if (!note) throw ApiError.notFound("note not found");

    await note.populate("owner", "name email");
    res.json({ note });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/notes/:id — owner only ({ _id, owner } -> compound index). */
export async function updateNote(req, res, next) {
  try {
    const { title, content } = req.body ?? {};
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!note) throw ApiError.notFound("note not found");

    if (title !== undefined) {
      assert(isNonEmptyString(title), "title cannot be empty");
      note.title = title.trim();
    }
    if (content !== undefined) {
      assert(isNonEmptyString(content), "content cannot be empty");
      note.content = content.trim();
    }

    await note.save();
    res.json({ note });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/notes/:id — owner only ({ _id, owner } -> compound index). */
export async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!note) throw ApiError.notFound("note not found");

    res.json({ message: "note deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/notes?page=&limit= — everyone's notes (admin only).
 * Unfiltered sort { _id: -1 } is served by the default _id index,
 * so no extra index is created for this view.
 */
export async function listAllNotes(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const result = await paginate(Note, {}, { page, limit, skip }, {
      populate: { path: "owner", select: "name email" },
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
