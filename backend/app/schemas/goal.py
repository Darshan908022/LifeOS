
from datetime import date, datetime
from uuid import UUID
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    target_date: date | None = None
    progress: int = Field(default=0, ge=0, le=100)
    status: Literal["active", "completed", "paused"] = "active"


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    target_date: date | None = None
    progress: int | None = Field(default=None, ge=0, le=100)
    status: Literal["active", "completed", "paused"] | None = None


class GoalResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    target_date: date | None
    progress: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
