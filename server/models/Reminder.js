import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

reminderSchema.index({ scheduledFor: 1, status: 1 });
reminderSchema.index({ habitId: 1 });

export default mongoose.model("Reminder", reminderSchema);
