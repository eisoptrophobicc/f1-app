import datetime
import pandas
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.session_context import SessionContext

FASTEST_CACHE = {}

def get_top3_fastest(fastf1, season, round_num, session_name):

    key = (season, round_num, session_name)

    if key in FASTEST_CACHE:
        return FASTEST_CACHE[key]

    try:
        ctx = SessionContext(fastf1, season, round_num, session_name)
        laps = ctx.laps[["Driver", "LapTime"]].dropna()

        if laps.empty:
            result = "N/A"
        else:
            fastest = (
                laps.groupby("Driver")["LapTime"].min().nsmallest(3)
            )

            formatted = []
            for drv, t in fastest.items():
                total_seconds = t.total_seconds()
                minutes = int(total_seconds // 60)
                seconds = total_seconds % 60
                formatted.append(f"{drv} {minutes}:{seconds:06.3f}")

            result = ", ".join(formatted)

    except Exception:
        result = "N/A"

    FASTEST_CACHE[key] = result
    return result

def parallel_fastest_loader(fastf1, season, round_num, sessions):

    results = {}

    with ThreadPoolExecutor(max_workers=5) as executor:

        future_map = {
            executor.submit(get_top3_fastest, fastf1, season, round_num, s["name"]): s["name"]
            for s in sessions
            if s["status"] == "Completed"
        }

        for future in as_completed(future_map):
            name = future_map[future]

            try:
                results[name] = future.result()
            except Exception:
                results[name] = "N/A"

    return results

def compute_fastest_adaptive(fastf1, season, round_num, sessions):
    if all((season, round_num, s["name"]) in FASTEST_CACHE
        for s in sessions if s["status"] == "Completed"):
        return {
            s["name"]: FASTEST_CACHE[(season, round_num, s["name"])]
            for s in sessions if s["status"] == "Completed"
        }

    completed = [s for s in sessions if s["status"] == "Completed"]

    if len(completed) <= 1:
        return {
            s["name"]: get_top3_fastest(fastf1, season, round_num, s["name"])
            for s in completed
        }

    return parallel_fastest_loader(fastf1, season, round_num, sessions)

def session_overview(fastf1, season, event_idx, schedule_df):

    if not (0 <= event_idx < len(schedule_df)):
        print("No race found for the specified season and round.")
        return

    rd = schedule_df.iloc[event_idx]

    print(f"\nRace Overview: Season {season}")

    round_num = rd['RoundNumber']
    print("Testing" if round_num == 0 else f"Round {round_num}")
    print(f"{rd['Location']}, {rd['Country']}")
    print(rd['OfficialEventName'])

    start_date = rd.get("Session1Date") or rd.get("Session1DateUtc")
    end_date = rd.get("EventDate")

    if start_date is not None and end_date is not None:
        print(f"{start_date.strftime('%d')}–{end_date.strftime('%d %B')}")

    now = datetime.datetime.now(datetime.timezone.utc)
    sessions = []

    for i in range(1, 6):

        name = rd.get(f"Session{i}")
        date = rd.get(f"Session{i}DateUtc") or rd.get(f"Session{i}Date")

        if name is None or pandas.isna(date):
            continue

        if date.tzinfo is None:
            date = date.replace(tzinfo=datetime.timezone.utc)

        sessions.append({"name": name, "date": date, "status": "Completed" if date < now else "Scheduled"})

    fastest_results = compute_fastest_adaptive(fastf1, season, round_num, sessions)

    print(f"{'Session':<25}{'Date (UTC)':<25}{'Status':<15}{'Top 3 Fastest'}")
    print("-" * 110)

    for s in sessions:
        date_str = s["date"].strftime("%d %B %Y %H:%M")
        top3_str = fastest_results.get(s["name"], "—")

        print(f"{s['name']:<25}{date_str:<25}{s['status']:<15}{top3_str}")