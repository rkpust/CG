import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: 200,
    },
    content: { type: String, required: [true, "content is required"], trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes — deliberately minimal (only what the app's queries require).
// ---------------------------------------------------------------------------

// 1) Covers BOTH note queries of a user:
//    - "list my notes": filter { owner } + sort { _id: -1 } + skip/limit
//    - "get/update/delete my note": equality on { owner, _id }
noteSchema.index({ owner: 1, _id: 1 });

export const Note = mongoose.model("Note", noteSchema);
