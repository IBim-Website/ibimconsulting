// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Welcome from "@/components/Welcome";
import JournalDashboard from "@/components/JournalDashboard";
import MonthlyJournal from "@/components/MonthlyJournal";

// We need to share this type with multiple components
export interface IFeelingsEntry {
  feelings: string;
  situation: string;
  significance: string;
}

export interface IGoalEntry {
  details: string;
  lastMonth: "N/A" | "Hit" | "Miss";
  nextMonth: string;
}

export interface IJournalData {
  id: string; // Added ID for list key
  month: string;
  feelings: {
    familyHigh: IFeelingsEntry;
    familyLow: IFeelingsEntry;
    personalHigh: IFeelingsEntry;
    personalLow: IFeelingsEntry;
    businessHigh: IFeelingsEntry;
    businessLows: IFeelingsEntry;
  };
  personalGoals: [IGoalEntry, IGoalEntry, IGoalEntry];
  businessGoals: [IGoalEntry, IGoalEntry, IGoalEntry];
}

// --- LocalStorage Keys ---
const NAME_KEY = "journalUserName";
const IN_PROGRESS_KEY = "monthlyJournalData";
const COMPLETED_KEY = "completedJournalsList";

type View = "loading" | "welcome" | "dashboard" | "journaling";

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [view, setView] = useState<View>("loading");
  
  const [inProgressJournal, setInProgressJournal] = useState<IJournalData | null>(null);
  const [completedJournals, setCompletedJournals] = useState<IJournalData[]>([]);

  // --- Initial Data Load Effect ---
  useEffect(() => {
    const name = localStorage.getItem(NAME_KEY);
    const inProgress = localStorage.getItem(IN_PROGRESS_KEY);
    const completed = localStorage.getItem(COMPLETED_KEY);

    if (inProgress) {
      setInProgressJournal(JSON.parse(inProgress));
    }
    if (completed) {
      setCompletedJournals(JSON.parse(completed));
    }

    if (!name) {
      setView("welcome");
    } else {
      setUserName(name);
      setView("dashboard");
    }
  }, []);

  // --- Handlers ---

  const handleNameSet = (name: string) => {
    localStorage.setItem(NAME_KEY, name);
    setUserName(name);
    setView("dashboard");
  };

  const handleStartJournal = () => {
    setView("journaling");
  };

  const handleExitJournal = () => {
    setView("dashboard");
  };

  const handleCompleteJournal = (data: IJournalData) => {
    // Add a unique ID and save to completed list
    const completedJournal = { ...data, id: new Date().toISOString() };
    const newCompletedList = [completedJournal, ...completedJournals];
    
    setCompletedJournals(newCompletedList);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(newCompletedList));

    // Clear the in-progress journal
    setInProgressJournal(null);
    localStorage.removeItem(IN_PROGRESS_KEY);

    setView("dashboard");
  };

  // --- Render Logic ---

  const renderView = () => {
    switch (view) {
      case "welcome":
        return <Welcome onNameSet={handleNameSet} />;
      case "dashboard":
        return (
          <JournalDashboard
            userName={userName || ""}
            onStartJournal={handleStartJournal}
            completedJournals={completedJournals}
            hasInProgress={!!inProgressJournal}
          />
        );
      case "journaling":
        return (
          <MonthlyJournal
            userName={userName || ""}
            onCompleteJournal={handleCompleteJournal}
            onExit={handleExitJournal}
            initialData={inProgressJournal}
          />
        );
      case "loading":
      default:
        return (
          <div className="text-white">Loading...</div> // A simple loader
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-black p-4 sm:p-10 flex items-start justify-center">
      {renderView()}
    </main>
  );
}