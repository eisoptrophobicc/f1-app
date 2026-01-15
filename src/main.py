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

def dri_stands(season):
    results = ergast_api.get_driver_standings(season = season).content[0]

    print(f"{'POS.':<5} {'DRIVER':<25} {'NATIONALITY':<15} {'TEAM':<15} {'PTS.':>5}")
    print("-" * 60)

    for _, row in results.iterrows():
        pos = row['position']
        dri_name = f"{row['givenName']} {row['familyName']}"
        nationality = row['driverNationality']
        constructor = row['constructorNames'][-1]
        points = float(row['points'])
        if points.is_integer():
            points = int(points)

        ioc_code = nat_ioc.get(nationality, "UNK")

        print(f"{pos:<5} {dri_name:<25} {ioc_code:<15} {constructor:<15} {points:>5}")

if __name__ == "__main__":
    dri_stands(default_season)