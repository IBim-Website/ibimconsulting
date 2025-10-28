// components/journal-steps/StepFeeling.tsx
import React from "react";

interface IFeelingsEntry {
  feelings: string;
  situation: string;
  significance: string;
}

// --- 1. This "Props" interface is correct ---
// It expects a 2-argument function for onChange
interface Props {
  title: string;
  icon: React.ReactNode;
  data: IFeelingsEntry;
  onChange: (field: keyof IFeelingsEntry, value: string) => void;
}

export const StepFeeling = ({ title, icon, data, onChange }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-gray-900 dark:text-white">{icon}</span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Feelings
        </label>
        <input
          type="text"
          placeholder="Single words: Joy, sad, happy..."
          value={data.feelings}
          // --- 2. This call is correct ---
          // It calls the 2-argument prop
          onChange={(e) => onChange("feelings", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
          autoFocus
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Situation
        </label>
        <textarea
          rows={3}
          placeholder="One sentence: What caused this?"
          value={data.situation}
          // --- 2. This call is correct ---
          onChange={(e) => onChange("situation", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Significance
        </label>
        <textarea
          rows={3}
          placeholder="How was this personally significant?"
          value={data.significance}
          // --- 2. This call is correct ---
          onChange={(e) => onChange("significance", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 sm:text-base focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-white dark:focus:ring-white"
        />
      </div>
    </div>
  );
};