
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )

    full_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    hashed_password: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    google_sub: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )

    profile_image: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # USER PREFERENCES
    theme_preference: Mapped[str] = mapped_column(
        String(20), default="light", nullable=False
    )

    notifications_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    # AUTHENTICATION SECURITY
    token_version: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tasks = relationship(
        "Task", back_populates="user", cascade="all, delete-orphan"
    )

    goals = relationship(
        "Goal", back_populates="user", cascade="all, delete-orphan"
    )

    habits = relationship(
        "Habit", back_populates="user", cascade="all, delete-orphan"
    )
