import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  await mongoose.connect(env.mongoUri);
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Life Pro API listening on port ${env.port}`);
  });
}

start().catch(error => {
  console.error("Failed to start server", error);
  process.exit(1);
});
