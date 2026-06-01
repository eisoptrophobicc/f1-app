import fastf1
import pathlib
import asyncio

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent

CACHE_DIR = pathlib.Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

fastf1.Cache.enable_cache(CACHE_DIR)

ergast_api = fastf1.ergast.Ergast()

async def fetch_driver_standings(season: int):

    results = ergast_api.get_driver_standings(season=season).content[0]

    print(results.iloc[0])

async def main():
    await fetch_driver_standings(2026)

asyncio.run(main())