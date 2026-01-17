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

## Season Logic
- On app start, standings default to the **latest season with at least one completed race**
- Ongoing seasons are supported once race data exists
- If a season with no standings data is requested, screens render a clear empty-state message
- Season resolution logic is handled outside individual screens

## Configuration
- Active screen is selected via a constant (`active_screen`)
- Constructor names are shown as provided by the data source
- FastF1 caching is enabled locally for performance

## Notes
- Constructor names are shown as provided by the data source
- No UI or CLI interaction yet; output is terminal-based
- Screens are intentionally kept independent of season resolution logic
- Logic is structured to be explainable end-to-end

## Planned
- Improved screen routing
- CLI-based screen and season selection
- Race calendar screen with session-level details
- Additional analytics screens
- UI layer (later)
