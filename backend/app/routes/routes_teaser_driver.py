from fastapi import APIRouter
from ..services.services_teaser_driver import get_teaser_drivers

router = APIRouter()

@router.get("/api/v1/teaser/drivers")
async def teaser_drivers():

    drivers = await get_teaser_drivers()

    return {
        "drivers": drivers
    }