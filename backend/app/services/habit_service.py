
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.habit import Habit
from app.schemas.habit import HabitCreate, HabitUpdate


def create_habit(
    db: Session,
    habit_data: HabitCreate,
    user_id: UUID,
) -> Habit:

    habit = Habit(
        user_id=user_id,
        **habit_data.model_dump(),
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def get_user_habits(
    db: Session,
    user_id: UUID,
) -> list[Habit]:

    statement = (
        select(Habit)
        .where(Habit.user_id == user_id)
        .order_by(Habit.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_habit_by_id(
    db: Session,
    habit_id: UUID,
    user_id: UUID,
) -> Habit | None:

    statement = select(Habit).where(
        Habit.id == habit_id,
        Habit.user_id == user_id,
    )

    return db.scalar(statement)


def update_habit(
    db: Session,
    habit: Habit,
    habit_data: HabitUpdate,
) -> Habit:

    update_data = habit_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(habit, field, value)

    db.commit()
    db.refresh(habit)

    return habit


def delete_habit(
    db: Session,
    habit: Habit,
) -> None:

    db.delete(habit)
    db.commit()
