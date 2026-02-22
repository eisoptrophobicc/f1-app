# F1 App

A Formula 1 analytics project built incrementally with structured architecture and clear domain modeling.

## Current Features
-   Driver standings screen (season-based)
-   Constructor standings screen (season-based)
-   Race calendar screen showing testing and race weekends (season-based)
-   Race weekend session overview screen
-   Telemetry replay engine with animated track visualization
-   Calendar and standings intentionally use different season semantics
-   CLI support for selecting screen, season, event, session, and replay behavior
-   Data sourced from JolpicaF1 (via FastF1)
-   Nationality mapped to IOC-style country codes
-   FastF1 local caching enabled
-   Clean, readable terminal output
-   Modular screen routing architecture

## Screens
- **Driver Standings**: Displays driver position, name, nationality, team, and points
- **Constructor Standings**: Displays constructor position, team and points
- **Race Calendar**: Displays round/testing label, country, location, event name, event format and event duration
- **Session Overview**: Displays all sessions for a race weekend or testing event, including session name, session date (UTC), status and top 3
fastest laps
- **Session Replay**: Displays animated track replay with dnf handling (vanish / freeze), dsq handling (show / faded / hide), adjustable replay speed

Screen selection is handled via CLI routing in `main.py`.

## Season Logic
- On app start, standings default to the **latest season with at least one completed race**
- On app start, calendar defaults to the **latest season**
- Ongoing seasons are supported once race data exists
- If a season with no standings data is requested, screens render a clear empty-state message
- Season resolution logic is handled outside individual screens
- Calendar ordering defines the internal event index
- Standings and calendar intentionally use different season semantics

## Architectural Notes
-  CLI acts strictly as a routing layer
-  Screens remain independent from season resolution logic
-  Heavy FastF1 session loading occurs only where required
-  Session data is cached in-memory during runtime
-  Derived analytics are computed adaptively (parallel when beneficial)
-  Telemetry replay uses a 6-state constant-acceleration Kalman model
-  Replay animation runs at \~60 FPS using Matplotlib blitting
-  Internal logic is structured to be explainable end-to-end

## Configuration
-  Active screen is selected via CLI (`--screen`)
-  Events are selected via **round number**
-  Pre-season testing uses `round = 0` with an optional secondary selector
-  Replay requires both `--round` and `--session`
-  DNF behavior configurable via `--dnf-mode`
-  DSQ behavior configurable via `--dsq-mode`
-  Replay speed adjustable via `--speed`
-  Constructor names are shown as provided by the data source

## CLI Example Usage
``` bash
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

# Telemetry replay
python src/main.py --screen replay --season 2025 --round 12 --session Race

# Replay with custom behavior
python src/main.py --screen replay --season 2025 --round 12 --session Race --dnf-mode freeze --dsq-mode faded --speed 2.0
```

## Notes
-  Constructor names are shown as provided by the data source
-  CLI acts as a routing layer for screens
-  Output is primarily terminal-based (replay uses Matplotlib window)
-  Screens are intentionally kept independent of season resolution logic
-  Internal logic uses calendar ordering as the source of truth
-  Heavy telemetry processing is isolated to the replay engine
-  Designed for gradual expansion toward a GUI layer

## Planned
- Session-level detail screen (FP1 / FP2 / FP3 / Qualifying / Race)
- Post-session analytics (pace, stints, tyre usage)
- Persistent caching of derived analytics
- Expanded calendar interaction with session drill-down
- Telemetry-based analysis
- Additional analytics screens
- UI layer (later)
