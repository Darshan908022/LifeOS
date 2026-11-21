
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai

from app.api.routes import (
    auth,
    tasks,
    goals,
    habits,
    habit_logs,
    habit_analytics,
    dashboard,
)

app = FastAPI(
    title="LifeOS API",
    description="Personal Intelligence Platform",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(goals.router, prefix="/api/v1")
app.include_router(habits.router, prefix="/api/v1")
app.include_router(habit_logs.router, prefix="/api/v1")
app.include_router(habit_analytics.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

# AI Assistant
app.include_router(ai.router, prefix="/api/v1")


# Root Endpoint
@app.get("/")
async def root():
    return {
        "name": "LifeOS",
        "message": "Personal Intelligence Platform API",
        "version": "1.0.0",
    }


# Health Check
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "application": "LifeOS",
        "api_version": "v1",
    }
