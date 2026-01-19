# F1 App

A Formula 1 Project built incrementally.

## Current Features
- Driver standings screen (season-based)
- Constructor standings screen (season-based)
- Race calendar screen showing testing and race weekends (season-based)
- Calendar and standings intentionally use different season semantics
- CLI support for selecting screen and season
- Data sourced from JolpicaF1 (via FastF1)
- Nationality mapped to IOC-style country codes
- Clean, readable terminal output

## Screens
- **Driver Standings**: Displays driver position, name, nationality, team, and points
- **Constructor Standings**: Displays constructor position, team and points
- **Race Calendar**: Displays round, country, location, event name, event format, start date, end date

Screen selection is currently handled via a configuration constant in `main.py`.

## Season Logic
- On app start, standings default to the **latest season with at least one completed race**
- On app start, calender default to the **latest season**
- Ongoing seasons are supported once race data exists
- If a season with no standings data is requested, screens render a clear empty-state message
- Season resolution logic is handled outside individual screens

## Configuration
- Active screen is selected via a constant (`active_screen`)
- Constructor names are shown as provided by the data source
- FastF1 caching is enabled locally for performance

## CLI Example Usage
```bash
python src/main.py
python src/main.py --screen drivers
python src/main.py --screen constructors
python src/main.py --season 2024
python src/main.py --season current
python src/main.py --screen drivers --season 2023
```

## Notes
- Constructor names are shown as provided by the data source
- CLI is used for screen and season selection
- Output is terminal-based
- Screens are intentionally kept independent of season resolution logic
- Logic is structured to be explainable end-to-end

## Planned
- Improved screen routing
- Race calendar screen expansion with session-level details
- Additional analytics screens
- UI layer (later)
