
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse

from app.services.goal_service import (
    create_goal,
    get_user_goals,
    get_goal_by_id,
    update_goal,
    delete_goal,
)

from app.api.deps.auth import get_current_user


router = APIRouter(prefix="/goals", tags=["Goals"])


# 1. Create a Goal
@router.post(
    "",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_goal(db, goal_data, current_user.id)


# 2. Get All User Goals
@router.get("", response_model=list[GoalResponse])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_goals(db, current_user.id)


# 3. Get One Goal
@router.get("/{goal_id}", response_model=GoalResponse)
def retrieve_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_goal_by_id(db, goal_id, current_user.id)

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return goal


# 4. Update a Goal
@router.put("/{goal_id}", response_model=GoalResponse)
def edit_goal(
    goal_id: UUID,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_goal_by_id(db, goal_id, current_user.id)

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return update_goal(db, goal, goal_data)


# 5. Delete a Goal
@router.delete(
    "/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_goal_by_id(db, goal_id, current_user.id)

    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    delete_goal(db, goal)

    return None
