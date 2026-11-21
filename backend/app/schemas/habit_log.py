
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class HabitLogCreate(BaseModel):
    completed_on: date


class HabitLogResponse(BaseModel):
    id: UUID
    habit_id: UUID
    completed_on: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
