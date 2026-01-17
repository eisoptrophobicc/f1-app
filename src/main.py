import fastf1
import json
import pathlib
import datetime
import argparse

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
with open(BASE_DIR/"data"/"nationality_ioc.json") as nat_file:
    nat_ioc = json.load(nat_file)

CACHE_DIR = pathlib.Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

fastf1.Cache.enable_cache(CACHE_DIR)

ergast_api = fastf1.ergast.Ergast()

def season_data_exists(ergast_api, season):
    try:
        data = ergast_api.get_race_results(season=season, limit=1).content[0]
        return not data.empty
    except Exception:
        return False
    
def resolve_season(ergast_api, request_season=None):
    current_year = datetime.datetime.now().year
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

def parse_args():
    parser = argparse.ArgumentParser(description="F1 Analytics[Terminal]")
    parser.add_argument("--screen", choices=["drivers", "constructors"], default="drivers", help="Select the standings to display")
    parser.add_argument("--season", default=None, help="Season Year[e.g., 2023] or 'current' for latest available season")
    return parser.parse_args()

args = parse_args()
request_season = args.season
    
default_season = resolve_season(ergast_api, request_season)
active_screen = args.screen

from screens.driver_standings import dri_stands
from screens.constructor_standings import team_stands

if __name__ == "__main__":
    if active_screen == "drivers":
        dri_stands(default_season, ergast_api, nat_ioc)
    elif active_screen == "constructors":
        team_stands(default_season, ergast_api)
    else:
        raise ValueError("Unknown Error")