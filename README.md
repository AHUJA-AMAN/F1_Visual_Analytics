# CS661 F1 Visual Analytics — StratViz

An F1 visual analytics web app built for CS661 (Big Data Visual Analytics). The app runs entirely in the browser — no backend server. Data is queried from Parquet files hosted on HuggingFace using DuckDB-WASM (SQL engine compiled to WebAssembly).

**Live site:** (add Vercel URL here once deployed)
**Data:** https://huggingface.co/datasets/Aman2406/f1-visual-analytics

---

## Quick Start (run locally)

```bash
cd frontend
npm install
npx vite
```

Open http://localhost:5173 in your browser. That's it — data is fetched from HuggingFace automatically.

**Requirements:** Node.js 18+ (check with `node --version`)

---

## Project Structure

```
├── frontend/                    # React + Vite app (this is what gets deployed)
│   ├── index.html               # HTML entry point
│   ├── vite.config.js           # Vite config (React plugin + Tailwind)
│   ├── package.json             # npm dependencies
│   └── src/
│       ├── main.jsx             # React entry — mounts <App /> to #root
│       ├── App.jsx              # Router setup (BrowserRouter + all routes)
│       ├── index.css            # Tailwind import + global styles (dark bg)
│       │
│       ├── lib/                 # DATA LAYER (DuckDB-WASM backend)
│       │   ├── duckdb.js        # Initializes DuckDB-WASM, fetches parquet files
│       │   │                    #   from HuggingFace, registers them as SQL views,
│       │   │                    #   exposes singleton connection + query() helper
│       │   └── queries.js       # 15 exported async functions — each runs a SQL
│       │                        #   query and returns a plain JS array of objects.
│       │                        #   This is the "API" that all pages call.
│       │
│       ├── components/
│       │   ├── charts/          # VISUALIZATION COMPONENTS (one per chart type)
│       │   │   └── ChampionshipChart.jsx
│       │   │       # Line chart showing cumulative points progression per driver
│       │   │       # Props: { data: [{driver, round, cumulative_points, constructor}],
│       │   │       #          highlightDrivers?: string[] }
│       │   │       # Uses: recharts (LineChart), getTeamColor() for line colors
│       │   │
│       │   └── layout/          # SHARED UI COMPONENTS
│       │       ├── Navbar.jsx       # Top navigation bar with NavLinks to all pages
│       │       ├── FilterBar.jsx    # Season dropdown, reads/writes Zustand store
│       │       ├── StatCard.jsx     # Reusable stat card (label + big number + subtext)
│       │       └── LoadingSkeleton.jsx  # Animated placeholder shown while data loads
│       │
│       ├── pages/               # PAGE COMPONENTS (one per route)
│       │   ├── LandingPage.jsx  # "/" — Hero with animated stats + "Enter" button
│       │   ├── SeasonPage.jsx   # "/season" — Stat cards + ChampionshipChart
│       │   │                    #   Fetches: getSeasonStatCards(), getChampionshipStandings()
│       │   ├── RacePage.jsx     # "/race/:raceId" — Placeholder (needs charts)
│       │   ├── DriversPage.jsx  # "/drivers" — Placeholder (needs charts)
│       │   └── StrategyPage.jsx # "/strategy" — Coming soon placeholder
│       │
│       ├── store/
│       │   └── filterStore.js   # Zustand global state: season, raceId,
│       │                        #   selectedDrivers, seasonRange + setters
│       │
│       └── constants/
│           └── f1Colors.js      # Team color hex codes + compound colors
│                                #   Exports: TEAM_COLORS, COMPOUND_COLORS, getTeamColor()
│
├── pipeline/                    # DATA PIPELINE (Python, run separately)
│   ├── fetch_jolpica.py         # Fetches race results, qualifying, pit stops from
│   │                            #   Jolpica API (2000-2024). Handles pagination + rate limiting.
│   ├── fetch_fastf1.py          # Fetches lap-by-lap telemetry from FastF1 (2018-2024).
│   └── build_parquets.py        # Processes raw cached data into final parquet files.
│
├── run_pipeline.py              # Runs the full pipeline end-to-end
├── generate_placeholder.py      # Generates mock parquet files for testing
├── requirements.txt             # Python dependencies for the pipeline
└── .gitignore
```

---

## Architecture

```
User's Browser
    │
    ├── React Pages (SeasonPage, RacePage, etc.)
    │       │
    │       ▼
    ├── queries.js  ← "API layer" — 15 async functions
    │       │
    │       ▼
    ├── duckdb.js   ← DuckDB-WASM (SQL engine in browser)
    │       │
    │       ▼
    └── Fetches .parquet files from HuggingFace (on first load, ~3MB total)
```

No server. No API calls to a backend. Everything runs client-side.

---

## Data Layer API (queries.js)

All functions are async and return plain JS arrays/objects. Import what you need:

```js
import { getChampionshipStandings, getRaceList } from '../lib/queries';
const data = await getChampionshipStandings(2023);
```

### Function Reference

| Function | Params | Returns |
|---|---|---|
| `getChampionshipStandings(season)` | `2023` | `[{ driver, round, cumulative_points }]` |
| `getConstructorHeatmap(season)` | `2023` | `[{ constructor, round, points }]` |
| `getRaceOutcomesGrid(season)` | `2023` | `[{ round, position, driver, team, dnf }]` |
| `getSeasonStatCards(season)` | `2023` | `{ champion, race_count, constructor_champion, fastest_lap_holder }` |
| `getRaceList(season)` | `2023` | `[{ round, race_name, circuit_name, country, date }]` |
| `getPositionChartData(raceId)` | `"2023_1"` | `[{ driver, team, lap_number, position }]` |
| `getLapTimeScatterData(raceId)` | `"2023_1"` | `[{ driver, team, lap_number, lap_time_seconds, compound, is_pit_lap }]` |
| `getGapToLeaderData(raceId)` | `"2023_1"` | `[{ driver, team, lap_number, gap_to_leader_seconds }]` |
| `getPitStopGanttData(raceId)` | `"2023_1"` | `[{ driver, stint_number, compound, start_lap, end_lap, stint_length }]` |
| `getDriverRadarStats(d1, d2, range)` | `"max_verstappen", "hamilton", {start:2022, end:2024}` | `{ driver1: {avg_qualifying_position, avg_race_position, win_rate, podium_rate, points_per_race, fastest_lap_rate}, driver2: {...} }` |
| `getQualVsRaceScatter(range)` | `{start:2020, end:2024}` | `[{ driver, season, avg_qualifying_position, avg_race_position, team }]` |
| `getCircuitHeatmapForDriver(driver)` | `"max_verstappen"` | `[{ circuit_name, season, avg_finish_position }]` |
| `getTeammateBattle(team, season)` | `"Red Bull", 2023` | `[{ round, driver1, driver2, quali_delta, race_position_delta }]` |
| `getDriverList(range)` | `{start:2022, end:2024}` | `[{ driver, team }]` |
| `getTeamList(season)` | `2023` | `[{ constructor }]` |

### Key conventions
- **`season`** — integer, e.g. `2023`
- **`raceId`** — string `"YYYY_R"`, e.g. `"2023_1"` (season + round)
- **`seasonRange`** — object `{ start: 2020, end: 2024 }` (inclusive)
- **`driver`** — Jolpica-style ID: `max_verstappen`, `hamilton`, `leclerc`
- **`constructor`** — display name: `Red Bull`, `Mercedes`, `Ferrari`, `McLaren`

---

## Adding a New Visualization

1. Create your chart component in `frontend/src/components/charts/YourChart.jsx`
2. Import the relevant query function from `../lib/queries`
3. Use this pattern in the page:

```jsx
import { useState, useEffect } from 'react';
import { getSomeData } from '../lib/queries';
import LoadingSkeleton from '../components/layout/LoadingSkeleton';
import YourChart from '../components/charts/YourChart';

function YourPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSomeData(params).then(d => { setData(d); setLoading(false); });
  }, [params]);

  return loading ? <LoadingSkeleton /> : <YourChart data={data} />;
}
```

4. Add the route in `App.jsx` if it's a new page

---

## Available Data

| File | Rows | Years | Source |
|------|------|-------|--------|
| standings.parquet | 11,925 | 2000-2024 | Jolpica API |
| results.parquet | 10,071 | 2000-2024 | Jolpica API |
| laps.parquet | 161,794 | 2018-2024 | FastF1 |
| stints.parquet | 7,101 | 2018-2024 | Derived from laps |

Data hosted at: `https://huggingface.co/datasets/Aman2406/f1-visual-analytics/resolve/main/data/`

---

## Running the Data Pipeline (optional — only if you need to regenerate data)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run_pipeline.py
```

This pulls fresh data from Jolpica API + FastF1 and produces parquet files in `output/`. Takes ~40 minutes on first run (subsequent runs use cache).

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Zustand
- **Data:** DuckDB-WASM (SQL in browser), Parquet files on HuggingFace
- **Pipeline:** Python, pandas, FastF1, requests
- **Deployment:** Vercel (auto-deploys from main branch)
