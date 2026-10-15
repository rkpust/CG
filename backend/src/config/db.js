import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log(
    `[db] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`
  );
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
