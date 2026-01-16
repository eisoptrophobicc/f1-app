def dri_stands(season, ergast_api, nat_ioc):
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