from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.models import TicketStatus, TicketPriority


class TicketCreate(BaseModel):
    title: str = Field(..., description="Заголовок заявки, от 3 до 120 символов")
    description: Optional[str] = Field(None, description="Описание, до 1000 символов")
    priority: TicketPriority = Field(default=TicketPriority.NORMAL)

    @field_validator("title")
    @classmethod
    def title_length(cls, v: str) -> str:
        v = v.strip()
        if not (3 <= len(v) <= 120):
            raise ValueError("title должен содержать от 3 до 120 символов")
        return v

    @field_validator("description")
    @classmethod
    def description_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 1000:
            raise ValueError("description не может быть длиннее 1000 символов")
        return v


class TicketStatusUpdate(BaseModel):
    status: TicketStatus


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str]
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


class ErrorResponse(BaseModel):
    detail: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
