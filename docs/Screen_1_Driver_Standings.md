# Screen 1: Driver Standings

## Status: 
Implemented [Terminal Output]

## Purpose: 
Display season-based Formula 1 Driver Standings in a clean, readable format.

## Data Source:
- JolpicaF1 [Accessed via FastF1]

## Inputs:
- **Season**
  - Auto-resolved on app start to the latest season with at least one completed race
  - May be explicitly provided via CLI input
  - If an explicitly requested season has no race data, an empty-state message is shown

## Displayed Data: 
- Position
- Driver
- Nationality [Derived via Mapping]
- Team
- Points

## Current Behaviour:
- Standings load correctly for a given season
- Data matches official F1 driver standings
- Standings are shown only for seasons with at least one completed race
- If a season with no race data is requested, an empty-state message is displayed
- Season resolution logic is handled outside the screen
- Displays an empty-state message when no data is available
- No crashes on missing or partial data
- Logic can be explained end-to-end

## Notes:
- Constructor names are displayed as provided by the data source
- Screen is selected via routing logic in `main.py`
