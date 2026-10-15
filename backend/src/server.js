import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const app = createApp();

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`[server] listening on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
