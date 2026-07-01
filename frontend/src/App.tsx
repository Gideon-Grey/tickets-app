import { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "@/components/Toolbar/Toolbar";
import TicketTable from "@/components/TicketTable/TicketTable";
import Pagination from "@/components/Pagination/Pagination";
import CreateTicketModal from "@/components/CreateTicketModal";
import AdminLoginModal from "@/components/AdminLoginModal";
import { deleteTicket, fetchTickets, updateTicketStatus } from "@/api/client";
import { ApiError, Ticket, TicketFilters, TicketStatus } from "@/types";
import shared from "@/styles/shared.module.scss";

const ADMIN_TOKEN_KEY = "tickets_admin_token";

const DEFAULT_FILTERS: TicketFilters = {
  status: "",
  priority: "",
  search: "",
  sort_by: "created_at",
  order: "desc",
  page: 1,
  page_size: 10,
};

export default function App() {
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_TOKEN_KEY)
  );

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTickets = useCallback(async (f: TicketFilters) => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchTickets(f);
      setTickets(page.items);
      setTotal(page.total);
      setPages(page.pages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Неизвестная ошибка");
      setTickets([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadTickets(filters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, loadTickets]);

  function updateFilters(next: Partial<TicketFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  function handleLoggedIn(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdminToken(token);
    setShowLoginModal(false);
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
  }

  async function handleStatusChange(ticket: Ticket, status: TicketStatus) {
    setActionError(null);
    setStatusUpdatingId(ticket.id);
    try {
      await updateTicketStatus(ticket.id, status);
      await loadTickets(filters);
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Не удалось изменить статус заявки"
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete(ticket: Ticket) {
    if (!adminToken) return;
    const confirmed = window.confirm(
      `Удалить заявку «${ticket.title}»? Это действие необратимо.`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(ticket.id);
    try {
      await deleteTicket(ticket.id, adminToken);
      await loadTickets(filters);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setActionError("Сессия администратора истекла. Войдите снова.");
        handleLogout();
      } else {
        setActionError(
          err instanceof ApiError ? err.message : "Не удалось удалить заявку"
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Toolbar
        filters={filters}
        onChange={updateFilters}
        isAdmin={!!adminToken}
        onCreateClick={() => setShowCreateModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
      />

      {actionError && <div className={shared.errorBanner}>{actionError}</div>}

      <TicketTable
        tickets={tickets}
        loading={loading}
        error={error}
        isAdmin={!!adminToken}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        statusUpdatingId={statusUpdatingId}
        deletingId={deletingId}
      />

      {!loading && !error && (
        <Pagination
          page={filters.page}
          pages={pages}
          total={total}
          pageSize={filters.page_size}
          onPageChange={(page) => updateFilters({ page })}
          onPageSizeChange={(page_size) => updateFilters({ page_size, page: 1 })}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            updateFilters({ page: 1 });
            loadTickets({ ...filters, page: 1 });
          }}
        />
      )}

      {showLoginModal && (
        <AdminLoginModal
          onClose={() => setShowLoginModal(false)}
          onLoggedIn={handleLoggedIn}
        />
      )}
    </>
  );
}
