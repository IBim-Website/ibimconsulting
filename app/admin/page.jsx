// app/admin/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase"; 

// Re-using your existing component
import JournalDashboard from "@/components/JournalDashboard";

export default function AdminPage() {
  // --- State: Auth ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- State: Data ---
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. Login Handler ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      fetchSubmissions();
    } else {
      alert("Invalid credentials");
    }
  };

  // --- 2. Data Fetching ---
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const journalsRef = collection(db, "mp_journals");
      // Get newest first
      const q = query(journalsRef, orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      
      const fetchedData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure dates are strings/objects compatible with your component
            // If your component expects an ISO string like localStorage had:
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        };
      });

      setSubmissions(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render: Login Screen ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- Render: Admin Dashboard using JournalDashboard Component ---
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-black p-4 sm:p-10 flex flex-col items-center">
      
      {/* Admin Header controls (Logout) */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4">
        <span className="text-gray-500 text-sm">Viewing {submissions.length} submissions</span>
        <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-red-500 hover:text-red-400 text-sm font-bold"
        >
            Logout
        </button>
      </div>

      {isLoading ? (
        <div className="text-white mt-10">Loading Admin Data...</div>
      ) : (
        <JournalDashboard
            userName="Admin" 
            onStartJournal={() => alert("You are in Admin View (View Only)")} 
            completedJournals={submissions} // <--- Firestore data goes here
            hasInProgress={false} 
            isAdmin={true}
        />
      )}
    </main>
  );
}