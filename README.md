# F1 App

A Formula 1 Project built incrementally.

## Current Features
- Driver standings screen (season-based)
- Constructor standings screen (season-based)
- Data sourced from Ergast (via FastF1)
- Nationality mapped to IOC-style country codes
- Clean, readable terminal output

## Screens
- **Driver Standings**: Displays driver position, name, nationality, team, and points
- **Constructor Standings**: Displays constructor position, team and points

Screen selection is currently handled via a configuration constant in `main.py`.

## Configuration
- Season is currently configurable via a constant (`default_season`)
- Constructor names are shown as provided by the data source (`active_screen`)
- FastF1 caching is enabled locally for performance

## Notes
- Constructor names are shown as provided by the data source
- No UI or CLI interaction yet; output is terminal-based
- Logic is structured to be explainable end-to-end

## Planned
- Improved screen routing
- Dynamic season selection
- Additional analytics screens
- UI layer (later)
