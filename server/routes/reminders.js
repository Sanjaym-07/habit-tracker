import express from "express";
import Reminder from "../models/Reminder.js";
import Habit from "../models/Habit.js";
import { processScheduledReminders, createDailyReminders } from "../services/scheduler.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId })
      .populate("habitId", "title")
      .sort({ scheduledFor: -1 })
      .limit(50);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    const reminders = await Reminder.find({ status: "pending" })
      .populate("habitId", "title")
      .populate("userId", "email username");
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/schedule", async (req, res) => {
  try {
    const { habitId, userId, scheduledFor } = req.body;
    const reminder = new Reminder({
      habitId,
      userId,
      scheduledFor: new Date(scheduledFor),
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/habits-with-reminders/:userId", async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.params.userId,
      "reminder.enabled": true,
    });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// Development-only endpoints to manually trigger scheduler tasks
if (process.env.NODE_ENV !== "production") {
  router.post("/__run-check", async (req, res) => {
    try {
      await processScheduledReminders();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/__create-daily", async (req, res) => {
    try {
      await createDailyReminders();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
