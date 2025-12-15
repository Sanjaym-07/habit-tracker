import mongoose from "mongoose";
import Habit from "../models/Habit.js";

const ObjectId = mongoose.Types.ObjectId;

export async function getOverview(userId) {
  const totalHabits = await Habit.countDocuments({ userId });

  const agg = await Habit.aggregate([
    { $match: { userId: ObjectId(userId) } },
    { $project: { numProgress: { $size: { $ifNull: ["$progress", []] } } } },
    { $group: { _id: null, totalCompletions: { $sum: "$numProgress" } } },
  ]);

  const totalCompletions = (agg[0] && agg[0].totalCompletions) || 0;
  const avgPerHabit = totalHabits ? totalCompletions / totalHabits : 0;

  return { totalHabits, totalCompletions, avgPerHabit };
}

export async function getStreaks(userId) {
  const habits = await Habit.find({ userId }).select(
    "title currentStreak highestStreak"
  );
  return habits.map((h) => ({
    habitId: h._id,
    title: h.title,
    currentStreak: h.currentStreak || 0,
    highestStreak: h.highestStreak || 0,
  }));
}

export async function getCompletionsTimeSeries(userId, days = 30) {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startStr = start.toISOString().split("T")[0];

  const agg = await Habit.aggregate([
    { $match: { userId: ObjectId(userId) } },
    { $project: { progress: 1 } },
    { $unwind: "$progress" },
    { $match: { progress: { $gte: startStr } } },
    { $group: { _id: "$progress", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map(agg.map((a) => [a._id, a.count]));

  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, count: map.get(key) || 0 });
  }
  return result;
}

export async function getWeekdayPattern(userId) {
  const agg = await Habit.aggregate([
    { $match: { userId: ObjectId(userId) } },
    { $project: { progress: 1 } },
    { $unwind: "$progress" },
    {
      $project: {
        weekday: {
          $dayOfWeek: { $dateFromString: { dateString: "$progress" } },
        },
      },
    },
    { $group: { _id: "$weekday", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Map to 0..6 (Sunday=0)
  const result = Array.from({ length: 7 }, (_, i) => ({ day: i, count: 0 }));
  for (const a of agg) {
    const idx = ((a._id - 1) % 7 + 7) % 7; // convert 1..7 -> 0..6
    result[idx].count = a.count;
  }
  return result;
}

export default { getOverview, getStreaks, getCompletionsTimeSeries, getWeekdayPattern };
