
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.schemas.habit_analytics import HabitAnalyticsResponse


def calculate_streaks(
    completed_periods: set[date],
    today: date,
    frequency: str,
) -> tuple[int, int]:

    if frequency == "daily":
        step = timedelta(days=1)
        current_period = today

    else:
        step = timedelta(days=7)
        current_period = today - timedelta(days=today.weekday())

    if current_period not in completed_periods:
        previous_period = current_period - step

        if previous_period in completed_periods:
            current_period = previous_period
        else:
            current_period = None

    current_streak = 0

    if current_period is not None:
        period = current_period

        while period in completed_periods:
            current_streak += 1
            period -= step

    longest_streak = 0
    running_streak = 0
    previous_date = None

    for completed_date in sorted(completed_periods):
        if previous_date is not None:
            if completed_date - previous_date == step:
                running_streak += 1
            else:
                running_streak = 1
        else:
            running_streak = 1

        longest_streak = max(longest_streak, running_streak)
        previous_date = completed_date

    return current_streak, longest_streak


def get_habit_analytics(
    db: Session,
    habit_id: UUID,
    user_id: UUID,
) -> HabitAnalyticsResponse | None:

    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == user_id,
        )
    )

    if habit is None:
        return None

    logs = list(
        db.scalars(
            select(HabitLog).where(
                HabitLog.habit_id == habit_id,
                HabitLog.user_id == user_id,
            )
        ).all()
    )

    today = date.today()
    start_date = habit.created_at.date()

    completed_dates = {
        log.completed_on
        for log in logs
    }

    if habit.frequency == "weekly":
        completed_periods = {
            completed_date - timedelta(days=completed_date.weekday())
            for completed_date in completed_dates
        }

        start_period = start_date - timedelta(days=start_date.weekday())
        current_period = today - timedelta(days=today.weekday())

        total_periods = (
            (current_period - start_period).days // 7
        ) + 1

        completed_count = sum(
            1 for period in completed_periods
            if start_period <= period <= current_period
        )

    else:
        completed_periods = completed_dates

        total_periods = (today - start_date).days + 1

        completed_count = sum(
            1 for completed_date in completed_dates
            if start_date <= completed_date <= today
        )

    completion_rate = (
        (completed_count / total_periods) * 100
        if total_periods > 0
        else 0.0
    )

    current_streak, longest_streak = calculate_streaks(
        completed_periods,
        today,
        habit.frequency,
    )

    return HabitAnalyticsResponse(
        habit_id=habit.id,
        habit_name=habit.name,
        frequency=habit.frequency,
        current_streak=current_streak,
        longest_streak=longest_streak,
        completion_rate=round(completion_rate, 2),
        total_completions=len(logs),
    )
