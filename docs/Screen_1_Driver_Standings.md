# Screen 1: Driver Standings

Status: Implemented [Terminal Output]

Purpose: Display season-based Formula 1 Driver Standings in a clean, readable format.

Data Source:
- FastF1 [Post Race, Cached Timing Data]

Inputs:
- Season [Default : Configurable Constant]

Displayed Data: 
- Position
- Driver
- Nationality [Derived via Mapping]
- Team
- Points

Current Behavior:
- Standings load correctly for a given season
- Data matches official F1 constructor standings
- Standings are shown only for seasons with at least one completed race
- If a season with no race data is requested, an empty-state message is displayed
- Season resolution logic is handled outside the screen
- Displays an empty-state message when no data is available
- No crashes on missing or partial data
- Logic can be explained end-to-end

Notes:
- Constructor names are displayed as provided by the data source
- Screen is selected via routing logic in `main.py`
