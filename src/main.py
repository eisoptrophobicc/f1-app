import fastf1
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
with open(BASE_DIR/"data"/"nationality_ioc.json") as nat_file:
    nat_ioc = json.load(nat_file)

CACHE_DIR = Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

fastf1.Cache.enable_cache(CACHE_DIR)

ergast_api = fastf1.ergast.Ergast()

default_season = 2025 #This is to be made dynamic later on with the default being the latest ongoing/completed season.
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