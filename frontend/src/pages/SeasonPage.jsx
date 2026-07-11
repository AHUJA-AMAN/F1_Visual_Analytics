import React, { useState, useEffect } from "react";
import useFilterStore from "../store/filterStore";
import FilterBar from "../components/layout/FilterBar";
import StatCard from "../components/layout/StatCard";
import LoadingSkeleton from "../components/layout/LoadingSkeleton";
import ChampionshipChart from "../components/charts/ChampionshipChart";
import {
  getSeasonStatCards,
  getChampionshipStandings,
} from "../lib/queries";

function formatDriverName(driver) {
  if (!driver) return "—";
  return driver
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function SeasonPage() {
  const { season } = useFilterStore();
  const [stats, setStats] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSeasonStatCards(season),
      getChampionshipStandings(season),
    ]).then(([s, st]) => {
      setStats(s);
      setStandings(st);
      setLoading(false);
    });
  }, [season]);

  return (
    <div>
      <FilterBar />
      <div className="p-6 space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <LoadingSkeleton key={i} height="100px" />
              ))}
            </div>
            <LoadingSkeleton height="420px" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Champion"
                value={formatDriverName(stats?.champion)}
              />
              <StatCard
                label="Total Races"
                value={stats?.race_count}
              />
              <StatCard
                label="Constructor Champion"
                value={stats?.constructor_champion}
              />
              <StatCard
                label="Most Fastest Laps"
                value={formatDriverName(stats?.fastest_lap_holder)}
              />
            </div>
            <ChampionshipChart data={standings} />
          </>
        )}
      </div>
    </div>
  );
}
