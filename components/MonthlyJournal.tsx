// components/MonthlyJournal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays, Heart, HeartOff, Sparkles, CloudRain,
  TrendingUp, TrendingDown, Target, Briefcase,
} from "lucide-react";

import { IJournalData, IFeelingsEntry, IGoalEntry } from "@/app/page";
import { StepMonth } from "./journal-steps/StepMonth";
import { StepFeeling } from "./journal-steps/StepFeeling";
import { StepGoals } from "./journal-steps/StepGoals";

interface Props {
  userName: string;
  initialData: IJournalData | null;
  onCompleteJournal: (data: IJournalData) => void;
  onExit: () => void;
}

const IN_PROGRESS_KEY = "monthlyJournalData";

const createEmptyGoal = (): IGoalEntry => ({
  details: "", lastMonth: "N/A", nextMonth: "",
});

const initialState: Omit<IJournalData, 'id'> = {
  month: "",
  feelings: {
    familyHigh: { feelings: "", situation: "", significance: "" },
    familyLow: { feelings: "", situation: "", significance: "" },
    personalHigh: { feelings: "", situation: "", significance: "" },
    personalLow: { feelings: "", situation: "", significance: "" },
    businessHigh: { feelings: "", situation: "", significance: "" },
    businessLows: { feelings: "", situation: "", significance: "" },
  },
  personalGoals: [createEmptyGoal(), createEmptyGoal(), createEmptyGoal()],
  businessGoals: [createEmptyGoal(), createEmptyGoal(), createEmptyGoal()],
};

const feelingSteps: Array<{
  key: keyof IJournalData["feelings"];
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "familyHigh", label: "Family High", icon: <Heart className="w-8 h-8" /> },
  { key: "familyLow", label: "Family Low", icon: <HeartOff className="w-8 h-8" /> },
  { key: "personalHigh", label: "Personal High", icon: <Sparkles className="w-8 h-8" /> },
  { key: "personalLow", label: "Personal Low", icon: <CloudRain className="w-8 h-8" /> },
  { key: "businessHigh", label: "Business High", icon: <TrendingUp className="w-8 h-8" /> },
  { key: "businessLows", label: "Business Lows", icon: <TrendingDown className="w-8 h-8" /> },
];

const TOTAL_STEPS = 1 + feelingSteps.length + 2;

export default function MonthlyJournal({
  userName,
  initialData,
  onCompleteJournal,
  onExit,
}: Props) {
  const [journalData, setJournalData] = useState<Omit<IJournalData, 'id'>>(
    initialData || initialState
  );
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (initialData && journalData === initialState) {
      return;
    }
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(journalData));
  }, [journalData, initialData]);

  const handleMonthChange = (value: string) => {
    setJournalData((prev) => ({ ...prev, month: value }));
  };

  // --- This is the 3-argument function ---
  const handleFeelingChange = (
    key: keyof IJournalData["feelings"],
    field: keyof IFeelingsEntry,
    value: string
  ) => {
    setJournalData((prev) => ({
      ...prev,
      feelings: {
        ...prev.feelings,
        [key]: {
          ...prev.feelings[key],
          [field]: value,
        },
      },
    }));
  };

  const handleGoalChange = (
    goalType: "personalGoals" | "businessGoals",
    index: number,
    field: keyof IGoalEntry,
    value: string
  ) => {
    setJournalData((prev) => {
      const newGoals = [...prev[goalType]] as [IGoalEntry, IGoalEntry, IGoalEntry];
      newGoals[index] = { ...newGoals[index], [field]: value };
      return { ...prev, [goalType]: newGoals };
    });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const progressPercentage = (currentStep / (TOTAL_STEPS - 1)) * 100;

  // --- THE FIX IS HERE ---
  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <StepMonth
          userName={userName}
          monthValue={journalData.month}
          onMonthChange={handleMonthChange}
          icon={<CalendarDays className="w-8 h-8" />}
        />
      );
    }
    if (currentStep > 0 && currentStep <= feelingSteps.length) {
      const stepConfig = feelingSteps[currentStep - 1];
      return (
        <StepFeeling
          title={stepConfig.label}
          icon={stepConfig.icon}
          data={journalData.feelings[stepConfig.key]}
          // --- THIS IS THE FIX ---
          // We pass a NEW 2-argument function that calls
          // our 3-argument "handleFeelingChange" function
          // with the missing "key" from stepConfig.
          onChange={(field, value) =>
            handleFeelingChange(stepConfig.key, field, value)
          }
        />
      );
    }
    if (currentStep === 7) {
      return (
        <StepGoals
          title="Personal Goals"
          icon={<Target className="w-8 h-8" />}
          data={journalData.personalGoals}
          onChange={(index, field, value) =>
            handleGoalChange("personalGoals", index, field, value)
          }
        />
      );
    }
    if (currentStep === 8) {
      return (
        <StepGoals
          title="Business Goals"
          icon={<Briefcase className="w-8 h-8" />}
          data={journalData.businessGoals}
          onChange={(index, field, value) =>
            handleGoalChange("businessGoals", index, field, value)
          }
        />
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-5xl w-full p-6 sm:p-8 lg:p-10 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl overflow-hidden">
      {/* (Rest of the file is the same) */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-8">
        <motion.div
          className="bg-gray-900 dark:bg-white h-2 rounded-full"
          style={{ width: `${progressPercentage}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-between">
          <button
            onClick={currentStep === 0 ? onExit : prevStep}
            className="px-6 py-2 text-sm font-medium rounded-md shadow-sm text-gray-900 bg-transparent border border-gray-300 hover:bg-gray-100 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {currentStep === 0 ? "Back to Dashboard" : "Previous"}
          </button>

          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 text-sm font-medium text-black bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-950"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => onCompleteJournal(journalData as IJournalData)}
              className="px-6 py-2 text-sm font-medium text-black bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-950"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}