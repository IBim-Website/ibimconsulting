"use client";

import { useState, useCallback, useEffect } from "react";
import { LogoPill } from "./LogoPill";
import { RangeSlider } from "./RangeSlider";
import {
  SORTED_CURRENCIES,
  CATEGORIES,
  Currency,
  convertInvest,
  fmtFull,
  fmtShort,
  SHEET_URL,
} from "./data";

const CAT_TABS = [
  { key: "all", label: "🗂️ All" },
  { key: "checking", label: "✅ Checking" },
  { key: "drawing", label: "📐 Drawing" },
  { key: "precast", label: "🏗️ Precast" },
  { key: "residential", label: "🏠 Residential" },
  { key: "steel", label: "🔩 Steel" },
  { key: "warehouse", label: "🏭 Warehouse" },
];

interface Screen3Props {
  initialCurrencyIndex: number;
  initialCategoryKey: string;
  formCountry: string;
  formPackage: string;
  firstName: string;
  lastName: string;
  email: string;
  interested: string;
  phone: string;
}

export function Screen3({
  initialCurrencyIndex,
  initialCategoryKey,
  formCountry,
  formPackage,
  firstName,
  lastName,
  email,
  interested,
  phone,
}: Screen3Props) {
  const [currencyIdx, setCurrencyIdx] = useState(initialCurrencyIndex);
  const [activeCat, setActiveCat] = useState(initialCategoryKey);
  const [employees, setEmployees] = useState(1);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const cat = CATEGORIES[activeCat];
  const cur: Currency = SORTED_CURRENCIES[currencyIdx];

  const [rate, setRate] = useState(cur.rDef);
  const [hours, setHours] = useState(cat.def);
  const [weeks, setWeeks] = useState(48);

  // When currency changes, reset rate
  useEffect(() => {
    setRate(Math.min(cur.rMax, Math.max(cur.rMin, cur.rDef)));
  }, [currencyIdx]);

  // When category changes, reset hours
  useEffect(() => {
    setHours((h) => Math.max(cat.min, h < cat.def ? cat.def : h));
  }, [activeCat]);

  // ── Calculations ──
  const invest = convertInvest(cat.invest, cur.xr) * employees;
  const annHrs = hours * weeks;
  const annCost = annHrs * rate;
  const savedHrs = annHrs * 0.6;
  const remHrs = annHrs * 0.4;
  const savedVal = savedHrs * rate;
  const remCost = remHrs * rate;
  const tAnnCost = annCost * employees;
  const tSaved = savedVal * employees;
  const tRemCost = remCost * employees;
  const tHrs = annHrs * employees;
  const tSavedHrs = savedHrs * employees;
  const tRemHrs = remHrs * employees;
  const hrsMonth = Math.round(tSavedHrs / 12);
  const roi = ((tSaved - invest) / invest) * 100;
  const payWks = invest / (tSaved / weeks);

  const paybackText =
    payWks < 1
      ? "Less than 1 week"
      : payWks < 52
        ? `${Math.ceil(payWks)} week${Math.ceil(payWks) === 1 ? "" : "s"}`
        : `${(payWks / 52).toFixed(1)} years`;

  const investLabel = (() => {
    const single = convertInvest(cat.invest, cur.xr);
    return employees > 1
      ? `${cur.sym}${single.toLocaleString()} × ${employees} = ${cur.sym}${invest.toLocaleString()}`
      : `${cur.sym}${single.toLocaleString()}`;
  })();

  const annDesc =
    employees > 1
      ? `${tHrs.toLocaleString()} hrs/year across ${employees} employees at ${cur.sym}${Math.round(rate).toLocaleString()}/hr`
      : `${annHrs.toLocaleString()} hrs/year at ${cur.sym}${Math.round(rate).toLocaleString()}/hr`;

  const roiBarPct = (Math.min(Math.max(roi, 0), 2000) / 2000) * 100;
  const costBarPct = Math.min((tAnnCost / (invest * 500)) * 100, 100);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    const payload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      interested,
      phone: phone,
      country: formCountry,
      interestedPackage: formPackage,
      currency: `${cur.flag} ${cur.name} (${cur.code})`,
      package: cat.title,
      hourlyRate: cur.sym + Math.round(rate).toLocaleString(),
      manualHrs: hours,
      workingWeeks: weeks,
      employees,
      annualCost: fmtFull(tAnnCost, cur.sym),
      annualSavings: fmtShort(tSaved, cur.sym),
      hoursReclaimed: Math.round(tSavedHrs).toLocaleString() + " hrs",
      roi: Math.round(roi).toLocaleString() + "%",
      payback: paybackText,
    };
    const ghlPayload = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      interestedPackage: formPackage,
      hourlyRate: payload.hourlyRate,
      manualHoursPerWeek: payload.manualHrs,
      workingWeeks: payload.workingWeeks,
      employeeCount: employees,
      annualCost: payload.annualCost,
      anualSavings: payload.annualSavings,
      hoursReclaimed: payload.hoursReclaimed,
      roi: payload.roi,
      paybackPeriod: payload.payback,
    };
    const response = await fetch("/api/roi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ghlPayload),
    });

    const data = await response.json();
    //Save roi information on googlesheet
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch {
      setSaveStatus("error");
    }
  }, [
    cur,
    cat,
    rate,
    hours,
    weeks,
    employees,
    tAnnCost,
    tSaved,
    tSavedHrs,
    roi,
    paybackText,
    formCountry,
    formPackage,
  ]);

  const selectClass =
    "appearance-none bg-[#161f2b] border border-[#2a3d55] rounded-xl text-[#eaf4ff] text-sm font-semibold py-2 pl-3 pr-8 outline-none cursor-pointer hover:border-[#1a9fd4] focus:border-[#1a9fd4] transition-colors";

  return (
    <div className="min-h-screen bg-[#0c1117] text-[#eaf4ff]">
      {/* Hero */}
      <div className="text-center px-5 pt-9 pb-7 bg-gradient-to-b from-[#0e151e] to-[#0c1117] border-b border-[#1e2d42]">
        <LogoPill />
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
          What Is Manual Work{" "}
          <em className="not-italic text-[#4dc8f0]">Really</em>
          <br />
          Costing You?
        </h1>
        <p className="text-[#c0d8f0] text-sm max-w-md mx-auto">
          Adjust the sliders to match your situation. See exactly how much time
          and money IBim automation puts back in your pocket.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#111920] border-b border-[#1e2d42] px-5 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] whitespace-nowrap">
              Region &amp; Currency
            </span>
            <div className="relative">
              <select
                className={selectClass}
                style={{ minWidth: 210 }}
                value={currencyIdx}
                onChange={(e) => setCurrencyIdx(Number(e.target.value))}
              >
                {SORTED_CURRENCIES.map((c, i) => (
                  <option key={i} value={i}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#4dc8f0] text-xs">
                ▾
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#1a9fd4]/13 border border-[#1a9fd4]/35 rounded-full px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4dc8f0]">
            <span className="w-2 h-2 rounded-full bg-[#4dc8f0] animate-pulse" />
            Tekla Automation ROI
          </div>

          <div className="bg-[#e8a020]/12 border border-[#e8a020]/30 rounded-lg px-4 py-1.5 text-sm text-[#f5b93a] font-bold whitespace-nowrap">
            Package Investment:{" "}
            <span className="text-[#fdd878]">{investLabel}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-5xl mx-auto px-5 pt-5 pb-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] mb-3">
          Select your work category
        </div>
        <div className="flex flex-wrap gap-2">
          {CAT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCat(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeCat === tab.key
                  ? "bg-[#1a9fd4]/20 border-[#1a9fd4] text-[#7dd8f5]"
                  : "bg-[#111920] border-[#1e2d42] text-[#c0d8f0] hover:border-[#1a9fd4] hover:text-[#4dc8f0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context Box */}
      <div className="max-w-5xl mx-auto px-5 mt-3">
        <div className="bg-[#161f2b] border border-[#2a3d55] border-l-[3px] border-l-[#1a9fd4] rounded-xl px-4 py-3">
          <strong className="block text-[#7dd8f5] text-sm mb-1">
            {cat.title}
          </strong>
          <p className="text-[#c0d8f0] text-xs leading-relaxed">{cat.body}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-5 mt-4 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left: Inputs */}
        <div className="bg-[#111920] border border-[#1e2d42] rounded-2xl p-6">
          <SectionTitle>Your Numbers</SectionTitle>

          {/* Hourly Rate */}
          <SliderGroup
            label="Hourly Rate"
            displayValue={`${cur.sym}${Math.round(rate).toLocaleString()}`}
            minLabel={`${cur.sym}${cur.rMin.toLocaleString()}`}
            maxLabel={`${cur.sym}${cur.rMax.toLocaleString()}`}
          >
            <RangeSlider
              min={cur.rMin}
              max={cur.rMax}
              step={5}
              value={rate}
              onChange={setRate}
            />
          </SliderGroup>

          {/* Hours */}
          <SliderGroup
            label={cat.lbl}
            displayValue={`${hours}h`}
            minLabel={`${cat.min}h`}
            maxLabel="60h"
          >
            <RangeSlider
              min={cat.min}
              max={60}
              step={1}
              value={hours}
              onChange={setHours}
            />
          </SliderGroup>

          {/* Weeks */}
          <SliderGroup
            label="Working Weeks / Year"
            displayValue={`${weeks}`}
            minLabel="20"
            maxLabel="52"
          >
            <RangeSlider
              min={20}
              max={52}
              step={1}
              value={weeks}
              onChange={setWeeks}
            />
          </SliderGroup>

          {/* Employees */}
          <div className="mt-5 pt-5 border-t border-[#1e2d42]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c0d8f0]">
                Number of Employees
              </span>
              <div className="flex items-center">
                <button
                  onClick={() => setEmployees((e) => Math.max(1, e - 1))}
                  className="w-9 h-9 bg-[#161f2b] border border-[#2a3d55] rounded-l-lg text-[#4dc8f0] font-bold text-lg flex items-center justify-center hover:bg-[#1a9fd4]/15 hover:border-[#1a9fd4] transition-all"
                >
                  −
                </button>
                <div className="w-14 h-9 bg-[#1e2a3a] border-t border-b border-[#2a3d55] text-[#eaf4ff] text-xl font-black flex items-center justify-center">
                  {employees}
                </div>
                <button
                  onClick={() => setEmployees((e) => Math.min(200, e + 1))}
                  className="w-9 h-9 bg-[#161f2b] border border-[#2a3d55] rounded-r-lg text-[#4dc8f0] font-bold text-lg flex items-center justify-center hover:bg-[#1a9fd4]/15 hover:border-[#1a9fd4] transition-all"
                >
                  +
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[#5a7a96] mt-2">
              ROI and savings scale with your team size.
            </p>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-3">
          {/* Annual Cost */}
          <div className="bg-[#161f2b] border border-[#2a3d55] rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] mb-1">
              Annual Cost of Manual Work
            </div>
            <div className="text-4xl font-black text-[#eaf4ff] leading-none mb-1">
              {fmtFull(tAnnCost, cur.sym)}
            </div>
            <div className="text-xs text-[#c0d8f0] mb-3">{annDesc}</div>
            <div className="h-1 bg-[#1e2d42] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1a9fd4] to-[#4dc8f0] rounded-full transition-all duration-500"
                style={{ width: `${costBarPct}%` }}
              />
            </div>
          </div>

          {/* Savings + Hours */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox color="green">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#52e096] mb-1">
                Annual Savings
              </div>
              <div className="text-2xl font-black text-[#2ec87a] leading-none mb-1">
                {fmtShort(tSaved, cur.sym)}
              </div>
              <div className="text-[10px] text-[#c0d8f0]">
                With 60% automation
              </div>
            </StatBox>
            <StatBox color="blue">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#4dc8f0] mb-1">
                Hours Reclaimed
              </div>
              <div className="text-2xl font-black text-[#4dc8f0] leading-none mb-1">
                {Math.round(tSavedHrs).toLocaleString()} hrs
              </div>
              <div className="text-[10px] text-[#c0d8f0]">
                {hrsMonth} hrs/month freed up
              </div>
            </StatBox>
          </div>

          {/* Before vs After */}
          <div className="bg-[#161f2b] border border-[#2a3d55] rounded-2xl p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8] mb-4">
              Before vs. After Automation
            </div>

            <BvaSection label="Hours Per Year on Manual Tasks">
              <BvaBar
                tag="BEFORE"
                tagColor="red"
                value={tHrs.toLocaleString() + " hrs"}
                pct={100}
                variant="before"
              />
              <BvaBar
                tag="AFTER"
                tagColor="green"
                value={Math.round(tRemHrs).toLocaleString() + " hrs"}
                pct={40}
                variant="after"
              />
            </BvaSection>

            <BvaSection label="Annual Cost (All Employees)">
              <BvaBar
                tag="BEFORE"
                tagColor="red"
                value={fmtShort(tAnnCost, cur.sym)}
                pct={100}
                variant="before"
              />
              <BvaBar
                tag="AFTER"
                tagColor="green"
                value={fmtShort(tRemCost, cur.sym)}
                pct={40}
                variant="after"
              />
            </BvaSection>
          </div>

          {/* ROI Strip */}
          <div className="bg-gradient-to-br from-[#10152a] to-[#0b1a12] border border-[#64003c]/30 rounded-2xl p-5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f5b93a] mb-2">
              📈 Return on Investment
            </div>
            <div className="text-xs text-[#c0d8f0] mb-2">
              IBim Package:{" "}
              <strong className="text-[#fdd878]">{investLabel}</strong> ·
              Employees: <strong className="text-[#fdd878]">{employees}</strong>
            </div>
            <div className="text-5xl font-black text-[#fdd878] leading-none mb-1 tracking-tight">
              {Math.round(roi).toLocaleString()}%
            </div>
            <div className="text-xs text-[#c0d8f0] mb-3">
              Estimated ROI on your total IBim investment
            </div>
            <div className="inline-block bg-[#e8a020]/10 border border-[#e8a020]/28 rounded-full px-4 py-1 text-xs text-[#c0d8f0] mb-3">
              Payback in{" "}
              <strong className="text-[#f5b93a]">{paybackText}</strong>
            </div>
            <div className="h-2 bg-[#1e2d42] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#e8a020] to-[#2ec87a] rounded-full transition-all duration-500"
                style={{ width: `${roiBarPct}%` }}
              />
            </div>
            <div className="text-[10px] text-[#5a7a96]">
              Bar scales to 2,000% ROI · 60% automation · Investment scales per
              employee
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="max-w-5xl mx-auto px-5 mb-4">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving" || saveStatus === "saved"}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              saveStatus === "saved"
                ? "bg-[#2ec87a] text-[#0c1117]"
                : "bg-gradient-to-r from-[#2ec87a] to-[#1a9a55] text-[#0c1117] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(46,200,122,0.25)]"
            }`}
        >
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "saved"
              ? "✅ Saved!"
              : "💾 Save My Results"}
        </button>
        {saveStatus === "saved" && (
          <p className="text-center text-sm text-[#2ec87a] mt-2">
            ✅ The ROI result will be sent to your email.
          </p>
        )}
        {saveStatus === "error" && (
          <p className="text-center text-sm text-[#e05060] mt-2">
            ⚠️ Could not save. Please try again or contact us directly.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-5 mb-10">
        <div className="bg-[#111920] border border-[#2a3d55] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#eaf4ff] mb-1">
              Ready to stop paying for manual work?
            </h3>
            <p className="text-xs text-[#c0d8f0]">
              Explore IBim's Tekla automation tools and packages — purpose-built
              for steel and precast detailing businesses.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/packages"
              className="bg-[#e8a020] hover:bg-[#f5b93a] text-[#0c1117] font-black text-sm px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
            >
              View Packages →
            </a>
            <a
              href="/tools"
              className="bg-transparent border border-[#1a9fd4] text-[#4dc8f0] font-black text-sm px-5 py-2.5 rounded-xl transition-all hover:bg-[#1a9fd4]/10 hover:-translate-y-0.5"
            >
              Browse Tools →
            </a>
          </div>
        </div>
        <p className="text-center text-[#5a7a96] text-[10px] mt-3 leading-relaxed">
          ibimconsulting.com.au · 📞 0406 860 078 · info@ibimconsulting.com.au
          <br />
          Results are illustrative estimates based on a 60% automation
          reduction. All future tools included at no extra cost.
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a9ab8]">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#1e2d42]" />
    </div>
  );
}

function SliderGroup({
  label,
  displayValue,
  minLabel,
  maxLabel,
  children,
}: {
  label: string;
  displayValue: string;
  minLabel: string;
  maxLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#c0d8f0]">
          {label}
        </span>
        <span className="text-2xl font-black text-[#eaf4ff]">
          {displayValue}
        </span>
      </div>
      {children}
      <div className="flex justify-between text-[10px] text-[#5a7a96] mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function StatBox({
  color,
  children,
}: {
  color: "green" | "blue";
  children: React.ReactNode;
}) {
  const cls =
    color === "green"
      ? "bg-[#2ec87a]/7 border-[#2ec87a]/22"
      : "bg-[#1a9fd4]/7 border-[#1a9fd4]/22";
  return <div className={`${cls} border rounded-xl p-4`}>{children}</div>;
}

function BvaSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-[11px] font-semibold text-[#c0d8f0] mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function BvaBar({
  tag,
  tagColor,
  value,
  pct,
  variant,
}: {
  tag: string;
  tagColor: "red" | "green";
  value: string;
  pct: number;
  variant: "before" | "after";
}) {
  const tagCls = tagColor === "red" ? "text-[#e05060]" : "text-[#52e096]";
  const valCls = tagColor === "red" ? "text-[#e05060]" : "text-[#52e096]";
  const barCls =
    variant === "before"
      ? "bg-gradient-to-r from-[#c03040] to-[#e05060]"
      : "bg-gradient-to-r from-[#1a9a55] to-[#2ec87a]";
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className={`text-[10px] font-bold w-10 text-right ${tagCls}`}>
        {tag}
      </span>
      <div className="flex-1 bg-[#1e2d42] rounded h-2 overflow-hidden">
        <div
          className={`${barCls} h-full rounded transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[11px] font-bold min-w-[70px] ${valCls}`}>
        {value}
      </span>
    </div>
  );
}
