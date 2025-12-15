import dotenv from "dotenv";
import mongoose from "mongoose";
import { processScheduledReminders, createDailyReminders } from "../services/scheduler.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in env");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  const arg = process.argv[2];
  if (arg === "check") {
    await processScheduledReminders();
    console.log("Completed reminder check");
  } else if (arg === "create") {
    await createDailyReminders();
    console.log("Completed create daily reminders");
  } else {
    console.log("Usage: node run_reminders.js [check|create]");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
