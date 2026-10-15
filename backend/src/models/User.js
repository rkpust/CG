import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is required"], trim: true },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },
    // Hashed with bcrypt in the pre-save hook; excluded from queries by default.
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 8,
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // e.g. ['chess', 'reading'] — used by the "group by interests" aggregation.
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Indexes — deliberately minimal (only what the app's queries require).
// Everything fetched by plain :id uses the default _id index.
// ---------------------------------------------------------------------------

// 1) Registration must reject duplicate emails and login looks the user up by
//    email (equality on { email }).
userSchema.index({ email: 1 }, { unique: true });

// 2) Admin "list users" view: filter { role } + sort { _id: 1 } pagination.
userSchema.index({ role: 1, _id: 1 });

// 3) Supports the "users grouped by interests" aggregation pipeline ($unwind
//    over the interests array).
userSchema.index({ interests: 1 });

// Hash password on create/password change (bcrypt, cost 12).
// Async pre hooks are awaited by Mongoose — no next() needed.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Safety net: never serialize the password hash.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model("User", userSchema);
