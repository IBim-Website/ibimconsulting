// components/ReadOnlyJournal.tsx
import React from "react";
import dynamic from "next/dynamic";
import { IJournalData } from "@/app/page";
import { Download, Loader2 } from "lucide-react";
import JournalPdfDocument from "./JournalPdfDocument"; // Import the new PDF template

// --- CRITICAL: Dynamically import PDFDownloadLink ---
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button
        className="px-6 py-2 text-sm font-medium rounded-md shadow-sm text-gray-900 bg-transparent border border-gray-300 opacity-50 cursor-not-allowed"
        disabled
      >
        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
        Loading...
      </button>
    ),
  }
);

interface Props {
  data: IJournalData;
}

export default function ReadOnlyJournal({
  data,
  userName,
}: {
  data: IJournalData;
  userName: string | undefined;
}) {
  // ... (feelingRows constant is the same) ...
  const feelingRows = [
    { label: "Family High", data: data.feelings.familyHigh },
    { label: "Family Low", data: data.feelings.familyLow },
    { label: "Personal High", data: data.feelings.personalHigh },
    { label: "Personal Low", data: data.feelings.personalLow },
    { label: "Business High", data: data.feelings.businessHigh },
    { label: "Business Lows", data: data.feelings.businessLows },
  ];

  return (
    <div className="space-y-10">
      {/* --- UPDATED HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          Your Journal: {data.month}
        </h2>
        
        {/* --- ADDED EXPORT BUTTON --- */}
        <PDFDownloadLink
          document={<JournalPdfDocument data={data} userName={userName} />}
          fileName={`Journal - ${data.month}.pdf`}
        >
          {({ blob, url, loading, error }) => (
            <button
              className="px-6 py-2 text-sm font-medium text-black bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-950"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 inline mr-2" />
              )}
              Export to PDF
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* --- Feelings Section (Unchanged) --- */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Feelings
        </h3>
        <div className="mt-4 space-y-4">
          {feelingRows.map((row) => (
            <div key={row.label} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h4 className="font-semibold text-lg">{row.label}</h4>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Feelings:</strong> {row.data.feelings || "..."}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Situation:</strong> {row.data.situation || "..."}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Significance:</strong> {row.data.significance || "..."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Goals Sections (Unchanged) --- */}
      {[
        { title: "Personal Goals", goals: data.personalGoals },
        { title: "Business Goals", goals: data.businessGoals },
      ].map((section) => (
        <section key={section.title}>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {section.title}
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {section.goals.map((goal, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2">
                <h4 className="font-semibold text-lg">Goal #{index + 1}</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Details:</strong> {goal.details || "..."}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Last Month:</strong> {goal.lastMonth}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Next Month:</strong> {goal.nextMonth || "..."}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}