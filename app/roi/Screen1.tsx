"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { LogoPill } from "./LogoPill";
import { COUNTRIES } from "./data";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  interested: string;
  phone: string;
}

interface Screen1Props {
  onSubmit: (data: FormData) => void;
}

const INTERESTS = ["Automation/Tool", "Training", "Consulting"];

function validate(data: FormData): Partial<Record<keyof FormData, string>> {
  const errs: Partial<Record<keyof FormData, string>> = {};
  if (!data.firstName.trim()) errs.firstName = "Required";
  if (!data.lastName.trim()) errs.lastName = "Required";
  if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    errs.email = "Valid email required";
  if (!data.country) errs.country = "Please select a country";
  if (!data.interested) errs.interested = "Please select an interest";
  if (!data.phone.trim()) errs.phone = "Required";
  return errs;
}

export function Screen1({ onSubmit }: Screen1Props) {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    interested: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});

  function handleChange(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) {
      const errs = validate({ ...form, [field]: value });
      setErrors((e) => ({ ...e, [field]: errs[field] }));
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate(form);
    setErrors((e) => ({ ...e, [field]: errs[field] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(form).map((k) => [k, true]),
    ) as Record<keyof FormData, boolean>;
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(form);
  }

  const inputBase =
    "w-full h-13 px-4 py-3 rounded-sm text-sm text-[#eaf4ff] bg-[#111920] border border-[#1e2d42] outline-none focus:border-[#1a9fd4] focus:ring-2 focus:ring-[#1a9fd4]/20 transition-all placeholder-[#5a7a96]";
  const selectBase =
    "w-full h-13 px-4 py-3 rounded-sm text-sm text-[#eaf4ff] bg-[#111920] border border-[#1e2d42] outline-none focus:border-[#1a9fd4] focus:ring-2 focus:ring-[#1a9fd4]/20 transition-all appearance-none cursor-pointer";

  return (
    <div className="relative">
      <div className="absolute top-8 left-6 md:left-12 z-50">
        <a
          href="/packages"
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 border border-blue-800/30 text-blue-200/70 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-md"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-semibold tracking-wide">
            Go to Packages
          </span>
        </a>
      </div>
      <div className="min-h-screen bg-[#0c1117] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl text-center">
          <LogoPill />
          <h1 className="text-3xl sm:text-4xl font-black text-[#eaf4ff] mb-3 leading-tight">
            Unlock Your{" "}
            <em className="not-italic text-[#4dc8f0]">ROI Calculator</em>
          </h1>
          <p className="text-[#c0d8f0] text-sm mb-8 mx-auto">
            Fill in the form below to get instant access to our Tekla Automation
            ROI Calculator <br />
            and discover how much time and money you could save.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-[#0c1117] border-2 border-[#0b2a5b] rounded-xl p-7 sm:p-9 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <Field label="First Name" error={errors.firstName}>
                <input
                  required
                  className={inputBase}
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="IBim"
                />
              </Field>

              {/* Last Name */}
              <Field label="Last Name" error={errors.lastName}>
                <input
                  required
                  className={inputBase}
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Consulting"
                />
              </Field>

              {/* Email */}
              <Field label="Email" error={errors.email}>
                <input
                  required
                  type="email"
                  className={inputBase}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="info@mail.ibimconsulting.com.au"
                  autoComplete="email"
                />
              </Field>

              {/* Country */}
              <Field label="Country" error={errors.country}>
                <div className="relative">
                  <select
                    required
                    className={selectBase}
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    onBlur={() => handleBlur("country")}
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4dc8f0] text-xs">
                    ▾
                  </span>
                </div>
              </Field>

              {/* Interested In */}
              <Field label="Interested In" error={errors.interested}>
                <div className="relative">
                  <select
                    required
                    className={selectBase}
                    value={form.interested}
                    onChange={(e) => handleChange("interested", e.target.value)}
                    onBlur={() => handleBlur("interested")}
                  >
                    <option value="" disabled>
                      Select interest
                    </option>
                    {INTERESTS.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4dc8f0] text-xs">
                    ▾
                  </span>
                </div>
              </Field>

              {/* Phone */}
              <Field label="Phone" error={errors.phone}>
                <input
                  required
                  type="tel"
                  className={inputBase}
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="040 686 0078"
                  autoComplete="tel"
                />
              </Field>
            </div>

            <div className="mt-7 flex justify-center">
              <button
                disabled={
                  !form.firstName ||
                  !form.lastName ||
                  !form.email ||
                  !form.country ||
                  !form.interested ||
                  !form.phone
                }
                type="submit"
                className="w-full max-w-xl h-14 bg-[#e8a020] hover:bg-[#f5b93a] text-[#0c1117] font-black text-xl rounded-full transition-all duration-150 active:scale-[0.98]"
              >
                Get My Free ROI Calculator →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-[#7a9ab8] mb-2 font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-[#e05060]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
