
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.schemas.habit_log import HabitLogCreate


def create_habit_log(
    db: Session,
    habit: Habit,
    user_id: UUID,
    log_data: HabitLogCreate,
) -> HabitLog:

    existing_log = db.scalar(
        select(HabitLog).where(
            HabitLog.habit_id == habit.id,
            HabitLog.completed_on == log_data.completed_on,
        )
    )

    if existing_log:
        return existing_log

    habit_log = HabitLog(
        habit_id=habit.id,
        user_id=user_id,
        completed_on=log_data.completed_on,
    )

    db.add(habit_log)
    db.commit()
    db.refresh(habit_log)

    return habit_log


def get_habit_logs(
    db: Session,
    habit_id: UUID,
    user_id: UUID,
) -> list[HabitLog]:

    statement = (
        select(HabitLog)
        .where(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user_id,
        )
        .order_by(HabitLog.completed_on.desc())
    )

    return list(db.scalars(statement).all())


def get_habit_log_by_id(
    db: Session,
    log_id: UUID,
    habit_id: UUID,
    user_id: UUID,
) -> HabitLog | None:

    statement = select(HabitLog).where(
        HabitLog.id == log_id,
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user_id,
    )

    return db.scalar(statement)


def delete_habit_log(
    db: Session,
    habit_log: HabitLog,
) -> None:

    db.delete(habit_log)
    db.commit()
