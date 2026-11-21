from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str):
    return db.scalar(
        select(User).where(User.email == email)
    )


def create_user(db: Session, user_data: UserRegister):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        return None

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user