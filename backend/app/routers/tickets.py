from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.auth import require_admin
from app.database import get_db
from app.models import TicketStatus, TicketPriority
from app.schemas import TicketCreate, TicketOut, TicketStatusUpdate, Page

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket = crud.create_ticket(db, payload)
    return ticket


@router.get("", response_model=Page[TicketOut])
def list_tickets(
    status_filter: Optional[TicketStatus] = Query(None, alias="status"),
    priority_filter: Optional[TicketPriority] = Query(None, alias="priority"),
    search: Optional[str] = Query(None, description="Поиск по title и description"),
    sort_by: str = Query("created_at", pattern="^(created_at|priority)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):

    items, total = crud.list_tickets(
        db,
        status_filter=status_filter,
        priority_filter=priority_filter,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )
    return Page(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=crud.total_pages(total, page_size),
    )


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketOut)
def change_status(
    ticket_id: str, payload: TicketStatusUpdate, db: Session = Depends(get_db)
):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    try:
        ticket = crud.update_status(db, ticket, payload.status)
    except crud.BusinessRuleError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    return ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    ticket = crud.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    try:
        crud.delete_ticket(db, ticket)
    except crud.BusinessRuleError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    return None
