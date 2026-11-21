
from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.goal import Goal
from app.models.habit import Habit
from app.models.habit_log import HabitLog

from app.schemas.dashboard import DashboardResponse


def get_dashboard_overview(
    db: Session,
    user_id: UUID,
) -> DashboardResponse:

    # Task statistics
    total_tasks = db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id
        )
    ) or 0

    pending_tasks = db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "pending",
        )
    ) or 0

    in_progress_tasks = db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "in_progress",
        )
    ) or 0

    completed_tasks = db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.status == "completed",
        )
    ) or 0

    # Goal statistics
    total_goals = db.scalar(
        select(func.count(Goal.id)).where(
            Goal.user_id == user_id
        )
    ) or 0

    active_goals = db.scalar(
        select(func.count(Goal.id)).where(
            Goal.user_id == user_id,
            Goal.status == "active",
        )
    ) or 0

    completed_goals = db.scalar(
        select(func.count(Goal.id)).where(
            Goal.user_id == user_id,
            Goal.status == "completed",
        )
    ) or 0

    # Habit statistics
    total_habits = db.scalar(
        select(func.count(Habit.id)).where(
            Habit.user_id == user_id
        )
    ) or 0

    active_habits = db.scalar(
        select(func.count(Habit.id)).where(
            Habit.user_id == user_id,
            Habit.is_active.is_(True),
        )
    ) or 0

    completed_habits_today = db.scalar(
        select(func.count(func.distinct(HabitLog.habit_id)))
        .join(Habit, Habit.id == HabitLog.habit_id)
        .where(
            HabitLog.user_id == user_id,
            Habit.user_id == user_id,
            Habit.is_active.is_(True),
            HabitLog.completed_on == date.today(),
        )
    ) or 0

    return DashboardResponse(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        total_goals=total_goals,
        active_goals=active_goals,
        completed_goals=completed_goals,
        total_habits=total_habits,
        active_habits=active_habits,
        completed_habits_today=completed_habits_today,
    )
