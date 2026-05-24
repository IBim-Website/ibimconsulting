"use client";

import { useEffect, useRef } from "react";

interface RangeSliderProps {
  id?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export function RangeSlider({ id, min, max, step = 1, value, onChange }: RangeSliderProps) {
  const ref = useRef<HTMLInputElement>(null);

  function updateTrack(v: number) {
    if (!ref.current) return;
    const pct = ((v - min) / (max - min)) * 100;
    ref.current.style.background = `linear-gradient(to right, #1a9fd4 ${pct}%, #1e2d42 ${pct}%)`;
  }

  useEffect(() => updateTrack(value), [value, min, max]);

  return (
    <input
      ref={ref}
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => {
        const v = Number(e.target.value);
        updateTrack(v);
        onChange(v);
      }}
      className="w-full h-[5px] rounded-full outline-none cursor-pointer appearance-none
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px]
        [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-[#4dc8f0] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(77,200,240,0.18)]
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px]
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4dc8f0]
        [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
    />
  );
}
