import logging
logging.getLogger("fastf1").setLevel(logging.ERROR)

def race_calen(fastf1, season):
    print(f"{'ROUND':<10} {'COUNTRY':<20} {'LOCATION':>20} {'EVENT NAME':<80} {'EVENT FORMAT':<20} {'START DATE':<15} {'END DATE':<15}")
    print("-" * 185)

    try:
        schedule = fastf1.get_event_schedule(season)
    except Exception:
        print("No valid season data found.")
        return
    
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
        event_stdate = str(row["Session1Date"].date())
        event_endate = str(row["EventDate"].date())

        print(f"{round_num:<10} {country:<20} {loc:>20} {event_off_name:<80} {event_format:<20} {event_stdate:<15} {event_endate:<15}")