
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, DateTime, ForeignKey, String, Uuid, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    frequency: Mapped[str] = mapped_column(
        String(30), default="daily", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user = relationship("User", back_populates="habits")
