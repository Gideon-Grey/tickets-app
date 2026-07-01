import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Enum as SAEnum, DateTime
from sqlalchemy.orm import validates

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TicketStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


PRIORITY_ORDER = {
    TicketPriority.LOW.value: 0,
    TicketPriority.NORMAL.value: 1,
    TicketPriority.HIGH.value: 2,
}


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        SAEnum(TicketStatus, native_enum=False, length=20),
        nullable=False,
        default=TicketStatus.NEW,
    )
    priority = Column(
        SAEnum(TicketPriority, native_enum=False, length=20),
        nullable=False,
        default=TicketPriority.NORMAL,
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    @validates("title")
    def validate_title(self, key, value):
        if value is None or not (3 <= len(value) <= 120):
            raise ValueError("title должен быть от 3 до 120 символов")
        return value
