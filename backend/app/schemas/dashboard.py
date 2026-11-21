
from pydantic import BaseModel, ConfigDict


class DashboardResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int

    total_goals: int
    active_goals: int
    completed_goals: int

    total_habits: int
    active_habits: int
    completed_habits_today: int

    model_config = ConfigDict(from_attributes=True)
