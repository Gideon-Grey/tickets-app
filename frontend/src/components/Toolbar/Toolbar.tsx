import { TicketFilters } from "@/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/components/Badges/Badges";
import styles from "./Toolbar.module.scss";
import shared from "@/styles/shared.module.scss";

interface Props {
  filters: TicketFilters;
  onChange: (next: Partial<TicketFilters>) => void;
  isAdmin: boolean;
  onCreateClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function Toolbar({
  filters,
  onChange,
  isAdmin,
  onCreateClick,
  onLoginClick,
  onLogoutClick,
}: Props) {
  return (
    <>
      <div className={styles.header}>
        <h1>Учёт внутренних заявок</h1>
        <div className={styles.headerActions}>
          {isAdmin ? (
            <>
              <span className={styles.adminPill}>Админ</span>
              <button className={`${shared.btn} ${shared.btnSm}`} onClick={onLogoutClick}>
                Выйти
              </button>
            </>
          ) : (
            <button className={`${shared.btn} ${shared.btnSm}`} onClick={onLoginClick}>
              Вход для админа
            </button>
          )}
          <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={onCreateClick}>
            + Новая заявка
          </button>
        </div>
      </div>

      <div className={styles.bar}>
        <input
          type="text"
          placeholder="Поиск по заголовку и описанию…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        />

        <div className={styles.fieldGroup}>
          <label htmlFor="status-filter">Статус</label>
          <select
            id="status-filter"
            value={filters.status ?? ""}
            onChange={(e) =>
              onChange({ status: e.target.value as TicketFilters["status"], page: 1 })
            }
          >
            <option value="">Все</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="priority-filter">Приоритет</label>
          <select
            id="priority-filter"
            value={filters.priority ?? ""}
            onChange={(e) =>
              onChange({
                priority: e.target.value as TicketFilters["priority"],
                page: 1,
              })
            }
          >
            <option value="">Все</option>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="sort-by">Сортировка</label>
          <select
            id="sort-by"
            value={filters.sort_by}
            onChange={(e) =>
              onChange({ sort_by: e.target.value as TicketFilters["sort_by"] })
            }
          >
            <option value="created_at">По дате создания</option>
            <option value="priority">По приоритету</option>
          </select>
          <select
            aria-label="Направление сортировки"
            value={filters.order}
            onChange={(e) =>
              onChange({ order: e.target.value as TicketFilters["order"] })
            }
          >
            <option value="desc">убыв.</option>
            <option value="asc">возр.</option>
          </select>
        </div>
      </div>
    </>
  );
}
