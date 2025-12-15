 import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import habitRoutes from "./routes/habits.js";
import authRoutes from "./routes/auth.js";
import reminderRoutes from "./routes/reminders.js";
import analyticsRoutes from "./routes/analytics.js";
import { startReminderScheduler } from "./services/scheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    startReminderScheduler();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
