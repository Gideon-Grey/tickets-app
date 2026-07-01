export type TicketStatus = "new" | "in_progress" | "done";
export type TicketPriority = "low" | "normal" | "high";

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface TicketCreatePayload {
  title: string;
  description?: string;
  priority: TicketPriority;
}

export type SortBy = "created_at" | "priority";
export type SortOrder = "asc" | "desc";

export interface TicketFilters {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  search?: string;
  sort_by: SortBy;
  order: SortOrder;
  page: number;
  page_size: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
