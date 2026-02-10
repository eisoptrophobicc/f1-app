import fastf1
import json
import pathlib
import datetime
import argparse

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent

with open(BASE_DIR / "data" / "nationality_ioc.json") as nat_file:
    nat_ioc = json.load(nat_file)

CACHE_DIR = pathlib.Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

fastf1.Cache.enable_cache(CACHE_DIR)

ergast_api = fastf1.ergast.Ergast()

from utils.season import curr_year, season_data_exists

def resolve_staseason(ergast_api, request_season=None):
    current_year = curr_year(datetime)

    if request_season is not None:
        if request_season.lower() == "current":
            request_season = current_year
        else:
            request_season = int(request_season)

        if season_data_exists(ergast_api, request_season):
            return request_season
        return None

    for year in range(current_year, 1949, -1):
        if season_data_exists(ergast_api, year):
            return year

    return None

def resolve_calseason(request_season=None):
    current_year = curr_year(datetime)

    if request_season is not None:
        if request_season.lower() == "current":
            return current_year
        return int(request_season)

    return current_year

def parse_args():
    parser = argparse.ArgumentParser(description="F1 Analytics[Terminal]")
    parser.add_argument("--screen", choices=["drivers", "constructors", "calendar", "overview"], default="calendar", help="Select the screen to display")
    parser.add_argument("--season", default=None, help="Season Year [e.g., 2023] or 'current'")
    parser.add_argument("--round", type=int, default=None, help="Round Number (use 0 for testing)")
    parser.add_argument("--test", type=int, default=None, help="Testing Event Number (only used when round = 0)")
    return parser.parse_args()

args = parse_args()
request_season = args.season
active_screen = args.screen

default_staseason = resolve_staseason(ergast_api, request_season)
default_calseason = resolve_calseason(request_season)

from screens.driver_standings import dri_stands
from screens.constructor_standings import team_stands
from screens.race_calendar import race_calen, resolve_event_index
from screens.session_overview import session_overview

ROUTES = {
    "drivers": lambda: dri_stands(default_staseason, ergast_api, nat_ioc),
    "constructors": lambda: team_stands(default_staseason, ergast_api),
    "calendar": lambda: race_calen(fastf1, default_calseason, show=True),
    "overview": lambda: (lambda schedule: session_overview(fastf1, default_calseason, event_idx=resolve_event_index(schedule, round_number=args.round,test_number=args.test), schedule_df=schedule))(race_calen(fastf1, default_calseason, show=False)),
}

def main():
    if active_screen == "overview" and args.round is None:
        raise ValueError("--round is required for session overview")

    if active_screen not in ROUTES:
        raise ValueError(f"Unknown screen: {active_screen}")

    ROUTES[active_screen]()

if __name__ == "__main__":
    main()