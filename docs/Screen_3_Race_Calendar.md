# Screen 3: Race Calendar

## Status: 
Implemented [Terminal Output]

## Purpose:
Display the official Formula 1 season timeline, including pre-season testing and race weekends, in chronological order.

## Data Source
- FastF1 Event Schedule [Official F1 timing and scheduling feed]

## Inputs:
- **Season**
  - The calendar defaults to the current season
  - Unlike standings, the calendar does not require completed races
  - Pre-season testing and future race weekends are valid calendar entries
  - May be explicitly provided via CLI input
  - If an explicitly requested season has no race data, an empty-state message is shown

## Event Types:

### Pre-Season Testing
- Identified via `RoundNumber == 0`
- Appears before Round 1
- May contain multiple testing events (e.g. Testing 1, Testing 2)
- Displayed with ordinal labels to support user selection

### Race Weekend:
- Identified via `RoundNumber > 0`
- May be conventional or sprint format

## Displayed Data:
- Round Label (Round Number / Testing)
- Country
- Location
- Official Event Name
- Event Format (Testing / Race Weekend)
- Event Duration

## Role in Navigation
- Acts as the authoritative source for event ordering
- Calendar order defines the internal event index
- Used to resolve user-facing round input into a specific event

## Notes:
- Official Event Names are displayed as provided by the data source
- Calendar semantics differ intentionally from standings semantics
- Standings require completed races; the calendar does not
- Session-level breakdown is handled in the Session Overview screen
