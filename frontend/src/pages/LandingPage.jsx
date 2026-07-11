import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { label: "Seasons", value: "25" },
  { label: "Races", value: "500+" },
  { label: "Lap Records", value: "161K+" },
  { label: "Years of Data", value: "2000–2024" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-7xl font-bold text-white mb-4"
      >
        F1 <span className="text-[#e10600]">Visual Analytics</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 text-lg mb-12 max-w-xl"
      >
        Explore 25 seasons of Formula 1 data — standings, race results,
        lap-by-lap telemetry, and pit strategy — all queried in your browser.
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="bg-[#111111] rounded-lg p-5 min-w-[120px]"
          >
            <div className="text-3xl font-bold text-[#e10600]">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate("/season")}
        className="bg-[#e10600] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#b30500] transition-colors cursor-pointer"
      >
        Enter Dashboard
      </motion.button>
    </div>
  );
}
