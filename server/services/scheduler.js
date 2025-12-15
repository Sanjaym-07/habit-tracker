import cron from "node-cron";
import Habit from "../models/Habit.js";
import Reminder from "../models/Reminder.js";
import { sendReminderEmail } from "./notificationService.js";

export function startReminderScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running reminder check...`);
    await processScheduledReminders();
  });

  cron.schedule("0 0 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Creating daily reminders...`);
    await createDailyReminders();
  });

  console.log("Reminder scheduler started");
}

async function processScheduledReminders() {
  try {
    const now = new Date();
    const pendingReminders = await Reminder.find({
      status: "pending",
      scheduledFor: { $lte: now },
    })
      .populate("habitId", "title")
      .populate("userId", "email username notificationPreferences");

    for (const reminder of pendingReminders) {
      try {
        if (!reminder.userId || !reminder.habitId) {
          reminder.status = "failed";
          reminder.error = "Missing user or habit reference";
          await reminder.save();
          continue;
        }

        if (reminder.userId.notificationPreferences?.email) {
          await sendReminderEmail(
            reminder.userId.email,
            reminder.userId.username,
            reminder.habitId.title
          );
        }

        reminder.status = "sent";
        reminder.sentAt = new Date();
        await reminder.save();

        await Habit.findByIdAndUpdate(reminder.habitId._id, {
          "reminder.lastSent": new Date(),
        });

        console.log(`Reminder sent for habit: ${reminder.habitId.title}`);
      } catch (err) {
        reminder.status = "failed";
        reminder.error = err.message;
        await reminder.save();
        console.error(`Failed to send reminder: ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Error processing reminders:", err);
  }
}

async function createDailyReminders() {
  try {
    const now = new Date();
    const habitsWithReminders = await Habit.find({
      "reminder.enabled": true,
    }).populate("userId");

    for (const habit of habitsWithReminders) {
      if (!habit.isDueToday(now)) continue;

      const todayStr = now.toISOString().split("T")[0];
      if (habit.progress.includes(todayStr)) continue;

      const [hours, minutes] = habit.reminder.time.split(":").map(Number);
      const scheduledFor = new Date(now);
      scheduledFor.setHours(hours, minutes, 0, 0);

      if (scheduledFor <= now) continue;

      const startOfDay = new Date(scheduledFor);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduledFor);
      endOfDay.setHours(23, 59, 59, 999);

      const existingReminder = await Reminder.findOne({
        habitId: habit._id,
        scheduledFor: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      if (!existingReminder) {
        await Reminder.create({
          habitId: habit._id,
          userId: habit.userId,
          scheduledFor,
        });
        console.log(`Created reminder for habit: ${habit.title}`);
      }
    }
  } catch (err) {
    console.error("Error creating daily reminders:", err);
  }
}

export { processScheduledReminders, createDailyReminders };
