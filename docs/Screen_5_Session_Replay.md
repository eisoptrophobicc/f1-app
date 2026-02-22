# Screen: Telemetry Replay

## Status:
Implemented [Matplotlib Visualization]

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
-  **DNF Mode**
  -  `vanish` (default): Driver disappears after retirement
  -  `freeze`: Driver remains at final recorded position
-  **DSQ Mode**
  -  `show`: Driver rendered normally
  -  `faded`: Driver rendered semi-transparent
  -  `hide`: Driver excluded from replay
-   **Speed**
  -   Replay speed multiplier (1.0 = real time)

## Telemetry Processing Pipeline

1.  Load session telemetry data
2.  Extract positional data (X, Y)
3.  Remove duplicate timestamps
4.  Uniform time resampling
5.  Apply 6-state constant-acceleration Kalman smoothing
6.  Synchronize global replay start time
7.  Animate at \~60 FPS using Matplotlib

## State Model

The replay engine uses a 6-state constant-acceleration model:

\[x, y, vx, vy, ax, ay\]

This reduces: - Positional jitter - Telemetry pulsing - Irregular sampling artifacts

Numba acceleration is used for performance-critical smoothing computation.

## Event Modeling
-  **DNS (Did Not Start)** drivers are excluded entirely
-  **DNF (Retired)** drivers follow selected DNF behavior
-  **DSQ (Disqualified)** drivers follow selected DSQ behavior
-  Replay state is computed deterministically from interpolated telemetry

## Visualization
-  Track outline derived from fastest lap reference
-  Team colors mapped via FastF1 utilities
-  Adaptive track bounds
-  Blitted animation loop for efficient rendering
-  Approximate 60 FPS playback

## Performance Considerations
-  Telemetry processing occurs only when replay screen is invoked
-  Uniform sampling interval defined internally
-  Kalman smoothing compiled with Numba (`njit`)
-  Rendering optimized using Matplotlib blitting

## Notes
-  Replay logic is isolated from CLI routing
-  Heavy telemetry loading is restricted to this screen
-  Designed to evolve toward advanced telemetry analytics (sector deltas, speed traces, overlays)
-  GUI transition possible without modifying core engine logic
