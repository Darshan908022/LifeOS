
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import (
    create_task,
    get_user_tasks,
    get_task_by_id,
    update_task,
    delete_task,
)
from app.api.deps.auth import get_current_user


router = APIRouter(prefix="/tasks", tags=["Tasks"])


# 1. Create a Task
@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(db, task_data, current_user.id)


# 2. Get All User Tasks
@router.get("", response_model=list[TaskResponse])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_tasks(db, current_user.id)


# 3. Get One Task
@router.get("/{task_id}", response_model=TaskResponse)
def retrieve_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_by_id(db, task_id, current_user.id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


# 4. Update a Task
@router.put("/{task_id}", response_model=TaskResponse)
def edit_task(
    task_id: UUID,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_by_id(db, task_id, current_user.id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return update_task(db, task, task_data)


# 5. Delete a Task
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_by_id(db, task_id, current_user.id)

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    delete_task(db, task)

    return None
