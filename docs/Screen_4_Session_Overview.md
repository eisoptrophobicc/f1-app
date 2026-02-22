# Screen 4: Session Overview

## Status:
Implemented [Terminal Output]

## Purpose:
Display a per-event overview of all sessions in a race weekend or pre-season testing event.

This screen acts as a bridge between the race calendar and detailed session-level analysis.

## Data Source
- FastF1 Session Metadata
- FastF1 Laps Data (analytics-only)

## Inputs:
- **Season**
  - Defaults to the active calendar season
- **Round**
  - User-facing round number
  - Uses `round = 0` for pre-season testing
- **Test (optional)**
  - Secondary selector for pre-season testing events
  - Defaults to Testing 1 if not provided

## Session Resolution:
- Sessions are derived strictly from calendar metadata
- Session names are resolved from `Session1` to `Session5`
- No assumptions are made beyond what the calendar provides

## Displayed Data:
- Session Name (FP1, FP2, Qualifying, Race, etc.)
- Session Date
- Session Status (Scheduled / Completed)
- Top 3 Fastest Laps (analytics-first)

## Behaviour:
-  Session status is computed using session date vs current UTC time
-  Analytics are computed only for completed sessions
-  Fastest laps are derived from lap-time aggregation (not classification tables)
-  Session data loading is cached in-memory during runtime
-  Adaptive computation:
  -  Single completed session → sequential loading
  -  Multiple completed sessions → parallel loading (ThreadPoolExecutor)

## Performance Considerations:
- FastF1 data loading is the primary performance cost
- Derived analytics are cached in-memory for the duration of the app session
- No persistent caching is currently used
- Screen is designed to tolerate delayed loading behind a UI loader

## Notes:
- This screen intentionally avoids race classification tables
- Focus is on session-level performance signals
- Designed to map directly to a future GUI “event overview” screen
- Session Detail / Telemetry screens are expected to branch from here
