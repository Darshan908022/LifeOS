
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse
from app.services.habit_service import (
    create_habit,
    get_user_habits,
    get_habit_by_id,
    update_habit,
    delete_habit,
)
from app.api.deps.auth import get_current_user


router = APIRouter(prefix="/habits", tags=["Habits"])


@router.post(
    "",
    response_model=HabitResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_habit(
    habit_data: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_habit(db, habit_data, current_user.id)


@router.get("", response_model=list[HabitResponse])
def list_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_habits(db, current_user.id)


@router.get("/{habit_id}", response_model=HabitResponse)
def retrieve_habit(
    habit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def edit_habit(
    habit_id: UUID,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    return update_habit(db, habit, habit_data)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_habit(
    habit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    habit = get_habit_by_id(db, habit_id, current_user.id)

    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    delete_habit(db, habit)
    return None
