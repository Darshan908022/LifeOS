
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class HabitAnalyticsResponse(BaseModel):
    habit_id: UUID
    habit_name: str
    frequency: str
    current_streak: int
    longest_streak: int
    completion_rate: float
    total_completions: int

    model_config = ConfigDict(from_attributes=True)
