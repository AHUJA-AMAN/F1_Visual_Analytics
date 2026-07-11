export const TEAM_COLORS = {
  "Red Bull": "#3671C6",
  "Mercedes": "#27F4D2",
  "Ferrari": "#E8002D",
  "McLaren": "#FF8000",
  "Aston Martin": "#358C75",
  "Alpine": "#FF87BC",
  "Alpine F1 Team": "#FF87BC",
  "Williams": "#64C4FF",
  "AlphaTauri": "#6692FF",
  "RB F1 Team": "#6692FF",
  "Alfa Romeo": "#C92D4B",
  "Haas": "#B6BABD",
  "Haas F1 Team": "#B6BABD",
  "Racing Point": "#F596C8",
  "Renault": "#FFF500",
  "Toro Rosso": "#469BFF",
  "Force India": "#F596C8",
  "Sauber": "#C92D4B",
};

export const COMPOUND_COLORS = {
  SOFT: "#E8002D",
  MEDIUM: "#FFF200",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#39B54A",
  WET: "#0067FF",
};

export function getTeamColor(constructor) {
  return TEAM_COLORS[constructor] || "#888888";
}
