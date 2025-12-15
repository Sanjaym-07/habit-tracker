import React from "react";
import { markHabitComplete } from "../utils/utils";

function HabitList({ habits, setHabits }) {
  const handleCheckbox = (habitId) => {
    const today = new Date();
    markHabitComplete(habitId, today, habits, setHabits);
  }
  
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 sm:p-5 shadow-xl h-full flex flex-col min-h-0">
      <h2 className="text-lg sm:text-xl font-semibold text-sky-300 mb-3 sm:mb-4 shrink-0">Your Habits</h2>
      {habits.length === 0 ? (
        <p className="text-slate-400">No habits yet. Go add some 🚀</p>) :
        (
      <ul className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 sm:pr-2 flex-1 min-h-0 custom-scrollbar">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="flex items-center justify-between bg-slate-800 rounded-xl p-2 sm:p-3 hover:bg-sky-900/40 hover:scale-[1.01] transition-all duration-300 ease-out border border-transparent hover:border-sky-500/30"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <input
                type="checkbox"
                onChange={() => handleCheckbox(habit.id)}
                className="w-4 h-4 sm:w-5 sm:h-5 accent-sky-500 rounded-md transition duration-200"
              />
              <span className="text-base sm:text-lg font-medium truncate">{habit.title}</span>
            </div>
            <span className="text-sky-400 font-semibold flex items-center gap-1 text-sm sm:text-base">
              🔥 {habit.currentStreak}
            </span>
          </li>
        ))}
      </ul>
        )}
    </div>
  );
}

export default HabitList
