# Screen: Telemetry Replay

## Status:
Implemented [Binary Replay + Web Visualization]

## Purpose:
Provide a synchronized, animated replay of session telemetry data with smoothing and configurable race-event behavior modeling.

This screen represents the analytical core of the application.

## Data Source
-  FastF1 Session Telemetry
-  FastF1 Session Results (for DNS / DNF / DSQ modeling)

## Inputs
-  **Season**
-  **Round**
-  **Session** (FP1, FP2, FP3, Qualifying, Race)

Replay visualization behavior (DNF handling, DSQ rendering, replay speed) is controlled directly in the browser viewer.

## Telemetry Processing Pipeline

1.  Load session telemetry data
2.  Extract positional data (X, Y)
3.  Remove duplicate timestamps
4.  Uniform time resampling
5.  Apply 6-state constant-acceleration Kalman smoothing
6.  Snap smoothed trajectory to reference circuit spline
7.  Synchronize global replay start time
8.  Export replay as compact binary telemetry format
9.  Web renderer loads binary replay and animates race in browser

## State Model

The replay engine uses a 6-state constant-acceleration model:

\[x, y, vx, vy, ax, ay\]

This reduces:
- Positional jitter
- Telemetry pulsing
- Irregular sampling artifacts

Numba acceleration is used for performance-critical smoothing computation.

## Event Modeling
-  **DNS (Did Not Start)** drivers are excluded entirely
-  **DNF (Retired)** drivers disappear or ghost depending on viewer configuration
-  **DSQ (Disqualified)** drivers can be shown, faded, or hidden
-  Replay state is computed deterministically from interpolated telemetry

## Visualization
-  Web-based renderer built with **React + PIXI.js**
-  Track outline derived from fastest lap reference
-  Team colors mapped via FastF1 utilities
-  Adaptive track bounds
-  GPU-accelerated rendering via WebGL
-  Smooth animation loop (~60 FPS)

## Performance Considerations
-  Telemetry processing occurs only when replay screen is invoked
-  Uniform sampling interval defined internally
-  Kalman smoothing compiled with Numba (`njit`)
-  Binary replay format minimizes frontend loading overhead
-  Web renderer performs lightweight interpolation for smooth playback

## Architectural Characteristics

Unlike simple telemetry visualizations, this system performs:

- Kalman-filtered trajectory smoothing
- Track-aware trajectory snapping
- Deterministic replay reconstruction
- Binary telemetry export for efficient rendering
- GPU-accelerated browser animation

This architecture separates **data processing (Python)** from **visualization (WebGL)**, allowing the replay engine to scale toward advanced telemetry analytics.

## Notes
-  Replay logic is isolated from CLI routing
-  Heavy telemetry loading is restricted to this screen
-  Designed to evolve toward advanced telemetry analytics (sector deltas, speed traces, overlays)
-  Web renderer allows future UI expansion without modifying the telemetry engine