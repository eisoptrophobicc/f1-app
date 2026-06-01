from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .routes import routes_teaser_driver

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(routes_teaser_driver.router)

@app.get("/")
async def root():
    return {"message": "healthy"}