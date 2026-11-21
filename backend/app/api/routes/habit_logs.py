
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.habit_log import HabitLogCreate, HabitLogResponse
from app.services.habit_log_service import (
    create_habit_log,
    get_habit_logs,
    get_habit_log_by_id,
    delete_habit_log,
)
from app.api.deps.auth import get_current_user
from app.services.habit_service import get_habit_by_id


router = APIRouter(
    prefix="/habits",
    tags=["Habit Tracking"],
)


@router.post(
    "/{habit_id}/logs",
    response_model=HabitLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def mark_habit_complete(
    habit_id: UUID,
    log_data: HabitLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found",
        )

    if not habit.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot log an inactive habit",
        )

    return create_habit_log(
        db,
        habit,
        current_user.id,
        log_data,
    )


@router.get(
    "/{habit_id}/logs",
    response_model=list[HabitLogResponse],
)
def list_habit_logs(
    habit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found",
        )

    return get_habit_logs(
        db,
        habit_id,
        current_user.id,
    )


@router.delete(
    "/{habit_id}/logs/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def undo_habit_completion(
    habit_id: UUID,
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found",
        )

    habit_log = get_habit_log_by_id(
        db,
        log_id,
        habit_id,
        current_user.id,
    )

    if habit_log is None:
        raise HTTPException(
            status_code=404,
            detail="Habit completion record not found",
        )

    delete_habit_log(db, habit_log)

    return None
