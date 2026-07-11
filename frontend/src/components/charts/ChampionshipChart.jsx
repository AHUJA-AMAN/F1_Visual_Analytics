import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { getTeamColor } from "../../constants/f1Colors";

/**
 * ChampionshipChart
 * Cumulative points trajectory for every driver across a season's rounds.
 *
 * Expected input prop `data` — rows from `standings.csv` (DuckDB-WASM query
 * result), one row per driver per round:
 * @param {Object} props
 * @param {Array<{
 *   season: number,
 *   round: number,
 *   driver: string,            // e.g. "max_verstappen"
 *   constructor: string,       // e.g. "Red Bull" — used directly for line colour
 *   points: number,            // points scored that round
 *   cumulative_points: number, // running total, already computed upstream
 *   position: number           // championship position after this round
 * }>} props.data
 * @param {string[]} [props.highlightDrivers] - if provided, only these drivers render at
 *   full opacity; everyone else is dimmed (used to compare specific championship battles).
 */
export default function ChampionshipChart({ data, highlightDrivers = null }) {
  const [hiddenDrivers, setHiddenDrivers] = useState(new Set());

  const { pivoted, drivers, driverConstructor } = useMemo(() => {
    const driverConstructor = new Map();
    const driverSet = new Set();
    for (const row of data) {
      driverSet.add(row.driver);
      if (!driverConstructor.has(row.driver)) {
        driverConstructor.set(row.driver, row.constructor);
      }
    }
    const drivers = Array.from(driverSet);

    const byRound = new Map();
    for (const row of data) {
      if (!byRound.has(row.round)) byRound.set(row.round, { round: row.round });
      byRound.get(row.round)[row.driver] = row.cumulative_points;
    }
    const pivoted = Array.from(byRound.values()).sort((a, b) => a.round - b.round);

    return { pivoted, drivers, driverConstructor };
  }, [data]);

  function toggleDriver(driver) {
    setHiddenDrivers((prev) => {
      const next = new Set(prev);
      next.has(driver) ? next.delete(driver) : next.add(driver);
      return next;
    });
  }

  function formatDriverLabel(driver) {
    return driver
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return (
    <div className="bg-[#111111] rounded-lg p-4 w-full h-[420px] text-white">
      <h3 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide uppercase">
        Championship Progression
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={pivoted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="round"
            stroke="#888"
            tick={{ fill: "#aaa", fontSize: 12 }}
            label={{ value: "Round", position: "insideBottom", offset: -3, fill: "#888" }}
          />
          <YAxis
            stroke="#888"
            tick={{ fill: "#aaa", fontSize: 12 }}
            label={{ value: "Cumulative Points", angle: -90, position: "insideLeft", fill: "#888" }}
          />
          <Tooltip
            contentStyle={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: 6 }}
            labelFormatter={(round) => `Round ${round}`}
            formatter={(value, driver) => [value, formatDriverLabel(driver)]}
          />
          <Legend
            onClick={(e) => toggleDriver(e.dataKey)}
            formatter={(driver) => formatDriverLabel(driver)}
            wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
          />
          {drivers.map((driver) => {
            const dimmed = highlightDrivers && !highlightDrivers.includes(driver);
            const color = getTeamColor(driverConstructor.get(driver));
            return (
              <Line
                key={driver}
                type="monotone"
                dataKey={driver}
                name={driver}
                stroke={color}
                strokeWidth={dimmed ? 1 : 2}
                strokeOpacity={dimmed ? 0.25 : 1}
                dot={false}
                hide={hiddenDrivers.has(driver)}
                connectNulls
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Mock data: 22-round season, 6 drivers, matches standings.csv schema exactly ---
function buildMockStandings() {
  const drivers = [
    { driver: "max_verstappen", constructor: "Red Bull", avg: 21 },
    { driver: "sergio_perez", constructor: "Red Bull", avg: 14 },
    { driver: "lewis_hamilton", constructor: "Mercedes", avg: 12 },
    { driver: "charles_leclerc", constructor: "Ferrari", avg: 13 },
    { driver: "lando_norris", constructor: "McLaren", avg: 11 },
    { driver: "fernando_alonso", constructor: "Aston Martin", avg: 10 },
  ];

  const rows = [];
  const cumulative = Object.fromEntries(drivers.map((d) => [d.driver, 0]));

  for (let round = 1; round <= 22; round++) {
    const roundResults = drivers.map((d) => {
      const noise = Math.round((Math.random() - 0.5) * 10);
      const points = Math.max(0, d.avg + noise);
      cumulative[d.driver] += points;
      return { ...d, points };
    });

    // rank this round's cumulative totals to derive championship position
    const ranked = [...roundResults].sort(
      (a, b) => cumulative[b.driver] - cumulative[a.driver]
    );

    for (const d of roundResults) {
      rows.push({
        season: 2023,
        round,
        driver: d.driver,
        constructor: d.constructor,
        points: d.points,
        cumulative_points: cumulative[d.driver],
        position: ranked.findIndex((r) => r.driver === d.driver) + 1,
      });
    }
  }
  return rows;
}

export const mockData = buildMockStandings();
