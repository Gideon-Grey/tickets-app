import {
  ApiError,
  Page,
  Ticket,
  TicketCreatePayload,
  TicketFilters,
  TicketStatus,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Ошибка запроса (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // default message
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export async function fetchTickets(filters: TicketFilters): Promise<Page<Ticket>> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.search) params.set("search", filters.search);
  params.set("sort_by", filters.sort_by);
  params.set("order", filters.order);
  params.set("page", String(filters.page));
  params.set("page_size", String(filters.page_size));

  const res = await fetch(`${API_URL}/tickets?${params.toString()}`);
  return handleResponse<Page<Ticket>>(res);
}

export async function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Ticket>(res);
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus
): Promise<Ticket> {
  const res = await fetch(`${API_URL}/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse<Ticket>(res);
}

export async function deleteTicket(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<void>(res);
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ access_token: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<{ access_token: string }>(res);
}
