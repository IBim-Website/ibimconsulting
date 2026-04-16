"use client";

import React from 'react';

export default function LicensingOptions({ exclude = "" }) {
  const licenses = [
    {
      title: "Monthly License",
      description: "Ideal for short-term use, this option allows you to try our product with a full monthly subscription instead of a limited trial. No transfers allowed."
    },
    {
      title: "Annual License",
      description: "A standard fixed license valid for one year. Up to three transfers are allowed per year."
    },
    {
      title: "One-Time License",
      description: "A perpetual license valid for a lifetime. Includes free updates for the first three years. Any updates beyond three years will require a minimum maintenance and incidental fee."
    },
    {
      title: "Floating License",
      description: "Allows you to install and use the license on two dedicated systems (e.g., desktop and laptop), but not simultaneously. Once you close the software on one system, the license is automatically released to use on the other. This option offers great flexibility for remote work. This is valid for one year and is available only for Packages."
    }
  ];

  return (
    <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pb-20 border-t border-blue-900/30 pt-20">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Licensing Options
          </h2>
          <p className="text-base text-blue-200/60 max-w-xl mx-auto">
            Choose the perfect plan for your short-term or long-term needs.
          </p>
        </div>
        
        {/* Static Cards Section */}
        <div className="space-y-4">
          {licenses.filter(license => license.title != exclude).map((license, index) => (
            <div 
              key={index} 
              className="group rounded-2xl border border-blue-900/40 bg-[#0A1025]/60 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-[#0A1025]/80 shadow-lg p-6"
            >
              <h3 className="text-lg text-blue-100 font-semibold mb-2 group-hover:text-cyan-300 transition-colors">
                {license.title}
              </h3>
              <p className="text-sm text-blue-200/70 leading-relaxed">
                {license.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}