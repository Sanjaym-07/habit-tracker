export const isHabitDue = (habit, date) => {
    if (!habit || !habit.freq) return false;
    switch (habit.freq.mode) {
      case "Daily":
        return true; 
      case "Weekly":
        return habit.freq.days.includes(date.getDay());
      case "Custom":
        return habit.freq.days.includes(date.getDay());
      default:
        return false;
    }
  }

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN");
}

export const markHabitComplete = (habitId, date, habits, setHabits) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const dateInStr = date.toISOString().split("T")[0];
    if (!habit.progress.includes(dateInStr)) habit.progress.push(dateInStr);
    
    if (!habit.lastCompleted) {
    habit.currentStreak = 1;
    } else {
        const lastDate = new Date(habit.lastCompleted);
        const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));

        if (habit.freq.mode === "Daily") {
          habit.currentStreak = diffDays === 1 ? habit.currentStreak + 1 : 1;
        } else if (habit.freq.mode === "Weekly" || habit.freq.mode === "Custom") {
          const scheduled = habit.freq.days;
          const lastDayIndex = scheduled.indexOf(lastDate.getDay());
          const nextIndex = (lastDayIndex + 1) % scheduled.length;
          const nextScheduledDay = scheduled[nextIndex];

          habit.currentStreak = date.getDay() === nextScheduledDay ? habit.currentStreak + 1 : 1;
        } else {
          habit.currentStreak = 1;
        }
      }

    if (habit.currentStreak > habit.highestStreak) habit.highestStreak = habit.currentStreak;
    habit.lastCompleted = dateInStr;
    setHabits([...habits]);
  }
