import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    freq: {
      mode: {
        type: String,
        enum: ["Daily", "Weekly", "Custom"],
        default: "Daily",
      },
      days: [{ type: Number, min: 0, max: 6 }],
      startDate: { type: String },
    },
    currentStreak: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    progress: [{ type: String }],
    lastCompleted: { type: String, default: null },
    reminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: "09:00" },
      lastSent: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

habitSchema.methods.isDueToday = function (date = new Date()) {
  const dayOfWeek = date.getDay();
  switch (this.freq.mode) {
    case "Daily":
      return true;
    case "Weekly":
    case "Custom":
      return this.freq.days.includes(dayOfWeek);
    default:
      return false;
  }
};

export default mongoose.model("Habit", habitSchema);
