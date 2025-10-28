// components/journal-steps/StepGoals.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IGoalEntry {
  details: string;
  lastMonth: "N/A" | "Hit" | "Miss";
  nextMonth: string;
}

interface Props {
  title: string;
  icon: React.ReactNode;
  data: [IGoalEntry, IGoalEntry, IGoalEntry];
  onChange: (
    index: number,
    field: keyof IGoalEntry,
    value: string
  ) => void;
}

// Chevron Icon
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-5 h-5"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </motion.svg>
  );
}

// Accordion Variants
const accordionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    marginTop: "1.25rem",
    transition: { duration: 0.3, ease: "easeInOut" }
  },
};


export const StepGoals = ({ title, icon, data, onChange }: Props) => {
  const [openGoals, setOpenGoals] = useState<number[]>([0]);

  const toggleGoal = (index: number) => {
    setOpenGoals(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-gray-900 dark:text-white">{icon}</span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((index) => {
          const isOpen = openGoals.includes(index);
          return (
            <div key={index} className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              
              <button
                type="button"
                onClick={() => toggleGoal(index)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                  Goal #{index + 1}
                </h3>
                <ChevronIcon isOpen={isOpen} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={accordionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="px-5 pb-5"
                  >
                    <div className="space-y-5 border-t border-gray-200 dark:border-gray-700 pt-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Details
                        </label>
                        <textarea
                          rows={3}
                          value={data[index].details}
                          // --- VERIFIED THIS LINE (was e.targe.value) ---
                          onChange={(e) => onChange(index, "details", e.target.value)}
                          placeholder="Specific and measurable goal"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Month's Goal
                        </label>
                        <select
                          value={data[index].lastMonth}
                          // --- VERIFIED THIS LINE ---
                          onChange={(e) => onChange(index, "lastMonth", e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
                        >
                          <option>N/A</option>
                          <option>Hit</option>
          
                          <option>Miss</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Next Month's Goal
                        </label>
                        <textarea
                          rows={3}
                          value={data[index].nextMonth}
                          // --- VERIFIED THIS LINE ---
                          onChange={(e) => onChange(index, "nextMonth", e.target.value)}
                          placeholder="What's the next step?"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};