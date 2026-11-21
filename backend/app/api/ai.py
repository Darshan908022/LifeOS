
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps.auth import get_current_user

from app.models.user import User
from app.models.task import Task
from app.models.goal import Goal
from app.models.habit import Habit

from app.services.ai_service import generate_ai_response


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


class AIRequest(BaseModel):
    prompt: str


class AIResponse(BaseModel):
    response: str


@router.post("/chat", response_model=AIResponse)
def chat_with_ai(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Fetch only this user's tasks
        tasks = (
            db.query(Task)
            .filter(Task.user_id == current_user.id)
            .order_by(Task.created_at.desc())
            .limit(50)
            .all()
        )

        # Fetch only this user's goals
        goals = (
            db.query(Goal)
            .filter(Goal.user_id == current_user.id)
            .order_by(Goal.created_at.desc())
            .limit(50)
            .all()
        )

        # Fetch only this user's habits
        habits = (
            db.query(Habit)
            .filter(Habit.user_id == current_user.id)
            .order_by(Habit.created_at.desc())
            .limit(50)
            .all()
        )

        # Build personal LifeOS context
        context_parts = []

        context_parts.append("TASKS:")

        if tasks:
            for task in tasks:
                context_parts.append(
                    f"- Title: {task.title}, "
                    f"Description: {task.description or 'None'}, "
                    f"Priority: {task.priority}, "
                    f"Status: {task.status}, "
                    f"Due date: {task.due_at.isoformat() if task.due_at else 'Not set'}"
                )
        else:
            context_parts.append("No tasks found.")

        context_parts.append("\nGOALS:")

        if goals:
            for goal in goals:
                context_parts.append(
                    f"- Title: {goal.title}, "
                    f"Description: {goal.description or 'None'}, "
                    f"Target date: {goal.target_date.isoformat() if goal.target_date else 'Not set'}, "
                    f"Progress: {goal.progress}%, "
                    f"Status: {goal.status}"
                )
        else:
            context_parts.append("No goals found.")

        context_parts.append("\nHABITS:")

        if habits:
            for habit in habits:
                context_parts.append(
                    f"- Name: {habit.name}, "
                    f"Frequency: {habit.frequency}, "
                    f"Active: {habit.is_active}"
                )
        else:
            context_parts.append("No habits found.")

        lifeos_context = "\n".join(context_parts)

        # Generate AI response using personal data
        result = generate_ai_response(
            request.prompt,
            lifeos_context
        )

        return AIResponse(response=result)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI response. Please try again."
        )
