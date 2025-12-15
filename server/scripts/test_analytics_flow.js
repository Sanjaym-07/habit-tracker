import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Habit from "../models/Habit.js";
import * as analytics from "../services/analyticsService.js";

dotenv.config();

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne();
  if (!user) {
    user = await User.create({ username: `analytics_test`, email: `analytics-test@example.com` });
  }

  // Create sample habits with progress for the last 10 days
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  await Habit.create({
    userId: user._id,
    title: "Analytics Habit 1",
    freq: { mode: "Daily" },
    progress: dates.slice(0, 7),
    currentStreak: 5,
    highestStreak: 7,
  });

  await Habit.create({
    userId: user._id,
    title: "Analytics Habit 2",
    freq: { mode: "Daily" },
    progress: dates.slice(2, 9),
    currentStreak: 3,
    highestStreak: 5,
  });

  console.log("Overview:");
  console.log(await analytics.getOverview(user._id));

  console.log("Streaks:");
  console.log(await analytics.getStreaks(user._id));

  console.log("Completions (7 days):");
  console.log(await analytics.getCompletionsTimeSeries(user._id, 7));

  console.log("Weekday pattern:");
  console.log(await analytics.getWeekdayPattern(user._id));

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
