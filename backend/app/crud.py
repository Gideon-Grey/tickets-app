import math
from typing import Optional, Tuple

from sqlalchemy import or_, case
from sqlalchemy.orm import Session

from app.models import Ticket, TicketStatus, TicketPriority, PRIORITY_ORDER
from app.schemas import TicketCreate


class BusinessRuleError(Exception):

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def create_ticket(db: Session, data: TicketCreate) -> Ticket:
    ticket = Ticket(
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=TicketStatus.NEW,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket(db: Session, ticket_id: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def list_tickets(
    db: Session,
    status_filter: Optional[TicketStatus] = None,
    priority_filter: Optional[TicketPriority] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
) -> Tuple[list, int]:
    query = db.query(Ticket)

    if status_filter is not None:
        query = query.filter(Ticket.status == status_filter)

    if priority_filter is not None:
        query = query.filter(Ticket.priority == priority_filter)

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(pattern),
                Ticket.description.ilike(pattern),
            )
        )

    if sort_by == "priority":
        priority_case = case(
            (Ticket.priority == TicketPriority.LOW, PRIORITY_ORDER[TicketPriority.LOW.value]),
            (Ticket.priority == TicketPriority.NORMAL, PRIORITY_ORDER[TicketPriority.NORMAL.value]),
            (Ticket.priority == TicketPriority.HIGH, PRIORITY_ORDER[TicketPriority.HIGH.value]),
            else_=0,
        )
        sort_column = priority_case
    else:
        sort_column = Ticket.created_at

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()

    items = (
        query.offset((page - 1) * page_size).limit(page_size).all()
    )

    return items, total


def update_status(db: Session, ticket: Ticket, new_status: TicketStatus) -> Ticket:
    if ticket.status == TicketStatus.DONE:
        raise BusinessRuleError(
            "Заявка в статусе 'done' не может быть отредактирована "
            "и не может быть переведена обратно в другой статус"
        )

    ticket.status = new_status
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    if ticket.status == TicketStatus.DONE:
        raise BusinessRuleError(
            "Заявка в статусе 'done' не может быть удалена"
        )
    db.delete(ticket)
    db.commit()


def total_pages(total: int, page_size: int) -> int:
    if page_size <= 0:
        return 0
    return max(1, math.ceil(total / page_size))
