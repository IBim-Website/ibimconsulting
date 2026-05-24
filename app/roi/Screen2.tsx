"use client";

import { useState } from "react";
import { LogoPill } from "./LogoPill";
import { SORTED_CURRENCIES, PACKAGE_OPTIONS } from "./data";

interface Screen2Props {
  defaultCurrencyIndex?: number;
  onLaunch: (currencyIndex: number, packageKey: string, packageLabel: string, countryLabel: string) => void;
}

export function Screen2({ defaultCurrencyIndex = 0, onLaunch }: Screen2Props) {
  const [currencyIdx, setCurrencyIdx] = useState(defaultCurrencyIndex);
  const [packageKey, setPackageKey] = useState("all");

  const countryLabel = `${SORTED_CURRENCIES[currencyIdx].flag} ${SORTED_CURRENCIES[currencyIdx].name} (${SORTED_CURRENCIES[currencyIdx].code})`;
  const packageLabel = PACKAGE_OPTIONS.find((p) => p.value === packageKey)?.label ?? "";

  const selectClass =
    "w-full bg-[#161f2b] border border-[#2a3d55] rounded-xl text-[#eaf4ff] text-sm font-semibold px-4 py-3 appearance-none outline-none cursor-pointer focus:border-[#1a9fd4] transition-colors";

  return (
    <div className="min-h-screen bg-[#0c1117] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <LogoPill />
        <h2 className="text-2xl font-black text-[#eaf4ff] mb-2">
          Confirm Your Details
        </h2>
        <p className="text-[#c0d8f0] text-sm mb-7">
          Confirm or adjust your selections below. These will pre-configure your
          ROI Calculator for the most accurate results.
        </p>

        <div className="bg-[#111920] border border-[#1e2d42] rounded-2xl p-7 text-left mb-6">
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] mb-2">
              Your Country / Region
            </label>
            <div className="relative">
              <select
                className={selectClass}
                value={currencyIdx}
                onChange={(e) => setCurrencyIdx(Number(e.target.value))}
              >
                {SORTED_CURRENCIES.map((c, i) => (
                  <option key={i} value={i}>
                    {c.flag}  {c.name}  ({c.code})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4dc8f0] text-xs">▾</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] mb-2">
              Package You're Interested In
            </label>
            <div className="relative">
              <select
                className={selectClass}
                value={packageKey}
                onChange={(e) => setPackageKey(e.target.value)}
              >
                {PACKAGE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4dc8f0] text-xs">▾</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onLaunch(currencyIdx, packageKey, packageLabel, countryLabel)}
          className="inline-flex items-center gap-2 bg-[#1a9fd4] hover:bg-[#4dc8f0] text-[#0c1117] font-black text-base px-10 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Launch Calculator →
        </button>
      </div>
    </div>
  );
}
