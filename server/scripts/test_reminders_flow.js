import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import Reminder from "../models/Reminder.js";
import { processScheduledReminders } from "../services/scheduler.js";

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(process.env.MONGO_URI);

  // Create a test user
  const user = await User.create({
    username: `testuser_${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    timezone: "UTC",
  });

  // Create a habit with reminder enabled 1 minute in the future
  const now = new Date();
  const scheduled = new Date(now.getTime() + 60 * 1000);
  const hh = String(scheduled.getHours()).padStart(2, "0");
  const mm = String(scheduled.getMinutes()).padStart(2, "0");

  const habit = await Habit.create({
    userId: user._id,
    title: "Test Reminder Habit",
    freq: { mode: "Daily" },
    reminder: { enabled: true, time: `${hh}:${mm}` },
  });

  // Create direct reminder for immediate processing
  await Reminder.create({ habitId: habit._id, userId: user._id, scheduledFor: scheduled });

  console.log("Created test reminder scheduled for:", scheduled.toISOString());

  // Wait 70 seconds then run the processing (or run immediately to test immediate sending)
  console.log("Waiting 70 seconds before running reminder processor...");
  await new Promise((r) => setTimeout(r, 70000));

  await processScheduledReminders();

  console.log("Reminder processing complete. Check logs for email preview URL (if any).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
