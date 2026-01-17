import fastf1
import json
import pathlib
import datetime

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
        request_season = int(request_season)
        if season_data_exists(ergast_api, request_season):
            return request_season
        return None
    
    for year in range(current_year, 1949, -1):
        if season_data_exists(ergast_api, year):
            return year
    return None
    
default_season = resolve_season(ergast_api)
active_screen = "drivers" # or "constructors"

from screens.driver_standings import dri_stands
from screens.constructor_standings import team_stands

if __name__ == "__main__":
    if active_screen == "drivers":
        dri_stands(default_season, ergast_api, nat_ioc)
    elif active_screen == "constructors":
        team_stands(default_season, ergast_api)
    else:
        raise ValueError("Unknown Error")