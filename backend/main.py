from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.risk_controller import router as risk_router
from app.controllers.precipitation_controller import router as precipitation_router

app = FastAPI(title="Alerto API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(risk_router)
app.include_router(precipitation_router)