def curr_year(datetime):
    return datetime.datetime.now().year

def season_data_exists(ergast_api, season):
    try:
        data = ergast_api.get_race_results(season=season, limit=1).content[0]
        return not data.empty
    except Exception:
        return False