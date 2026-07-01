import { Ticket, TicketStatus } from "@/types";
import { PriorityBadge, STATUS_OPTIONS, StatusBadge } from "@/components/Badges/Badges";
import styles from "./TicketTable.module.scss";
import shared from "@/styles/shared.module.scss";

interface Props {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void;
  onDelete: (ticket: Ticket) => void;
  statusUpdatingId: string | null;
  deletingId: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketTable({
  tickets,
  loading,
  error,
  isAdmin,
  onStatusChange,
  onDelete,
  statusUpdatingId,
  deletingId,
}: Props) {
  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingState}>Загрузка заявок…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.errorState}>Не удалось загрузить заявки: {error}</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.emptyState}>
          Заявок не найдено. Измените фильтры или создайте новую заявку.
        </div>
      </div>
    );
  }

  function renderStatusControl(t: Ticket) {
    const isDone = t.status === "done";
    if (isDone) return <StatusBadge status={t.status} />;
    return (
      <select
        className={styles.statusSelect}
        value={t.status}
        disabled={statusUpdatingId === t.id}
        onChange={(e) => onStatusChange(t, e.target.value as TicketStatus)}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  function renderDeleteButton(t: Ticket) {
    if (!isAdmin) return null;
    const isDone = t.status === "done";
    return (
      <button
        className={`${shared.btn} ${shared.btnSm} ${shared.btnDanger}`}
        disabled={isDone || deletingId === t.id}
        title={
          isDone ? "Заявки в статусе 'Выполнена' нельзя удалить" : "Удалить заявку"
        }
        onClick={() => onDelete(t)}
      >
        Удалить
      </button>
    );
  }

  return (
    <div className={styles.card}>
      {/* desktop */}
      <table className={styles.tableDesktop}>
        <thead>
          <tr>
            <th>Заявка</th>
            <th>Статус</th>
            <th>Приоритет</th>
            <th>Создана</th>
            <th>Обновлена</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>
                <div className={styles.title}>{t.title}</div>
                {t.description && (
                  <div className={styles.description}>{t.description}</div>
                )}
              </td>
              <td>{renderStatusControl(t)}</td>
              <td>
                <PriorityBadge priority={t.priority} />
              </td>
              <td className={styles.muted}>{formatDate(t.created_at)}</td>
              <td className={styles.muted}>{formatDate(t.updated_at)}</td>
              <td>{renderDeleteButton(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* mobile */}
      <ul className={styles.cardsMobile}>
        {tickets.map((t) => (
          <li className={styles.ticketCard} key={t.id}>
            <div className={styles.ticketCardTop}>
              <div>
                <div className={styles.title}>{t.title}</div>
                {t.description && (
                  <div className={`${styles.description} ${styles.descriptionMobile}`}>
                    {t.description}
                  </div>
                )}
              </div>
              <PriorityBadge priority={t.priority} />
            </div>

            <div className={styles.ticketCardMeta}>
              <span className={styles.muted}>Создана: {formatDate(t.created_at)}</span>
              <span className={styles.muted}>Обновлена: {formatDate(t.updated_at)}</span>
            </div>

            <div className={styles.ticketCardBottom}>
              {renderStatusControl(t)}
              {renderDeleteButton(t)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
