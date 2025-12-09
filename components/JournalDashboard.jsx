// components/JournalDashboard.jsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { BookMarked, Plus, ArrowRight, Download, Loader2 } from "lucide-react";
// Note: IJournalData type import removed as it's not needed in JS
import Modal from "./Modal";
import ReadOnlyJournal from "./ReadOnlyJournal";
import JournalPdfDocument from "./JournalPdfDocument"; 

// --- CRITICAL: Dynamically import PDFDownloadLink ---
// This prevents SSR errors since it needs the browser
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button className="p-2 text-gray-400" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    ),
  }
);

export default function JournalDashboard({
  userName,
  onStartJournal,
  completedJournals,
  hasInProgress,
  isAdmin = false
}) {
  const [viewingJournal, setViewingJournal] = useState(null);

  return (
    <>
      <div className="mx-auto max-w-5xl w-full p-6 sm:p-8 lg:p-10 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl">
        {/* ... (Header and CTA Button are unchanged) ... */}
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          Welcome back, {userName}.
        </h2>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">
          { isAdmin ? "Here are the completed journals from your users." : "Ready to reflect on your month?"}
        </p>
        {
          !isAdmin && (<button
          onClick={onStartJournal}
          className="mt-8 w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 text-lg font-medium text-black bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-950"
        >
          {hasInProgress ? (
            <>
              Continue Your Journal <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Start New Monthly Journal <Plus className="w-5 h-5" />
            </>
          )}
        </button>)
        }


        {/* --- Completed Journals List (UPDATED) --- */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <BookMarked className="w-7 h-7" />
            {isAdmin ? "All" : "Your"} Completed Journals
          </h3>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-800">
            {completedJournals.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                {isAdmin ? "All" : "Your"} completed journals will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {completedJournals.map((journal) => (
                  <li
                    key={journal.id}
                    // Changed from button to div
                    className="flex justify-between items-center py-4 px-2"
                  >
                    <button
                      onClick={() => setViewingJournal(journal)}
                      className="flex-1 text-left"
                    >
                      <span className="text-lg font-medium text-gray-900 dark:text-white hover:underline">
                        {journal.month} {isAdmin ? `[ ${journal?.author} ]` : ""}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      {/* --- ADDED DOWNLOAD BUTTON --- */}
                      <PDFDownloadLink
                        document={<JournalPdfDocument data={journal} userName={isAdmin ? journal?.author : userName} />}
                        fileName={`Journal - ${journal.month} [${isAdmin ? journal?.author : userName}].pdf`}
                      >
                        {({ blob, url, loading, error }) => (
                          <button
                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            title="Export to PDF"
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </PDFDownloadLink>

                      <button
                        onClick={() => setViewingJournal(journal)}
                        className="p-2 text-gray-400"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* --- Read-Only Modal --- */}
      {viewingJournal && (
        <Modal onClose={() => setViewingJournal(null)}>
          <ReadOnlyJournal data={viewingJournal} userName={userName} />
        </Modal>
      )}
    </>
  );
}