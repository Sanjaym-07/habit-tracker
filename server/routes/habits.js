import express from "express";
import Habit from "../models/Habit.js";

const router = express.Router();

import auth from "../middleware/auth.js";

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const habit = new Habit(req.body);
    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json({ message: "Habit deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const dateStr = date || new Date().toISOString().split("T")[0];
    if (!habit.progress.includes(dateStr)) {
      habit.progress.push(dateStr);

      if (!habit.lastCompleted) {
        habit.currentStreak = 1;
      } else {
        const lastDate = new Date(habit.lastCompleted);
        const currentDate = new Date(dateStr);
        const diffDays = Math.floor(
          (currentDate - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (habit.freq.mode === "Daily") {
          habit.currentStreak = diffDays === 1 ? habit.currentStreak + 1 : 1;
        } else {
          const scheduled = habit.freq.days;
          const lastDayIndex = scheduled.indexOf(lastDate.getDay());
          const nextIndex = (lastDayIndex + 1) % scheduled.length;
          const nextScheduledDay = scheduled[nextIndex];
          habit.currentStreak =
            currentDate.getDay() === nextScheduledDay
              ? habit.currentStreak + 1
              : 1;
        }
      }

      if (habit.currentStreak > habit.highestStreak) {
        habit.highestStreak = habit.currentStreak;
      }
      habit.lastCompleted = dateStr;
      await habit.save();
    }

    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reminder", async (req, res) => {
  try {
    const { enabled, time } = req.body;
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      { reminder: { enabled, time, lastSent: null } },
      { new: true }
    );
    if (!habit) return res.status(404).json({ error: "Habit not found" });
    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
