import logging
logging.getLogger("fastf1").setLevel(logging.ERROR)

def race_calen(fastf1, season, show = True):
    try:
        schedule = fastf1.get_event_schedule(season)
    except Exception:
        print(f"{'ROUND':<10} {'COUNTRY':<20} {'LOCATION':>20} {'EVENT NAME':<80} {'EVENT FORMAT':<20} {'DURATION':<30}")
        print("-" * 185)
        print("No valid season data found.")
        return
    
    if show:
        print(f"{'ROUND':<10} {'COUNTRY':<20} {'LOCATION':>20} {'EVENT NAME':<80} {'EVENT FORMAT':<20} {'DURATION':<30}")
        print("-" * 185)

        if schedule is None or schedule.empty:
            print("No valid season data found.")
            return
        
        for _, row in schedule.iterrows():
            round_num = row['RoundNumber']
            if round_num == 0:
                round_num = "Testing"
            country = row['Country']
            loc = row['Location']
            event_off_name = row["OfficialEventName"]
            event_format = row["EventFormat"]
            event_stdate = str(row["Session1DateUtc"].strftime("%d"))
            event_endate = str(row["EventDate"].strftime("%d %B %Y"))

            print(f"{round_num:<10} {country:<20} {loc:>20} {event_off_name:<80} {event_format:<20} {event_stdate}–{event_endate:<30}")

    return schedule

def resolve_event_index(schedule, round_number, test_number=None):
    matches = schedule[schedule["RoundNumber"] == round_number]

    if matches.empty:
        raise ValueError(f"No event found for round {round_number}")

    if round_number != 0:
        return matches.index[0]

    if len(matches) == 1:
        return matches.index[0]

    if test_number is None:
        return matches.iloc[0].name 

    if test_number < 1 or test_number > len(matches):
        raise ValueError(f"Invalid test number. Choose between 1 and {len(matches)}.")

    return matches.iloc[test_number - 1].name