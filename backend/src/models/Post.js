import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: 200,
    },
    content: { type: String, required: [true, "content is required"], trim: true },
    author: {
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

// 1) The $lookup stage of the "posts of a user" aggregation joins
//    posts.author -> users._id; this index serves that join and any
//    "list posts by author" query with _id-based pagination.
postSchema.index({ author: 1, _id: 1 });

export const Post = mongoose.model("Post", postSchema);
