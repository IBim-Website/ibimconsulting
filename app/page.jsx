// app/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from "@/lib/firebase"; 

import Welcome from "@/components/Welcome";
import JournalDashboard from "@/components/JournalDashboard";
import MonthlyJournal from "@/components/MonthlyJournal";

const NAME_KEY = "journalUserName";
const IN_PROGRESS_KEY = "monthlyJournalData";
const COMPLETED_KEY = "completedJournalsList";

export default function Home() {
  const [userName, setUserName] = useState(null);
  const [view, setView] = useState("loading");
  
  const [inProgressJournal, setInProgressJournal] = useState(null);
  const [completedJournals, setCompletedJournals] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // Optional: Add loading state for saving

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

  const handleNameSet = (name) => {
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

  // --- UPDATED HANDLER ---
  const handleCompleteJournal = async (data) => {
    console.log("1. Handler started. Data received:", data); // STEP 1

    setIsSaving(true);
    
    try {
      console.log("2. Attempting to save to Firestore..."); // STEP 2
      
      const journalEntry = { 
        ...data, 
        author: userName,
        createdAt: serverTimestamp(),
        savedAtLocal: new Date().toISOString()
      };

      console.log("3. DB Object ready", journalEntry); // STEP 3

      console.log({ firebaseConfig })

      // THIS IS WHERE IT USUALLY HANGS
      const docRef = await addDoc(collection(db, "mp_journals"), journalEntry);

      console.log("4. SUCCESS! ID:", docRef.id); // STEP 4

      // Update Local State
      const completedJournalLocal = { ...journalEntry, id: docRef.id };
      const newCompletedList = [completedJournalLocal, ...completedJournals];
      
      setCompletedJournals(newCompletedList);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(newCompletedList));

      setInProgressJournal(null);
      localStorage.removeItem(IN_PROGRESS_KEY);

      setView("dashboard");
    } catch (e) {
      console.error("❌ ERROR CAUGHT:", e); // LOOK HERE
      alert(`Error: ${e.message}`);
    } finally {
      console.log("exiting..")
      setIsSaving(false);
    }
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
            // You might want to pass isSaving to show a spinner on the submit button
            isSaving={isSaving} 
          />
        );
      case "loading":
      default:
        return (
          <div className="text-white">Loading...</div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-black p-4 sm:p-10 flex items-start justify-center">
      {renderView()}
    </main>
  );
}