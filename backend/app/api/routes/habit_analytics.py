
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.deps.auth import get_current_user
from app.schemas.habit_analytics import HabitAnalyticsResponse
from app.services.habit_analytics_service import get_habit_analytics


router = APIRouter(
    prefix="/habits",
    tags=["Habit Analytics"],
)


@router.get(
    "/{habit_id}/analytics",
    response_model=HabitAnalyticsResponse,
)
def retrieve_habit_analytics(
    habit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = get_habit_analytics(
        db,
        habit_id,
        current_user.id,
    )

    if analytics is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found",
        )

    return analytics
