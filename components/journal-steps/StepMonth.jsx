// components/journal-steps/StepMonth.jsx
import React from "react";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

export const StepMonth = ({ userName, monthValue, onMonthChange, icon }) => {
  const [selectedMonth, selectedYear] = monthValue.split(" ");

  const handleMonthSelect = (e) => {
    const year = selectedYear || currentYear;
    onMonthChange(`${e.target.value} ${year}`);
  };

  const handleYearSelect = (e) => {
    const month = selectedMonth || months[0];
    onMonthChange(`${month} ${e.target.value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-gray-900 dark:text-white">{icon}</span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          Monthly Update
        </h2>
      </div>

      <p className="text-xl text-gray-600 dark:text-gray-300">
        Let's start your reflection, <strong className="text-gray-800 dark:text-gray-100">{userName}</strong>.
        Which month are you journaling for?
      </p>

      <div className="flex flex-col sm:flex-row sm:items-end gap-6 max-w-lg">
        <div className="flex-1">
          <label
            htmlFor="month"
            className="block text-base font-medium text-gray-700 dark:text-gray-300"
          >
            Month
          </label>
          <select
            id="month"
            name="month"
            value={selectedMonth || ""}
            onChange={handleMonthSelect}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-4 text-base h-16 focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
            autoFocus
          >
            <option value="" disabled>
              Select a month
            </option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="year"
            className="block text-base font-medium text-gray-700 dark:text-gray-300"
          >
            Year
          </label>
          <select
            id="year"
            name="year"
            value={selectedYear || ""}
            onChange={handleYearSelect}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-4 text-base h-16 focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          >
            <option value="" disabled>
              Select a year
            </option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};