import express from "express";
import * as analytics from "../services/analyticsService.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/overview/:userId", async (req, res) => {
  try {
    const data = await analytics.getOverview(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Convenience endpoints for a single-user demo (returns analytics for the first user)
router.get("/me/overview", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: "No users found" });
    const data = await analytics.getOverview(user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me/streaks", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: "No users found" });
    const data = await analytics.getStreaks(user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me/completions", async (req, res) => {
  try {
    const days = parseInt(req.query.days || "30", 10);
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: "No users found" });
    const data = await analytics.getCompletionsTimeSeries(user._id, days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me/weekday-pattern", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: "No users found" });
    const data = await analytics.getWeekdayPattern(user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/streaks/:userId", async (req, res) => {
  try {
    const data = await analytics.getStreaks(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/completions/:userId", async (req, res) => {
  try {
    const days = parseInt(req.query.days || "30", 10);
    const data = await analytics.getCompletionsTimeSeries(req.params.userId, days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/weekday-pattern/:userId", async (req, res) => {
  try {
    const data = await analytics.getWeekdayPattern(req.params.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
