import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import SeasonPage from "./pages/SeasonPage";
import RacePage from "./pages/RacePage";
import DriversPage from "./pages/DriversPage";
import StrategyPage from "./pages/StrategyPage";

function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {!isLanding && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/season" element={<SeasonPage />} />
        <Route path="/race/:raceId" element={<RacePage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/strategy" element={<StrategyPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
