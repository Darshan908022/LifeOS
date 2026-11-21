
from datetime import datetime
from uuid import UUID
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None

    priority: Literal["low", "medium", "high"] = "medium"

    status: Literal["pending", "in_progress", "completed"] = "pending"

    due_at: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None

    priority: Literal["low", "medium", "high"] | None = None

    status: Literal["pending", "in_progress", "completed"] | None = None

    due_at: datetime | None = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    priority: str
    status: str
    due_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
