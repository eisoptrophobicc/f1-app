from ..data.data_teaser_driver import fetch_teaser_drivers

async def get_teaser_drivers():
    drivers = await fetch_teaser_drivers(2025)

    return drivers