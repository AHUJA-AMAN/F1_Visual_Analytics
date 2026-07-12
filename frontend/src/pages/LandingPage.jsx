import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import WorldMap from "../components/WorldMap";
import raceData from "../constants/raceLocations.json";

const ALL_YEARS = Array.from({ length: 25 }, (_, i) => 2000 + i); // 2000-2024
const WINDOW_SIZE = 7;

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [windowStart, setWindowStart] = useState(ALL_YEARS.length - WINDOW_SIZE);

  const visibleYears = ALL_YEARS.slice(windowStart, windowStart + WINDOW_SIZE);

  const races = useMemo(() => {
    return raceData.racesByYear[selectedYear] || [];
  }, [selectedYear]);

  function handlePrev() {
    setWindowStart((s) => Math.max(0, s - 1));
  }

  function handleNext() {
    setWindowStart((s) => Math.min(ALL_YEARS.length - WINDOW_SIZE, s + 1));
  }

  function handleRaceClick(race) {
    navigate(`/race/${selectedYear}/${race.race_id}`);
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0e14] overflow-hidden">
      {/* World Map (full background) */}
      <div className="absolute inset-0">
        <WorldMap races={races} onRaceClick={handleRaceClick} />
      </div>

      {/* Floating year selector */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#121822]/90 backdrop-blur-sm border border-[#26303f] rounded-xl px-4 py-3">
        <button
          onClick={handlePrev}
          disabled={windowStart === 0}
          className="text-white/70 hover:text-white disabled:opacity-30 px-2 py-1 text-lg cursor-pointer disabled:cursor-default"
        >
          ←
        </button>

        <div className="flex gap-1">
          {visibleYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                year === selectedYear
                  ? "bg-[#e10600] text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1b2431]"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={windowStart >= ALL_YEARS.length - WINDOW_SIZE}
          className="text-white/70 hover:text-white disabled:opacity-30 px-2 py-1 text-lg cursor-pointer disabled:cursor-default"
        >
          →
        </button>
      </div>

      {/* Hint text */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm z-10">
        Select a season, then click a race pin to dive in.
      </p>
    </div>
  );
}
