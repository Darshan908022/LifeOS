
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(
    db: Session,
    task_data: TaskCreate,
    user_id: UUID,
) -> Task:

    task = Task(
        user_id=user_id,
        **task_data.model_dump(),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


def get_user_tasks(
    db: Session,
    user_id: UUID,
) -> list[Task]:

    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_task_by_id(
    db: Session,
    task_id: UUID,
    user_id: UUID,
) -> Task | None:

    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id,
    )

    return db.scalar(statement)


def update_task(
    db: Session,
    task: Task,
    task_data: TaskUpdate,
) -> Task:

    update_data = task_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    task: Task,
) -> None:

    db.delete(task)
    db.commit()
