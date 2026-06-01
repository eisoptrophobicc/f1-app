import fastf1
import pathlib
import asyncio

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent

CACHE_DIR = pathlib.Path("cache")
CACHE_DIR.mkdir(exist_ok=True)

fastf1.Cache.enable_cache(CACHE_DIR)

ergast_api = fastf1.ergast.Ergast()

async def fetch_teaser_drivers(season: int):
    standings = ergast_api.get_driver_standings(
        season=season
    ).content[0]

    race_schedule = ergast_api.get_race_schedule(
        season=season
    )

    current_round = race_schedule.shape[0]

    leader_points = float(standings.iloc[0]["points"])

    teaser_drivers = []

    for _, row in standings.head(3).iterrows():

        driver_code = row["driverCode"]

        driver_points = float(row["points"])

        if driver_points.is_integer():
            driver_points = int(driver_points)

        progression = []

        for rnd in range(1, current_round + 1):

            response = ergast_api.get_driver_standings(
                season=season,
                round=rnd
            )

            if not response.content:
                break

            round_standings = response.content[0]

            driver_row = round_standings[
                round_standings["driverCode"] == driver_code
            ]

            if not driver_row.empty:

                pts = float(driver_row.iloc[0]["points"])

                if pts.is_integer():
                    pts = int(pts)

                progression.append(pts)

        gap = leader_points - driver_points

        if gap == 0:

            gap = None

        else:

            if gap.is_integer():
                gap = int(gap)

            gap = f"-{gap}"

        teaser_drivers.append({
            "pos": int(row["position"]),
            "code": driver_code,
            "name": f"{row['givenName']} {row['familyName']}",
            "team": row["constructorNames"][-1],
            "pts": driver_points,
            "spark": progression,
            "gap": gap
        })

    return teaser_drivers