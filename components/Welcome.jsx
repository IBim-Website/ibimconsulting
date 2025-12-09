// components/Welcome.jsx
"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

export default function Welcome({ onNameSet }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="mx-auto max-w-lg w-full p-6 sm:p-8 lg:p-10 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl text-center">
      <Sparkles className="mx-auto h-12 w-12 text-gray-900 dark:text-white" />
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
        Welcome to Your Journal
      </h2>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
        What should we call you?
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="sr-only">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-4 text-base h-16 focus:border-gray-900 focus:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
            placeholder="e.g., Alex"
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 text-base font-medium text-black bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-950"
        >
          Let's Get Started
        </button>
      </form>
    </div>
  );
}