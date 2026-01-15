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

If done correctly the following should be possible:
- Standings load correctly for a given season
- Data matches official F1 results
- No crashes on missing partial data
- Logic can be explained end-to-end
