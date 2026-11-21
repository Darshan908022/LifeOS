
from datetime import datetime
from uuid import UUID
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    frequency: Literal["daily", "weekly"] = "daily"
    is_active: bool = True


class HabitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    frequency: Literal["daily", "weekly"] | None = None
    is_active: bool | None = None


class HabitResponse(BaseModel):
    id: UUID
    name: str
    frequency: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
