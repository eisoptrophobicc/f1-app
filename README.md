# F1 App

A Formula 1 Project built incrementally.

## Current Features
- Driver standings screen (season-based)
- Constructor standings screen (season-based)
- Race calendar screen showing testing and race weekends (season-based)
- Race weekend session overview screen
- Calendar and standings intentionally use different season semantics
- CLI support for selecting screen, season, and event
- Data sourced from JolpicaF1 (via FastF1)
- Nationality mapped to IOC-style country codes
- Clean, readable terminal output

## Screens
- **Driver Standings**: Displays driver position, name, nationality, team, and points
- **Constructor Standings**: Displays constructor position, team and points
- **Race Calendar**: Displays round/testing label, country, location, event name, event format, start date, end date
- **Session Overview**: Displays all sessions for a race weekend or testing event, including status and top 3 fastest laps

Screen selection is handled via CLI routing in `main.py`.

## Season Logic
- On app start, standings default to the **latest season with at least one completed race**
- On app start, calendar defaults to the **latest season**
- Ongoing seasons are supported once race data exists
- If a season with no standings data is requested, screens render a clear empty-state message
- Season resolution logic is handled outside individual screens

## Configuration
- Active screen is selected via CLI (`--screen`)
- Events are selected via **round number**
- Pre-season testing uses `round = 0` with an optional secondary selector
- Constructor names are shown as provided by the data source
- FastF1 caching is enabled locally for performance

## CLI Example Usage
```bash
# Default calendar
python src/main.py

# Driver standings
python src/main.py --screen drivers

# Constructor standings
python src/main.py --screen constructors

# Explicit season
python src/main.py --season 2024
python src/main.py --season current

# Driver standings for a specific season
python src/main.py --screen drivers --season 2023

# Race weekend session overview (normal round)
python src/main.py --screen overview --season 2025 --round 12

# Pre-season testing (defaults to Testing 1)
python src/main.py --screen overview --season 2025 --round 0

# Pre-season testing (explicit)
python src/main.py --screen overview --season 2025 --round 0 --test 2
```

## Notes
- Constructor names are shown as provided by the data source
- CLI acts as a routing layer for screens
- Output is terminal-based
- Screens are intentionally kept independent of season resolution logic
- Internal logic uses calendar ordering as the source of truth
- Logic is structured to be explainable end-to-end

## Planned
- Session-level detail screen (FP1 / FP2 / FP3 / Qualifying / Race)
- Post-session analytics (pace, stints, tyre usage)
- Persistent caching of derived analytics
- Expanded calendar interaction with session drill-down
- Telemetry-based analysis
- Additional analytics screens
- UI layer (later)
