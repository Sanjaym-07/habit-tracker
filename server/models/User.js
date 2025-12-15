import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
