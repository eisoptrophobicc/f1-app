def team_stands(season, ergast_api):
    print(f"{'POS.':<5} {'TEAM':<20} {'PTS.':>5}")
    print("-" * 60)

    if season is None:
        print("No valid season data found.")
        return
    
    results = ergast_api.get_constructor_standings(season = season).content[0]

    for _, row in results.iterrows():
        pos = row['position']
        team_name = row['constructorName']
        points = float(row['points'])
        if points.is_integer():
            points = int(points)

        print(f"{pos:<5} {team_name:<20} {points:>5}")